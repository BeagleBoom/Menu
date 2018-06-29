function $load_sample() {
    return function () {
        var zoom = 1;
        var position = 0;
        var width = 320;
        var height = 90;

        var canvas = null;
        var bar = null;

        var sound = [0];

        var submode = {
            mode: "",
            values: "",
        };

        function draw() {

            if (sound === undefined || sound.length === 0) return;

            var ctx = canvas.getContext("2d");

            var zoomSegment = Math.ceil(sound.length / zoom);

            var stepSize = Math.floor(zoomSegment * 0.1);

            var bucketSize = Math.floor(zoomSegment / width);

            var stretch = zoomSegment < width ? width / zoomSegment : 1;

            if (position * stepSize + zoomSegment > sound.length) {
                position = Math.floor((sound.length - zoomSegment) / stepSize);
            }

            bar.style.width = width / zoom + "px";
            bar.style.left = width * (position * stepSize / sound.length) + "px";

            ctx.clearRect(0, 0, width, height);
            var drawData = sound
                .slice(position * stepSize, position * stepSize + zoomSegment)
                .reduce(function (out, element) {
                    if (out[out.length - 1].length >= bucketSize) {
                        out.push([]);
                    }
                    out[out.length - 1].push(element);
                    return out;
                }, [[]])
                .map(function (group) {
                    return group.reduce(function (sum, c) {
                        return sum + c;
                    }, 0) / group.length;
                })
                .map(function (s) {
                    return Math.round(s * height / 2);
                })
                .map(function (p, i) {
                    return [
                        i * stretch,
                        (p + height / 2)
                    ];
                });

            ctx.beginPath();
            ctx.strokeStyle = "#F28B0C";

            drawData.forEach(function (arg, i) {
                if (i === 0) {
                    ctx.moveTo(arg[0], arg[1])
                } else {
                    ctx.lineTo(arg[0], arg[1])
                }
            });
            ctx.stroke();
        }


        return {
            start: function (data) {
                canvas = document.getElementById("myCanvas");
                bar = document.getElementById("bar");
                sound = data.sound;
                draw();
            },
            onEvent: function (event, data) {
                function showSubmode() {
                    var template = Handlebars.compile(loadPartial(submode.mode));
                    var html = template(submode.values);
                    var elem = document.getElementById("submode");
                    elem.innerHTML = "";
                    var d = document.createElement('div');
                    d.innerHTML = html;
                    elem.append(d);
                }

                function hideSubmode() {
                    var elem = document.getElementById("submode");
                    elem.innerHTML = "";
                }

                switch (event) {
                    case "zoom_in":
                        if (zoom < 16) {
                            zoom *= 2;
                            draw();
                        }
                        break;
                    case "zoom_out":
                        if (zoom > 1) {
                            zoom /= 2;
                            if (position >= zoom) position = zoom - 1;
                            draw();
                        }
                        break;
                    case "zoom_left":
                        if (position > 0) {
                            position--;
                            draw();
                        }
                        break;
                    case "zoom_right":
                        position++;
                        draw();
                        break;
                    case "waveform":
                        console.log(sound);
                        sound = data.sound;
                        draw();
                        break;
                    case "submode":
                        submode.mode = data.mode;

                        if (submode.mode === "") {
                            submode.values = {};
                            hideSubmode();
                            break;
                        }

                        submode.values = data.data;
                        showSubmode();

                        break;
                    default:
                        console.log("unknown event:", event, data);

                }
            }
        };
    };
}