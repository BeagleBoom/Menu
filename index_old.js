let stateStack = [];

const api = {
    display(view, data) {
        socket.display(view, data);
    },
    send(eventType, data) {
        console.log("api.send:", eventType, data);

    },

    pushState(newStateName, initData = {}) {


    }
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
