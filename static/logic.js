var socket = new WebSocket("ws://" + document.location.host);
var views = {};

var colors = {};

var partials = {};

if (navigator.vendor === "Google Inc.") {
    colors.A = ["#F28B0C", "#3B568C"];
    colors.B = ["#3B568C", "#F28B0C"];
    colors.C = ["#69BF76", "#3B568C"];
    colors.D = ["#F23A29", "#3B568C"];
} else {
    colors.A = ["#F28B0C", "black"];
    colors.B = ["#3B568C", "black"];
    colors.C = ["#69BF76", "black"];
    colors.D = ["#F23A29", "black"];
}

var change = -8;

function toHSL(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    var r = parseInt(result[1], 16);
    var g = parseInt(result[2], 16);
    var b = parseInt(result[3], 16);

    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    s = s * 100;
    s = Math.round(s);
    l = l * 100;
    l = Math.round(l);
    h = Math.round(h * 360);
    h += change;
    return 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
}

colors.R1 = colors.A;
colors.R2 = colors.B;
colors.R3 = colors.C;
colors.R4 = colors.D;

var currentController = null;

socket.onmessage = function (event) {
    var tmp = JSON.parse(event.data);
    var message = tmp.message;

    var type = tmp.type;

    function call(name) {
        if (currentController == null || !currentController.hasOwnProperty(name)) {
            return function () {
            };
        } else {
            return currentController[name];
        }
    }

    switch (type) {
        case "debug":
            if (Array.isArray(message)) {
                console.log.apply(console, message);
            } else {
                console.log(message);
            }
            break;
        case "display":

            call("stop")();

            var view = message.view;
            var data = message.data;

            if (controllers.hasOwnProperty(view)) {
                currentController = controllers[view]();
            }

            if (!views.hasOwnProperty(view)) {
                if (templates.hasOwnProperty(view)) {
                    views[view] = Handlebars.compile(templates[view]);
                } else {
                    views[view] = Handlebars.compile("<span style=\"color:red;\">VIEW NOT FOUND: " + view + "</span>");
                }
            }

            document.getElementById("content").innerHTML = views[view](data);

            call("start")(data);
            break;
        case "captions":

            for (var id in message) {
                if (!message.hasOwnProperty(id)) continue;
                var caption = message[id];
                var color = colors[id];
                if (caption === false) {
                    caption = "";
                    color = null;
                }
                var byId = document.getElementById(id);
                if (caption[0] === ":") {
                    byId.innerHTML = "<i class='fa fa-" + caption.substr(1) + "'></i>";
                } else {
                    byId.textContent = caption;
                }
                if (color == null) {
                    byId.style["background-color"] = "";
                    byId.style.color = "";
                } else {
                    byId.style["background-color"] = color[0];
                    byId.style.color = color[1];
                }

            }
            break;
        default:
            call("onEvent")(type, message);
            break;
    }
};

Handlebars.registerHelper("inc", function (value, options) {
    return parseInt(value) + 1;
});

Handlebars.registerHelper('json', function (context) {
    console.log("JSON:", context);
    return JSON.stringify(context);
});

Handlebars.registerHelper('include', function (path, options) {
    console.log(this, path, options);
});

Handlebars.registerHelper('limit', function (arr, limit) {
    return arr.slice(0, limit);
});

function loadPartial(name) {
    if (!partials.hasOwnProperty(name)) {
        console.log("Loading partial: " + name);
        var x = new XMLHttpRequest();
        x.open('GET', '/partials/' + name + '.hbs', false);
        x.onreadystatechange = function () {
            if (x.readyState === 4) {
                switch (x.status) {
                    case 200:
                        partials[name] = x.responseText.trim();
                        break;

                    default:
                        partials[name] = "<span style=\"color:red;\">PARTIAL NOT FOUND: /partials/" + name + ".hbs</span>";
                        break;
                }
            }
        }
        x.send();
    }
    return partials[name];
}