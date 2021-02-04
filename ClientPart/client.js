const socket = io();

const form = document.getElementById("send-container");
const messageInput = document.getElementById("messageInp");
const fileBtn = document.getElementById("fileBtn");
const fileChoosen = document.getElementById("file");
const messageArea = document.querySelector(".message_area");

var audio = new Audio("Ding.mp3");

fileBtn.addEventListener("click", () => {
  fileChoosen.click();
});

fileChoosen.addEventListener("change", () => {
  const file = fileChoosen.files[0];
  const formData = new FormData();

  formData.append("files", file);

  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    console.log(xhr.readyState);
  };

  xhr.open("POST", "https://chatter-webapplication.herokuapp.com/file");
  xhr.send(formData);

  showImage(file);
});

function showImage(file) {
  appendImage(file, "right");

  scrollToBottom();
  socket.emit("image-send", file.name);
}

socket.on("show-image-all", (filename) => {
  window.setTimeout(() => {
    appendImage(filename, "left");
  }, 5000);
});

let username;
do {
  username = prompt("Enter your name to join");
} while (!username);

if (username.trim().length < 2) {
  console.log(username.trim().length < 2);
  alert("Enter valid name");
  window.location.reload();
}

//show user joined,inform to server
socket.emit("new-user-joined", username);

//show user joined message on page
socket.on("user-joined", (name) => {
  audio.play();
  appendMessageCenter(name, "join");
});
// on send message
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = messageInput.value;

  if (message.trim() == "") {
    alert("Message not be empty");
    return;
  }

  messageInput.value = "";
  sendMessage(message);
});

// Recieve Message from other users
socket.on("send-message", (msg) => {
  audio.play();
  appendMessage(msg, "left");
  scrollToBottom();
});

// user left

socket.on("user-left", (user) => {
  appendMessageCenter(user, "left");
  scrollToBottom();
});

function sendMessage(msgValue) {
  let msg = {
    user: username,
    message: msgValue,
  };
  //Insert Message in page
  appendMessage(msg, "right");

  //sendToServer

  socket.emit("send", msgValue);
  scrollToBottom();
}

function appendMessageCenter(name, sign) {
  let messageDiv = document.createElement("div");
  messageDiv.classList.add("center");
  let markup;
  if (name == null) {
    return;
  }
  if (sign == "join") {
    markup = `<p id="join">${name} joined the chat</p>`;
    audio.play();
  } else {
    markup = `<p id="left">${name} left the chat</p>`;
  }

  messageDiv.innerHTML = markup;
  messageArea.appendChild(messageDiv);
  scrollToBottom();
}

function appendMessage(msg, classType) {
  let messageDiv = document.createElement("div");
  let className = classType;

  messageDiv.classList.add("message", className);

  let markup = `
            <div id='name${className}'>
            <h4>${msg.user}</h4></div>
            <p>${msg.message}</p>
            <span style="font-size: x-small;color: black;">${new Date().toLocaleTimeString()}</span>
    `;
  messageDiv.innerHTML = markup;

  messageArea.appendChild(messageDiv);
}

function appendImage(file, classType) {
  let messageDiv = document.createElement("div");
  let className = classType;

  messageDiv.classList.add("message", className, "imageback");

  let markup;
  let file_url;
  let file_extension;
  if (classType === "right") {
    file_url = URL.createObjectURL(file);
    file_extension = file.name.split(".")[1];
  } else {
    file_url = `http://localhost:8000/show?filename=${file}`;
    file_extension = file.split(".")[1];
  }

  markup = generateMarkup(file_url, file_extension);

  messageDiv.innerHTML = markup;

  messageArea.appendChild(messageDiv);
  scrollToBottom();
}

function generateMarkup(file_url, file_extension) {
  let markup;
  const acceptedImage = ["gif", "jpeg", "png", "jpg"];
  const acceptedAudio = ["mp3", "m4a", "wav", "ogg"];
  const acceptedVideo = ["mp4", "mov", "avi", ".mov"];

  if (acceptedImage.includes(file_extension.toLowerCase())) {
    markup = `<img src='${file_url}' class='image'> `;
  } else if (acceptedAudio.includes(file_extension.toLowerCase())) {
    markup = `<audio controls class='audio'><source src='${file_url}' type='audio/${file_extension}' /> </audio> `;
  } else if (acceptedVideo.includes(file_extension.toLowerCase())) {
    markup = `<video controls class='video'><source src='${file_url}' type='video/${file_extension}' /> </video> `;
  } else {
    markup = `<iframe src='${file_url}' ></iframe><br><a href='${file_url}' target='_blank' >view</a>`;
    return markup;
  }

  return (
    markup +
    `<br><span style="
  font-size: small;
  color: black;
">${new Date().toLocaleTimeString()}</span>`
  );
}

function scrollToBottom() {
  messageArea.scrollTop = messageArea.scrollHeight;
}
