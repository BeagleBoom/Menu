function $root() {
    return function () {
        var ips = {};

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
                console.log(event, data);
                switch (event) {
                    case "SHOW_IP":
                        displayIp(data.ipIndex);
                        break;
                    case "INTERNET_CONNECTION":
                        updateInternetConnection(data);
                        break;
                    default:
                        console.log("Unknown event: ", event, data);
                        break;
                }
            }
        };
    };
}