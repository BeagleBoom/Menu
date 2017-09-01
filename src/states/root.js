module.exports = ({Arg0, Else}) => {
    return {
        name: "root",
        title: "Start",
        info: "Please choose whether you want to record or search a sample.",
        captions: {
            "A": "Search Sample",
            "D": "Record Sample"
        },

        data: {
            "asd": "dsa"
            // initiale Variablen
        },
        resume: (name, returnData) => {
            console.log("Resume root from:", name, returnData);
        },
        start: (name) => {
            console.log("Start:", name);
        },

        events: {
            "BUTTON_DOWN": [
                [Arg0("A"), [
                    (api, data, event) => {
                        console.log("Switching to search sample", data, event);
                    },
                    (api, data, event) => {
                        api.pushState("sample_search");
                    }
                ]],
                [Arg0("D"), [
                    (api, data, event) => {
                        console.log("Switching to record sample", data, event);
                    },
                    (api, data, event) => {
                        api.pushState("sample_record");
                    }
                ]],
                [Else, [() => console.log("no match, idling..")]]
            ]
        }
    };
};