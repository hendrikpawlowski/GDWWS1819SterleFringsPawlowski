const express = require('express');
const app = express();
const bodyParser = require("body-parser")

const kundeRoutes = require('./api/resources/kunde');
const einkaufslisteRoutes = require('./api/resources/einkaufsliste');
const discounterRoutes = require('./api/resources/discounter');
const produktRoutes = require('./api/resources/produkt');

app.use(bodyParser.json())


/*const Kunde = function(id, benutzername, passwort) {
    this.id = id;
    this.benutzername = benutzername;
    this.passwort = passwort;
    let einkaufsliste = new Array();
}


const Einkaufsliste = function(name) {
    this.name = name;
    let produkte = new Array();
}

var kunde1 = new Kunde(1234, "hendrik", "pass");

module.exports = {
    getKunde: function() {
        return kunde1;
    }
}*/

app.use('/kunde', kundeRoutes);
app.use('/einkaufsliste', einkaufslisteRoutes);
app.use('/discounter', discounterRoutes);
app.use('/produkt', produktRoutes);






app.use((req, res, next) => {
    const error = new Error('404 Not Found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
})

module.exports = app;