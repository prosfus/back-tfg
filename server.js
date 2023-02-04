const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: process.env.ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

let connectedUsers = [];

io.on("connection", (socket) => {
  socket.on("hello", (data) => {
    console.log("[*] New user connected", data.name);
    connectedUsers = [...connectedUsers, { name: data.name, id: socket.id }];
    io.emit("connectedUsers", connectedUsers);
    io.emit("me", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("[*] User disconnected");
    connectedUsers = connectedUsers.filter((u) => u.id !== socket.id);
    socket.broadcast.emit("connectedUsers", connectedUsers);
  });

  socket.on("callUser", (data) => {
    io.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });
});

server.listen(process.env.PORT || 5000, () =>
  console.log("Server is running on port: ", process.env.PORT || 5000)
);
