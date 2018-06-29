function $root() {
    return function () {
        return {
            resume: function (data) {
                document.querySelectorAll('.Drow').forEach(function (elem) {
                    elem.style.visibility = 'visible'
                });
            },

            start: function (data) {
                document.querySelectorAll('.Drow').forEach(function (elem) {
                    elem.style.visibility = 'visible'
                });
            }
        };
    };
}