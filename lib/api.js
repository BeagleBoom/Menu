const fs = require("fs");
const path = require("path");
const {URL} = require("url");
const debug = true;

let globalStore = {};
let settingsFile = path.join(__dirname, "/../", "settings.json");

module.exports = (stack, sendEvent, display, sendView, sendCaptions) => {
    return {
        popState(...args) {
            return stack.popState(...args);
        },
        pushState(...args) {
            return stack.pushState(...args);
        },
        send(...args) {
            return sendEvent(...args);
        },
        sendView(...args) {
            return sendView(...args);
        },
        sendCaptions(...args) {
            return sendCaptions(...args);
        },
        display(...args) {
            return display(...args);
        },
        setSetting(key, value) {
            globalStore = Object.assign(globalStore, { [key]: value});
            fs.writeFileSync(settingsFile, JSON.stringify(globalStore));
        },
        getSetting(key) {

            if(Object.keys(globalStore).length < 1) {
                this.loadSettings();
            }
            return globalStore[key];
        },
        loadSettings() {
            if(debug) console.log("Loading Settings...");
            let file = fs.readFileSync(settingsFile);
            globalStore = Object.assign(globalStore, JSON.parse(file));
           // console.log(settings);
        },
        saveSettings() {
            fs.writeFileSync(settingsFile, JSON.stringify(globalStore, null, 3));
        },
        
        getContent(rawURL) {
            let url = new URL(rawURL);
            return new Promise((resolve, reject) => {
                let useHTTPS = url.protocol === "https:" ? true : false;
                let lib = useHTTPS ? require("https") : require("http");
                let options =
                    {
                        hostname: url.hostname,
                        port: url.port,
                        path: url.pathname + url.search,
                        method: 'GET',
                    };
                if (useHTTPS) {
                    options.ca = globalStore.freesound.certificate.ca;
                    options.cert = globalStore.freesound.certificate.cert;
                    options.key = globalStore.freesound.certificate.key;
                }
                console.log(rawURL);
                lib.request(options, function (response) {
                    if (response.statusCode < 200 || response.statusCode > 299) {
                        reject(new Error('Failed to load page, status code: ' + response.statusCode));
                    }
                    const data = [];
                    response.on('data', (chunk) => data.push(chunk));
                    response.on('end', () => {
                        resolve(data.join(''))
                    });
                }).end();
            });
        }
    }
};