function $root() {
    return function () {
        return {
            start: function (data) {
                document.querySelectorAll('.Drow').forEach(function (elem) {
                    elem.style.visibility = 'visible'
                });
            }
        };
    };
}