var table = document.getElementById("game_table");
var hasStarted = false;

function startPhase(){
  socket.emit("startPhase");
}

function startItUp(data){
  hasStarted = true;
  table.insertRow(0);
  for(var i = 0; i < data.number_of_players; i++){
    table.rows[0].insertCell(0);
  }
}

function endItUp(){
  hasStarted = false;
}

function update(self, data){
  if (!hasStarted) return;
  if (self){
    socket.emit("getInput", data);
    //console.log(data.current_input);
  }else{
    console.log(data);
    for(var i = data.length - 1; i > -1; i--){
      //console.log(data[i].inputs);
      table.rows[0].cells[i].innerHTML = data[i].current_input
    }
  }
}



function roomUpdate(data){
  //fuck
  if (self){
    socket.emit("getInput", data);
    //console.log(data.current_input);
  }else{
    console.log(data);
    for(var i = data.length - 1; i > -1; i--){
      //console.log(data[i].inputs);
    }
  }
}
