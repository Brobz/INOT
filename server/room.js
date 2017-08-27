exports.Room = function(mnS, mxS, colors){
  var self = {
    players : [],
    maxSize : mxS,
    minSize : mnS,
    colors : colors,
    inGame : false,
    current_phase : -1,
    number_of_phases : 5,
    phases : [],
    phaseTime : 5
  }

  self.startPhase = function() {
    current_phase += 1;

     setTimeout(self.endPhase, phaseTime * 1000);
  }

  self.endPhase = function(){
    if (current_phase < number_of_phases - 1) self.startPhase();
  }

  self.removePlayer = function(player){
    index = self.players.indexOf(player);
    self.players.splice(index, 1);
  }

  self.addPlayer = function(player){
    self.players.push(player);
  }

  self.checkForWin = function(){
    return false;
  }

  return self;

}
