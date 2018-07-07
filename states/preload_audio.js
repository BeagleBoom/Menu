const progress = require("request-progress");
const legacy_request = require("request");
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');


function convertToWave(sourceFilePath, destinationFilePath, api, deleteSourceFileAfterFinished) {

    api.sendView("convert_begin");
    return new Promise((resolve, reject) => ffmpeg(sourceFilePath)
        .toFormat('wav')
        .on('error', (err) => {
            console.log('An error occurred on converting an audio-file to wave: ' + err.message);
            api.sendView("error", err);
            reject(err);
        })
        .on('progress', (progress) => {
            // console.log(JSON.stringify(progress));
            api.sendView("progress", progress);
            //console.log('Processing: ' + progress.targetSize + ' KB converted');
        })
        .on('end', () => {
            api.sendView("convert_finished");
            console.log('Processing finished !');
            if (deleteSourceFileAfterFinished) {
                fs.unlinkSync(sourceFilePath);
            }
            resolve(destinationFilePath);
        })
        .save(destinationFilePath));//path where you want to save your file
}

function downloadFreesoundFile(soundId, filePath, api, {name}) {
    let oAuth = api.getSetting("oAuth");

    let headers = {Authorization: "Bearer" + " " + oAuth.access_token};

    let uri = "https://freesound.org/apiv2/sounds/" + soundId + "/download/";

    let request = legacy_request(uri, {headers: headers});
    return new Promise((resolve, reject) => progress(request, {}).on('progress', function (state) { // File Download Progress
            api.sendView("progress", state);
        }).on('error', function (err) { // On Authentication Error
            err.soundId = soundId;
            err.type = "download";

            api.sendView("error", err);
            reject(err);
        }).on('end', function () {  // On Request finished

        }).pipe(fs.createWriteStream(filePath))
            .on('finish', function () { // Saving Finished
                api.sendView("download_finished", filePath);
                name = name.slice(name, name.lastIndexOf(".")) + "_" + Date.now();
                let convertDestination = path.join(api.settings.get("audio_path", path.join(__dirname, "..", "saved")), name + ".wav");
                resolve(convertToWave(filePath, convertDestination, api, true));
            }).on('error', function (err) { // Saving Failed
                err.soundId = soundId;
                api.sendView("error", err);
            })
    );
};

module.exports = ({Arg0, Else}, api) => {
    return {
        name: "preload audio",
        title: "Audio Preload",
        caption: {
            "A": "Cancel"
        },
        data: {},
        resume: (name, returnData) => {

        },
        start: (data) => {
            if (data.freesound_soundId !== undefined) {
                // Download File from the Internet
                let defaultDownloadFile = api.getSetting("defaultDownloadFile");
                let downloadFile = api.getSetting("tmpDownloadFile");
                downloadFreesoundFile(data.freesound_soundId.id, downloadFile, api, data.freesound_soundId)
                    .then(file => api.pushState("load_sample", {file,meta:data.freesound_soundId}));
                api.display("preload_audio", {title: data.freesound_soundId.name});

            }


        },
        events: {}
    }
};