const t = require('typebase');

module.exports = t.Struct.define([
        ["recipient", t.ui8],
        ["id", t.ui8],
        ["data", t.List.define(t.ui8, 508)]
    ]
);