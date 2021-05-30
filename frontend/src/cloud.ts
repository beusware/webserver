import socketio from "socket.io-client";

const socket = socketio();

const createFileAnchor = (url: string): void => {
  const a = document.createElement("a");
  a.href = `cloud/${url}`;
  a.innerText = url;

  document.querySelector(".list").appendChild(a);
}

socket.on("cloudDataResponse", (data: Array<string>): void => {
  document.querySelector(".list").innerHTML = "";

  if (data) {
    for (let i of data) {
      createFileAnchor(i);
    }
  }
});

const input: HTMLInputElement = document.querySelector("input");

input.addEventListener("change", async (_) => {
  if (input.files.length == 0) return;

  let file: File = input.files[0];
  let formData: FormData = new FormData();

  formData.append("file", file);

  input.disabled = true;

  await fetch("/cloud/upload", {method: "POST", body: formData});
  
  alert("Upload ist fertig");
  socket.emit("cloudDataRequest");
  input.disabled = false;
  input.value = null;
});

socket.emit("cloudDataRequest");
