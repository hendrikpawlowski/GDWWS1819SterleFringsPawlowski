const express = require('express');
const app = express();
const bodyParser = require("body-parser");

const kundeRoutes = require('./api/resources/kunde');

app.use(bodyParser.json());

// Anfragen mit bestimmten URIs werden in die jeweiligen Skripte weitergeleitet
app.use('/kunde', kundeRoutes);


// ERROR Handling
app.use((req, res, next) => {
    // 404 = Not Found
    const error = new Error('404 Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    // 500 = Internal Error
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});


module.exports = app;