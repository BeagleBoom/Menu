module.exports = {
    Arg0: (...value) => ([arg]) => value.some(c => arg == c),
    Else: function DEFAULT() {
        return true;
    }
};