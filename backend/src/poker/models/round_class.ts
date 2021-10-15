import { Player } from "./player_class";
import { Dealer } from "./dealer_class";
import { Util } from "../../../../helpers/util"

export class Round {
  dealer: Dealer = new Dealer();
  player: Array<Player>;
  private _playersTurn: number; // number of the place in Array
  lastBet: number; // highest amunt of Chips infront of Player
  raisedBy: Player; // last Player who raised
  pot: Array<number>;
  constructor (players: Array<Player>, smallBlind: number, blinds: Array<number>) {
      this.player = players;
      
      // legt den Spieler fest, der anfägt
      this.lastBet = blinds[0]; // Blinds: [0] = Chipbetrag BB; [1] = Chipbetrag SB
      if (smallBlind + 2 < players.length) {
        this._playersTurn = smallBlind + 2;
      } else {
        this._playersTurn = smallBlind - players.length + 2;
      }

      // TODO: Event bei AllIn vor allem bei Blinds

      // Zieht Blinds bei den Spielern ab
      this.player[smallBlind].chips -= blinds[1];
      this.player[smallBlind].lastBet = blinds[1];
      if (smallBlind + 1 >= this.player.length) {
        this.player[0].chips -= blinds[0];
        this.player[0].lastBet = blinds[0];
        this.raisedBy = this.player[0];
      } else {
        this.player[smallBlind+1].chips -= blinds[0];
        this.player[smallBlind+1].lastBet = blinds[0];
        this.raisedBy = this.player[smallBlind+1];
      }
  }

  // TODO: Null Rückgabewerte überprüfen und Fehlermeldungen einbauen
  playersAction(action: string, amount?: number): Player{
    
    // enthält die Methoden aus Methoden actions
    const actions: Array<string> = ["call", "check", "raise", "pass"];
    if (!actions.includes(action)) return  this.player[this._playersTurn];

    const nextPlayer = (): Player => {
      this._playersTurn = this._playersTurn+1 >= this.player.length ? 0 : this._playersTurn + 1;
      if (this.player[this._playersTurn].notPlaying) return nextPlayer();
      if (this.player[this._playersTurn] == this.raisedBy) return;

      return this.player[this._playersTurn];
    }

    // @ts-ignore
    // true if unalowed action was done, send back the same Player
    if (this["_" + action](amount)) return this.player[this._playersTurn];
    return nextPlayer();
  }

  // returns the Player whose turn is
  getPlayingPlayer(): Player {
    return this.player[this._playersTurn];
  }

  // TODO: methods of actions to Player_Class
  private _check (): boolean {
    if (this.lastBet !== this.player[this._playersTurn].lastBet) return true;

    return false;
  }

  private _pass (): boolean {
    this.player[this._playersTurn].notPlaying = true;

    return false;
  }

  private _call (): boolean {
    // check for enough chips
    if ( (this.player[this._playersTurn].chips - (this.lastBet - this.player[this._playersTurn].lastBet)) < 0 ) return true;

    this.player[this._playersTurn].chips -= (this.lastBet - this.player[this._playersTurn].lastBet);
    this.player[this._playersTurn].lastBet = this.lastBet; 

    return false;
  }

  // always RAISE TO
  private _raise (amount: number): boolean {
    if (!amount) return true;
    // check for enough chips
    if ( (this.player[this._playersTurn].chips - (amount - this.player[this._playersTurn].lastBet)) < 0 || amount <= this.lastBet) return true;

    this.player[this._playersTurn].chips -= (amount - this.player[this._playersTurn].lastBet);
    this.player[this._playersTurn].lastBet = amount;
    this.lastBet = amount;
    this.raisedBy = this.player[this._playersTurn];

    return false;
  }
}