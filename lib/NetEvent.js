const t = require('typebase');

module.exports = t.Struct.define([
        ["recipient", t.i16],
        ["id", t.ui16],
    ["data", t.List.define(t.ui8, 508)]
    ]
);