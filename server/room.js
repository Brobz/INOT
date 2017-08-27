exports.Room = function(name, mnS, mxS, colors){
  var self = {
    name : name,
    players : [],
    maxSize : mxS,
    minSize : mnS,
    colors : colors,
    inGame : false,
    current_phase : -1,
    number_of_phases : 5,
    phases : [],
    phaseTime : 5,
    SOCKET_LIST : {}
  }

  self.startPhase = function() {
    if(self.current_phase == -1){
      self.inGame = true;
      for(var i = 0; i < self.players.length; i++){
        self.SOCKET_LIST[self.players[i].id].emit("start_game", {number_of_players : self.players.length});
      }
    }
    self.current_phase += 1;

     setTimeout(self.endPhase, self.phaseTime * 1000);
  }

  self.endPhase = function(){
    self.phases.push([]);
    for(var i = 0; i < self.players.length; i++){
      self.phases[self.current_phase].push(self.players[i].current_input);
      self.players[i].current_input = ""
    }
    if (self.current_phase < self.number_of_phases - 1) {
      self.startPhase();
      for(var i = 0; i < self.players.length; i++){
        self.SOCKET_LIST[self.players[i].id].emit("end_phase", {number_of_players : self.players.length});
      }
    }else{
      for(var i = 0; i < self.players.length; i++){
        self.SOCKET_LIST[self.players[i].id].emit("end_game");
      }
      self.inGame = false;
      self.current_phase = -1;
      self.phases = [];
    }
  }

  self.removePlayer = function(player){
    index = self.players.indexOf(player);
    self.players.splice(index, 1);
  }

  self.addPlayer = function(player){
    self.players.push(player);
  }

  self.addSocket = function(socket, id){
    self.SOCKET_LIST[id] = socket;
  }

  self.removeSocket = function(id){
    delete self.SOCKET_LIST[id];
  }

  self.checkForWin = function(){
    return false;
  }

  return self;

}
