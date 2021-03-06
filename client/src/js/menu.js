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
var createRoomText = document.getElementById("create_room_name");
var joinRoomText = document.getElementById("join_room_name");

var startGame1 = document.getElementById("startGame1");
var startGame2 = document.getElementById("startGame2");
var startGame3 = document.getElementById("startGame3");
var startGameButtons = [startGame1, startGame2, startGame3];

var winners = ["", "", ""]

function can_start_phase(){
  if(current_phase < 0){
    document.getElementById("startGameButton").style = "";
  }
}

function cant_start_phase(){
  document.getElementById("startGameButton").style = "display:none;";
}

function connected(data){

  id = data.id;

  document.getElementById("connectedText").innerHTML = data.msg;

  socket.on("update_inputs", function(data){update_inputs(data)});

  socket.on("update_rooms", function(data){update_rooms(data)});

  socket.on("start_game", function(data){start_game(data)});

  socket.on("can_start_phase", function(){can_start_phase()});

  socket.on("cant_start_phase", function(){cant_start_phase()});

  socket.on("end_game", function(){end_game()});

  socket.on("end_phase", function(data){end_phase(data)});

  log_sign.style ="display:none;";

  rooms.style.display = "";

}

function connectionFailed(data){
  document.getElementById("connectedText").innerHTML = data.msg;
}

/*
function roomUpdate(data){

}
*/

function joinRoom(data){
  socket.emit("joinRoom", data);
}

function createRoom(){
  socket.emit("createRoom", {roomName:createRoomText.value});
}

signup = function(){
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

connect = function(){

    socket = io();

    connectedText.innerHTML = "Connecting...";

    socket.emit("logInInfo", {username:nameInput.value.toLowerCase(), password:passInput.value});

    socket.on("connected", function(data){connected(data)});

    socket.on("connectionFailed", function(data){connectionFailed(data)});

    socket.on("roomUpdate", function(data){roomUpdate(data)});



}
try{
  nameInput.onkeypress = passInput.onkeypress = function(e){
      if (!e) e = window.event;
      var keyCode = e.keyCode || e.which;
      if (keyCode == '13'){
        if(connectButton.style.display == "")
          connectButton.onclick();
      }
  }
}
catch(e){

}
