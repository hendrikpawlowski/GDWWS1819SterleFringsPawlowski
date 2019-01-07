const express = require('express');
const app = express();
const bodyParser = require("body-parser")

const kundeRoutes = require('./api/resources/kunde');
const einkaufslisteRoutes = require('./api/resources/einkaufsliste');
const discounterRoutes = require('./api/resources/discounter');
const produktRoutes = require('./api/resources/produkt');

app.use(bodyParser.json())



// Anfragen mit bestimmten URIs werden in die jeweiligen Skripte weitergeleitet
app.use('/kunde', kundeRoutes);
app.use('/einkaufsliste', einkaufslisteRoutes);
app.use('/discounter', discounterRoutes);
app.use('/produkt', produktRoutes);



// ERROR Handling
app.use((req, res, next) => {
    // 404 = Not Found
    const error = new Error('404 Not Found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    // 500 = Internal Error
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
})

module.exports = app;