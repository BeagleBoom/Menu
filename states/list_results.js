const MPlayer = require('mplayer');
const player = new MPlayer();
module.exports = ({Arg0, Else}, api) => {
    return {
        name: "list_results",
        title: "Results",
        captions: {
            "A": "Previous",
            "D": "Next"
        },
        data: {
            results: {},
            selectedItem: "",
            origin: ""
        },
        resume: (name, returnData) => {
            api.send("LIST_RESULTS", {
                title: this.title,
                data: this.data,
            });
        },
        start: (name, initData) => {
            this.title = initData.title || "Results";
            this.data.results = initData.results;
            this.data.origin = initData.origin || "local";
            api.send("LIST_RESULTS", {
                title: this.title,
                data: this.data,
            });
        },
        events: {
            "BUTTON_DOWN": [
                [Arg0("PLAY"), [
                    (api, data, event) => {
                        console.log("Playing sound ", this.data.selectedItem);
                        switch (this.data.origin) {
                            case "freesound":
                                api.send("PLAY_PREVIEW", this.data.selectedItem);
                                player.openFile('http://freesound.org/data/previews/392/392617_7383104-lq.mp3');
                                break;
                            case "local":
                                api.send("PLAY_PREVIEW", this.data.results[this.data.selectedItem].path);
                                break;
                            default:
                                console.error("unknown service: ", this.data.origin);
                        }
                    }
                ]],
                [Arg0("STOP"), [
                    (api, data, event) => {
                        player.stop();
                        api.send("STOP_PREVIEW");
                    }
                ]],
                [Arg0("Z2"), [
                    (api, data, event) => {
                        console.log("Z2", this.data);
                        if (this.data.origin === "freesound") {
                            api.send("FREESOUND_DOWNLOAD", this.data.selectedItem);
                        }
                        api.pushState("sample_loaded", this.data);
                    }
                ]],
                [Arg0("A"), [
                    (api, data, event) => {
                        if (this.data.origin === "freesound") {
                            api.send("FREESOUND_PREV", "");
                        } else {
                            api.send("RESULTS_PREV")
                        }
                    }
                ]],
                [Arg0("D"), [
                    (api, data, event) => {
                        if (this.data.origin === "freesound") {
                            api.send("FREESOUND_NEXT", "");
                        } else {
                            api.send("RESULTS_NEXT")
                        }
                    }
                ]]
            ],
            "ROTARY_LEFT": [
                [Arg0("R4"), [
                    (api, data, event) => {
                        let index = 0;
                        let ids = Object.keys(this.data.results);
                        if (ids.length > 0) {
                            index = ids.indexOf(this.data.selectedItem);
                            if (index > 0) this.data.selectedItem = ids[index - 1];
                        }
                        api.send("LIST_RESULTS", {
                            title: this.title,
                            data: this.data,
                        });
                    }
                ]]
            ],
            "ROTARY_RIGHT": [
                [Arg0("R4"), [
                    (api, data, event) => {
                        let index = 0;
                        let ids = Object.keys(this.data.results);
                        if (ids.length > 0) {
                            index = ids.indexOf(this.data.selectedItem);
                            if (index < ids.length - 1) this.data.selectedItem = ids[index + 1];
                        }
                        api.send("LIST_RESULTS", {
                            title: this.title,
                            data: this.data,
                        });
                    }
                ]]
            ]
        }
    }
};