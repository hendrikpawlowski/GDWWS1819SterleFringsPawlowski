const express = require('express');
const router = express.Router();
const fs = require('fs');

// Die lokale Einkaufslistendatenbank wird in einem Array in der Variable einkaufslisten gespeichert
const kundenListe = require('../../kundenDatenbank');


const ourUri = "localhost:3000";


router.get("/:einkaufslisteID/", (req, res, next) => {

    fs.readFile('./api/resources/kundeURI.json', 'utf8',  (error, data) => {
        
        if(error) throw error;

        // Es wird auf die kundeID aus app.js zugegriffen
        const current = JSON.parse(data);
        const kundeURI = current.kundeURI;

        // Auf die einkaufslisteID wird zugegriffen
        const einkaufslisteID = req.params.einkaufslisteID;
        //const currentUri = ourUri + "/kunde/" + kundeID + "/einkaufsliste/" + einkaufslisteID

        // Der Kunde mit der jeweiligen Kunden ID wird gesucht
        for(let i = 0; i < kundenListe.length; i++){

            if(kundenListe[i].uri == kundeURI){

                for(let j = 0; j < kundenListe[i].einkaufslisten.length; j++){

                    if(kundenListe[i].einkaufslisten[j].uri == kundeURI + "/einkaufsliste/" + einkaufslisteID){

                        res.status(200).json({

                            kunde: kundenListe[i],
                            einkaufsliste: kundenListe[i].einkaufslisten[j]
                        })
                    }
                }
            }
        }
        // Die Einkaufsliste auf den Kunden mit der übergebenen ID wurde nicht gefunden
        // 404 = Not Found
        // res.sendStatus(404);
        // res.status(404).json({
        //     message: "404 Not Found"
        // });
    })
})



router.get("/", (req, res, next) => {

    fs.readFile('./api/resources/kundeURI.json', 'utf8',  (error, data) => {
        
        if(error) throw error;

        // Es wird auf die kundeID aus app.js zugegriffen
        const current = JSON.parse(data);
        const kundeURI = current.kundeURI;

        // Der Kunde mit der jeweiligen Kunden ID wird gesucht
        for(let i = 0; i < kundenListe.length; i++){

            if(kundenListe[i].uri == kundeURI){

                        res.status(200).json({
                            einkaufslisten: kundenListe[i].einkaufslisten,
                        })
                    }
                }
        // Die Einkaufsliste auf den Kunden mit der übergebenen ID wurde nicht gefunden
        // 404 = Not Found
        // res.sendStatus(404);
        // res.status(404).json({
        //     message: "404 Not Found"
        // });
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
            }
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



/*
console.log(einkaufslisten);
console.log(einkaufslisten.length);

router.post("/", (req, res, next) => {

    // Eine neue Einkaufsliste wird erstellt
    const einkaufsliste = {
        id: generateNewID(),
        kundeID: req.body.kundeID
    }


    for(let i = 0; i < kundenListe.length; i++){

        //Prüfung, ob eingegebene KundenID in der Kundendatenbank vorhanden ist
        if(kundenListe[i].id == einkaufsliste.kundeID){

            const currentKunde = kundenListe[i];
            const currentKundeEinkaufslisten = currentKunde.einkaufslisten;

            // Die Einkaufsliste wird dem Array hinzugefügt
            einkaufslisten.push(einkaufsliste);

            // Das Array wird in der lokalen Einkaufslistendatenbank (einem json-File) gespeichert
            fs.writeFile('einkaufslistenDatenbank.json', JSON.stringify(einkaufslisten), function(error){
                if(error) throw error;
            });

            // EinkaufslistenID wird dem zugehörigen Kunden in der Kundendatenbank (einem json-File) hinzugefügt
            currentKunde.einkaufslisten.push(einkaufsliste.id);

            fs.writeFile('kundenDatenbank.json', JSON.stringify(kundenListe), function(error){
                if(error) throw error;
            });


            // 201 = CREATED
            res.status(201).json({
                uri: "localhost:3001/einkaufsliste/" + einkaufsliste.id,
                createdEinkaufsliste: einkaufsliste
            });
        }
    }
})

router.get("/:einkaufslisteID", (req, res, next) => {

    const id = req.params.einkaufslisteID;

    // Die Einkaufsliste mit der übergebenen Einkaufslisten ID wird gesucht und in der Variable currentEinkaufsliste gespeichert
    for(let i = 0; i < einkaufslisten.length; i++){
        if(einkaufslisten[i].id == id){
            var currentEinkaufsliste = einkaufslisten[i];
        }
    }

    res.status(200).json({
        message: "Ein GET auf Einkaufsliste " + id,
        einkaufsliste: currentEinkaufsliste
    });
})

router.put("/:einkaufslisteID", (req, res, next) => {

    res.status(200).json({

    });
})

router.delete("/:einkaufslisteID", (req, res, next) => {

    res.status(200).json({

    });
})
*/


module.exports = router;