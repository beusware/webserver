import { Card } from "./card_class";

export class Player {
  id: string;
  name: string;
  chips: number;
  cards: Array<Card>;
  blind: string;
  notPlaying: boolean;

  constructor(id: string, name: string, chips: number = 5000, cards: Array<Card> = [], blind: string = "", notPlaying: boolean = false) {
    this.id = id;
    this.name = name;
    this.chips = chips;
    this.cards = cards;
    this.blind = blind;
    this.notPlaying = notPlaying;
  }

  // Beobachtet das Spiel
  pass(_: any) {
    console.log("asd");
    return;
  }

  // TODO: @davidpkj: FIX IT
  // Setzt einen höheren Satz als der vorherige Spieler
  raise(message: string): string {
    const args: Array<string> = message.split(" ");

    if (args.length == 1) return "So geht das aber nicht du kleiner Dreckssack!";

    let action: string = isNaN(parseInt(args[1])) ? args[1] : "by";
    let amount: number = isNaN(parseInt(args[1])) ? parseInt(args[2]) : parseInt(args[1]);

    if (action == "to") console.log("raising to " + amount)
    if (action == "by") console.log("raising by " + amount)
  }

  // Wenn vorher nicht gesetzt → „ball“ an den nächsten geben
  check(_: any) { 
    return;
  }

  // Wenn vorher gesetzt → auf gleiches erhöhen
  call(_: any) {
    return;
  }

  // Verlässt die lobby
  quit(_: any) {
    console.log("asd");
    return;
  }

  //cards = [];
/* 
  numArrayContains(array, index) {   // Gibt an wie oft der "index" im array[] vorhanden ist
    var n = 0;
    for (let i of array) {
      if (i == index) n++;
    }

    return n;
  }

  typeAmount(type) {
    /* type ist "color" o. "number"
        gibt Array zurück mit:
            [0][i] den verschiedenen Farben/Nummern
            [1][i] der Anzahl wie oft diese in player.cards[] vorkommt
            [2] Farbe des Flushs, wenn vorhanden
    var rückgabe = [[], []];
    for (let i of this.cards) {
      if (rückgabe[0].indexOf(i[type]) !== -1) {
        rückgabe[1][rückgabe[0].indexOf(i[type])]++;
      } else {
        rückgabe[0].push(i[type]);
        rückgabe[1][rückgabe[0].indexOf(i[type])] = 1;
      }
    }

    for (let c = 5; c <= 7; c++) {
      if (rückgabe[1].includes(c)) rückgabe[2] = rückgabe[0][rückgabe[1].indexOf(c)];
    }

    return rückgabe;
  }

  getHand() {    // Gibt die Hand des Spieler in einem Array wieder
    var cAmount = this.typeAmount("color");
    var nAmount = this.typeAmount("number");

    const flushCards = () => {  // Array mit den Karten die im Flush sind
      let flushCards = [];

      for (let i of this.cards) {
        if (i.color == cAmount[2]) {
          flushCards.push(i.number);
        }
      }

      return flushCards.sort((a, b) => a - b);
    }

    const hasStraight = (n) => {   // Gib an ob das übergebene Array > 5 aufeinander folgende Zahlen hat
      var rückgabe = [1, 1];
      var counter = 1;
      var straightCards;
      if (n == 1) {   // damit nAmount nicht sortiert wird; 
        straightCards = flushCards();
      } else {
        straightCards = this.typeAmount("number");
        straightCards.sort((a, b) => a - b);
      }

      for (let i = 0; i < straightCards.length - 1; i++) {

        if (straightCards[i] + 1 == straightCards[i + 1]) {
          counter++;
          if (counter > rückgabe[0]) {
            rückgabe[0] = counter;
            rückgabe[1] = straightCards[i + 1];
          } else {
            if (straightCards[i] !== straightCards[i + 1]) counter = 1;
          }
        }
      }

      if (rückgabe[0] < 5) {
        rückgabe[0] = false;
      } else {
        rückgabe[0] = true;
      }

      return rückgabe;  // Rückgabe[0] Zahlenfolge ist größer 5, [1] höchste Zahl der Zahlenfolge
    }

    const highCard = (c1, c2) => {  // Gibt die höchst Zahl wieder die nicht in der Hand ist (c1, c2 müssen als Karten der Hand mit übergeben werden)
      let karten = []
      for (let i of this.cards) {
        if (i.number !== c1 && i.number !== c2) {
          karten.push(i.number);
        }
      }

      karten.sort((a, b) => a - b);
      return karten[karten.length - 1];
    }

    if (typeof (cAmount[2]) !== "undefined") {   	// Spieler hat einen Flush

      if (hasStraight(1)[0] && hasStraight(1)[1] == 14) {
        return 10;  // Check if Royal Flush
      } else {
        if (hasStraight(1)[0]) return [9, hasStraight(1)[1]];    // Check if Sraight Flush
      }

      let fCards = flushCards();
      while (fCards.length > 5) {
        fCards.shift();
      }

      return [6, fCards];
    }

    if (hasStraight(0)[0]) return [5, hasStraight(0)[1]];

    if (nAmount[1].includes(4)) {   // Player has 4 of a Kind
      return [8, nAmount[0][nAmount[1].indexOf(4)], highCard(nAmount[0][nAmount[1].indexOf(4)])];
    }

    if (nAmount[1].includes(3) && nAmount[1].includes(2) || this.numArrayContains(nAmount[1], 3) == 2) {    // Player hat Full House
      var rückgabe = [];
      rückgabe[0] = 7;
      var karten = [];

      if (this.numArrayContains(nAmount[1], 2) == 2) {
        for (let i = 0; i < nAmount[0].length; i++) {
          if (nAmount[1][i] == 2) karten.push(nAmount[0][i]);
        }
        karten.sort((a, b) => a - b);
        rückgabe[2] = karten[karten.length - 1];
      }

      if (this.numArrayContains(nAmount[1], 3) == 2) {
        for (let i = 0; i < nAmount[0].length; i++) {
          if (nAmount[1][i] == 3) karten.push(nAmount[0][i]);
        }
        karten.sort((a, b) => a - b);
        rückgabe[1] = karten[1];
        rückgabe[2] = karten[0];

        return rückgabe;
      }

      if (typeof (rückgabe[2]) == "undefined") rückgabe[2] = nAmount[0][nAmount[1].indexOf(2)];
      rückgabe[1] = nAmount[0][nAmount[1].indexOf(3)];

      return rückgabe;
    }

    if (nAmount[1].includes(3)) {   // Player hat 3 of a Kind
      return [4, nAmount[0][nAmount[1].indexOf(3)], highCard(nAmount[0][nAmount[1].indexOf(3)])];
    }

    if (nAmount[1].includes(2)) {
      var karten = [];

      if (this.numArrayContains(nAmount[1], 2) >= 2) {    // Two Pairs

        for (let i = 0; i < nAmount[0].length; i++) {
          if (nAmount[1][i] == 2) karten.push(nAmount[0][i]);
        }

        karten.sort((a, b) => a - b);
        if (karten.length == 3) karten.shift();

        return [3, karten[1], karten[0], highCard(karten[1], karten[0])];
      } else {    // One Pair
        return [2, nAmount[0][nAmount[1].indexOf(2)], highCard(nAmount[0][nAmount[1].indexOf(2)])];
      }
    }

    return [1, highCard()];
  } */
}