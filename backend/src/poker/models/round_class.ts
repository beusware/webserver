import { Player } from "./player_class";
import { Util } from "../../../../helpers/util"

export class Round {
    player: Array<Player>;
    playersTurn: number; // number of the place in Array
    lastBet: number; // highest amunt of Chips infront of Player
    raisedBy: Player; // last Player who raised
    pot: Array<number>;
    constructor (players: Array<Player>, smallBlind: number, blinds: Array<number>) {
        this.player = players;
        
        // legt den Spieler fest, der anfägt
        this.lastBet = blinds[0]; // Blinds: [0] = Chipbetrag BB; [1] = Chipbetrag SB
        if (smallBlind + 2 < players.length) {
          this.playersTurn = smallBlind + 2;
        } else {
          this.playersTurn = smallBlind - players.length + 2;
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
    playersAction(action: string, amount?: number): Player | string{
      
      // enthält die Methoden aus Methoden
      const actions: Array<string> = ["call", "check", "raise", "pass"];
      if (!actions.includes(action)) return;

      const nextPlayer = (): Player | string => {
        this.playersTurn = this.playersTurn+1 >= this.player.length ? 0 : this.playersTurn + 1;
        if (this.player[this.playersTurn].notPlaying) return nextPlayer();
        if (this.player[this.playersTurn] == this.raisedBy) return "nextCard";

        return this.player[this.playersTurn];
      }

      // @ts-ignore
      if (!this[action](amount)) return;
      // @ts-ignore
      this[action](amount);
      return nextPlayer();
    }

    check (): boolean {
      if (this.lastBet !== this.player[this.playersTurn].lastBet) return true;
    }

    pass (): void {
      this.player[this.playersTurn].notPlaying = true;
    }

    call (): boolean {
      // Check ob noch genug Chips vorhanden sind
      if ( (this.player[this.playersTurn].chips - (this.lastBet - this.player[this.playersTurn].lastBet)) < 0 ) return true;

      this.player[this.playersTurn].chips -= (this.lastBet - this.player[this.playersTurn].lastBet);
      this.player[this.playersTurn].lastBet = this.lastBet; 
    }

    // always RAISE TO
    raise (amount: number): boolean {
      // Checkt ob genug Chips vorhanden sind
      if ( (this.player[this.playersTurn].chips - (amount - this.player[this.playersTurn].lastBet)) < 0 ) return true;

      this.player[this.playersTurn].chips -= (amount - this.player[this.playersTurn].lastBet);
      this.player[this.playersTurn].lastBet = amount;
      this.lastBet = amount;
      this.raisedBy = this.player[this.playersTurn];
    }
}