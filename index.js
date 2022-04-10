const express = require('express');
const app = express();

const ws = require('ws');

const Scraper = require("./scraper.js");

const scraper = new Scraper("57406ac14592dae5e720e0e68d0f4583", { x: -513, y: 2780, w: 32, h: 32 });
scraper.get().then(canvas => {
  console.log("Canvas loaded!");
});
scraper.connectEventSource();
scraper.on("update", (data) => {
  console.log("Pixel in area updated!", data);
  sendUpdate(data);
});
scraper.on("connectionReady", (e) => {
  console.log("EventSource connection ready!");
});

function sendUpdate(data) {
  if (sockets.length <= 0) return;
  sockets.forEach(socket => {
    socket.send(JSON.stringify({ type: "update", data: data }));
  });
}

app.get("/api/pixel/:x.:y", async (req, res) => {
  const x = parseInt(req.params.x);
  const y = parseInt(req.params.y);
  const color = scraper.getColor(x, y);
  res.send(color);
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const server = app.listen(process.env.PORT || 3000, () => {
  console.log("Server up!");
});
const wsServer = new ws.Server({ server: server, path: '/api/live' });
wsServer.getUniqueID = function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4() + '-' + s4();
};

const sockets = [];

wsServer.on("connection", (socket) => {
  socket.id = wsServer.getUniqueID();
  console.log("New client connected! ", socket.id);

  socket.on("close", () => {
    console.log("Client disconnected. ", socket.id);
    sockets.splice(sockets.indexOf(socket), 1);
  });
  
  sockets.push(socket);
});
