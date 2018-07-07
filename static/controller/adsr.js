function $adsr() {
    return function () {
        var zoom = 1;
        var position = 0;
        var width = 320;
        var height = 90;

        function draw() {

        }


        return {
            start: function (data) {
                draw();
            },
            onEvent: function (event, data) {
                switch (event) {
                    case "adsr":
                        document.getElementById("attack").innerHTML = data.attack;
                        document.getElementById("decay").innerHTML = data.decay;
                        document.getElementById("sustain").innerHTML = data.sustain;
                        document.getElementById("release").innerHTML = data.release;
                        break;
                    default:
                        console.log("unknown event:", event, data);

                }
            }
        };
    };
}