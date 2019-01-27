const express = require('express');
const fakeapp = express();
const bodyParser = require("body-parser");

const discounterRoutes = require('./api/resources/sortiment');

fakeapp.use(bodyParser.json());

fakeapp.use('/sortiment', discounterRoutes);

// ERROR Handling
fakeapp.use((req, res, next) => {
    // 404 = Not Found
    const error = new Error('404 Not Found');
    error.status = 404;
    next(error);
});

fakeapp.use((error, req, res) => {
    // 500 = Internal Error
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});

module.exports = fakeapp;