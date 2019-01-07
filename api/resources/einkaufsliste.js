const express = require('express');
const router = express.Router();
const fs = require('fs');

// Die lokale Einkaufslistendatenbank wird in einem Array in der Variable einkaufslisten gespeichert
const einkaufslisten = require('../../einkaufslistenDatenbank');
const kundenListe = require('../../kundenDatenbank');

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



const generateNewID = function(){

    // Dieser token soll auf true gesetzt werden, wenn die ID des aktuellen Kunden mit dem Zähler übereinstmmt
    // So soll eine ID gefunden werden, die noch nicht verwendet wird

    var token = false;

    for(let i = 0; i < einkaufslisten.length + 1; i++) {

        for(let position = 0; position < einkaufslisten.length; position++){

            // Wird die aktuelle ID schon verwendet, so wird der token auf true gesetzt
            if(einkaufslisten[position].id == i){
                token = true;
            }

        }
        // Ist der token = false, so wird der aktuelle Zähler zurückgegeben
        if(!token){
            return i;
        }
        // Der token wird wieder auf false gesetzt, um alles nocheinmal mit dem nächsten Zähler machen zu können
        token = false;
    }
}

module.exports = router;