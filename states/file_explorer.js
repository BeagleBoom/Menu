const MPlayer = require('mplayer');
const player = new MPlayer();
player.volume(100);
let fileList = {};

module.exports = ({ Arg0, Else }, api) => {
    return {
        name: "file_explorer",
        title: "File Explorer",
        captions: {
            "A": "Refresh",
            "D": "Load"
        },
        data: {
            searchTerm: "",
            results: [],
            currentId: 0,
            currentItem: null,
            index: 0,
            showData: false
        },
        resume: async (name, returnData) => {
            await loadFileList(api, returnData);
        },
        start: async (data) => {
            await loadFileList(api, data);
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
                    async (api, data, event) => {
                        await loadFileList(api, data);
                    }
                ]],
                [Arg0("D"), [
                    (api, data, event) => {
                        if (data.currentItem !== undefined) {
                            let id = data.currentItem.id;
                            let currentFile = fileList[id];

                            data.file = currentFile.fullPath;
                            if (currentFile.hasOwnProperty("data")) {
                                if (currentFile.data.hasOwnProperty("meta")) {
                                    data.meta = currentFile.data.meta;
                                } else {
                                    delete data.meta;
                                }
                            }

                            api.pushState("load_sample", data);

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
    }
};

function convertLocalFilesToFreesoundScheme(allFiles, data) {
    allFiles = Object.keys(allFiles).map((file_key) => {
        let fileObj = allFiles[file_key];

        if (fileObj.data !== undefined && fileObj.data.meta !== undefined && fileObj.data.meta !== undefined) {
            let freesound_object = JSON.parse(JSON.stringify(fileObj.data.meta));
            freesound_object.id = file_key;
            freesound_object.preview = fileObj.fullPath.replace(/ /g, "\\ ");

            return freesound_object;
        } else {
            return {
                id: file_key,
                name: file_key,
                preview: fileObj.fullPath, //.replace(/ /g, "\\ "),
                description: "<br/>This file has been manually added to your BeagleBoom.",
                type: "wav",
                samplerate: "",
                duration: "",
                avg_rating: "",
                mono: "",
                tags: [],
                license: "Unknown"
            };
        }
    });
    data.currentId = 0;
    data.currentItem = allFiles[0];
    data.results = { results: allFiles, count: allFiles.length, next: allFiles.length > 0 ? true : null, previous: allFiles.length > 0 ? true : null };
    data.index = 0;
    data.showData = false;
    return data;
}

async function loadFileList(api, data) {
    fileList = await api.audioFilesystem.getAllSamplesWithMetaData();
    let fileData = convertLocalFilesToFreesoundScheme(fileList, data)

    api.display("sound_list", fileData);
    api.sendView("loading", false);
}