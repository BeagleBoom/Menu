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
        var showData = false;
        var hasNext = false;
        var hasPrev = false;

        function renderInfos(data) {
            var template = Handlebars.compile(fetchTemplate("info"));
            var html = template(results.currentItem);
            var elem = document.getElementById("info");
            elem.innerHTML = "";
            var d = document.createElement('div');
            d.innerHTML = html;
            elem.appendChild(d);
        }

        function showInfo(data) {
            renderInfos(data);
            document.getElementById("info").classList.add("show");
        }

        function hideInfo(event) {
            if (event === "play") return;
            document.getElementById("info").classList.remove("show");
        }

        function setIndex(newIndex) {
            // todo: show play status

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
            console.log("checkCaptions", results);
            if (!hasNext) {
                document.getElementById("D").style.visibility = 'hidden';
            } else {
                document.getElementById("D").style.visibility = 'visible';
            }

            if (!hasPrev) {
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
                showData = data.showData;
                index = data.index;
                data = data.results;
                console.log("start", data);
                hasPrev = (data.previous != null);
                hasNext = (data.next != null);
                results = data.results;
                results.currentItem = currentItem;
                setIndex(index);
                scrollTo(index);
                checkCaptions();
                if (showData) {
                    showInfo();
                }
            },
            onEvent: function (event, data) {
                hideInfo(event);
                console.log(data, event);
                switch (event) {
                    case "scrollUp":
                        index = data.index;
                        if (index === 0) {
                            scrollTo(results.length - 2);
                        } else {
                            scrollTo(index);
                        }

                        setIndex(index);
                        scroll("-");
                        break;
                    case "scrollDown":
                        console.log(data);
                        index = data.index;
                        if (index === results.length) {
                            scrollTo(0);
                        } else {
                            scrollTo(index);
                        }
                        setIndex(index);
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
                        showInfo(data.currentItem);
                        break;
                    case "index":
                        setIndex(data);
                        scrollTo(data);
                        break;
                    case "currentItem":
                        results.currentItem = data;
                        showInfo(data);
                        break;
                    default:
                        console.log("Unkown event: ", event, data);
                }
            }
        }
    }
}