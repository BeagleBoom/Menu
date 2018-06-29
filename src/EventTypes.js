const path = require("path");
const fs = require("fs");
const {spawnSync}=require("child_process");

const command = "gcc";
const args = "-E -Wp,-v -xc /dev/null".split(" ");

let {stdout, stderr} = spawnSync(command, args, {stdio: []});

[stdout, stderr] = [stdout, stderr].map(s=>s.toString().split("\n"));

let data = stderr
        .slice(stderr.findIndex(e => e.indexOf("#include <...>") !== -1) + 1)
        .map(l=>l.trim())
        .filter(l => l[0] === "/")
        .map(p=>path.join(p, "EventQueue"))
        .filter(p=>fs.existsSync(p))
    ;

if (data.length === 0) {
    throw "Could not find EventQueue Lib!!";
}

let out = fs.readFileSync(path.join(data[0], "EventType.h")).toString();

out = out.slice(out.indexOf("{") + 1, out.lastIndexOf("}"));
out = out.split("\n")
    .map(l=>l.trim())
    .filter(l=>l.length > 0)
    .map(l=>l.split("//")[0])
    .reduce((out, e)=>out.concat(
        e
            .replace(/\/\*/g, ",/*,")
            .replace(/\*\//g, ",*/,")
            .split(",")
    ), [])
    .filter(l=>l.length > 0)
    .reduce(({out, level}, c)=> {
        if (c === "/*") {
            level++;
        } else if (c === "*/") {
            level--;
        } else if (level === 0) {
            out.push(c);
        }
        return {out, level};
    }, {out: [], level: 0}).out
    /*.reduce(({events, ids}, event, index)=> {
        events[event] = index;
        ids[index] = event;
        return {events, ids}
    },{events:{}, ids:{}})*/
;

console.log(out);

