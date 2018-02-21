const t = require('typebase');
const MessageQueue = require('svmq');

const QueueEventEnum = require("./QueueEventEnum");
const NetEvent = require("./NetEvent");

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
            let bufferPointer = new t.Pointer(new Buffer(data));
            let event = NetEvent.unpack(bufferPointer);
            console.log("EVENT", event.id,event.recipient,event.data.slice(0, event.data.indexOf(0)).map(c => String.fromCharCode(c)).join(""));
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
        start() {
            queue = MessageQueue.open(queueId);
            run = true;
            setImmediate(popMessage);
        }

        stop() {
            run = false;
            queue.close();
            queue = null;
        }

        send(eventType, data) {
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
        }
    }

    let handler = new Handler();
    return handler;
};


