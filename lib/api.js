module.exports = (stack, sendEvent, display,sendView) => {
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
        sendView(...args) {
            return sendView(...args);
        },
        display(...args) {
            return display(...args);
        },

    };
};