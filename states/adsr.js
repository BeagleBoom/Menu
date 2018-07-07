const path = require("path");
const fs = require("fs");

module.exports = ({Arg0, Else}, api) => {
    function sendADSR(adsr) {

        adsr = {
            attack: Math.round(adsr.attack),
            decay: Math.round(adsr.decay),
            sustain: Math.round(adsr.sustain * 10) / 10,
            release: Math.round(adsr.release),
        };

        api.send("ADSR", [
            adsr.attack, adsr.decay, adsr.sustain, adsr.release
        ]);
        api.sendView("adsr", adsr);
        api.file.settings.set("adsr", adsr);

    }

    let scope = {
        name: "adsr",
        captions: {
            "R1": "Attack",
            "R2": "Decay",
            "R3": "Sustain",
            "R4": "Release"
        },
        title: "ADSR-Settings",
        data: {
            params: {
                adsr: {
                    attack: 0,
                    decay: 0,
                    sustain: 0,
                    release: 0,
                }
            }
        },
        resume: (name, returnData, data) => {
            api.display("adsr", data);
            drawADSR();
        },
        start(data) {
            api.display("adsr", data);

            data.params.adsr = api.file.settings.get("adsr", {
                attack: 500,
                decay: 500,
                sustain: 0.8,
                release: 500
            });
        },
        events: {
            "ROTARY_LEFT": [
                [Arg0("R1"), [
                    (api, data, event) => {
                        data.params.adsr.attack -= 100;
                        if (data.params.adsr.attack < 0)
                            data.params.adsr.attack = 0;
                        sendADSR(data.params.adsr);
                    }
                ]],
                [Arg0("R2"), [
                    (api, data, event) => {
                        data.params.adsr.decay -= 100;
                        if (data.params.adsr.decay < 1)
                            data.params.adsr.decay = 1;
                        sendADSR(data.params.adsr);
                    }
                ]],
                [Arg0("R3"), [
                    (api, data, event) => {
                        data.params.adsr.sustain -= 0.1;
                        if (data.params.adsr.sustain < 0)
                            data.params.adsr.sustain = 0;
                        sendADSR(data.params.adsr);
                    }
                ]], [Arg0("R4"), [
                    (api, data, event) => {
                        data.params.adsr.release -= 100;
                        if (data.params.adsr.release < 0)
                            data.params.adsr.release = 0;
                        sendADSR(data.params.adsr);
                    }
                ]],
            ],
            "ROTARY_RIGHT": [
                [Arg0("R1"), [
                    (api, data, event) => {
                        data.params.adsr.attack += 100;
                        sendADSR(data.params.adsr);
                    }
                ]], [Arg0("R2"), [
                    (api, data, event) => {
                        data.params.adsr.decay += 100;

                        if (data.params.adsr.decay == 101) {
                            data.params.adsr.decay = 100;
                        }
                        sendADSR(data.params.adsr);
                    }
                ]],
                [Arg0("R3"), [
                    (api, data, event) => {
                        data.params.adsr.sustain += 0.1;
                        if (data.params.adsr.sustain < 0.1) {
                            data.params.adsr.sustain = 0.1;
                        }

                        if (data.params.adsr.sustain > 1) {
                            data.params.adsr.sustain = 1;
                        }
                        sendADSR(data.params.adsr);
                    }
                ]], [Arg0("R4"), [
                    (api, data, event) => {
                        data.params.adsr.release += 100;
                        sendADSR(data.params.adsr);
                    }
                ]]],
            "BUTTON_UP": [
                [Arg0("R1"), []],
                [Arg0("R2"), []],
                [Arg0("A"), []],
                [Arg0("B"), []],
                [Arg0("D"), []]
            ]
        }
    };
    return scope;
};