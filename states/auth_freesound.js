let pollTimer = {};

module.exports = ({Arg0, Else}, api) => {
    return {
        name: "auth_freesound",
        title: "Freesound Authentification",

        start: (data) => {
            let currentTime = new Date();

            if(data.oAuth === undefined || data.oAuth.expires_at === undefined ||data.oAuth.expires_at <= currentTime) {
                api.getContent(data.freesound.baseUrl + "/poll").then((resp) => {
                    let response = JSON.parse(resp);

                    //Everything is Okay, let's go to the last state
                    if (response.code >= 200 && response.code <= 203) {
                        clearInterval(timer);
                        api.setSetting("oAuth", response);
                        api.popState(null);

                    //On Error, just show the oAuth QR Code and poll
                    } else {
                        api.getContent(data.freesound.baseUrl + "/getauthurl").then((response) => {
                            let resp = JSON.parse(response);
                            api.display("auth_freesound", resp);
                        });

                        pollTimer = setInterval(async () => {
                            api.getContent(data.freesound.baseUrl + "/poll").then((resp) => {
                                let response = JSON.parse(resp);
                                if (response.code >= 200 && response.code <= 203) {
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
