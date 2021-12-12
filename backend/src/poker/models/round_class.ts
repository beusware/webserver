import { log } from "../../../../helpers/log_handler";
import { Util } from "../../../../helpers/util"
import { Player } from "./player_class";
import { Dealer } from "./dealer_class";
import { Card } from "./card_class";

export class Round {
  dealer: Dealer = new Dealer();
  player: Array<Player>; // TODO: private
  private _playersTurn: number; // number of the place in Array
  lastBet: number; // highest amunt of Chips infront of Player
  raisedBy: Player; // last Player who raised
  pot: Array<number>;
  smallBlind: number;
  constructor (players: Array<Player>, blinds: Array<number>) {
      this.player = players;

      this.setBlinds();
      
      // legt den Spieler fest, der anfägt
      this.lastBet = blinds[0]; // Blinds: [0] = Chipbetrag BB; [1] = Chipbetrag SB
      if (this.smallBlind + 2 < players.length) {
        this._playersTurn = this.smallBlind + 2;
      } else {
        this._playersTurn = this.smallBlind - players.length + 2;
      }
      this.raisedBy = players[this._playersTurn];

      // TODO: Event bei AllIn vor allem bei Blinds

      // Zieht Blinds bei den Spielern ab
      this.player[this.smallBlind].chips -= blinds[1];
      this.player[this.smallBlind].lastBet = blinds[1];
      if (this.smallBlind + 1 >= this.player.length) {
        this.player[0].chips -= blinds[0];
        this.player[0].lastBet = blinds[0];
      } else {
        this.player[this.smallBlind+1].chips -= blinds[0];
        this.player[this.smallBlind+1].lastBet = blinds[0];
      }
  }

  // TODO: Null Rückgabewerte überprüfen und Fehlermeldungen einbauen
  playersAction(action: string, amount?: number): Player{

    const nextPlayer = (): Player => {
      this._playersTurn = this._playersTurn+1 >= this.player.length ? 0 : this._playersTurn + 1;
      if (this.player[this._playersTurn] == this.raisedBy) return;
      if (this.player[this._playersTurn].notPlaying) return nextPlayer();

      return this.player[this._playersTurn];
    }

    // executes the typed in command of the player
    if (action == "pass" || action == "quit") {
      this.player[this._playersTurn][action]();
    
    // executes the other commands
    } else {
      // @ts-ignore
      // true if unalowed action was done, send back the same Player
      if (this.player[this._playersTurn][action](this.lastBet, amount)) return this.player[this._playersTurn];
      // adjusts the variables
      if (action == "raise") {
        this.lastBet = amount;
        this.raisedBy = this.player[this._playersTurn];
      }
    }
    // logs the action of the Player
    const player: Player = this.player[this._playersTurn];
    log("info", "Poker System", `name: ${player.name} | action: ${action} | chips: ${player.chips} ${amount ? "| amount:" + amount : ""}`);

    
    return nextPlayer();
  }

  getPlayer(): Array<Player> {
    return this.player;
  }

  // returns the Player whose turn is
  getPlayingPlayer(): Player {
    return this.player [this._playersTurn];
  }

  // assigns the blinds to three of the players
  setBlinds(): void {
    const blinds: Array<string> = ["Dealer", "Small Blind", "Big Blind"];

    const loopBlinds = (startIndex: number): void => {
      for (let i = 0; i < 3; i++) {
        if (i == 0 && this.player.length == 2) continue;
        if (startIndex + i == this.player.length) startIndex = 0 - i;

        this.player[startIndex + i].blind = blinds[i];
      }
    }
    // check if there aren´t blinds so starts at random
    if (Util.allObjectsOfArrayWithProperty(this.player, "blind", "").length == this.player.length) {
      let random: number = Util.randomNumber(0, this.player.length - 1);

      loopBlinds(random);
    // by given blinds pass them on to the next sitting player
    } else {
      let target: number = this.player.indexOf(Util.objectOfArrayWithProperty(this.player, "blind", "Small Blind"));
      // removes the old blindes
      for (let player of this.player) {
        player.blind = "";
      }

      loopBlinds(target);
    }

    this.smallBlind = this.player.indexOf(Util.objectOfArrayWithProperty(this.player, "blind", "Small Blind"));
  }

  setPlayerCards(): void{
    // selects the player who gets the first card ( smallblind or by only two players it is the bigblind )
    let startIndex: number;
    if (this.player.length > 2) {
      startIndex = this.smallBlind;
    } else {
      startIndex = this.smallBlind == 0 ? 1 : 0;
    }

    for (let i = 0; i < (2 * this.player.length); i++) {
      if (startIndex + i >= this.player.length) startIndex = 0 - i;

      let dealed: Card = this.dealer.deal();
      this.player[startIndex+i].cards.push(dealed);
    }
  }
}