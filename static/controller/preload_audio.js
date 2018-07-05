var progressbarIntervalId = -1;

function $preload_audio() {
    return function () {
        return {
            start: function (data) {

            },
            onEvent: function (event, data) {
                switch (event) {
                    case "progress":
                        var elem = document.getElementById("progressbar");
                        var width = 1;
                        console.log("New Progress: " + JSON.stringify(data));

                        if(progressbarIntervalId != -1) {
                            clearInterval(progressbarIntervalId);
                        }

                        progressbarIntervalId = setInterval(frame, 10);
                        function frame() {
                            if (width >= data) {
                                clearInterval(progressbarIntervalId);
                            } else {
                                width++;
                                elem.style.width = width + '%';
                            }
                        }
                        
                        break;
                    case "error":
                       console.log("error");
                                     break;
                    case "download_begin":
                        console.log("download begin");
                        break;
                    case "download_finished":
                        var elem = document.getElementById("progressbar");
                        elem.innerText = "Download finished";
                        console.log("download finished");
                        break;
                    default:
                        console.log("unknown event: ", event, data);
                }
            }
        };
    };
}