const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const fs = require('fs');



const kundeRoutes = require('./api/resources/kunde');
const einkaufslisteRoutes = require('./api/resources/einkaufsliste');


const ourUri = "localhost:3000";



app.use(bodyParser.json())

// Anfragen mit bestimmten URIs werden in die jeweiligen Skripte weitergeleitet
app.use('/kunde', kundeRoutes);

// app.use('/kunde/:kundeID/einkaufsliste', (req, res, next) => {

//     // Um in einkaufsliste.js auf die kundURI zugreifen zu können, speichern wir die kundeURI in einem JSON-File
//     const kundeURI = {
//         kundeURI : ourUri + "/kunde/" + req.params.kundeID
//     };

//     fs.writeFile('./api/resources/kundeURI.json', JSON.stringify(kundeURI), function(error){
//         if(error) throw error;
//         next();
//     })
// });

app.use('/kunde/:kundeID/einkaufsliste', einkaufslisteRoutes);



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


/*
var request = require("request")

var url = "localhost:3000/kunde/1";

request({
    url: url,
    json: true
}, function (error, response, body) {

    if (!error && response.statusCode === 200) {
        console.log(body) // Print the json response
    }
})
*/

module.exports = app;