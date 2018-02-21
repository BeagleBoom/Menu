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
        }

        display(view, data) {
            this.send("display", {view, data});
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
        }

        process(connection) {
            if (this._queue.length === 0) return;
            connection.sendUTF(JSON.stringify(this._queue.shift()))
        }
    }

    let handler = new Handler();


    const server = http.createServer(function (req, res) {

        let url = req.url.substr(1);

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

    wsServer.on('request', function (request) {
        const connection = request.accept(null, request.origin);
        let timer = setInterval(() => handler.process(connection), 100);
        connection.on('message', function (message) {
        });
        connection.on('close', function (connection) {
            clearInterval(timer);
        });
    });

    return handler;

}
;