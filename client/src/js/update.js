var table = document.getElementById("game_table");
var input_field = document.getElementById("input_field");
var rooms_text = document.getElementById("available_rooms")
var current_phase = -1;

function startPhase(){
  socket.emit("startPhase");
}

function end_phase(data){
  table.insertRow(current_phase + 1);
  for(var i = 0; i < data.number_of_players; i++){
    table.rows[current_phase + 1].insertCell(0);
  }

  current_phase += 1;
  input_field.value = "";
}

function start_game(data){
  hasStarted = true;
  current_phase += 1;
  table.insertRow(0);
  for(var i = 0; i < data.number_of_players; i++){
    table.rows[0].insertCell(0);
  }
}

function end_game(){
  hasStarted = false;
  current_phase = -1;
}

function getKeys(data){
  socket.emit("getInput", data);
}

function update(data){
  for(var i = data.length - 1; i > -1; i--){
    rooms_text.innerHTML = "";
    for(var k = 0; k < data[i].room_names.length; k++){
      rooms_text.innerHTML += "<br>";
      rooms_text.innerHTML += "Room " + String(Number(k) + 1) +  ": " + data[i].room_names[k] + " | Players: " + data[i].room_sizes[k] + " <button onclick='joinRoom({roomName:data[i].room_names[k]})'>JOIN </button>";
    }
  }

  if(current_phase < 0) return;

  for(var i = data.length - 1; i > -1; i--){
    table.rows[current_phase].cells[i].innerHTML = data[i].current_input;
  }
}



function roomUpdate(data){
  //fuck
  if (self){
    socket.emit("getInput", data);
    //console.log(data.current_input);
  }else{
    for(var i = data.length - 1; i > -1; i--){
      //console.log(data[i].inputs);
    }
  }
}
