const Path = require("path");
const fs = require("fs");

class Settings {
    constructor() {
        this._settings = {};
        this._defaults = {};
    }

    setDefault(key, value) {
        this._defaults[key] = value;
    }

    get(key, defaultValue = this._defaults[key]) {
        return this._settings.hasOwnProperty(key) ? this._settings[key] : defaultValue;
    }

    set(key, value) {
        this._settings[key] = value;
    }

    unset(key) {
        delete this._settings[key];
    }
}

function load(fileName) {
    if (fs.existsSync(fileName)) {
        try {
            return JSON.parse(fs.readFileSync(fileName).toString());
        } catch (e) {
            return {};
        }
    } else {
        return {};
    }
}

function save(fileName, settings) {
    fs.writeFileSync(fileName, JSON.stringify(settings, null, 2));
}

class AutoPersistSettings extends Settings {
    constructor(fileName) {
        super();
        this._loaded = false;
        this._fileName = fileName;
    }

    _load(merge = false) {
        if (!this._loaded) {
            this._loaded = true;
            let loaded = load(this._fileName);
            if (merge) {
                this._settings = Object.assign(loaded, this._settings);
            } else {
                this._settings = loaded;
            }
        }
    }

    _save() {
        this._load(true);
        save(this._fileName, this._settings);
    }

    get(key, defaultValue = this._defaults[key]) {
        this._load();
        return super.get(key, defaultValue);
    }

    set(key, value) {
        super.set(key, value);
        this._save();
    }

    unset(key) {
        super.unset(key);
        this._save();
    }
}

class WaveSettingsFile extends AutoPersistSettings {
    constructor(fileName) {
        super(fileName);

        this._load();
        if (Object.keys(this._settings).length === 0) {
            this._settings = {
                presets: [],
                settings: {},
                meta: {}
            };
        }
    }

    static forWave(file) {
        return new WaveSettingsFile(file.substr(0, file.lastIndexOf(".") + 1) + "json");
    }

    savePreset() {
        this._settings.presets.push({
            name: "Preset " + (this._settings.presets.length + 1),
            settings: JSON.parse(JSON.stringify(this._settings.settings))
        });
        this._save();
    }

    loadPreset(index) {
        this._settings.settings = JSON.parse(JSON.stringify(this._settings.presets[index]));
        this._save();
    }

    listPresets() {
        return this._settings.presets.map(({ name }) => name);
    }

    renamePreset(index, name) {
        this._settings.presets[index].name = name;
        this._save();
    }

    get(key, defaultValue = this._defaults[key]) {
        this._load();
        if (key === "meta") {
            return this._settings.meta;
        }
        return this
            ._settings
            .settings
            .hasOwnProperty(key) ?
            this._settings.settings[key] :
            defaultValue
            ;
    }

    set(key, value) {
        if (key === "meta") {
            this._settings.meta = value;
        } else {
            this._settings.settings[key] = value;
        }
        this._save();
    }

    unset(key) {
        delete this._settings.settings[key];
        this._save();
    }
}

class AudioFilesystem {
    constructor(directories) {
        this._directories = directories;
    }

    async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }

    async getAllSamples(extensions) {
        if (extensions === undefined) { extensions = [".wav", ".wave"]; }
        let result = [];

        this._directories.forEach((directory) => {
            if(!fs.existsSync(directory)) {
                console.error("Can not access ${directory}");
            }

            let files = fs.readdirSync(directory);

            files.filter(file => {
                let ret = extensions.filter(extension => file.endsWith(extension));
                let ret2 = ret.length > 0;
                return ret2;
            }).forEach(file => {
                    /*console.log("lol");
                    let d = directory;
                    let f = file;
                    let df = Path.join(d, f);
                    result.push(df);
                    */ result.push(Path.join(directory, file));
            });

        });

        return result;
    }


    async getAllSamplesWithMetaData() {
        let result = {};

        let files = await this.getAllSamples([".wav", ".wave", ".json"]);
        let metafiles = files.length > 0 ? files.filter(file => file.endsWith(".json")).reduce((r, v) => {
            if (typeof (r) !== "object") { r = { [r]: {} }; return r; };
            r[v] = {};
            return r;
        }) : {};

        files.filter(file => !file.endsWith(".json")).forEach((file) => {
            console.log("test");
            let extension = Path.extname(file);
            let filename = Path.basename(file, extension);
            let directoryName = Path.dirname(file);

            let fileHash = filename;
            if (result[filename] !== undefined) {
                let fileCounter = 2;
                let alternateName = "filename [${fileCounter}]";
                while (result[alternateName] !== undefined) {
                    fileCounter++;
                }
                fileHash = alternateName;
            }

            result[fileHash] = { fullPath: file, directory: Path.dirname(file) };

            let jsonFilepath = Path.join(directoryName, filename + ".json");
            if (metafiles[jsonFilepath] !== undefined) {
                let metafilecontent = fs.readFileSync(jsonFilepath);
                let metadata = JSON.parse(metafilecontent);
                if (metadata.hasOwnProperty("meta")) {
                    metadata.meta.name = fileHash;
                }
                result[fileHash]["data"] = metadata;
            }
        });

        return result;
    }
}



module.exports = {
    AutoPersistSettings, Settings, WaveSettingsFile, AudioFilesystem
};