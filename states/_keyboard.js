module.exports = ({Arg0, Else}) => {
    let alphabet = "abcdefghiklmnopqrstuvwxyz0123456789 ,-_#()[]";
    return {
        name: "_keyboard",
        title: "",
        captions: {
            "A": "a/A",
            "C": "Delete",
            "D": "Submit"
        },

        data: {
            capslock: false,
            string: "",
            currentChar: "a"
        },
        resume: (name, returnData) => {
            data.string = returnData.string || "";
            this.title = returnData.title;
        },
        start: (name) => {
            console.log("starting keyboard input");
        },

        events: {
            "BUTTON_UP": [
                [Arg0("A"),
                    [(api, data, event) => {
                        console.log("Toggling capslock mode", !data.capslock);
                        data.capslock = !data.capslock;
                        if (data.capslock) {
                            data.currentChar = data.currentChar.toUpperCase();
                        } else {
                            data.currentChar = data.currentChar.toLowerCase();
                        }
                        api.send("KEYBOARD", data);
                    }]
                ],
                [Arg0("C"),
                    [(api, data, event) => {
                        if (data.string.length > 0) {
                            data.string = data.string.substr(0, -1);
                        }
                        api.send("KEYBOARD", data);
                        console.log("removing last char, new string: ", data.string);
                    }]
                ],
                [Arg0("D"),
                    [(api, data, event) => {
                        console.log("Submitted String: ", data.string);
                        api.popState();
                    }]
                ],
                [Arg0("R4"),
                    [(api, data, event) => {
                        console.log("Appending char", data.currentChar, " to string", data.string);
                        data.string += data.currentChar;
                        api.send("KEYBOARD", data);
                    }]
                ]
            ],
            "ROTARY_LEFT": [
                [Arg0("R4"), [
                    (api, data, event) => {
                        let index = alphabet.indexOf(data.currentChar.toLowerCase());
                        data.currentChar = alphabet[(index - 1) % alphabet.length];
                        if (data.capslock) {
                            data.currentChar = data.currentChar.toUpperCase();
                        }

                        api.send("KEYBOARD", data);
                    }
                ],
                ]
            ],
            "ROTARY_RIGHT": [
                [Arg0("R4"), [
                    (api, data, event) => {
                        let index = alphabet.indexOf(data.currentChar.toLowerCase());
                        data.currentChar = alphabet[(index + 1) % alphabet.length];
                        if (data.capslock) {
                            data.currentChar = data.currentChar.toUpperCase();
                        }
                        api.send("KEYBOARD", data);
                    }
                ],
                ]
            ]
        }
    }
};
