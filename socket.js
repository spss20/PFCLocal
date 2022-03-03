const express = require('express');
const app = express()
const server = require('http').createServer(app);
const io = require('socket.io')(server);
var path = require('path');
const port = 3000;

server.listen(port, function () {
  console.log("Server listening on port " , port)
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
    console.log("Dispenser" , data);
  })


  socket.on("nozzleReader" , data => {
    socket.broadcast.emit("nozzleReader" , data);
      console.log(data);
  })
  socket.on('disconnect', () => { console.log("Client Disconnected") });
});
