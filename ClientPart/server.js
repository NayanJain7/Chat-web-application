const express = require("express");
const app = express();
const upload = require("express-fileupload");
const path = require("path");
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const port = process.env.PORT || 8000;

app.use(express.static(__dirname));
app.use(upload());

let username = {};

app.get("/", (req, res) => {
  res.sendFile("/index");
});

// file send request
app.post("/file", (req, res) => {
  
  console.log("Inside post method");
  if (req.files) {
    var file = req.files.files;

    var filename = file.name;
    file.mv("./UploadFiles/" + filename, function (err) {
      if (err) {
        res.send("File not uploaded", err);
        console.log("File Uploaded error line no.29 => ", err);
      } else {
        console.log("File uploaded");
        console.log(username);
      }
    });
  }
});


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

  socket.on("image-send", (filename) => {
    socket.broadcast.emit("show-image-all", filename);
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

