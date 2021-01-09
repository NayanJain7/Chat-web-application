const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const port = process.env.PORT || 8000

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile("/index");
});
let username = {};
io.on("connection", (socket) => {
  console.log("connected");

  socket.on("new-user-joined", (name) => {
    username[socket.id] = name;
    socket.broadcast.emit("user-joined", name);
    console.log(username);
  });

  socket.on("send", (msg) => {
    socket.broadcast.emit("send-message", {
      message: msg,
      user: username[socket.id],
    });
  });

  socket.on("disconnect", (message) => {
    socket.broadcast.emit("user-left", username[socket.id]);
    console.log("Disconnect Message is " + username[socket.id]);
    delete username[socket.id];
  });
});

http.listen(port, () => {
  console.log("Listening.....");
});
