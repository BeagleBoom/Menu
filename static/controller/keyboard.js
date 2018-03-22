function $keyboard() {
    return function () {
        function selectChar(c) {
            document.querySelectorAll("#keyboard td").forEach(function (node) {
                node.classList.remove("active");
            });
            document.getElementById("char_" + c).classList.add("active");
        }

        return {
            start: function (data) {

            },
            onEvent: function (event, data) {
                switch (event) {
                    case "displayChar":
                        selectChar(data);
                        break;
                    case "text":
                        document.getElementById("text").innerText = data;
                        break;
                }
            }
        };
    };
}