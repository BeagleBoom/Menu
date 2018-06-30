module.exports = ({Arg0, Else}, api) => {
    return {
        name: "auth_freesound",
        title: "Freesound Authentification",

        start: (data) => {
            api.getContent(data.freesound.baseUrl + "/getauthurl").then((response) => {
                let resp = JSON.parse(response);
                api.display("auth_freesound", resp);
            });
            let timer = setInterval(async () => {
                api.getContent(data.freesound.baseUrl + "/poll").then((resp) => {
                    let response = JSON.parse(resp);
                    if (response.access_token !== undefined) {
                        clearInterval(timer);
                        api.popState(null);
                    }
                })
            }, 2000);

        },
        events: {}
    }
};
