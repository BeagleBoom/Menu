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
            a: 1
        },
        resume: (name, returnData, data) => {
            console.log("Resume root from:", name, returnData);
            console.log("a", data);
        },
        start: (data) => {
            console.log("Start:", data);
            data.a++;
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