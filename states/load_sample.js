module.exports = ({Arg0, Else},api) => {
    return {
        name: "load_sample",
        captions: {
            A: "-5",
            B: ":trash",
            C: "+5",
            R1: "-1 / +1"
        },
        title: "Load Sample",
        data: {
            i: 0
        },
        resume: (name, returnData) => {
        },
        start(name) {
            api.display("test", {
                i: 0
            });
        },
        events: {
            "ROTARY_LEFT": [
                [Arg0("R1"), [
                    (api, data, event) => {
                        data.i -= 1;
                        api.display("test", {i: data.i});
                    }
                ]]],
            "ROTARY_RIGHT": [
                [Arg0("R1"), [
                    (api, data, event) => {
                        data.i += 1;
                        api.display("test", {i: data.i});
                    }
                ]]],
            "BUTTON_UP": [
                [Arg0("A"), [
                    (api, data, event) => {
                        data.i -= 5;
                        api.display("test", {i: data.i});
                    }
                ]],
                [Arg0("B"), [
                    (api, data, event) => {
                        data.i = 0;
                        api.display("test", {i: data.i});
                    }
                ]],
                [Arg0("C"), [
                    (api, data, event) => {
                        data.i += 5;
                        api.display("test", {i: data.i});
                    }
                ]]
            ]
        }
    }
};