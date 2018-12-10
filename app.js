const express = require('express');
const app = express();

const kundeRoutes = require('./api/resources/kunde');

app.use('/kunde', kundeRoutes);

module.exports = app;