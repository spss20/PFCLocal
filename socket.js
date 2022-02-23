const express = require('express');
const app = express()
const server = require('http').createServer(app);
const io = require('socket.io')(server);
var path = require('path');


server.listen(3000, function () {
  console.log("Server listening on port 3000")
});

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {
  console.log("Client Connected")
  websocket = socket;

  socket.on("main" , data => {
      console.log(data);
  })
  
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
