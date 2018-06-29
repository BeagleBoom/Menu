module.exports = ({Arg0, Else}, api) => {
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
            settings: {}
        },
        resume: (name, returnData, data) => {
            document.getElementById("A").style.visibility = 'visible';
            document.getElementById("B").style.visibility = 'visible';
            document.getElementById("C").style.visibility = 'visible';
            document.getElementById("D").style.visibility = 'visible';

            console.log("Resume root from:", name, returnData);
            console.log("a", data);
            api.getSettings().then((tmp) => {
                data.settings = tmp
            });
            api.display("root", data);
        },
        start: (data) => {
            api.getSettings().then((tmp) => {
                data.settings = tmp;
            });
            api.display("root", data);
        },

        events: {
            "BUTTON_UP": [
                [Arg0("A"), [
                    (api, data, event) => {
                        api.pushState("load_sample", data);
                    }
                ]],
                [Arg0("C"), [
                    (api, data, event) => {
                        api.pushState("sample_search", data);
                    }
                ]],
                [Arg0("D"), [
                    (api, data, event) => {
                        api.pushState("sample_record", data);
                    }
                ]]
            ]
        }
    };
};