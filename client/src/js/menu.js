var socket;
var id;
var log_sign = document.getElementById("log_sign");
var nameInput = document.getElementById("nameInput");
var passInput = document.getElementById("passInput");
var ignInput = document.getElementById("ignInput");
var connectButton = document.getElementById("connectButton");
var signButton = document.getElementById("signButton");
var backToLoginButton = document.getElementById("backToLoginButton");
var signedText = document.getElementById("signedText");
var connectedText = document.getElementById("connectedText");
var actionText = document.getElementById("actionText");
var signUpText = document.getElementById("signUpText");

var startGame1 = document.getElementById("startGame1");
var startGame2 = document.getElementById("startGame2");
var startGame3 = document.getElementById("startGame3");
var startGameButtons = [startGame1, startGame2, startGame3];

var winners = ["", "", ""]

canvas.font = "15px Monaco";
canvas.textAlign = 'center';

function connected(data){

  id = data.id;

  document.getElementById("connectedText").innerHTML = data.msg;

  socket.on("update", function(data){update(data)});

  socket.on("startGame", function(data){startGame(data)});

  socket.on("endGame", function(data){endGame(data)});

  log_sign.style.display = "none";


}

function connectionFailed(data){
  document.getElementById("connectedText").innerHTML = data.msg;
}

backToLoginButton.onclick = function(){
  ignInput.style.display = "none";
  backToLoginButton.style.display = "none";
  connectButton.style.display = "";
  actionText.innerHTML = "Log In"
  signUpText.style.display = "";
  signedText.innerHTML = "";
  connectedText.innerHTML = "";
  nameInput.value = "";
  passInput.value = "";
  ignInput.value = "";
}

signButton.onclick = function(){
  if(ignInput.style.display == "none"){

    nameInput.value = "";
    passInput.value = "";
    ignInput.value = "";

    ignInput.style.display = "";
    backToLoginButton.style.display = "";
    connectButton.style.display = "none";
    actionText.innerHTML = "Sign Up"
    signUpText.style.display = "none";
    connectedText.innerHTML = "";

  }else{

    if(nameInput.value == "" || passInput.value == "" || ignInput.value == "")
      return;

    socket = io();

    signedText.innerHTML = "Signing Up...";

    socket.emit("signUpInfo", {username:nameInput.value.toLowerCase(), password:passInput.value, ign:ignInput.value});

    socket.on("signUpSuccessfull", function(data){
      signedText.innerHTML = data.msg;
    });

    socket.on("signUpFailed", function(data){
      signedText.innerHTML = data.msg;
    });
  }
}

connectButton.onclick = function(){

    socket = io();

    connectedText.innerHTML = "Connecting...";

    socket.emit("logInInfo", {username:nameInput.value.toLowerCase(), password:passInput.value});

    socket.on("connected", function(data){connected(data)});

    socket.on("connectionFailed", function(data){connectionFailed(data)});




}

nameInput.onkeypress = passInput.onkeypress = function(e){
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode == '13'){
      if(connectButton.style.display == "")
        connectButton.onclick();
    }
}
