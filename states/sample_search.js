module.exports = ({Arg0, Else}, api) => {
    return {
        name: "sample_search",
        title: "Search Sample",
        data: {
            searchTerm: ""
        },
        resume: (name, returnData) => {
            if (name === "_keyboard") {
                data.searchTerm = returnData.string;
                console.log("Entered String", data.searchTerm);
                api.send("FREESOUND_SEARCH", data.searchTerm);
                api.send("WAITING", "Waiting for search results.");
            }
        }, start: (name) => {
            api.pushState("_keyboard");
            console.log("Starting search")
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