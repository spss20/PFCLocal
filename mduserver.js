const express = require('express');
const SerialPort = require('serialport');
const app = express()
const server = require('http').createServer(app);
const io = require('socket.io')(server);
var ByteBuffer = require("bytebuffer");

//Serial
const serialPort = require('serialport')
const utils = require('./utils');
const { arch } = require('os');
const { Logger } = require('mongodb');
const { hexStringToByte, byteToHexString } = require('./utils');
const { clearTimeout } = require('timers');


var lastPacketTime = -1;
var delay = 70;
var responseTimeout;

serialPort.list().then(ports => {
  ports.forEach(function (port) {
    console.log(port.path);
    console.log(port.pnpId);
    console.log(port.manufacturer);
  });
});

const printer = new SerialPort('COM16', {
  baudRate: 9600,
}, (error) => {
  console.log(error)
})

const dispenser = new SerialPort('COM11', {
  baudRate: 5787,
  parity: 'even'
}, (error) => {
  console.log(error)
})

var lastPacket = [];

// const array = new ArrayBuffer(1);
// const buffer = new Uint8Array(array)
// buffer[0]  = 0x51;
// dispenser.write(buffer)

app.use(express.static('public'))

server.listen(3000, function () {
  console.log("Server listening on port 3000")
});

io.on('connection', socket => {
  console.log("Client Connected")
  websocket = socket;

  //Read dispenser serial data
  socket.on("dispenser" , data => {
    // socket.broadcast.emit("dispenser" , data);
    console.log("Received App: " , data);
    dispenser.write(hexStringToByte(data))
    lastPacket = []
    console.log("Before Packet",lastPacket);
  })

  socket.on("nozzleReader" , data => {
    // socket.broadcast.emit("nozzleReader" , data);
      console.log(data);
  })

  socket.on("printer" , data => {
    const buffer = utils.hexStringToByte(data);
    console.log(buffer)
    if(buffer != null){
        printer.write(buffer)
    }
  })
  socket.on('disconnect', () => { 
    console.log("Client Disconnected")
    lastPacket = []
    lastPacketTime = -1;
    clearTimeout(responseTimeout)
    responseTimeout = null;
   });

});

dispenser.on('data', function(data) {
 
  if(lastPacketTime == -1 || (new Date().getTime() - lastPacketTime) > delay){

     responseTimeout = setTimeout(() => {
        const buffer = Buffer.concat(lastPacket);
        lastPacket = []
        console.log("Length"  , buffer.length)
        io.emit("dispenser", byteToHexString(buffer))
      }, 500);

  }

  lastPacketTime = new Date().getTime()
  lastPacket.push(data)
})

