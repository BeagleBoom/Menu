function $midi() {
    return function () {
        var devices = [];

        function setIndex(newIndex, cls) {
            console.log(newIndex);
            if (document.getElementsByClassName(cls).length > 0) {
                document.getElementsByClassName(cls)[0].classList.remove(cls);
            }
            document.getElementById("device-" + newIndex).classList.add(cls);
        }


        return {
            start: function (data) {
                devices = data.devices;
                setIndex(data.currentIndex, "active");
                setIndex(data.selectedIndex, "selected");
            },
            onEvent: function (event, data) {
                switch (event) {
                    case "scroll":
                        setIndex(data, "active");
                        break;
                    case "select":
                        setIndex(data, "selected");
                        break;
                    default:
                        console.log("Unkown event: ", event, data);
                }
            }
        }
    }
}