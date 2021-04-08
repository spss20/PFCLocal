const express = require('express');
const app = express()
const server = require('http').createServer(app);
const io = require('socket.io')(server);


server.listen(3000, function () {
  console.log("Server listening on port 3000")
});


io.on('connection', socket => {
  console.log("Client Connected")
  websocket = socket;

  //Read dispenser serial data
  socket.on("dispenser" , data => {
    socket.broadcast.emit("dispenser" , data);
    console.log(data);
  })


  socket.on("nozzleReader" , data => {
    socket.broadcast.emit("nozzleReader" , data);
      console.log(data);
  })
  socket.on('disconnect', () => { console.log("Client Disconnected") });
});



