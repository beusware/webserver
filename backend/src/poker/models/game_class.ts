import { log } from "../../../../helpers/log_handler";
import { Player } from "./player_class";
import { Dealer } from "./dealer_class";
import { Card } from "./card_class";
import { Round } from "./round_class";
import { Util } from "../../../../helpers/util";
import * as fs from "fs";
import * as path from "path";

let interval: NodeJS.Timeout;

export class Game {
  running: boolean = false;
  // TODO: check welches welches und das Chaos mit zwei Arrays aufräumen
  currentPlayers: Array<Player> = [];
  players: Array<Player> = [];
  lastBet: number = 0;
  pot: number = 0;
  gameClientInteraction: Function;
  round: Round;

  // Versucht eine Runde zu starten (gibt true bei Erfolg aus)
  async tryGameStart() {
    const players: Array<Player> = this.currentPlayers;

    if (this.running == true || players.length > 8 || players.length < 2 || interval != null) {
      log(`warn`, `Poker System`, `Poker kann nicht starten (running: ${this.running}, players: ${players.length}, counting: ${interval ? true : false})`);
      return false;
    }

    let time: number = 30;

    interval = setInterval(() => {
      if (players.length < 2 || time == 0) {
        clearInterval(interval);
        interval = null;

        if (time == 0) {
          this.running = true;
          this.startGame();
          return true;
        }

        return false;
      }

      time--;
    }, 1000);
  }

  // Startet ein Spiel KEINE RUNDE
  startGame() {
    log("info", "Poker System", "Eine Runde Poker beginnt");
    this.players = this.currentPlayers;

    // TODO: IMPLEMENT ROUNDS
    this.startRound();
  }

  startRound() {
    let dealer: Dealer = new Dealer();

    // Setzt die Blinds für die Spieler
    const setBlinds = ()  => {
      const blinds: Array<string> = ["Dealer", "Small Blind", "Big Blind"];

      const loopBlinds = (startIndex: number): void => {
        for (let i = 0; i < 3; i++) {
          if (i == 0 && this.players.length == 2) continue;
          if (startIndex + i == this.players.length) startIndex = 0 - i;

          this.players[startIndex + i].blind = blinds[i];
        }
      }

      if (Util.allObjectsOfArrayWithProperty(this.players, "blind", "").length == this.players.length) {
        let random: number = Util.randomNumber(0, this.players.length - 1);

        loopBlinds(random);
      } else {
        let target: number = this.players.indexOf(Util.objectOfArrayWithProperty(this.players, "blind", "Small Blind"));

        for (let player of this.players) {
          player.blind = "";
        }

        loopBlinds(target);
      }
    }

    // Jedem Spieler werden zwei Karten gegeben Z. 101 - 111
    const setPlayerCards = (): void => {
      let startAt: number;
      // Sorgt dafür, dass bei 2 Spielern BB die erste bekommt und nicht SB
      if (this.players.length > 2) {
        startAt = smallBlind;
      } else {
        if (smallBlind == 0) {
          startAt = 1;
        } else {
          startAt = 0;
        }
      }
      
      for (let i = 0; i < 2; i++) {
        let startIndex: number = startAt;

        for (let k = 0; k < this.players.length; k++) {
          if (startIndex + k >= this.players.length) startIndex = 0 - k;
          
          let dealed: Card = dealer.deal();
          this.players[startIndex+k].cards.push(dealed);
          this.gameClientInteraction({id: this.players[startIndex+k].id, card: dealed});
        }
      }
    }

    // TODO: Blindsystem ausdenken
    setBlinds();
    const smallBlind: number = this.players.indexOf(Util.objectOfArrayWithProperty(this.players, "blind", "Small Blind"));

    // Rendert die Spielernamen und zeigt die ersten Blinds an (Callback => ../pockersocket)
    this.gameClientInteraction({action: "renderPlayerlist"});
    
    // Gibt jedem Spieler die ersten 2 Karten
    setPlayerCards();

    this.round = new Round (this.players, smallBlind, [200, 100]);
    this.gameClientInteraction( {action:"msg", content: "Die Runde beginnt"});
    if (smallBlind + 2 < this.players.length) {
      // Die unteren beiden können auf Clientside kombiniert werden
      this.gameClientInteraction ( {action: "msg", content: "system It´s your turn!", id: this.players[smallBlind+2].id} );
      this.gameClientInteraction ( {action: "yourTurn", id: this.players[smallBlind+2].id} );
    } else {
      // Die unteren beiden können auf Clientside kombiniert werden
      this.gameClientInteraction ( {action: "msg", content: "system It´s your turn!", id: this.players[smallBlind-this.players.length+2].id} );
      this.gameClientInteraction ( {action: "yourTurn", id: this.players[smallBlind-this.players.length+2].id} );
    }   
  }

  async preflop (action: string, amount?: number) {
    this.round.playersAction(action, amount);
  }

  // TODO: Fix Type of json 
  // Liest mögliche Spielerinformation aus
  getUserData(name: string): any {
    const userlist: string = path.join(__dirname, "../backend/data/poker/userlist.json");
    const json: any = JSON.parse(fs.readFileSync(userlist, {encoding: "utf-8"}));

    for (let player of json) {
      if (player.name == name) return player;
    }

    return {};
  }

  // FIXME:
  // Evaluiert die Nachricht eines Spielers in Bezug auf mögliche Befehle
  evaluateMessage(message: string, socketid: string): any {
    const msg: string = message.toLowerCase().trim();
    const commands: Array<string> = ["call", "check", "raise", "pass", "quit", "system"]; // Array enthält Methoden von Player
    let player: Player = Util.objectOfArrayWithProperty(this.currentPlayers, "id", socketid);
    let type: string = "chit";
    let response: string;

    if (commands.includes(msg.split(" ")[0])) {
      type = "command";
      // console.log(msg.split(" "));
      const cmdray: Array<string> = msg.split(" ");
      const cmd: string = cmdray[0];
      // @ts-ignore
      if (player[cmd]) response = player[cmd](message);

      // Verhindert, dass die Nachricht doppelt erscheint, wenn sie vom System an einen Spieler geht
      if (cmd == "system") return {sender: player.name, content: null, type: type, system: response}
    }

    return {sender: player ? player.name : "System", content: message, type: type, system: response};
  }

  // FIXME: return type
  // Tritt dem System bei außer Spiel Läuft
  async join(name: string, socketid: string, gameClientInteraction: Function) {
    this.gameClientInteraction = gameClientInteraction; 

    // for (let player of this.currentPlayers || this.running) {
    for (let player of this.currentPlayers) {
      if (player.name == name) return false;
    }

    let player: Player = new Player(socketid, name, this.getUserData(name).chips);
    this.currentPlayers.push(player);
    this.tryGameStart();

    log("info", "Poker System", `Ein Client ist dem System beigetreten (Name: ${name} | ID: ${socketid})`);

    return {"player": player};
  }

  // Verlassen des Systems
  leave(socketid: string): void {
    const players: Array<Player> = this.currentPlayers;

    for (let index in players) {
      if (players[index].id == socketid) {
        log("info", "Poker System", `Ein Client hat das System verlassen (Name: ${players[index].name} | ID: ${socketid})`);
        players.splice(parseInt(index));
      }
    }
  }
}