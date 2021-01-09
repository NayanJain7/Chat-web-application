const socket = io();

const form = document.getElementById("send-container");
const messageInput = document.getElementById("messageInp");
const messageArea = document.querySelector(".message_area");

var audio = new Audio('Ding.mp3');


let username;
do {
  username = prompt("Enter your name to join");
} while (!username);

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

  if(message.trim()==""){
    alert("Message not be empty");
    return
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
  if(name==null){
    return;
  }
  if (sign == "join") {
    markup = `<p>${name} joined the chat</p>`;
    audio.play();
  } else {
    markup = `<p>${name} left the chat</p>`;
  }

  messageDiv.innerHTML = markup;
  messageArea.appendChild(messageDiv);
}

function appendMessage(msg, classType) {
  let messageDiv = document.createElement("div");
  let className = classType;

  messageDiv.classList.add("message", className);

  let markup = `
            <h4>${msg.user}</h4>
            <p>${msg.message}</p>

    `;
  messageDiv.innerHTML = markup;

  messageArea.appendChild(messageDiv);
}

function scrollToBottom() {
  messageArea.scrollTop = messageArea.scrollHeight;
}
