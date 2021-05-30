import socketio from "socket.io-client";

const socket = socketio();
 
const graph = document.querySelector(".graph");

socket.on("tick", (data) => {
  // const p = document.createElement("p");
  // p.innerText = data;
  // graph.append(document.createElement("p"));

  graph.innerHTML = data.toString();
});
