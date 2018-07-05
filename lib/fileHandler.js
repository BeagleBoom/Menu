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

const fs = require("fs");

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
        return this._settings.presets.map(({name}) => name);
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

module.exports = {
    AutoPersistSettings, Settings, WaveSettingsFile
};