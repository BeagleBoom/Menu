const fs = require("fs");
const path = require("path");
const helper = require("../lib/StateFunctions");

module.exports = (api) => {
    let toProcess = fs.readdirSync(__dirname)
        .filter(f => f.endsWith(".js"))
        .filter(f => f !== "index.js")
        .map(f => [f.slice(0, -3), path.join(__dirname, f)])
        .map(([name, p]) => {
            let now=Date.now();
            console.log(`Loading ${name}...`);
            let out= [name, require(p)(helper, api)];
            console.log(`Loaded ${name}, took ${Date.now()-now} ms`);

        })
        .map(([name, p]) => [name, Object.assign({data: {}}, p)])
        .map(([name, p]) => {
            if (name !== "_default") {
                if (p.hasOwnProperty("extends")) {
                    if (!Array.isArray(p.extends)) {
                        p.extends = [p.extends];
                    }
                    if (p.extends.indexOf("_default") === -1) {
                        p.extends.unshift("_default");
                    }
                } else {
                    p.extends = ["_default"];
                }
            }
            return [name, p];
        })
        .reduce((out, [name, p]) => Object.assign(out, {[name]: p}), {});

    let processed = -1;
    let functions = {
        "_default": toProcess["_default"]
    };
    delete toProcess["_default"];

    let old = Object.values(toProcess).length;

    while (old > 0) {
        Object.entries(toProcess)
            .filter(([key, value]) => value
                .extends
                .filter(e => !functions.hasOwnProperty(e)).length === 0
            ).forEach(([stateName, value]) => {
            let {events} = value;
            value.extends.forEach(fnc => {
                let {events: def = {}} = functions[fnc];

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
                value.events = events;
                functions[stateName] = value;
                delete toProcess[stateName];
            })
        });
        let current = Object.values(toProcess).length;
        if (old === current) {
            throw "Could not process extends: " + Object.keys(toProcess).join(", ");
        }
        old = current;
    }

    return functions;
};
