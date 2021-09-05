import { log } from "../../../helpers/log_handler";
import { Util } from "../../../helpers/util";
import { Game } from "./models/game_class";
import { Card } from "./models/card_class";

const game: Game = new Game();
let io: any;

const gameClientInteraction = (_: any): void => {
  // Symbolisiert auf Clienstite, dass die Runde startet
  if (_.action == "renderPlayerlist") {
    io.emit("roundStarting", game.currentPlayers);
    return;
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

  if (_.action == "msg") {
    // Schickt eine Nachricht an Textfeld des Clients
    if (_.id) {
      routeMessage(_.id, _.content);
      return;
    }

    // Schickt eine Nachricht an alle
    routeMessage(null, _.content);
    return;
  }
}

const routeMessage = (socketId: string, message: string): void => {
  let messageObject: any = game.evaluateMessage(message, socketId);

  if (messageObject.system) {
    io.to(socketId).emit("appendMessage", messageObject);
    return;
  }

  io.emit("appendMessage", messageObject);
}

export const pokersocket = (pio: any) => {
  io = pio;

  io.on("connection", (socket: any) => {
    socket.on("joinRequest", async (name: string) => {
      let response = await game.join(name, socket.id, gameClientInteraction);
      socket.emit("joinResponse", response);

      socket.on("action", (action: string, amount?: number) => {
        //game.preflop(action, amount);
      });

      socket.on("sendMessage", (message: string) => {routeMessage(socket.id, message);});
    });

    socket.on("disconnect", () => {
      game.leave(socket.id);
    });
  });
}
