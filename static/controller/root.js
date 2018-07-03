function $root() {
    return function () {
        var ips = {};
        var space = {};

        function displayIp(index) {
            document.querySelectorAll('.ip.active').forEach(function (elem) {
                elem.classList.remove("active");
            });
            var selector = "ip" + (index + 1);
            var elem = document.getElementById(selector);
            elem.classList.add("active");
        }

        function updateInternetConnection(data) {
            var InternetElem = document.getElementById("no_internet");
            if (!data) {
                InternetElem.style.display = 'block';
            } else {
                InternetElem.style.display = 'none';
            }
        }

        function displayDiskspace(data) {
            if (data === -1) {
                document.getElementById("space").style.display = 'none';
            } else {
                document.getElementById("space").style.display = 'block';
                if (data.space !== space.space) {
                    document.getElementById("diskspaceValue").innerHTML = data.space + "%";
                    var circle = document.getElementById("spaceCircle");
                    circle.classList.remove("p" + space.space);
                    space = data;
                    circle.classList.add("p" + space.space);
                }

                console.log(data.space);

            }
        }

        return {
            resume: function (data) {
                document.querySelectorAll('.Drow').forEach(function (elem) {
                    elem.style.visibility = 'visible'
                });

                displayIp(data.ipIndex);
                updateInternetConnection(data.internetConnection);
            },

            start: function (data) {
                displayIp(data.ipIndex);
                updateInternetConnection(data.internetConnection);
                document.querySelectorAll('.Drow').forEach(function (elem) {
                    elem.style.visibility = 'visible'
                });
            },
            onEvent: function (event, data) {
                switch (event) {
                    case "SHOW_IP":
                        displayIp(data.ipIndex);
                        break;
                    case "INTERNET_CONNECTION":
                        updateInternetConnection(data);
                        break;

                    case "DISK_SPACE":
                        displayDiskspace(data);
                        break;
                    default:
                        console.log("Unknown event: ", event, data);
                        break;
                }
            }
        };
    };
}