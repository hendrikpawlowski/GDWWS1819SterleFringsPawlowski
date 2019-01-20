const express = require('express');
const fakeapp = express();
const bodyParser = require("body-parser");

const discounterRoutes = require('./api/resources/discounter');

fakeapp.use(bodyParser.json());

fakeapp.use('/discounter', discounterRoutes);

// ERROR Handling
fakeapp.use((req, res, next) => {
    // 404 = Not Found
    const error = new Error('404 Not Found');
    error.status = 404;
    next(error);
});

fakeapp.use((error, req, res, next) => {
    // 500 = Internal Error
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});

//Hendrik wenn du das liest, deine Kommentare sind jetzt der hammer :*

module.exports = fakeapp;