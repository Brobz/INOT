exports.Room = function(mnS, mxS, colors){
  var self = {
    players : [],
    maxSize : mxS,
    minSize : mnS,
    colors : colors,
    inGame : false
  }

  self.removePlayer = function(player){
    index = self.players.indexOf(player);
    self.players.splice(index, 1);
    self.updateTeams();
  }

  self.addPlayer = function(player){
    self.players.push(player);
    self.updateTeams();
  }

  self.checkForWin = function(){
    return false;
  }

  return self;

}
