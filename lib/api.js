module.exports = (stack, sendEvent, display) => {
    return {
        popState: stack.popState,
        pushState: stack.pushState,
        send: sendEvent,
    };
};