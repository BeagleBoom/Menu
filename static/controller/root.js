function $root() {
    return function () {
        return {
            resume: function (data) {

                document.getElementById("A").style.visibility = 'visible';
                document.getElementById("B").style.visibility = 'visible';
                document.getElementById("C").style.visibility = 'visible';
                document.getElementById("D").style.visibility = 'visible';
            },

            start: function (data) {
                document.querySelectorAll('.Drow').forEach(function (elem) {
                    elem.style.visibility = 'visible'
                });
            }
        };
    };
}