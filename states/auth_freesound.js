let pollTimer = -1;

module.exports = ({ Arg0, Else }, api) => {
    return {
        name: "auth_freesound",
        title: "Freesound Authentification",

        start: (data) => {
            let currentTime = new Date();

            console.log(data.freesound);
            if (data.freesound.oAuth === undefined || data.freesound.oAuth.expires_at === undefined || data.freesound.oAuth.expires_at <= currentTime) {
                console.log(data);
                api.getContent(data.freesound.baseUrl + "/poll").then((resp) => {
                    let response = JSON.parse(resp);

                    //Everything is Okay, let's go to the last state
                    if (response.code >= 200 && response.code <= 203) {
                        console.log("Setting oAuth Data: " + JSON.stringify(response, null, 3));
                        let oAuthResponse = { access_token: response.access_token, expires_at: new Date(response.expires_at) };
                        api.setSetting("oAuth", oAuthResponse)
                        api.popState(oAuthResponse);

                        //On Error, just show the oAuth QR Code and poll
                    } else {
                        api.display("auth_freesound");
                        api.sendView("loading", true);

                        console.log("Error: " + response.code);
                        api.getContent(data.freesound.baseUrl + "/getauthurl").then((response) => {
                            let resp = JSON.parse(response);
                            console.log("Displaying QR Code");
                            api.sendView("loading", false);
                            api.display("auth_freesound", resp);
                        });

                        pollTimer = setInterval(async () => {
                            api.getContent(data.freesound.baseUrl + "/poll").then((resp) => {
                                let response = JSON.parse(resp);
                                if (response.code >= 200 && response.code <= 203 && response.access_token !== undefined && response.expires_at !== undefined) {
                                    console.log("Polling...");
                                    clearInterval(pollTimer);
                                    pollTimer = -1;
                                    let oAuthResponse = { access_token: response.access_token, expires_at: new Date(response.expires_at) };
                                    api.setSetting("oAuth", oAuthResponse)
                                    api.popState(oAuthResponse);
                                }
                            });
                        }, 2000);
                    }
                });
            } else {
                api.popState(null);
            }

        },
        events: {
            "BUTTON_UP": [
                [Arg0("BACK"),
                [(api, data, event) => {
                    console.log("Returning to previous state...");
                    if (pollTimer != -1) {
                        clearInterval(pollTimer);
                        pollTimer = -1;
                    }
                    api.popState();
                }]
                ]
            ]
        }
    }
};
