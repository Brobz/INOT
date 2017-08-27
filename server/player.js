exports.Player = function(id, name, color){
  var self = {
    name : name,
    color : color,
    id : id,
    current_input : ""

  }

  return self;
}
