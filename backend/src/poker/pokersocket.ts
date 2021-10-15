import { log } from "../../../helpers/log_handler";
import { Util } from "../../../helpers/util";
import { Game } from "./models/game_class";
import { Card } from "./models/card_class";
import { Message } from "./models/message_class";

const game: Game = new Game();
let io: any;

const gameClientInteraction = (_: any): void => {
  // Symbolisiert auf Clienstite, dass die Runde startet
  if (_.action == "renderPlayerlist") {
    io.emit("roundStarting", game.currentPlayers);
    return;
  }

  if (_.action == "checkButtonTo") {
    io.to(_.id).emit("checkButtonTo", _.innerText);
  }

  if (_.action == "yourTurn") {
    io.to(_.id).emit("yourTurn");
    return;
  }

  if (_.card) {
    // Zeigt Clientsite die ersten 2 Karten an
    if (_.id) {
      io.to(_.id).emit('preflop', _.card);
      return;
    }
    // Zeigt Clientsite die nächste Karte vom Tisch an
    io.emit("nextCard", _.card); // Implement on Client
    return;
  }

  if (_.constructor.name == "Message") {
    // sends message to every client
    if (_.toAllPlayers) {
      io.emit("appendMessage", _);
      return;
    }

    // sends message only to a specified client
    io.to(_.id).emit("appendMessage", _);
  }
}

const routeMessage = (socketId: string, message: string): void => {
  // [0]: message send, [1]: gameResponse by typed command
  let messageObjects: Array<Message> = game.evaluateMessage(message, socketId);
  
  for (let message of messageObjects) {
    if (message) {
      if (message.toAllPlayers) {
        io.emit("appendMessage", message);
      } else {
        io.to(message.id).emit("appendMessage", message);
      }
    }
  }
}

export const pokersocket = (pio: any) => {
  io = pio;

  io.on("connection", (socket: any) => {
    socket.on("joinRequest", async (name: string) => {
      let response = await game.join(name, socket.id, gameClientInteraction);
      socket.emit("joinResponse", response);

      socket.on("sendMessage", (message: string) => {routeMessage(socket.id, message);});
    });

    socket.on("disconnect", () => {
      game.leave(socket.id);
    });
  });
}
