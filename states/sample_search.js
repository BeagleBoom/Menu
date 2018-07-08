const request = require('then-request');
const querystring = require("querystring");
const MPlayer = require('mplayer');
const player = new MPlayer();
player.volume(100);

let {URL, URLSearchParams} = require("url");

const search = (text, oAuthSettings, startPage = 1) => {

    let oAuth = {
        token: {
            access_token: oAuthSettings.access_token,
            token_type: "Bearer"
        }
    };

    // Fields and Filters
    let fields = 'previews,id,name,url,tags,description,duration,avg_rating,license,type,channels,filesize,bitrate,samplerate,username,pack,num_downloads,avg_ratings,num_ratings,';

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
            currentId: 0,
            currentItem: null,
            index: 0,
            showData: false
        },
        captions: {
            "A": "Load",
            "C": "<< Page",
            "D": "Page >>"
        },
        resume: (name, returnData, data) => {
            if (name === "auth_freesound") {
                if (typeof(returnData) === "object" && Object.keys(returnData).length > 0) {
                    api.pushState("_keyboard", {text: data.searchTerm});
                } else {
                    api.popState(null);
                }
            }


            if (name === "_keyboard") {
                if (returnData === null || Object.keys(returnData).length == 0) {
                    return api.popState();
                }
               

                api.display("sound_list", []);
                api.sendView("loading", true);

                let oAuthConfig = api.getSetting("oAuth");
                search(returnData, oAuthConfig).then(result => {
                    data.searchTerm = returnData;
                    data.results = result;
                    data.currentItem = result.results[0];
                    api.display("sound_list", data);
                    api.sendView("loading", false);
                });
            }

            if (name === "load_sample" || name === "preload_audio") {
                if(name === "preload_audio") {
                    returnData = returnData.old_data;
                }
                
                api.display("sound_list", data);
                api.sendView("currentItem", data.currentItem);
                api.sendView("index", data.index);
                //api.sendView("info", data);
            }
        }, start: (data) => {
            let freesound = api.getSetting("freesound");
            data.freesound = freesound;
            api.pushState("auth_freesound", data);
        },
        events: {
            "ROTARY_RIGHT": [
                [Arg0("Z2"), [
                    (api, data, event) => {
                        data.showData = false;
                        data.index++;

                        if (data.index > data.results.results.length - 1) {
                            data.index = 0;
                        }
                        data.currentItem = data.results.results[data.index];
                        api.sendView("scrollDown", data);

                    }
                ]]
            ],
            "ROTARY_LEFT": [
                [Arg0("Z2"), [
                    (api, data, event) => {
                        data.showData = false;
                        data.index--;
                        if (data.index === -1) {
                            data.index = data.results.results.length - 1;
                        }

                        data.currentItem = data.results.results[data.index];
                        api.sendView("scrollUp", data);
                    }
                ]]
            ],
            "BUTTON_UP": [
                [Arg0("A"), [
                    (api, data, event) => {
                        data.showData = false;
                        console.log("Current Item:" + data.currentItem);
                        api.pushState("preload_audio", {freesound_soundId: data.currentItem, searchTerm: data.searchTerm, old_data: data});
                        //api.pushState("load_sample", {item: data.currentItem, settings: data.settings, old_data: data});
                    }
                ]],
                [Arg0("C"), [
                    (api, data, event) => {
                        data.showData = false;
                        if (data.results.previous !== null) {
                            let loadUrl = new URL(data.results.previous);
                            let searchParams = new URLSearchParams(loadUrl.searchParams);
                            api.sendView("loading", true);
                            let oAuthConfig = api.getSetting("oAuth");
                            search(data.searchTerm, oAuthConfig, searchParams.get("page")).then(result => {
                                data.index = 0;
                                data.results = result;
                                data.currentItem = data.results.results[0];
                                api.display("sound_list", data);
                                api.sendView("loading", false);
                            });
                        }
                    }
                ]],
                [Arg0("D"), [
                    (api, data, event) => {
                        data.showData = false;
                        if (data.results.next !== null) {
                            let loadUrl = new URL(data.results.next);
                            let searchParams = new URLSearchParams(loadUrl.searchParams);
                            api.sendView("loading", true);
                            let oAuthConfig = api.getSetting("oAuth");
                            search(data.searchTerm, oAuthConfig, searchParams.get("page")).then(result => {
                                data.index = 0;
                                data.results = result;
                                api.display("sound_list", data);
                                data.currentItem = data.results.results[0];
                                api.sendView("loading", false);
                            });
                        }
                    }
                ]],
                [Arg0("Z2"), [
                    (api, data, event) => {
                        if (data.currentItem === null) {
                            data.currentItem = data.results.results[0];
                        }
                        data.showData = true;
                        api.sendView("currentItem", data.currentItem);
                        api.sendView("info", data);
                    }
                ]],
                [Arg0("PLAY_RECORD"), [
                    (api, data, event) => {
                        player.once('start', () => {
                            api.sendView("play");
                        });
                        player.once('stop', () => {
                            api.sendView("stop");
                        });

                        let filename = data.currentItem.preview.replace("https://", "http://");
                        player.openFile(filename);
                    }
                ]],
                [Arg0("STOP_CLEAR"), [
                    (api, data, event) => {
                        player.stop();
                        api.sendView("stop");
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