const midi = require('midi');

const {send, start} = require("./lib/messageQueue")();

start(true);

var input = new midi.input();

let count = input.getPortCount();
console.log("found devices: ", count);
for (let i = 0; i < count; i++) {
    console.log(input.getPortName(i));
}

input.on('message', function (deltaTime, message) {
    let trigger = false;
    let note = message[1];
    switch (message[0]) {
        case 0x90:
            trigger = true;
            break;
        case 0x80:
            trigger = false;
            break;
        default:
            return;
    }
    let eventPackage = [
        2,//CV 1
        note,
        6,//Gain 1
        trigger ? 1 : 0
    ];
    console.log(eventPackage);
    send("ADC_VALUES", eventPackage);
});
input.openPort(0);

