module.exports = ({Arg0, Else}) => {
    return {
        name: "root",
        title: "Start",
        info: "Please choose whether you want to record or search a sample.",
        captions: {
            "A": "Load",
            "C": "Search",
            "D": "Record"
        },

        data: {
            // initial variables
        },
        resume: (name, returnData) => {
            console.log("Resume root from:", name, returnData);
        },
        start: (name) => {
            console.log("Start:", name);
        },

        events: {
            "BUTTON_UP": [
                [Arg0("A"), [
                    (api, data, event) => {
                        api.pushState("load_sample");
                    }
                ]],
                [Arg0("C"), [
                    (api, data, event) => {
                        api.pushState("sample_search");
                    }
                ]],
                [Arg0("D"), [
                    (api, data, event) => {
                        api.pushState("sample_record");
                    }
                ]]
            ]
        }
    };
};