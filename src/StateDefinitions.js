const Arg0 = function (value) {
    return (args) => args == value;
};
const Else = () => true;
const reSend =
    (newType) => (api, data, event) => api.send(newType, event.data);


module.exports = {
    "root": {
        name: "root",
        data: {
            "asd": "dsa"
            // initiale Variablen
        },
        resume: (name, returnData) => {
            console.log("Resume root from:", name, returnData);
        },
        start: (name) => {
            console.log("Start:", name, returnData);

        },
        events: {
            "ROTARY_RIGHT": [
                [Arg0("Button1"), [
                    (api, data, event) => {
                        console.log("Button 1", data, event);
                    },
                    reSend("BUTTON_UP"),
                    (api, data, event) => {
                        api.pushState("record");
                    }
                ]],
                [Else, [() => console.log("else")]]
            ]
        }
    },
    "record": {
        name: "record",
        data: {
            "moep": "peom"
        },
        resume: (name, returnData) => {
            console.log("Resume record from", name, returnData);
        },
        events: {
            "ROTARY_LEFT": [
                [Arg0("Button2"), [
                    (api, data, event) => {
                        console.log("Button 2", data, event)
                    },
                    (api, data, event) => {
                        api.popState();
                    }
                ],
                ]
            ]
        }
    }
};
