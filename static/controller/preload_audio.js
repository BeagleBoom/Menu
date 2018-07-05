var progressbarIntervalId = -1;
var currentWidth = 0;

function setProgress(value) {
    var elem = document.getElementById("progressbar");
    if(progressbarIntervalId != -1) {
        clearInterval(progressbarIntervalId);
    }

    progressbarIntervalId = setInterval(frame, 10);
    function frame() {
        if (currentWidth >= value * 100) {
            clearInterval(progressbarIntervalId);
        } else {
            currentWidth++;
            elem.style.width = currentWidth + '%';
        }
    }
}

function $preload_audio() {
    return function () {
        return {
            start: function (data) {

            },
            onEvent: function (event, data) {
                switch (event) {
                    case "progress":
                        
                        console.log("New Progress: " + JSON.stringify(data));
                        
                        setProgress(data.percent);
                        
                        
                        break;
                    case "error":
                       console.log("error");
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
                    default:
                        console.log("unknown event: ", event, data);
                }
            }
        };
    };
}