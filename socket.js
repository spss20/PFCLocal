const express = require('express');
var fs = require('fs');
var cors = require('cors');
const app = express()
const corsConfig = {
    origin: "*",
    credentials: true
  };
app.use(cors(corsConfig));

const server = require('https').createServer({
  key: fs.readFileSync('./ssl.key'),
  cert: fs.readFileSync('./cert.crt'),
  ca: fs.readFileSync('./certificate_auth.crt'),
  requestCert: false,
  rejectUnauthorized: false
}, app);

const io = require('socket.io')(server , { cors: corsConfig });

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
