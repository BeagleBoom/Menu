const midi = require('midi');

const inputs = new midi.input();

const {send, start} = require("../lib/messageQueue")();

start(true);

let started = [];

const open = (port, name) => {
    if (port === -1 || started.includes(name)) return;
    started.push(name);
    const channel = new midi.input();
    channel.on('message', function (deltaTime, message) {
        if (selectedMidiDevice !== name) {
            return;
        }
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
        send("ADC_VALUES", eventPackage);
    });
    channel.openPort(port);
};


let selectedMidiDevice = null;
module.exports = ({Arg0, Else}, api) => {
    return {
        name: "midi",
        title: "Midi Settings",
        captions: {
            "D": "Select"
        },
        data: {
            devices: ["Off"],
            selectedItem: api.settings.get("midi_device", "Off")
        },
        resume: (name, returnData) => {

        },
        start: (initData) => {
            initData.devices = initData
                .devices
                .concat(Array
                    .from(Array(inputs.getPortCount()))
                    .map((v, i) => inputs.getPortName(i))
                );

            if (selectedMidiDevice == null) {
                selectedMidiDevice = initData.selectedItem;
            }
            let selectedIndex = initData.devices.indexOf(selectedMidiDevice);
            if (selectedIndex === -1) {
                selectedIndex = 0;
                selectedMidiDevice = "Off";
            }

            initData.selectedIndex = selectedIndex;
            initData.currentIndex = selectedIndex;
            open(initData.selectedIndex - 1, selectedMidiDevice);
            api.display("midi", initData);
        },
        events: {
            "BUTTON_UP": [
                [Arg0("D", "Z2"), [
                    (api, data, event) => {
                        data.selectedIndex = data.currentIndex;
                        selectedMidiDevice = data.devices[data.selectedIndex];
                        api.sendView("select", data.selectedIndex);
                        open(data.selectedIndex - 1, selectedMidiDevice);
                        api.settings.set("midi_device", selectedMidiDevice);
                    }
                ]]
            ],
            "ROTARY_LEFT": [
                [Arg0("Z2"), [
                    (api, data, event) => {
                        data.currentIndex--;

                        if (data.currentIndex < 0) {
                            data.currentIndex = data.devices.length - 1;
                        }
                        api.sendView("scroll", data.currentIndex);
                    }
                ]]
            ],
            "ROTARY_RIGHT": [
                [Arg0("Z2"), [
                    (api, data, event) => {
                        data.currentIndex++;

                        if (data.currentIndex > data.devices.length - 1) {
                            data.currentIndex = 0;
                        }
                        api.sendView("scroll", data.currentIndex);
                    }
                ]]
            ]
        }
    }
}
;