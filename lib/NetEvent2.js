const t = require('typebase');

module.exports = t.Struct.define([
        ["id", t.ui16],
    ["data", t.List.define(t.ui8, 508)]
    ]
);