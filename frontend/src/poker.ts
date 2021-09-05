import socketio from "socket.io-client";

const socket = socketio();

// TODO: Einmal alles durchkommentieren

//  **********ANFANG  Login Seite   **********
//
const usernameInput: HTMLInputElement = document.querySelector("#username");

//
const sendUsername = (): void => {
  let name: string = usernameInput.value;

  if (name) {
    name = name.trim();
    name = name.replace(/[^a-zA-Z0-9ßüäö\-\ ]/g, "");

    if (name != "") socket.emit("joinRequest", name);
  }

  usernameInput.value = "";
  // THIS DOES NOT WORK, HAS I EVER?
  // document.activeElement.blur();
}

//
usernameInput.addEventListener("keydown", (event: KeyboardEvent): void => {
  if (event.key == "Enter") {
    event.preventDefault();
    sendUsername();
  }
});

//
document.querySelector("#login").addEventListener("click", sendUsername);
// document.querySelector("#logout").addEventListener("click", () => location.reload());

//  **********ENDE  Login Seite   **********

// Fügt einen eventListener zum Eingabefeld hinzu und schickt Nachricht ab
// @ts-ignore
document.querySelector("#chat-input").addEventListener("keydown", (event: KeyboardEvent): void => {
  if (event.key == "Enter") {
    event.preventDefault();

    const input: HTMLInputElement = document.querySelector("#chat-input");
    socket.emit("sendMessage", input.value);
    input.value = "";
  }
});


//  **********ANFANG SocketIo   **********
// Wechselt das Fenster von Login zu Game
socket.on("joinResponse", (response): void => {
  if (response) {
    document.querySelector(".information-wrapper").remove();
    const game: HTMLElement = document.querySelector(".game");
    game.style.display = "flex";
  } else {
    alert("Anmeldung fehlgeschlagen");
  }
});

// Schreibt die Blinds, Spielernamen und Chips in die Liste (trigger Z. 80)
const renderPlayerList = (players: any): void => {
  const elements = document.getElementsByClassName("player");

  for (let index in elements) {
    // TODO: Dangerous
    if (parseInt(index) > players.length - 1) break;

    const player = players[index];
    elements[index].innerHTML = `${player.blind != "" ? `<span class="blind">[${player.blind.replaceAll(/[^A-Z]/g, "")}]</span> ` : ""}${player.name} (${player.chips})`;
  }
}

// Empfängt das Signal einer neuen Runde
socket.on("roundStarting", (currentPlayers): void => {
  renderPlayerList(currentPlayers);
});

// Empfängt ein messageObject aus game_class evaluateMessage() und rendert dieses im Chatfenster
socket.on("appendMessage", (messageObject: any): void => {
  if (messageObject.content) {
    const p1: HTMLElement = document.createElement("p");
    p1.innerHTML = `${messageObject.sender}: <span class="${messageObject.type}">${messageObject.content}</span>`;
    document.querySelector(".messages").appendChild(p1);
  }
  
  if (messageObject.system) {
    const p2: HTMLElement = document.createElement("p");
    p2.innerHTML = `Dealer: <span class="system">${messageObject.system}</span>`;
    document.querySelector(".messages").appendChild(p2);
  }
});

// Zeigt die ersten beiden Karten
socket.on("preflop", (card: any): void => {
  // TODO: THIS MIGHT BREAK, no?
  let hand: NodeListOf<HTMLImageElement> = document.querySelectorAll(".hand > .card");
  // makes the URL relative
  let src: string = "./" + hand[0].src.replace(/^(?:\/\/|[^/]+)*\//, '');
  
  if (src == "./assets/poker/cards/default.png") {
    hand[0].src = `./assets/poker/cards/${card.suit}${card.number}.png`;
  } else {
    hand[1].src = `./assets/poker/cards/${card.suit}${card.number}.png`;
  }
});

socket.on("yourTurn", (): void => {

  // TODO: EventListener durch button.disabled ersetzen
  document.querySelector("#raise").addEventListener("click", () => {
    socket.emit("action", "raise", 600 /*?? 0*/);
  });
});

//  **********ENDE SocketIo   **********