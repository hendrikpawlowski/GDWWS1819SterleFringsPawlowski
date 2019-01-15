const express = require('express');
const router = express.Router();
const fs = require('fs');

// Die lokale Einkaufslistendatenbank wird in einem Array in der Variable einkaufslisten gespeichert
const kundenListe = require('../../kundenDatenbank');

const ourUri = "localhost:3000";



router.get("/:einkaufslisteID/", (req, res, next) => {

    console.log("url:" + req.url);
    console.log("baseUrl: " + req.baseUrl);
    console.log("originalUrl: " + req.originalUrl);

    fs.readFile('./api/resources/kundeURI.json', 'utf8',  (error, data) => {
        
        if(error) throw error;

        // Es wird auf die kundeID aus app.js zugegriffen
        const current = JSON.parse(data);
        const kundeURI = current.kundeURI;

        // Auf die einkaufslisteID wird zugegriffen
        const einkaufslisteID = req.params.einkaufslisteID;

        // Diese Variable wird auf true gesetzt, wenn der Kunde und seine Einkaufsliste gefunden wurden
        var found = false;
        
        // Der Kunde mit der jeweiligen Kunden ID wird gesucht
        for(let i = 0; i < kundenListe.length; i++){

            if(kundenListe[i].uri == kundeURI){

                for(let j = 0; j < kundenListe[i].einkaufslisten.length; j++){

                    if(kundenListe[i].einkaufslisten[j].uri == kundeURI + "/einkaufsliste/" + einkaufslisteID){

                        res.status(200).json({
                            einkaufsliste: kundenListe[i].einkaufslisten[j]
                        })

                        found = true;
                    }
                }
            }
        }

        if(!found){
            res.status(404).json({
                message: "404 Not Found",
                problem: "Der Kunde, oder die Einkaufsliste dieses Kunden existiert nicht"
            })
        }
    })
})



router.get("/", (req, res, next) => {

    fs.readFile('./api/resources/kundeURI.json', 'utf8',  (error, data) => {
        
        if(error) throw error;

        // Es wird auf die kundeURI aus app.js zugegriffen
        const current = JSON.parse(data);
        const kundeURI = current.kundeURI;

        // Diese Variable wird auf true gesetzt, wenn der Kunde gefunden wurde
        var found = false;

        // Der Kunde mit der passenden URI wird gesucht
        for(let i = 0; i < kundenListe.length; i++){

            if(kundenListe[i].uri == kundeURI){

                res.status(200).json({
                    einkaufslisten: kundenListe[i].einkaufslisten,
                })

                found = true;
            }
        }

        if(!found){
            res.status(404).json({
                message: "404 Not Found",
                problem: "Der gesuchte Kunde existiert nicht"
            })
        }
        // 404 = Not Found
    })
})



router.post("/", (req, res, next) => {

    fs.readFile('./api/resources/kundeURI.json', (error, data) => {

        if(error) throw error;

        // Es wird auf die kundeID aus app.js zugegriffen
        const current = JSON.parse(data);
        const kundeURI = current.kundeURI;

        for(let i = 0; i < kundenListe.length; i++){

            if(kundenListe[i].uri == kundeURI){

                const newEinkaufsliste = {
                    uri: kundeURI + "/einkaufsliste/" + (kundenListe[i].einkaufslisten.length + 1),
                    id : kundenListe[i].einkaufslisten.length + 1,
                    produkte : req.body.produkte
                }
                
                kundenListe[i].einkaufslisten.push(newEinkaufsliste);

                saveData();

                res.status(200).json({
                    kunde : kundenListe[i]
                })
            }
        }
    })
})



router.delete('/:einkaufslisteID', (req, res, next) => {

    fs.readFile('./api/resources/kundeURI.json', (error, data) => {

        if(error) throw error;

        // Es wird auf die kundeID aus app.js zugegriffen
        const current = JSON.parse(data);
        const kundeURI = current.kundeURI;

        const einkaufslisteID = req.params.einkaufslisteID;
        console.log(einkaufslisteID);

        // Diese Variable wird auf true gesetzt, wenn der Kunde und seine Einkaufsliste gefunden wurden
        var found = false;

        for(let i = 0; i < kundenListe.length; i++){

            if(kundenListe[i].uri == kundeURI){

                kundenListe[i].einkaufslisten.splice(einkaufslisteID - 1, 1);
                // Jede Einkaufsliste soll immer folgende ID haben:
                // Position im Array + 1
                refreshIDs(kundeURI);
                saveData();

                res.status(200).json({
                    kunde : kundenListe[i]
                })

                found = true;
            }
        }
        if(!true){
            res.status(404).json({
                message: "404 Not Found",
                problem: "Der Kunde, oder die Einkaufsliste dieses Kunden existiert nicht"
            })
        }
    })
});


// HILFS FUNKTIONEN


const saveData = function(){
    fs.writeFile('kundenDatenbank.json', JSON.stringify(kundenListe), function(error){
        if(error) throw error;
    });
}



const refreshIDs = function(kundeURI){

    for(let i = 0; i < kundenListe.length; i++){

        if(kundenListe[i].uri == kundeURI){

            for(let j = 0; j < kundenListe[i].einkaufslisten.length; j++){

                const newID = j + 1;
                kundenListe[i].einkaufslisten[j].id = newID;
                kundenListe[i].einkaufslisten[j].uri = kundeURI + "/einkaufsliste/" + newID;
            }
        }
    }
}



module.exports = router;