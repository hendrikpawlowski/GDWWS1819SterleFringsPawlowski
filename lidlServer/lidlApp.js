const express = require('express');
const lidlApp = express();
const bodyParser = require("body-parser");

const discounterRoutes = require('./api/resources/sortiment');

lidlApp.use(bodyParser.json());

lidlApp.use('/sortiment', discounterRoutes);

// ERROR Handling
lidlApp.use((req, res, next) => {
    // 404 = Not Found
    const error = new Error('404 Not Found');
    error.status = 404;
    next(error);
});

lidlApp.use((error, req, res) => {
    // 500 = Internal Error
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});

module.exports = lidlApp;