import socketio from "socket.io-client";
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);
const socket = socketio();
 
// https://www.chartjs.org/docs/latest/samples/line/line.html

const context = document.querySelector("canvas").getContext("2d");



socket.on("tick", (data) => {
  // const p = document.createElement("p");
  // p.innerText = data;
  // graph.append(document.createElement("p"));
});
