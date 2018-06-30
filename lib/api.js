const fs = require("fs");
const path = require("path");
const {URL} = require("url");
const debug = true;

let settings = null;
let globalStore = {};
let settingsFile = path.join(__dirname, "/../", "settings.json");

let that = (stack, sendEvent, display, sendView, sendCaptions) => {
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
        async getSettings() {
            if (fs.existsSync(settingsFile)) {
                let file = fs.readFileSync(settingsFile);

                settings = JSON.parse(file);
                let retData = JSON.parse(await this.getContent(settings.freesound.baseUrl + "/poll"));

                // beagleboom not registered to service
                if (retData.code == 407 || retData.code == 204) {
                    this.pushState("auth_freesound", settings);
                    return settings;
                }

                // error
                if (retData.code != 200 && retData != 201) {
                    this.sendView("error", {error: returnData.message});
                    return settings;
                }

                settings.freesound.token = retData.access_token;
                return settings;
            } else {
                api.sendView("error", {error: "Settings not found"});
            }
        },

        setSetting(key, value) {
            globalStore = Object.assign(globalStore, { [key]: value});
            fs.writeFileSync(settingsFile, JSON.stringify(settings));
        },
        getSetting(key) {

            if(Object.keys(globalStore).length < 1) {
                that().loadSettings();
            }
            return globalStore[key];
        },
        loadSettings() {
            if(debug) console.log("Loading Settings...");
            let file = fs.readFileSync(settingsFile);
            settings = Object.assign(settings, JSON.parse(file));
           // console.log(settings);
        },
        saveSettings() {
            fs.writeFileSync(settingsFile, JSON.stringify(settings));
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
                    options.ca = settings.freesound.certificate.ca;
                    options.cert = settings.freesound.certificate.cert;
                    options.key = settings.freesound.certificate.key;
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

module.exports = that;