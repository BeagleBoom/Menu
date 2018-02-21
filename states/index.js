const fs = require("fs");
const path = require("path");
const helper = require("../lib/StateFunctions");

module.exports = (api) => {
    let functions = fs.readdirSync(__dirname)
        .filter(f => f.endsWith(".js"))
        .filter(f => f !== "index.js")
        .map(f => [f.slice(0, -3), path.join(__dirname, f)])
        .map(([name, p]) => [name, require(p)(helper, api)])
        .map(([name, p]) => [name, Object.assign({data: {}}, p)])
        .map(([name, p]) => {
            p.data.initialized = false;
            return [name, p];
        })
        .reduce((out, [name, p]) => Object.assign(out, {[name]: p}), {});

    if (functions.hasOwnProperty("_default")) {
        let def = functions["_default"].events;
        Object.entries(functions)
            .filter(([name]) => name !== "_default")
            .forEach(([stateName, {events = {}}]) => {
                Object.entries(def).forEach(([event, handler]) => {
                    if (events.hasOwnProperty(event)) {
                        let elseCase = events[event].findIndex(([{name}]) => name === "DEFAULT");
                        if (elseCase === -1) {
                            events[event] = events[event].concat(handler);
                        } else {
                            events[event].splice(elseCase, 0, ...handler);
                        }
                    } else {
                        events[event] = handler;
                    }
                });
                functions[stateName].events = events;
            });
    }
    return functions;
};
