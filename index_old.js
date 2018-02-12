const t = require('typebase');

const socket = require("./socketConnection")(8080);

const MessageQueue = require('svmq');
const queue = MessageQueue.open(1337);

const QueueEventEnum = require("./src/QueueEventEnum");
const NetEvent = require("./src/NetEvent");

let stateStack = [];

const type = process.argv[2];
if (type === undefined) {
    console.error("Queue channel argument missing!");
    console.error("\t try running the process:");
    console.error("\t\t" + process.argv[0] + " " + process.argv[1] + " <channelnumber>");
    process.exit(-1);
}

function popMessage() {
    queue.pop({type: process.argv[2]}, (err, data) => {

        if (err) throw err;
        let bufferPointer = new t.Pointer(new Buffer(data));
        let event = NetEvent.unpack(bufferPointer);
        event.data = JSON.parse(event.data.slice(0, event.data.indexOf(0)).map(c => String.fromCharCode(c)).join(""));
        // fixme: remove this after fix in Queue
        [event.id, event.recipient] = [event.recipient, event.id];
        event.event = QueueEventEnum[event.id];
        eventHandler(event);
        setImmediate(popMessage);
    });
}

const api = {
    display(view, data) {
        socket.display(view, data);
    },
    send(eventType, data) {
        console.log("api.send:", eventType, data);
        let charray = [];
        Array.from(JSON.stringify(data)).forEach((item) => {
            charray.push(item.charCodeAt(0));
        });

        let event = {
            recipient: 3,
            id: QueueEventEnum.indexOf(eventType),
            data: charray
        };
        let p = new t.Pointer(new Buffer(8196), 0);

        NetEvent.pack(p, event);

        queue.push(p.buf);
    },
    popState() {
        let currentState = stateStack[stateStack.length - 1];
        let lastState = stateStack[(stateStack.length >= 2 ? stateStack.length - 2 : 0)];
        debug("POPSTATE", currentState.name, "->", lastState.name);
        stateDefinitions[lastState.name].resume.apply(api, [currentState.name, JSONClone(currentState.data)]);
        socket.sendCaptions(stateDefinitions[lastState.name].captions);
        if (currentState !== lastState) {
            stateStack.pop();
        }
    },
    pushState(newStateName, initData = {}) {
        if (!stateDefinitions.hasOwnProperty(newStateName)) {
            debug("Unknown state name: ", newStateName);
            return;
        }

        let newState = stateDefinitions[newStateName];
        let currentState = stateStack[(stateStack.length > 0 ? stateStack.length - 1 : 0)];
        let oldInstance = newState.data.initialized;
        if (!oldInstance) {
            debug("PUSHSTATE[Start]", currentState.name, "->", newState.name);
            newState.start.apply(api, [currentState.name, initData]);
            newState.data.initialized = true;
        } else {
            debug("PUSHSTATE[Resume]", currentState.name, "->", newState.name);
            newState.resume.apply(api, [currentState.name, JSONClone(currentState.data)]);
        }
        socket.sendCaptions(newState.captions);
        stateStack.push({name: newState.name, data: JSONClone(newState.data)});

    }
};
const stateDefinitions = require("./src/StateDefinitions")(api);


const eventHandler = (rawEvent) => {
    function performStateEvents(state, rawEvent) {
        if (!state.events.hasOwnProperty(rawEvent.event)) {
            state = stateDefinitions["_default"];
            if (!state.events.hasOwnProperty(rawEvent.event)) {
                return;
            }
        }
        state.events[rawEvent.event].every((event) => {
            if (event !== undefined) {
                if (event[0](rawEvent.data)) {
                    let workingQueue = event[1];
                    workingQueue.forEach((entry) => {
                        entry(api, currentState.data, rawEvent);
                    });
                    return false;
                }
                return true;
            }
        });
    }

    let currentState = stateStack[(stateStack.length > 0 ? stateStack.length - 1 : 0)];
    let state = stateDefinitions[currentState.name];

    if (!state.hasOwnProperty("events")) return;

    performStateEvents(state, rawEvent);
};

function JSONClone(data) {
    return JSON.parse(JSON.stringify(data))
}


let init = () => {
    stateStack.push({
        name: "root",
        data: JSONClone(stateDefinitions.root.data)
    });
    socket.sendCaptions(stateDefinitions.root.captions);
};
init();

const debug = (...message) => socket.send("debug", message);

socket.setCallback((event, data) => {
    eventHandler({
        id: 1,
        event,
        data
    });
});


//popMessage();
