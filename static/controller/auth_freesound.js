function $auth_freesound() {
    return function () {
        return {
            start: function (data) {

            },
            onEvent: function (event, data) {
                switch (event) {
                    case "loading":
                        var elem = document.getElementById("loading");
                        if (data) {
                            elem.classList.add("show");
                        } else {
                            elem.classList.remove("show");
                        }
                        break;
                    case "data":
                       
                        break;
                    default:
                        console.log("unknown event: ", event, data);
                }
            }
        };
    };
}