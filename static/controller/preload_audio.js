var progressbarIntervalId = -1;
var currentWidth = 0;

function setProgress(value) {
    var elem = document.getElementById("progressbar");

    clearInterval(progressbarIntervalId);
    progressbarIntervalId = setInterval(frame, 10);
    function frame() {
        if (currentWidth >= 100) {
            clearInterval(progressbarIntervalId);
            return;
        }
        if (currentWidth >= value * 100) {
            clearInterval(progressbarIntervalId);
        } else {
            currentWidth++;
            elem.style.width = currentWidth + '%';
        }
    }
}

function clearProgress() {
    clearInterval(progressbarIntervalId);
    currentWidth = 0;
    var elem = document.getElementById("progressbar");
    elem.style.width = 0;
}

function $preload_audio() {
    return function () {
        return {
            start: function (data) {
                var elem = document.getElementById("description");
                elem.innerText = data.title;
            },
            onEvent: function (event, data) {
                switch (event) {
                    case "progress":
                        setProgress(data.percent);
                        break;
                    case "error":
                        var elem = document.getElementById("title");
                        elem.innerText = "Error: " + data.message;
                        break;
                    case "download_begin":
                        console.log("download begin");
                        
                        break;
                    case "download_finished":
                        var elem = document.getElementById("title");
                        elem.innerText = "Download finished";
                        setProgress(1);
                        console.log("download finished");
                        break;
                    case "convert_begin":
                        clearProgress()
                        var elem = document.getElementById("title");
                        elem.innerText = "Converting to Wave...";
                        break;
                    case "convert_finished":
                        var elem = document.getElementById("title");
                        elem.innerText = "Converting finished";
                        break
                    default:
                        console.log("unknown event: ", event, data);
                }
            }
        };
    };
}