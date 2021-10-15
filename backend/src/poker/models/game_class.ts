import { log } from "../../../../helpers/log_handler";
import { Player } from "./player_class";
import { Card } from "./card_class";
import { Round } from "./round_class";
import { Message } from "./message_class";
import { Util } from "../../../../helpers/util";
import * as path from "path";
import * as fs from "fs";
import { stringify } from "querystring";

let interval: NodeJS.Timeout;

export class Game {
  running: boolean = false;
  // TODO: check welches welches und das Chaos mit zwei Arrays aufräumen
  currentPlayers: Array<Player> = [];
  players: Array<Player> = [];
  lastBet: number = 0;
  pot: number = 0;
  private _gameClientInteraction: Function;
  private _round: Round;

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
          
          let dealed: Card = this._round.dealer.deal();
          this.players[startIndex+k].cards.push(dealed);
          this._gameClientInteraction({id: this.players[startIndex+k].id, card: dealed});
        }
      }
    }

    // TODO: Blindsystem ausdenken
    setBlinds();
    const smallBlind: number = this.players.indexOf(Util.objectOfArrayWithProperty(this.players, "blind", "Small Blind"));

    this._round = new Round (this.players, smallBlind, [200, 100]);
    
    // Rendert die Spielernamen und zeigt die ersten Blinds an
    this._gameClientInteraction({action: "renderPlayerlist"});
    
    // Gibt jedem Spieler die ersten 2 Karten
    setPlayerCards();

    this._gameClientInteraction(new Message("System", "Die Runde beginnt!", "", true, "chit"));
    if (smallBlind + 2 < this.players.length) {
      // Die unteren beiden können auf Clientside kombiniert werden
      this._gameClientInteraction (new Message("Dealer", "It´s your turn!", this.players[smallBlind+2].id, false, "system"));
      this._gameClientInteraction ( {action: "yourTurn", id: this.players[smallBlind+2].id} );
    } else {
      // Die unteren beiden können auf Clientside kombiniert werden
      this._gameClientInteraction (new Message("Dealer", "It´s your turn!", this.players[smallBlind-this.players.length+2].id, false, "system"));
      this._gameClientInteraction ( {action: "yourTurn", id: this.players[smallBlind-this.players.length+2].id} );
    }

    // changes the Check to a Raise after one Player raised
    for (let player of this.players) {
      if (player.lastBet != this._round.lastBet) {
        this._gameClientInteraction({action: "checkButtonTo", innerText: "Call", id: player.id});
      }
    }
  }

  preflop (id: string, action: string, amount?: number): Message {    
    // changes the Check to a Raise button on Clientsite
    const changeCheckButton = (roundStarting: boolean) => {
      for (let player of this.players) {
        // changes the button back if a new Card is shown
        if (roundStarting) {
          this._gameClientInteraction({action: "checkButtonTo", innerText: "Check", id: player.id});
          continue; 
        }

        // changes the Check to a Raise after one Player raised
        if (player.lastBet != this._round.lastBet && !player.notPlaying) {
          this._gameClientInteraction({action: "checkButtonTo", innerText: "Call", id: player.id});
        }
      }
    }
    
    // wertet die Action des Spielers aus
    let actionResult: Player = this._round.playersAction(action, amount);
    
    // wenn es null zurückgibt soll die nächste Karte aufgedeckt werden
    if (!actionResult) {
      console.log("Die nächst Karte kann aufgedeckt werden");
      return;
    }
    
    // plyer made unalowed action
    if (id == actionResult.id) {
      this._gameClientInteraction ( {action: "yourTurn", id: actionResult.id} );
      return new Message("Dealer", "This Action is not allowed", actionResult.id, false, "system");
    }

    if (action == "raise") {
      changeCheckButton(false);
    }

    // logs the action of the Player
    log("info", "Poker System", `name: ${Util.objectOfArrayWithProperty(this.players, "id", id)} | action: ${action} | amount: ${amount}`);
    // next plyers turn
    this._gameClientInteraction ( {action: "yourTurn", id: actionResult.id} );
    return new Message("Dealer", "It´s your turn!", actionResult.id, false, "system");
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

  // FIXME: evtl. type errors hier oder in der message_class
  evaluateMessage(message: string, socketId: string): Array<Message> {
    // Message typed by the client
    let messageObject = new Message(Util.objectOfArrayWithProperty(this.currentPlayers, "id", socketId).name, message, socketId, true);
    let gameInteraction: Message;
    
    // prevents Player from interacting without being on turn
    if (this._round.getPlayingPlayer().id != socketId) messageObject.type = "chit";
    // executes the command typed in the chat
    if (messageObject.type == "command") {
      // transforms raise by into raise to
      if (messageObject.raiseAction == "by") {
        messageObject.amount = this._round.lastBet + messageObject.amount;
      }

      gameInteraction = this.preflop(socketId, messageObject.content[0], messageObject.amount);
      // TODO: if evtl. überflüssig, sobald preflop immer Message returned
      if (gameInteraction) {
        // message send back only to the sender because of mistakes in the command 
        if (messageObject.id == gameInteraction.id) {
          messageObject.toAllPlayers = false;
        }
      }
    }

    return [messageObject, gameInteraction];
  }

  // FIXME: return type
  // Tritt dem System bei außer Spiel Läuft
  async join(name: string, socketid: string, gameClientInteraction: Function) {
    this._gameClientInteraction = gameClientInteraction; 

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