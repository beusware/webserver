import { Util } from "../../../../helpers/util";
import { Card } from "./card_class";

const numbers = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const suits = ["clubs", "diamonds", "hearts", "spades"];

const generateAllCards = (): Array<Card> => {
  let result = [];

  for (let suit of suits) {
    for (let number of numbers) {
      result.push(new Card(suit, number));
    }
  }

  return result;
}

export class Dealer {
  cards: Array<Card>;
  table: Array<Card>;
  constructor(cards = generateAllCards(), table: Array<Card> = []) {
    this.cards = cards;
    this.table = table;
  }
 
  // FIXME: Splice evtl. ein Index zu hoch
  deal(): Card {
    let index = Util.randomNumber(0, this.cards.length - 1);
    let card = this.cards[index];

    this.cards.splice(index, 1);
    return card;
  }

  dealToTable(): void {
    this.table.push(this.deal());
  }
}

/*
  Phasen des Spiels:
  preflop
  flop
  turn
  river
*/