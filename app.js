const SerialPort = require('serialport')
const utils = require('./constants')

SerialPort.list().then(ports => {
    ports.forEach(function (port) {
        console.log(port.path);
        console.log(port.pnpId);
        console.log(port.manufacturer);
    });
});

return;

const com1 = new SerialPort('/dev/tty.usbserial-110', {
    baudRate: 9600,
}, (error) => {
    console.log(error)
})


com1.on('data', function (data) {

    // const buffer = Buffer.concat(data);

    console.log("Data: " , data);
    // if (lastPacketTime == -1 || (new Date().getTime() - lastPacketTime) > delay) {

    //     responseTimeout = setTimeout(() => {
    //         const buffer = Buffer.concat(lastPacket);
    //         lastPacket = []
    //         console.log("Length", buffer.length)
    //         io.emit("dispenser", byteToHexString(buffer))
    //     }, 500);

    // }

    // lastPacketTime = new Date().getTime()
    // lastPacket.push(data)
})


//Writing to COM1
const array = new ArrayBuffer(12);
const buffer = new Uint8Array(array)
buffer[0] = 0x31;
buffer[1] = 0x30;
buffer[2] = 0x30;
buffer[3] = 0x30;
buffer[4] = 0x36;
buffer[5] = 0xAA;
buffer[6] = 0xBB;
buffer[7] = 0xCC;
buffer[8] = 0xDD;
buffer[9] = 0x11;
buffer[10] = 0x22

// buffer[6] = 0x55;
// buffer[7] = 0x66;
// buffer[8] = 0x77;
// buffer[9] = 0x88;
// buffer[10] = 0x99;
// buffer[11] = 0xAA;

console.log("Sending buffer " , buffer);
com1.write(buffer);