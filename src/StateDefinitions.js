module.exports = (api) => {
    const helper = require("./StateFunctions");
    const fs = require('fs');
    let files = fs.readdirSync('./src/states');
    let ret = {};
    files.forEach((file) => {
        let itemname = file.slice(0, -3);
        ret[itemname] = require("./states/" + file)(helper);
        if (!ret[itemname].hasOwnProperty("data")) {
            ret[itemname].data = {};
        }
        ret[itemname].data.initialized = false;
        let captions = ret[itemname].captions;
        if (ret[itemname].name == undefined ||
            ret[itemname] == "") {
            console.error("Mandatory field 'name' is not set for: " + itemname);
            return;
        }
        api.send("MENU_ITEMS", {
            screen: ret[itemname].name,
            captions: captions || {},
            title: ret[itemname].title || "",
            info: ret[itemname].info || ""
        });

    });
    return ret;
};
