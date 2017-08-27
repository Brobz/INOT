console.log("Starting Server...");


var mongojs = require("mongojs");
var db = mongojs("mongodb://brobz:astecas2012@ds047146.mlab.com:47146/afi", ["accounts", "progress"]);

var express = require("express");
var app = express();
var server = require("http").Server(app);

app.get("/", function(req, res){
    res.sendFile(__dirname + "/client/index.html");
});

app.get("/login", function(req, res){
    res.sendFile(__dirname + "/client/login.html");
});

app.get("/signup", function(req, res){
    res.sendFile(__dirname + "/client/signup.html");
});


app.use("/client", express.static(__dirname + "/client"));


server.listen(process.env.PORT || 2000);



console.log("Server Ready!");




var Player = require("./server/player.js").Player;
var Room = require("./server/room.js").Room;

var SOCKET_LIST = {};
var PLAYER_LIST = {};
var ROOM_LIST = [Room(2, 2, ["F10909", "0917F1"])];

ROOM_LIST[0].inGame  = true;

var io = require("socket.io")(server, {});
io.sockets.on("connection", function(socket){
    var p;
    socket.on("signUpInfo", function(data){
      db.accounts.find({username:data.username}, function(err, res){
        if(res.length > 0){
          socket.emit("signUpFailed", {msg: "Sign Up failed. Username/In Game Name already taken."});
          return;
        }else{
          console.log(data.ign);
          db.accounts.find({ign:data.ign}, function(err, res){
            if(res.length > 0){
              socket.emit("signUpFailed", {msg: "Sign Up failed. Username/In Game Name already taken."});
              return;
            }else{
              db.accounts.save({username: data.username, password: data.password, ign: data.ign});
              socket.emit("signUpSuccessfull", {msg: "Account Created Successfully!"});
              return;
            }
          });
        }
      });
    });
    socket.on("logInInfo", function(data){
        db.accounts.find({username:data.username, password:data.password}, function(err, res){
          if(res.length > 0){
            if(data.username in SOCKET_LIST){
              socket.emit("connectionFailed", {msg:"This account is currently logged in elsewhere!"});
              return;
            }

            socket.id = data.username;
            SOCKET_LIST[socket.id] = socket;

            p = Player(socket.id, res[0].ign, null);
            PLAYER_LIST[socket.id] = p;

            ///////////
            ROOM_LIST[0].addPlayer(p);
            ROOM_LIST[0].SOCKET_LIST = SOCKET_LIST;
            //////////

            socket.emit("connected", {
              msg: "Logged in as " + p.name,
              id: socket.id
            });

          }else{
            socket.emit("connectionFailed", {msg:"Invalide Username/Password"});
            return;
          }
        });
    });

    socket.on("setName", function(data){p.name = data.name;});

    if(p === null)
      return;

    socket.on("joinRoom", function(data){
      if(ROOM_LIST[data.room].players.length >= ROOM_LIST[data.room].maxSize || ROOM_LIST[data.room].inGame){
        return;
      }
      for(var i in ROOM_LIST){
        if(ROOM_LIST[i].players.indexOf(p) >= 0){
          ROOM_LIST[i].removePlayer(p);
        }
      }
      ROOM_LIST[data.room].addPlayer(p);

      for(var i in SOCKET_LIST){
        var s = SOCKET_LIST[i];
        s.emit("roomUpdate", {
          rooms: ROOM_LIST,
        });
      }
    });

    socket.on("keyPress", function(data){getKeyInput(socket.id, data);});

    socket.on("disconnect", function(){Disconnected(socket.id)});

    socket.on("getInput", function(data){getInput(socket.id, data);});

    socket.on("startPhase", function(){startPhase(socket.id);});

});

function Disconnected(id) {
  for(var i = 0; i < ROOM_LIST.length; i++){

    if(ROOM_LIST[i].players.indexOf(PLAYER_LIST[id]) >= 0){

      ROOM_LIST[i].removePlayer(PLAYER_LIST[id]);
      ROOM_LIST[i].removeSocket(id);
    }
  }

  delete SOCKET_LIST[id];
  delete PLAYER_LIST[id];



}

function getKeyInput(id, data){
  /*/
  if(data.input == "d"){
    PLAYER_LIST[id].isMovingRight = data.state;
  }
  if(data.input == "s"){
    PLAYER_LIST[id].isMovingDown = data.state;
  }
  if(data.input == "a"){
    PLAYER_LIST[id].isMovingLeft = data.state;
  }
  if(data.input == "w"){
    PLAYER_LIST[id].isMovingUp = data.state;
  }

  if(data.input == "shoot0"){
    PLAYER_LIST[id].isShootingLeft = data.state;

    if(data.state){
      PLAYER_LIST[id].isShootingRight = false;
      PLAYER_LIST[id].isShootingDown = false;
      PLAYER_LIST[id].isShootingUp = false;
    }
  }
  if(data.input == "shoot1"){
    PLAYER_LIST[id].isShootingUp = data.state;

    if(data.state){
      PLAYER_LIST[id].isShootingRight = false;
      PLAYER_LIST[id].isShootingDown = false;
      PLAYER_LIST[id].isShootingLeft = false;
    }
  }
  if(data.input == "shoot2"){
    PLAYER_LIST[id].isShootingRight = data.state;

    if(data.state){
      PLAYER_LIST[id].isShootingLeft = false;
      PLAYER_LIST[id].isShootingDown = false;
      PLAYER_LIST[id].isShootingUp = false;
    }
  }
  if(data.input == "shoot3"){
    PLAYER_LIST[id].isShootingDown = data.state;

    if(data.state){
      PLAYER_LIST[id].isShootingRight = false;
      PLAYER_LIST[id].isShootingLeft = false;
      PLAYER_LIST[id].isShootingUp = false;
    }
  }

  /*/

}

function getInput(id, data){
  PLAYER_LIST[id].current_input = data.current_input;
}


function startPhase(id){
  for(var i = 0; i < ROOM_LIST.length; i++){
    if(ROOM_LIST[i].inGame){
      for(var k = 0; k < ROOM_LIST[i].players.length; k++){
        if(ROOM_LIST[i].players[k].id == id) ROOM_LIST[i].startPhase();
      }
    }
  }
}

function Update(){
  var infoPack = [];
  for(var key in PLAYER_LIST){
    infoPack.push({
      current_input : PLAYER_LIST[key].current_input
    })
  }

  for(var i in ROOM_LIST){
    if(ROOM_LIST[i].inGame){
      for(var k = 0; k < ROOM_LIST[i].players.length; k++){
        var s = SOCKET_LIST[ROOM_LIST[i].players[k].id];
        for(var j = 0; j < infoPack.length; j++){
          if (ROOM_LIST[i].players[k].id - 1 != j){
            for(var x = 0; x < infoPack[j].current_input.length; x++){
              infoPack[j][x] = "*";
            }
          }
        }
        s.emit("update", false, infoPack);
      }
    }
  }

}

setInterval(Update, 1000/60);
