const progress = require("request-progress");
const legacy_request = require("request");
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');


function convertToWave(sourceFilePath,destinationFilePath, api, delelteSourceFileAfterFinished) {

    api.sendView("convert_begin");

    ffmpeg(sourceFilePath)
        .toFormat('wav')
        .on('error', (err) => {
            console.log('An error occurred on converting an audio-file to wave: ' + err.message);
            api.sendView("error", err);
        })
        .on('progress', (progress) => {
            // console.log(JSON.stringify(progress));
            api.sendView("progress", progress);
            //console.log('Processing: ' + progress.targetSize + ' KB converted');
        })
        .on('end', () => {
            api.sendView("convert_finished");
            console.log('Processing finished !');
            if(delelteSourceFileAfterFinished) {
                fs.unlinkSync(sourceFilePath);
            }
        })
        .save(destinationFilePath);//path where you want to save your file
}

function downloadFreesoundFile(soundId, filePath, api) {
    let oAuth = api.getSetting("oAuth");

    let headers = { Authorization: "Bearer" + " " + oAuth.access_token };

    let uri = "https://freesound.org/apiv2/sounds/" + soundId + "/download/";

    let request = legacy_request(uri, { headers: headers });
    progress(request, {
    }).on('progress', function (state) { // File Download Progress
        api.sendView("progress", state);
    }).on('error', function (err) { // On Authentication Error
        err.soundId = soundId;
        err.type = "download";

        api.sendView("error", err);
    }).on('end', function () {  // On Request finished

    }).pipe(fs.createWriteStream(filePath))
        .on('finish', function () { // Saving Finished
            api.sendView("download_finished", filePath);
            let convertDestination = api.getSetting("defaultAudioFile");
            convertToWave(filePath, convertDestination, api, true);
        }).on('error', function (err) { // Saving Failed
            err.soundId = soundId;
            api.sendView("error", err);
        });
};

module.exports = ({ Arg0, Else }, api) => {
    return {
        name: "preload audio",
        title: "Audio Preload",
        caption: {
            "A": "Cancel"
        },
        data: {
        },
        resume: (name, returnData) => {

        },
        start: (data) => {
            if (data.freesound_soundId !== undefined) {
                // Download File from the Internet
                let defaultDownloadFile = api.getSetting("defaultDownloadFile");
                let downloadFile = api.getSetting("tmpDownloadFile");
                downloadFreesoundFile(data.freesound_soundId.id, downloadFile, api);
                api.display("preload_audio", { title: data.freesound_soundId.name });

            }


        },
        events: {
            "BUTTON_UP": [
                [Arg0("BACK"),
                [(api, data, event) => {
                    console.log("Stopping recording and returning to previous state...");
                    api.send("RECORD_STOP", "");
                    api.send("RECORD_CLEAR", "");
                    api.popState();
                }]
                ],
                [Arg0("A"), [
                    (api) => {
                        api.send("RECORD_CLEAR", "");
                        this.data.recording = false;
                    }
                ]]
            ]
        }
    }
};