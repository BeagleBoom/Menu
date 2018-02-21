module.exports = ({Arg0, Else}) => {
    return {
        events: {
            "BUTTON_UP": [
                [Arg0("BACK"),
                    [(api, data, event) => {
                        console.log("Returning to previous state...");
                        api.popState();
                    }]
                ]
            ]
        }
    }
};
