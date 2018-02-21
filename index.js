const queueTypeId = process.argv[2];


if (queueTypeId === undefined) {
    console.error("Queue channel argument missing!");
    console.error("\t try running the process:");
    console.error("\t\t" + process.argv[0] + " " + process.argv[1] + " <channelnumber>");
    process.exit(-1);
}

const socket = require("./lib/socketConnection")(8080);
global.debug = (message, ...args) => {
    socket.send("debug", message + ":\n" + JSON.stringify(args));
    console.log(message + ":\n" + JSON.stringify(args));
};

const queue = require("./lib/messageQueue")(1337, parseInt(queueTypeId));

const StateStack = require("./lib/stateStack");
const stack = new StateStack({
    sendEvent(...args) {
        return queue.send(...args);
    },
    display(...args) {
        return socket.display(...args);
    },
    sendCaptions(...args) {
        return socket.sendCaptions(...args);
    }
});

const eventHandler = (arg) => stack.processEvent(arg);
queue.on("event", (...arg) => eventHandler(...arg));
socket.on("remote", (...arg) => {
    debug("REMOTE Event", arg);
    eventHandler(...arg);
});
//queue.start();