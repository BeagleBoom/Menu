function $sound_list() {
    return function () {
        var results = [];
        var index = 0;
        var snd = null;
        function setIndex(newIndex) {
            var currentId = results.results[0].id;
            if (document.getElementsByClassName("active").length > 0) {
                currentId = document.getElementsByClassName("active")[0].id;
            }
            if (currentId == null || currentId == undefined) {
                currentId = results.results[index].id;
            }
            document.getElementById(currentId).classList.remove("active");
            index = newIndex;
            document.getElementById(results.results[index].id).classList.add("active");
        }

        function scrollTo(index) {
            var list = document.getElementsByClassName("list")[0];

            list.style.marginTop = -(index * 53) + "px";
        }

        function scroll(direction) {
            var list = document.getElementsByClassName("list")[0];

            if (direction === "+") {
                if (index + 1 < results.results.length - 1) {
                    list.style.marginTop = -(index * 53) + "px";
                }
            }
            else {
                if (results.results.length - 1 - index >= 2) {
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

        return {
            start: function (data) {
                results = data;
                setIndex(0);
                checkCaptions();
            },
            onEvent: function (event, data) {
                switch (event) {
                    case "scrollUp":
                        if (index === 0) {
                            index = results.results.length;
                            scrollTo(results.results.length - 3);
                        }
                        setIndex(index - 1);
                        scroll("-");
                        break;
                    case "scrollDown":
                        if (index === results.results.length - 1) {
                            index = -1;
                            scrollTo(0);
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

                    case "play":
                        if (snd !== null) {
                            snd.pause();
                        }
                        snd = new Audio(results.results[index].preview); // buffers automatically when created
                        snd.play();
                        break;
                }
            }
        }
    }
}