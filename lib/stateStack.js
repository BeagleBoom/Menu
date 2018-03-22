const {EventEmitter} = require("events");

const JSONClone = (data) => JSON.parse(JSON.stringify(data));

module.exports = class StateStack extends EventEmitter {
    constructor({sendEvent, display, sendCaptions, sendView}) {
        super();
        this._stack = [];
        this._api = require("./api")(this, sendEvent, display, sendView, sendCaptions);
        this._states = require("../states")(this._api);
        this._sendCaptions = sendCaptions;
        this.pushState("root");
    }

    name() {
        return this._stack[this._stack.length - 1].name;
    }

    data() {
        return this._stack[this._stack.length - 1].data;
    }

    current(last = 1) {
        if (this._stack.length >= last) {
            return this._stack[this._stack.length - last];
        } else {
            return {};
        }
    }

    definition(name = this.name()) {
        return this._states[name];
    }

    popState(data = {}) {
        if (this._stack.length < 2) return;
        let currentState = this.current();
        let lastState = this.current(2);
        this.definition(lastState.name).resume(currentState.name, data, lastState.data);
        this._sendCaptions(this.definition(lastState.name).captions);
        if (currentState !== lastState) {
            this._stack.pop();
        }
    }

    pushState(newStateName, initData = {}) {
        if (!this._states.hasOwnProperty(newStateName)) {
            debug("Unknown state name: ", newStateName);
            return;
        }
        let newState = this.definition(newStateName);
        let data = Object.assign({}, JSONClone(newState.data), initData);

        this._sendCaptions(newState.captions);
        this._stack.push({
            name: newState.name,
            data
        });
        newState.start(data);
    }


    processEvent({event, data}) {
        let currentState = this.current();
        let state = this.definition();
        if (!state.events.hasOwnProperty(event)) return;


        state.events[event].every(([check, handler]) => {
            if (event !== undefined) {
                if (check(data)) {
                    handler.forEach((entry) => {
                        entry(this._api, currentState.data, {event, data});
                    });
                    return false;
                }
                return true;
            }
        });
    }
}