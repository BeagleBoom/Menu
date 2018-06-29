function $sound_list() {
    return function () {
        Handlebars.registerHelper('fetch_license', function (license) {
            license = license.trim();
            var ret = "";
            switch (license) {
                case "http://creativecommons.org/licenses/by/3.0/":
                    ret = "<img src='/css/icons/cc_icon_white_x2.png'> <img src='/css/icons/attribution_icon_white_x2.png'>";
                    break;
                case "http://creativecommons.org/publicdomain/zero/1.0/":
                    ret = "<img src='/css/icons/nolaw.png'>";
                    break;

                case "http://creativecommons.org/licenses/by-nc/3.0/":
                    ret = "<img src='/css/icons/cc_icon_white_x2.png'> <img src='/css/icons/attribution_icon_white_x2.png'> <img src='/css/icons/nc_white_x2.png'>";
                    break;
                default:
                    ret = license;
                    console.log(ret);
            }
            return ret;
        });

        var results = {};
        var index = 0;
        var currentId = null;

        function showInfo(data) {
            document.getElementById("info").classList.add("show");
        }

        function hideInfo(event) {
            if (event === "play") return;
            document.getElementById("info").classList.remove("show");
        }

        function setIndex(newIndex) {
            currentId = results.currentItem.id;
            if (document.getElementsByClassName("active").length > 0) {
                currentId = document.getElementsByClassName("active")[0].id;
            }
            if (currentId == null || currentId == undefined) {
                currentId = results[index].id;
            }
            document.getElementById(currentId).classList.remove("active");
            document.getElementById(results[index].id).classList.add("active");
        }

        function scrollTo(index) {
            var list = document.getElementsByClassName("list")[0];
            list.style.marginTop = -(index * 53) + "px";

        }

        function scroll(direction) {
            var list = document.getElementsByClassName("list")[0];

            if (direction === "+") {
                if (index + 1 < results.length - 1) {
                    list.style.marginTop = -(index * 53) + "px";
                }
            }
            else {
                if (results.length - 1 - index >= 2) {
                    list.style.marginTop = -(index * 53) + "px";
                }
            }
        }

        function checkCaptions() {
            if (results.next === null) {
                document.getElementById("D").style.visibility = 'hidden';
            } else {
                document.getElementById("D").style.visibility = 'visible';
            }

            if (results.previous === null) {
                document.getElementById("C").style.visibility = 'hidden';
            } else {
                document.getElementById("C").style.visibility = 'visible';
            }
        }

        function fetchTemplate(template) {
            return loadPartial(template);
        }

        return {
            start: function (data) {
                var currentItem = data.currentItem;
                index = data.index;
                data = data.results;
                results = data.results;
                results.currentItem = currentItem;
                setIndex(index);
                scrollTo(index);
                checkCaptions();
            },
            onEvent: function (event, data) {
                hideInfo(event);
                console.log(data.index, event);
                switch (event) {
                    case "scrollUp":
                        index = data.index;
                        if (index === 0) {
                            scrollTo(results.length - 2);
                        } else {
                            scrollTo(index);
                        }

                        setIndex(index - 1);
                        scroll("-");
                        break;
                    case "scrollDown":
                        index = data.index;
                        if (index === results.length) {
                            scrollTo(0);
                        } else {
                            scrollTo(index);
                        }
                        setIndex(index + 1);
                        scroll("+");
                        break;
                    case "loadNext":
                    case "loadPrev":
                        results = data;
                        setIndex(0);
                        scrollTo(0);
                        checkCaptions();
                        break;

                    case "loading":
                        var elem = document.getElementById("loading");
                        if (data) {
                            elem.classList.add("show");
                        } else {
                            elem.classList.remove("show");
                        }
                        break;
                    case "info":
                        showInfo(data);
                        break;
                    case "index":
                        setIndex(data);
                        scrollTo(data);
                        break;
                    case "currentItem":
                        var template = Handlebars.compile(fetchTemplate("info"));
                        var html = template(data);
                        var elem = document.getElementById("info");
                        elem.innerHTML = "";
                        var d = document.createElement('div');
                        d.innerHTML = html;
                        elem.appendChild(d);
                        break;
                    default:
                        console.log("Unkown event: ", event, data);
                }
            }
        }
    }
}