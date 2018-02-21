module.exports = (stack, sendEvent, display) => {
    return {
        popState(...args) {
            return stack.popState(...args);
        },
        pushState(...args) {
            return stack.pushState(...args);
        },
        send(...args) {
            return sendEvent(...args);
        },
        display(...args) {
            return display(...args);
        },

    };
};