module.exports = (webSocketsServerPort = 8080) => {
    let remoteCallback = () => {
    };
    const webSocketServer = require('websocket').server;
    const http = require('http');

    const path = require("path");
    const fs = require("fs");

    const server = http.createServer(function (req, res) {

        let url = req.url.substr(1);

        const toServe = path.join(__dirname, "static", url === "" ? "index.html" : url);

        if (url.split("/")[0] === "press") {
            let [control, action = "PUSH"] = url.split("/")[1].split("_");

            switch (action) {
                case "PUSH":
                    remoteCallback("BUTTON_UP", control);
                    break;
                case "LEFT":
                case "RIGHT":
                    remoteCallback("ROTARY_" + action, control);
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

    let queue = [];

    const send = (type, message = {}) => {
        queue.push({
            type, message
        });
    };
    wsServer.on('request', function (request) {
        const connection = request.accept(null, request.origin);
        let timer = setInterval(() => {
            if (queue.length === 0) return;
            connection.sendUTF(JSON.stringify(queue.shift()));
        }, 100);
        connection.on('message', function (message) {
            queue.push(message);
        });
        connection.on('close', function (connection) {
            clearInterval(timer);
        });
    });

    return {
        setCallback(clb) {
            remoteCallback = clb;
        },
        display(view, data) {
            send("display", {view, data});
        },
        send: send,
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
            send("captions", {A, B, C, D, R1, R2, R3, R4});
        }
    };

};