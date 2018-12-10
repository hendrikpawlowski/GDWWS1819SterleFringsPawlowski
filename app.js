const express = require('express');
const app = express();

const kundeRoutes = require('./api/resources/kunde');




const Kunde = function(id, benutzername, passwort) {
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
}

app.use('/kunde', kundeRoutes);

module.exports = app;