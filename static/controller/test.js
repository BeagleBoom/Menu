function $test() {
    return function () {
        var zoom = 1;
        var position = 0;
        var width = 320;
        var height = 180;

        var canvas = null;
        var bar = null;

        var sound = [0];

        function draw() {
            var ctx = canvas.getContext("2d");

            var zoomSegment = Math.ceil(sound.length / zoom);

            bar.style.width = width / zoom + "px";
            bar.style.left = width / zoom * position + "px";

            var bucketSize = Math.ceil(zoomSegment / width);
            ctx.clearRect(0, 0, width, height);
            var drawData = sound
                .slice(position * zoomSegment, (position + 1) * zoomSegment)
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
                    return [i, (p + height / 2)];
                });

            ctx.beginPath();
            ctx.strokeStyle = "#F28B0C";

            drawData.forEach((arg, i) => {
                if (i === 0) {
                    ctx.moveTo(...arg)
                } else {
                    ctx.lineTo(...arg)
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
            onEvent(event, data) {
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
                        if (position < zoom - 1) {
                            position++;
                            draw();
                        }
                        break;
                }
            }
        };
    };
}