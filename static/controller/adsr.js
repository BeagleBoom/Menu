function $adsr() {
    return function () {
        var zoom = 1;
        var position = 0;
        var width = 320;
        var height = 160;

        function draw(a, d, s, r) {
            var canvas = document.getElementById("myCanvas");
            var ctx = canvas.getContext("2d");

            s = s * height;

            var totalLength = (a + d + r) * 2.5;
            var lengthMultiplier = width / totalLength;
            var points = [
                [0, 0],
                [a * lengthMultiplier, height, "#F28B0C"],
                [(a + d) * lengthMultiplier, s, "#3B568C"],
                [width - r * lengthMultiplier, s, "#69BF76"],
                [width, 0, "#F23A29"]
            ];

            ctx.clearRect(0, 0, width, height);

            ctx.lineWidth = 5;
            ctx.lineCap = "round";
            for (var i = 1; i < points.length; i++) {
                ctx.beginPath();
                var a = points[i - 1];
                var b = points[i];
                ctx.strokeStyle = b[2];
                ctx.moveTo(a[0], height - a[1]);
                ctx.lineTo(b[0], height - b[1]);
                ctx.stroke();
            }


        }
        return {
            start: function (data) {
                var adsr = data.params.adsr;
                console.log(data);
                draw(adsr.attack, adsr.decay, adsr.sustain, adsr.release);
            },
            onEvent: function (event, data) {
                switch (event) {
                    case "adsr":
                        document.getElementById("attack").innerHTML = data.attack;
                        document.getElementById("decay").innerHTML = data.decay;
                        document.getElementById("sustain").innerHTML = data.sustain;
                        document.getElementById("release").innerHTML = data.release;
                        draw(data.attack, data.decay, data.sustain, data.release);

                        break;
                    default:
                        console.log("unknown event:", event, data);

                }
            }
        };
    };
}