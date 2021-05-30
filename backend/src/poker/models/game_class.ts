import { log } from "../../../../helpers/log_handler";
import { Player } from "./player_class";
import { Dealer } from "./dealer_class";
import { Card } from "./card_class";
import { Util } from "../../../../helpers/util";
import * as fs from "fs";

let interval: NodeJS.Timeout;

export class Game {
  running: boolean = false;
  currentPlayers: Array<Player> = [];
  lastBet: number = 0;
  pot: number = 0;

  // Versucht eine Runde zu starten (gibt true bei Erfolg aus)
  async tryGameStart(gameStarting: Function) {
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
          this.startGame(gameStarting);
          return true;
        }

        return false;
      }

      time--;
    }, 1000);
  }

  // Startet ein Spiel KEINE RUNDE
  startGame(gameStarting: Function) {
    log("info", "Poker System", "Eine Runde Poker beginnt");

    // TODO: IMPLEMENT ROUNDS
    this.startRound(gameStarting);
  }

  startRound(gameStarting: Function) {
    const players: Array<Player> = this.currentPlayers;
    const smallBlind: number = players.indexOf(Util.objectOfArrayWithProperty(players, "blind", "Small Blind"));
    let dealer: Dealer = new Dealer();

    // Erste Phase des Spiels
    const preflop = (startAt: number) => {
      for (let i = 0; i < 2; i++) {
        let startIndex: number = startAt;

        for (let k = 0; k < players.length; k++) {
          if (startIndex + k >= players.length) startIndex = 0 - k;
          
          let dealed: Card = dealer.deal();
          this.currentPlayers[startIndex+k].cards.push(dealed);
          gameStarting(players[startIndex+k].id, dealed);
        }
      }
    };

    // TODO: Blindsystem ausdenken
    this.setBlinds();
    // Rendert die Spielernamen und zeigt die ersten Blinds an
    gameStarting();

    // Gibt jedem Spieler die ersten 2 Karten, bei 2 Spielern bekommt BB die erste und nicht SB
    if (players.length > 2) {
      preflop(smallBlind);
    } else {
      if (smallBlind == 0) {
        preflop(1);
      } else {
        preflop(0);
      }
    }
  } 

  // Setzt die Blinds für die Spieler
  setBlinds() {
    const blinds: Array<string> = ["Dealer", "Small Blind", "Big Blind"];
    const players: Array<Player> = this.currentPlayers;

    const loopBlinds = (startIndex: number): void => {
      for (let i = 0; i < 3; i++) {
        if (i == 0 && players.length == 2) continue;
        if (startIndex + i == players.length) startIndex = 0 - i;

        players[startIndex + i].blind = blinds[i];
      }
    }

    if (Util.allObjectsOfArrayWithProperty(players, "blind", "").length == players.length) {
      let random: number = Util.randomNumber(0, players.length);

      loopBlinds(random);
    } else {
      let target: number = players.indexOf(Util.objectOfArrayWithProperty(players, "blind", "Small Blind"));

      for (let player of players) {
        player.blind = "";
      }

      loopBlinds(target);
    }
  }

  // TODO: Fix Type of json 
  // Liest mögliche Spielerinformation aus
  getUserData(name: string): any {
    const userlist: string = `${__dirname}/../data/userlist.json`;
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
    const commands: Array<string> = ["call", "check", "raise", "pass", "quit"];
    let player: Player = Util.objectOfArrayWithProperty(this.currentPlayers, "id", socketid);
    let type: string = "chit";
    let response: string;

    if (commands.includes(msg.split(" ")[0])) {
      type = "command";
      console.log(msg.split(" "));
      const cmdray: Array<string> = msg.split(" ");
      const cmd: string = cmdray[0];
      // @ts-ignore
      if (player[cmd]) response = player[cmd](msg);
    }

    return {sender: player.name, content: message, type: type, system: response};
  }

  // FIXME: return type
  // Tritt dem System bei außer Spiel Läuft
  async join(name: string, socketid: string, gameStarting: Function) {
    // for (let player of this.currentPlayers || this.running) {
    for (let player of this.currentPlayers) {
      if (player.name == name) return false;
    }

    let player: Player = new Player(socketid, name, this.getUserData(name).chips);
    this.currentPlayers.push(player);
    this.tryGameStart(gameStarting);

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