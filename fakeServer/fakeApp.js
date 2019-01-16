const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const fs = require('fs');

const discounterRoutes = require('./api/resources/discounter');

app.use(bodyParser.json());

app.use('/discounter', discounterRoutes);

//Hendrik wenn du das liest du benutzt zu viele Kommentare

module.exports = app;