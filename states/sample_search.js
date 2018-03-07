let request = require('then-request');
let querystring = require("querystring");

const search = (text, startPage = 1) => {

    let oAuth = {token: {access_token: "sEzGLDzLDtuzUW8itzDPPYek0NjYmD", "token_type": "Bearer"}};

    // Fields and Filters
    let fields = 'id,name,url,tags,description,duration,avg_rating,license,type,channels,filesize,bitrate,samplerate,username,pack,num_downloads,avg_ratings,num_ratings';

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
                return r;
            });
            return result;
        })
        ;
};


module.exports = ({Arg0, Else}, api) => {
    return {
        name: "sample_search",
        title: "Search Sample",
        data: {
            searchTerm: ""
        },
        resume: (name, returnData, data) => {
            if (name === "_keyboard") {
                if (returnData === null) {
                    return api.popState();
                }
                search(returnData).then(result => {
                    console.log(result);
                    result.results[1].active = true;
                    api.display("sound_list", result);
                });
            }
        }, start: (name) => {
            api.pushState("_keyboard");
        },
        events: {
            "FREESOUND_SEARCHRESULTS": [
                [Else, [
                    (api, data, event) => {
                        console.log("Got freesound results: ", data);
                        api.pushState("list_results", {
                                origin: "freesound",
                                results: data,
                                title: "Freesound search results"
                            }
                        );
                    }
                ]],
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