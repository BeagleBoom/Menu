module.exports = ({Arg0, Else}) => {
    return {
        name: "record_sample",
        title: "Record Sample",
        caption: {
            "A": "Clear",
            "D": "Finish"
        },
        data: {
            recording: false
        },
        resume: (name, returnData) => {
        },
        start: (name) => {
        },
        events: {
            "BUTTON_UP": [
                [Arg0("BACK"),
                    [(api, data, event) => {
                        console.log("Stopping recording and returning to previous state...");
                        api.send("RECORD_STOP", "");
                        api.send("RECORD_CLEAR", "");
                        api.popState();
                    }]
                ],
                [Arg0("PLAY"), [
                    (api, data, event) => {
                        if (this.data.recording) {
                            api.send("RECORD_PAUSE", "");
                        } else {
                            api.send("RECORD_RESUME", "");
                        }
                        this.data.recording = !this.data.recording;
                    }
                ]],
                [Arg0("STOP"), [
                    (api, data, event) => {
                        api.send("RECORD_STOP", "");
                        this.data.recording = false;
                    }
                ]],
                [Arg0("A"), [
                    (api) => {
                        api.send("RECORD_CLEAR", "");
                        this.data.recording = false;
                    }
                ]],
                [Arg0("D"), [
                    (api) => {
                        api.pushState("load_sample", {mode: "record"});
                    }
                ]]
            ]
        }
    }
};