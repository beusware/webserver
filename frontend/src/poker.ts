import socketio from "socket.io-client";

const socket = socketio();
let currentPlayers = [];

// TODO: Einmal alles durchkommentieren

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

// 
document.querySelector("#chat-input").addEventListener("keydown", (event: KeyboardEvent): void => {
  if (event.key == "Enter") {
    event.preventDefault();

    const input: HTMLInputElement = document.querySelector("#chat-input");
    socket.emit("sendMessage", input.value);
    input.value = "";
  }
});

// 
socket.on("appendMessage", (messageObject: any): void => {
  const p1: HTMLElement = document.createElement("p");
  p1.innerHTML = `${messageObject.sender}: <span class="${messageObject.type}">${messageObject.content}</span>`;
  document.querySelector(".messages").appendChild(p1);

  if (messageObject.system) {
    const p2: HTMLElement = document.createElement("p");
    p2.innerHTML = `Dealer: <span class="system">${messageObject.system}</span>`;
    document.querySelector(".messages").appendChild(p2);
  }
});

// 
socket.on("joinResponse", (response): void => {
  if (response) {
    document.querySelector(".information-wrapper").remove();
    const game: HTMLElement = document.querySelector(".game");
    game.style.display = "flex";
  } else {
    alert("Anmeldung fehlgeschlagen");
  }
});

// Empfängt das Signal einer neuen Runde
socket.on("roundStarting", (currentPlayers): void => {
  renderPlayerList(currentPlayers);
});

// Zeigt die ersten beiden Karten
socket.on("preflop", (card: any): void => {
  // TODO: THIS MIGHT BREAK, no?
  let hand: NodeListOf<HTMLImageElement> = document.querySelectorAll(".hand > .card");

  if (hand[0].src == "http://localhost:1337/assets/poker/cards/default.png") {
    hand[0].src = `http://localhost:1337/assets/poker/cards/${card.suit}${card.number}.png`;
  } else {
    hand[1].src = `http://localhost:1337/assets/poker/cards/${card.suit}${card.number}.png`;
  }
});

// Schreibt die Blinds, Spielernamen und Chips in die Liste
const renderPlayerList = (players: any): void => {
  const elements = document.getElementsByClassName("player");

  for (let index in elements) {
    // TODO: Dangerous
    if (parseInt(index) > players.length - 1) break;

    const player = players[index];
    elements[index].innerHTML = `${player.blind != "" ? `<span class="blind">[${player.blind.replaceAll(/[^A-Z]/g, "")}]</span> ` : ""}${player.name} (${player.chips})`;
  }
}