const event = require("events").EventEmitter;


module.exports = (webSocketsServerPort = 8080) => {

    const webSocketServer = require('websocket').server;
    const http = require('http');

    const path = require("path");
    const fs = require("fs");

    class Handler extends event {
        constructor() {
            super();
            this._queue = [];
            this._default = {};
        }

        display(view, data) {
            this.send("display", {view, data});
            this._default.display = {view, data};
        }

        send(type, message = {}) {
            this._queue.push({
                type, message
            });
        }

        sendCaptions({
                         A = false,
                         B = false,
                         C = false,
                         D = false,
                         R1 = false,
                         R2 = false,
                         R3 = false,
                         R4 = false,
                     } = {}) {
            this.send("captions", {A, B, C, D, R1, R2, R3, R4});
            this._default.captions = {A, B, C, D, R1, R2, R3, R4};
        }

        getDefault() {
            return Object.entries(this._default).map(([type, message]) => JSON.stringify({type, message}));
        }

        process() {
            if (this._queue.length === 0) return null;
            let process = this._queue;
            this._queue = [];
            return process.map(e => JSON.stringify(e));
        }
    }

    let handler = new Handler();


    const server = http.createServer(function (req, res) {

        let url = req.url.substr(1).split("?")[0];

        const toServe = path.join(__dirname, "..", "static", url === "" ? "index.html" : url);

        if (url.split("/")[0] === "press") {
            let [control, action = "PUSH"] = url.split("/")[1].split("_");

            switch (action) {
                case "PUSH":
                    handler.emit("remote", {
                        event: "BUTTON_UP",
                        data: control
                    });
                    break;
                case "LEFT":
                case "RIGHT":
                    handler.emit("remote", {
                        event: "ROTARY_" + action, data: control
                    });
            }

            res.writeHead(200);
            res.end();
        } else if (url.split("/")[0] === "text") {
            let text = decodeURIComponent(url.split("/").slice(1).join("/"));
            handler.emit("remote", {
                event: "TEXT", data: text
            });
        } else if (url === "templates.js") {
            let templates = fs.readdirSync(path.join(__dirname, "..", "static", "templates"))
                .map(f => [
                    f.split(".").slice(0, -1).join("."),
                    fs.readFileSync(path.join(__dirname, "..", "static", "templates", f)).toString()
                ])
                .reduce((out, [key, value]) => Object.assign(out, {[key]: value}), {});
            ;

            let controller = fs.readdirSync(path.join(__dirname, "..", "static", "controller"))
                .map(f => [
                    f.split(".").slice(0, -1).join("."),
                    fs.readFileSync(path.join(__dirname, "..", "static", "controller", f)).toString()
                ])
                .reduce(([functions, controllers], [name, source]) => {
                    functions.push(source);
                    controllers.push(`controllers["${name}"] = $${name}();`);
                    return [functions, controllers]
                }, [[], [
                    "controllers = {};"
                ]]).map(e => e.join("\n")).join("\n");
            ;


            res.write(`window.templates=${JSON.stringify(templates, null, 2)};\n`);
            res.write(controller);


            res.end();
        } else {
            fs.stat(toServe, (err, stat) => {
                if (!err) {
                    res.writeHead(200, {
                        'Content-Length': stat.size
                    });
                    fs.createReadStream(toServe).pipe(res);
                } else {
                    res.writeHead(404);
                    res.end();
                }
            });
        }
    });
    server.listen(webSocketsServerPort, function () {
        console.log((new Date()) + " Server is listening on port "
            + webSocketsServerPort);
    });
    const wsServer = new webSocketServer({
        httpServer: server
    });

    let connections = {};
    setInterval(() => {
        let items = handler.process();
        if (items == null) return;
        Object.values(connections).forEach(connection => items.forEach(item => connection.sendUTF(item)));
    }, 50);
    let i = 0;
    wsServer.on('request', function (request) {
        const connection = request.accept(null, request.origin);
        //let timer = setInterval(() => handler.process(connection), 100);
        i++;
        connections[i] = connection;

        handler.getDefault().forEach(item => connection.sendUTF(item));

        connection.on('message', function (message) {
        });
        connection.on('close', function (connection) {
            delete connections[i];
        });
    });

    return handler;

}
;