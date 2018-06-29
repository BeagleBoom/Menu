const t = require('typebase');
const MessageQueue = require('svmq');

const QueueEventEnum = require("./QueueEventEnum");
const NetEvent = require("./NetEvent");
const NetEventSend = require("./NetEvent2");

module.exports = (queueId = 1337, type) => {
    let queue = null;
    let run = false;

    function popMessage() {
        debug("QUEUE: Waiting", {type});
        queue.pop({type}, (err, data) => {
            if (!run) {
                debug("QUEUE: Run stopped.");
                return;
            }
            debug("QUEUE: Error: " + err);
            if (err) throw err;
            console.log(data);
            let bufferPointer = new t.Pointer(new Buffer(data));
            console.log("LEN:", data.length);
            let event = NetEvent.unpack(bufferPointer);
            console.log("EVENT", event.id, event.recipient, event.data.map(c => String.fromCharCode(c)).join(""));
            event.data = JSON.parse(event.data.slice(0, event.data.indexOf(0)).map(c => String.fromCharCode(c)).join(""));
            // fixme: remove this after fix in Queue
            [event.id, event.recipient] = [event.recipient, event.id];
            delete event.recipient;
            event.event = QueueEventEnum[event.id];
            debug("QUEUE: event", event);
            handler.emit("event", event);
            if (run) {
                setImmediate(popMessage);
            }
        });
    }

    const event = require("events").EventEmitter;

    class Handler extends event {
        start(sendOnly = false) {
            queue = MessageQueue.open(queueId);
            run = true;

            if (!sendOnly) setImmediate(popMessage);
        }

        stop() {
            run = false;
            queue.close();
            queue = null;
        }

        send(eventType, data, recipient = 3) {
            let charray = [];
            Array.from(JSON.stringify(data)).forEach((item) => {
                charray.push(item.charCodeAt(0));
            });

            let event = {
                recipient,
                id: QueueEventEnum.indexOf(eventType),
                data: charray
            };
            let p = new t.Pointer(new Buffer(510), 0);

            NetEventSend.pack(p, event);

            queue.push(p.buf, {type: 1});
        }
    }

    let handler = new Handler();
    return handler;
};


