import { log } from "../../../helpers/log_handler";
import { Util } from "../../../helpers/util";
import { Game } from "./models/game_class";
import { Card } from "./models/card_class";

const game: Game = new Game();
let io: any;

const roundStarting = (id: string, card: Card): void => {
  // Symbolisiert auf Clienstite, dass die Runde startet
  if (!card) {
    io.emit("roundStarting", game.currentPlayers);
    return
  }
  // Zeigt Clientsite die ersten 2 Karten an
  if (id) {
    io.to(id).emit('preflop', card);
    return
  }
  // Zeigt Clientsite die nächste Karte vom Tisch an
  io.emit("nextCard", card); // Implement on Client
}

const routeMessage = (socket: any, message: string): void => {
  let messageObject: any = game.evaluateMessage(message, socket.id);

  if (messageObject.system) {
    socket.emit("appendMessage", messageObject);
    return;
  }

  io.emit("appendMessage", messageObject);
}

export const pokersocket = (pio: any) => {
  io = pio;

  io.on("connection", (socket: any) => {
    socket.on("joinRequest", async (name: string) => {
      let response = await game.join(name, socket.id, roundStarting);
      socket.emit("joinResponse", response);

      socket.on("sendMessage", (message: string) => {routeMessage(socket, message);});
    });

    socket.on("disconnect", () => {
      game.leave(socket.id);
    });
  });
}
