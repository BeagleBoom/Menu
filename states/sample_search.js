let request = require('then-request');
let querystring = require("querystring");
let {URL, URLSearchParams} = require("url");

const search = (text, startPage = 1) => {

    let oAuth = {token: {access_token: "zrFL5jPlJGcquE0Zvb99BqYdlPjvN9", "token_type": "Bearer"}};

    // Fields and Filters
    let fields = 'previews,id,name,url,tags,description,duration,avg_rating,license,type,channels,filesize,bitrate,samplerate,username,pack,num_downloads,avg_ratings,num_ratings';

    // Request Parameters
    let headers = {Authorization: oAuth.token.token_type + " " + oAuth.token.access_token};
    let uri = "https://www.freesound.org/apiv2/search/text/?" + querystring.stringify({
        query: text,
        page: startPage,
        fields: fields
    });

    // Search for Text
    return request('GET', uri, {headers: headers})
        .getBody('utf8')
        .then(JSON.parse)
        .then(result => {
            result.results = result.results.map(r => {
                r.samplerate = Math.round(r.samplerate / 1000) + " kb/s";

                r.mono = r.channels < 2;
                r.avg_rating = Math.round(r.avg_rating * 100) / 100;

                r.duration = [
                    Math.floor(r.duration / 60) % 60,
                    Math.ceil((r.duration % 60) * 100) / 100
                ]
                    .map(d => d < 10 ? "0" + d : "" + d)
                    .join(":");
                r.preview = r.previews['preview-hq-mp3'];
                return r;
            });
            return result;
        }).catch((...args) => {
            console.error(...args);
        });
};


module.exports = ({Arg0, Else}, api) => {
    return {
        name: "sample_search",
        title: "Search Sample",
        data: {
            searchTerm: "",
            results: [],
        },
        captions: {
            "C": "Previous",
            "D": "Next"
        },
        resume: (name, returnData, data) => {
            if (name === "_keyboard") {
                if (returnData === null) {
                    return api.popState();
                }
                api.sendView("loading", true);
                search(returnData).then(result => {
                    data.searchTerm = returnData;
                    data.results = result;
                    api.display("sound_list", result);
                    api.sendView("loading", false);
                });
            }
        }, start: (data) => {
            api.pushState("_keyboard", {text: data.searchTerm});
        },
        events: {
            "FREESOUND_SEARCHRESULTS": [
                [Else, [
                    (api, data, event) => {
                        console.log("Got freesound results: ", data);
                        data.results[data.index].active = true;
                        data.results = data;
                        api.pushState("list_results", {
                                origin: "freesound",
                                results: data,
                                title: "Freesound search results"
                            }
                        );
                    }
                ]],
            ],
            "ROTARY_RIGHT": [
                [Arg0("Z2"), [
                    (api, data, event) => {
                        api.sendView("scrollDown", null);
                    }
                ]]
            ],
            "ROTARY_LEFT": [
                [Arg0("Z2"), [
                    (api, data, event) => {
                        api.sendView("scrollUp", null);
                    }
                ]]
            ],
            "BUTTON_UP": [
                [Arg0("C"), [
                    (api, data, event) => {
                        if (data.results.previous !== null) {
                            let loadUrl = new URL(data.results.previous);
                            let searchParams = new URLSearchParams(loadUrl.searchParams);
                            api.sendView("loading", true);
                            search(data.searchTerm, searchParams.get("page")).then(result => {
                                data.results = result;
                                api.display("sound_list", result);
                                api.sendView("loading", false);
                            });
                        }
                    }
                ]],
                [Arg0("D"), [
                    (api, data, event) => {
                        if (data.results.next !== null) {
                            let loadUrl = new URL(data.results.next);
                            let searchParams = new URLSearchParams(loadUrl.searchParams);
                            api.sendView("loading", true);
                            search(data.searchTerm, searchParams.get("page")).then(result => {
                                data.results = result;
                                api.display("sound_list", result);
                                api.sendView("loading", false);
                            });
                        }
                    }
                ]],
                [Arg0("Z2"), [
                    (api, data, event) => {
                        api.sendView("play", null);
                    }
                ]]
            ]
        }
    };
};


// possible results:
const result = {
    $id: {
        title: "Title",
        duration: "12", // in seconds
        type: "wav|aif|aiff|mp3|flac",
        channels: "2",
        path: ""
    }
};