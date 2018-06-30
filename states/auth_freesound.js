let pollTimer = {};

module.exports = ({Arg0, Else}, api) => {
    return {
        name: "auth_freesound",
        title: "Freesound Authentification",

        start: (data) => {
            let currentTime = new Date();

            if(data.settings.oAuth === undefined || data.settings.oAuth.expires_at === undefined ||data.settings.oAuth.expires_at <= currentTime) {
                console.log(data);
                api.getContent(data.settings.freesound.baseUrl + "/poll").then((resp) => {
                    let response = JSON.parse(resp);

                    //Everything is Okay, let's go to the last state
                    if (response.code >= 200 && response.code <= 203) {
                        console.log("Setting oAuth Data: " + JSON.stringify(response, null, 3));
                        api.setSetting("oAuth", response);
                        api.popState(null);

                    //On Error, just show the oAuth QR Code and poll
                    } else {
                        console.log("Error: " + response.code);
                        api.getContent(data.settings.freesound.baseUrl + "/getauthurl").then((response) => {
                            let resp = JSON.parse(response);
                            console.log("Displaying QR Code");
                            api.display("auth_freesound", resp);
                        });

                        pollTimer = setInterval(async () => {
                            api.getContent(data.settings.freesound.baseUrl + "/poll").then((resp) => {
                                let response = JSON.parse(resp);
                                if (response.code >= 200 && response.code <= 203) {
                                    console.log("Polling...");
                                    clearInterval(pollTimer);
                                    api.popState(null);
                                }
                            });
                        }, 2000);            
                    }
                });
            } else {
                api.popState(null);
            }

        },
        events: {}
    }
};
