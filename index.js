const t = require('typebase');

const MessageQueue = require('svmq');
const queue = MessageQueue.open(1337);

const QueueEventEnum = require("./src/QueueEventEnum");
const NetEvent = require("./src/NetEvent");
const stateDefinitions = require("./src/StateDefinitions");

let stateStack = [];


function popMessage() {
    queue.pop((err, data) => {
        if (err) throw err;
        let bufferPointer = new t.Pointer(new Buffer(data));
        let event = NetEvent.unpack(bufferPointer);
        event.data = JSON.parse(event.data.slice(0, event.data.indexOf(0)).map(c => String.fromCharCode(c)).join(""));
        [event.id, event.recipient] = [event.recipient, event.id];
        event.event = QueueEventEnum[event.id];
        eventHandler(event);
        setImmediate(popMessage);
    });
}
//popMessage();


const api = {
    send(eventType, data){
        // TODO: Make it work :)
        console.log("api.send:", QueueEventEnum.indexOf(eventType), eventType, data);
        let event = {
            recipient: 0,
            id: QueueEventEnum.indexOf(eventType),
            data: JSON.stringify(data)
        };
        let p = new t.Pointer(new Buffer(1200), 0);

        let rawData = NetEvent.pack(p, event);
        // queue.push(new Buffer(rawData.toString()));
    },
    popState(){
        let currentState = stateStack[stateStack.length - 1];
        let lastState = stateStack[(stateStack.length >= 2 ? stateStack.length - 2 : 0)];
        stateDefinitions[lastState[0]].resume(currentState[0], JSONClone(currentState[1]))
    },
    pushState(newStateName){
        if(!stateDefinitions.hasOwnProperty(newStateName)){
            return;
        }

        let newState = stateDefinitions[newStateName];
        let currentState = stateStack[(stateStack.length > 0 ? stateStack.length - 1 : 0)];
        stateStack.push([newState.name, JSONClone(newState.data)]);
        newState.resume(currentState[0], JSONClone(currentState[1]));
        // is it needed to check whether the state was already created?
    }
};


const eventHandler = (rawEvent) => {
    let currentState = stateStack[(stateStack.length > 0 ? stateStack.length - 1 : 0)];
    let state = stateDefinitions[currentState[0]];

    if (!state.hasOwnProperty("events")) return;

    if (state.events.hasOwnProperty(rawEvent.event)) {
        state.events[rawEvent.event].every((event) => {
            if (event[0](rawEvent.data)) {
                let workingQueue = event[1];
                workingQueue.forEach((entry) => {
                    entry(api, JSONClone(currentState[1]), rawEvent);
                });
                return false;
            }
            return true;
        });
    }
};

function JSONClone(data) {
    return JSON.parse(JSON.stringify(data))
}


let init = () => {
    stateStack.push([
        "root",
        JSONClone(stateDefinitions.root.data)
    ])
};
init();

eventHandler({
    id: 2,
    event: 'ROTARY_LEFT',
    data: "Button2"
});
eventHandler({
    id: 3,
    event: 'ROTARY_RIGHT',
    data: "Button1"
});

eventHandler({
    id: 2,
    event: 'ROTARY_LEFT',
    data: "Button2"
});