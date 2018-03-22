function $auth_freesound() {
    return function () {
        return {
            start: function (data) {

            },
            onEvent: function (event, data) {
                switch (event) {
                    default:
                        console.log("unknown event: ", event, data);
                }
            }
        };
    };
}