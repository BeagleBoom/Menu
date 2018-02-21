const queueTypeId = process.argv[2];
if (queueTypeId === undefined) {
    console.error("Queue channel argument missing!");
    console.error("\t try running the process:");
    console.error("\t\t" + process.argv[0] + " " + process.argv[1] + " <channelnumber>");
    process.exit(-1);
}

const queue = require("./lib/messageQueue")(1337, queueTypeId);
const socket = require("./lib/socketConnection")(8080);

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
queue.on("event", eventHandler);
socket.on("remote", eventHandler);
//queue.start();