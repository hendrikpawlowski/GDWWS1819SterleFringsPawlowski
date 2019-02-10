const express = require('express');
const aldiApp = express();
const bodyParser = require("body-parser");
const discounterRoutes = require('./api/resources/sortiment');
const datenbank = require('./datenbank');


aldiApp.use(bodyParser.json());

aldiApp.use('/sortiment', discounterRoutes);

aldiApp.get("/", (req,res) => {
    res.status(200).json({
        daten: datenbank
    })
});

// ERROR Handling
aldiApp.use((req, res, next) => {
    // 404 = Not Found
    const error = new Error('404 Not Found');
    error.status = 404;
    next(error);
});

aldiApp.use((error, req, res) => {
    // 500 = Internal Error
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});

module.exports = aldiApp;