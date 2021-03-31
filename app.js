const SerialPort = require('serialport')
const utils = require('./constants')

console.log("Delay: " , utils.isAGroupEnabled , " seconds");


// SerialPort.list().then(ports => {
//     ports.forEach(function(port) {
//       console.log(port.path);
//       console.log(port.pnpId);
//       console.log(port.manufacturer);
//     });
//   });