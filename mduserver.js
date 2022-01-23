console.log("START")

const express = require('express');
const app = express()
const server = require('http').createServer(app);
const io = require('socket.io')(server);

//Serial
const SerialPort = require('serialport')
const utils = require('./utils');
const { hexStringToByte, byteToHexString } = require('./utils');
const { clearTimeout } = require('timers');


var lastPacketTime = -1;
var delay = 100;
var responseTimeout;

let dispenser;
let printer;


SerialPort.list().then(ports => {
  ports.forEach(function (port) {
    
    if(port.vendorId != null){
      console.log(port)

      if (port.vendorId.toLowerCase() == "1a86") {
        console.log("Dispenser Vendor ID Matched")
        dispenser = new SerialPort(port.path, {
          baudRate: 9600,
          databits: 8,
          parity: 'none',
          stopbits: 1,
          flowControl: false
  
        }, (error) => {
          console.log(error)
        })
      }
  
      if (port.vendorId.toLowerCase() == "067b") {
        console.log("Printer Vendor Id matched")
        printer = new SerialPort(port.path, {
          baudRate: 9600,
        }, (error) => {
          console.log(error)
        })
      }
    }

  });


  if (dispenser != null) {
    console.log("Dispenser connected successfully")

    dispenser.on('data', function (data) {

      if (lastPacketTime == -1 || (new Date().getTime() - lastPacketTime) > delay) {

        responseTimeout = setTimeout(() => {
          const buffer = Buffer.concat(lastPacket);
          lastPacket = []
          console.log("MDU: ", buffer)
          console.log("Received Length: " , buffer.length)
          io.emit("dispenser", byteToHexString(buffer))
        }, 300);

      }

      lastPacketTime = new Date().getTime()
      lastPacket.push(data)
    })

    var lastPacket = [];

  } else {
    console.log("Error: Dispenser not connected")
  }

  if (printer != null) {
    console.log("Printer connected successfully")
  } else {
    console.log("Error: Printer not connected")
  }



});




app.use(express.static('public'))

server.listen(3000, function () {
  console.log("Server listening on port 3000")
});

io.on('connection', socket => {
  console.log("Client Connected")
  websocket = socket;

  //Read dispenser serial data
  socket.on("dispenser", data => {
    // socket.broadcast.emit("dispenser" , data);
    console.log("App: ", data);
    console.log("Sent Length: " , data.length)

    lastPacket = []
    if (dispenser != null)
      dispenser.write(hexStringToByte(data))
  })

  socket.on("nozzleReader", data => {
    // socket.broadcast.emit("nozzleReader" , data);
    console.log(data);
  })

  socket.on("printer", data => {
    const buffer = utils.hexStringToByte(data);
    console.log(buffer)
    if (buffer != null) {
      if (printer != null)
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



