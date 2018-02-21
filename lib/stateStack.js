const {EventEmitter} = require("events");
module.exports = class StateStack extends EventEmitter {
    constructor({sendEvent, display}) {
        super();
        this._stack = [];
        this._api = require("./api")(this, sendEvent, display);
        this._states = require("../states")(this._api);
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

    popState() {
        if (this._stack.length < 2) return;
        let currentState = this.current();
        let lastState = this.current(2);
        this.definition(lastState.name).resume(currentState.name, JSONClone(currentState.data));
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
        let currentState = this.current();
        let oldInstance = newState.data.initialized;
        if (!oldInstance) {
            newState.start(currentState.name, initData);
            newState.data.initialized = true;
        } else {
            newState.resume(currentState.name, JSONClone(currentState.data));
        }
        this._stack.push({name: newState.name, data: JSONClone(newState.data)});
    }

    processEvent({event, data}) {
        let currentState = this.current();
        let state = this.definition();
        if (!state.events.hasOwnProperty(event)) return;


        state.events[event].every(([check, handler]) => {
            if (event !== undefined) {
                if (check(data)) {
                    handler.forEach((entry) => {
                        entry(api, currentState.data, {event, data});
                    });
                    return false;
                }
                return true;
            }
        });
    }
}