const path = require("path");
const fs = require("fs");
const legacy_request = require('request');
const progress = require('request-progress');

let waveForm = [];
let parseWave = false;
const {spawn} = require("child_process");


module.exports = ({Arg0, Else}, api) => {
    const store = {
        requests: {}
    };

    const captions = {
        //    A: "Save",
        //    B: "Upload",
        //    D: "Playback"
        R1: "ADSR",
        // R2: "Loop"
    };
    let stopAudio = () => {
    };

    const startAudio = (file) => {
        waveForm = [];
        stopAudio();
        let audio = spawn(path.join(__dirname, "..", "..", "audio", "BeagleAudio"), [3, `"${file}"`], {shell: true});
        audio.stdout.on('data', (data) => {
            let tmp = data.toString().replace(/(\r\n\t|\n|\r\t)/gm, "");

            if (tmp.indexOf("##WAVE_START##") !== -1) {
                parseWave = true;
            }
            if (tmp.indexOf("##WAVE_END##") !== -1) {
                parseWave = false;
                api.sendView("waveform",
                    {
                        sound: waveForm
                    });
            }
            if (parseWave) {
                tmp = tmp.replace("##WAVE_START##", "");
                tmp = tmp.replace("##WAVE_END##", "");
                let waveData = tmp.split(" ");
                waveData.forEach((wData) => {
                    if (wData !== "") {
                        waveForm.push(parseFloat(wData));
                    }
                });
            }
        });

        stopAudio = () => audio.kill();
    };

    let scope = {
        name: "load_sample",
        captions: captions,
        title: "Load Sample",
        data: {
            default_captions: captions,
            item: {},
            settings: {},
            params: {
                adsr: {
                    attack: 0,
                    decay: 0,
                    sustain: 0,
                    release: 0,
                },
                loop: {
                    start: 0,
                    end: -1
                }
            }
        },
        resume: (name, returnData, data) => {
            api.display("load_sample", data);
            showWaveForm(data.filename);
        },
        start(data) {
            api.display("load_sample", data);

            let filename = data.file;
            api.file.load(filename);
            if (data.hasOwnProperty("meta")) {
                api.file.settings.set("meta", data.meta);
            }
            startAudio(filename);
            //showWaveForm(data.item.filename);
        },
        events: {
            "ROTARY_LEFT": [
                [Arg0("Z1"), [
                    (api, data, event) => {
                        api.sendView("zoom_out", {});
                    }
                ]],
                [Arg0("Z2"), [
                    (api, data, event) => {
                        api.sendView("zoom_left", {});
                    }
                ]]],
            "ROTARY_RIGHT": [
                [Arg0("Z1"), [
                    (api, data, event) => {
                        api.sendView("zoom_in", {});
                    }
                ]],
                [Arg0("Z2"), [
                    (api, data, event) => {
                        api.sendView("zoom_right", {});
                    }
                ]]],
            "BUTTON_UP": [
                [Arg0("BACK"), [
                    function (api, data, event) {
                        stopAudio();
                        api.popState(data);
                    }
                ]],
                [Arg0("R1"), [
                    (api, data, event) => {
                        api.pushState("adsr", data);
                    }
                ]],
                [Arg0("R2"), [
                    (api, data, event) => {
                        data.submode = "loop";
                        api.sendView("submode", {mode: data.submode, data: data.params.loop});
                    }
                ]],
                [Arg0("A"), [
                    (api, data, event) => {
                    }
                ]],
                [Arg0("B"), [
                    (api, data, event) => {
                    }
                ]],
                [Arg0("BACK"), [
                    (api, data, event) => {
                        api.pushState("playback", data);
                    }
                ]]
            ]
        }
    };
    return scope;
};