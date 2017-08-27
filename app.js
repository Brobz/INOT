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
var ROOM_LIST = [];

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

    socket.on("createRoom", function(data){createRoom(socket.id, data);});

    socket.on("joinRoom", function(data){joinRoom(socket.id, data);});

    socket.on("keyPress", function(data){getKeyInput(socket.id, data);});

    socket.on("disconnect", function(){Disconnected(socket.id)});

    socket.on("getInput", function(data){getInput(socket.id, data);});

    socket.on("startPhase", function(){startPhase(socket.id);});

});

function joinRoom(id, data){
    for(var i in ROOM_LIST){
      if (ROOM_LIST[i].name == data.roomName && ROOM_LIST[i].players.indexOf(PLAYER_LIST[id]) < 0){
          ROOM_LIST[i].addPlayer(PLAYER_LIST[id]);
      }
    }
}


function createRoom(id, data){
  if(data.roomName.toLowerCase() == "") return;
  for(var i in ROOM_LIST){
    if (ROOM_LIST[i].name.toLowerCase() == data.roomName.toLowerCase()) return;
  }
  var new_room = Room(data.roomName, 2, 5, ["AAAA00", "AAAA00", "AAAA00", "AAA100", "A0AA00"]);
  new_room.SOCKET_LIST  = SOCKET_LIST;
  ROOM_LIST.push(new_room);
  joinRoom(id, data);
}

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

function getInput(id, data){
  PLAYER_LIST[id].current_input = data.current_input;
}


function startPhase(id){
  for(var i = 0; i < ROOM_LIST.length; i++){
    for(var k = 0; k < ROOM_LIST[i].players.length; k++){
      if(ROOM_LIST[i].players[k].id == id) ROOM_LIST[i].startPhase();
    }
  }
}

function Update(){
  var room_names = [];
  var room_sizes = [];
  for(var i in ROOM_LIST){
    room_names.push(ROOM_LIST[i].name);
    room_sizes.push(ROOM_LIST[i].players.length);
  }
  var infoPack = [];
  for(var key in PLAYER_LIST){
    infoPack.push({
      current_input : PLAYER_LIST[key].current_input,
      room_names : room_names,
      room_sizes : room_sizes
    });
  }

  for(var key in SOCKET_LIST){
        SOCKET_LIST[key].emit("update_client", infoPack);
      }

}

setInterval(Update, 1000/60);
