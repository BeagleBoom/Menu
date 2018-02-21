module.exports = {
    Arg0: (value) => (args) => args == value,
    Else: function DEFAULT() {
        return true;
    }
};