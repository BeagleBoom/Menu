module.exports = ({Arg0, Else}) => {
    return {
        name: "sample_record",
        title: "Record Sample",
        data: {
            "moep": "peom"
        },
        resume: (name, returnData) => {
            console.log("Resume record from", name, returnData);
        },
        start: (name) => {
            console.log("Starting record")
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