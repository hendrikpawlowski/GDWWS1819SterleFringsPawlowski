const express = require('express');
const router = express.Router();
const fs = require('fs');

// Die lokale Kundendatenbank wird in einem Array in der Variable kundenListe gespeichert
const kundenListe = require('../../kundenDatenbank');
console.log(kundenListe);

const ourUri = "localhost:3000";



/*
 * POST Verb auf Kunde
 * Ein neuer Kunde wird angelegt
 */
router.post("/", (req, res, next) => {

    const newId = generateNewID();

    // Ein neuer Kunde wird erstellt
    const kunde = {
        uri: ourUri + "/kunde/" + newId,
        id: newId,
        name: req.body.name,
        einkaufslisten: []
    }

    // Der Kunde wird dem Array hinzugefügt
    kundenListe.push(kunde);

    // Das Array wird in der lokalen Datenbank (einem json-File) gespeichert
    saveData();

    // 201 = CREATED
    res.status(201).json({
        createdKunde: kunde
    });
})



/*
 * GET Verb auf alle Kunden
 * Die Kundenliste wird zurückgegeben
 */
router.get("/", (req, res, next) => {

    res.status(200).json({
        KundenListe : kundenListe
    });
})




/*
 * GET Verb auf einen speziellen Kunden
 * Der Kunde, mit dem die URI übereinstimmt wird zurückgegeben
 */
router.get("/:kundeID", (req, res, next) => {
    
    const id = req.params.kundeID;

    console.log(ourUri + req.originalUrl);

    // Der Kunde mit der übergebenen Kunden ID wird gesucht und in der Variable currentKunde gespeichert
    for(let i = 0; i < kundenListe.length; i++){
        
        if(kundenListe[i].uri == ourUri + req.originalUrl){
            var currentKunde = kundenListe[i];
        }
    }

    res.status(200).json({
        kunde: currentKunde
    })
})



/*
 * PUT Verb auf einen speziellen Kunden
 * Der Kunde, mit dem die URI übereinstimmt, wird mit neuen Daten gespeichert
 */
router.put("/:kundeID", (req, res, next) => {

    res.status(200).json({
        message: "Ein PUT Request auf Kunde " + kundeID
    });
})



/*
 * DELETE Verb auf einen speziellen Kunden
 * Der Kunde, mit dem die URI übereinstimmt, wird gelöscht
 */
router.delete("/:kundeID", (req, res, next) => {

    const kundeID = req.params.kundeID;

    for(let i = 0; i < kundenListe.length; i++){

        if(kundenListe[i].id == kundeID){
            kundenListe.splice(i, 1);
            saveData();
        }
    }

    res.status(200).json({
        newKundenListe: kundenListe
    });
})



// HILFS FUNKTIONEN

/*
 * saveData ist dazu da, um Daten die in unserer lokalen Datenbank in Benutzung unserer Anwendung geändert
 * wurden wieder zu speichern.
 */
const saveData = function(){
    fs.writeFile('kundenDatenbank.json', JSON.stringify(kundenListe), function(error){
        if(error) throw error;
    });
}



/*
 * Mit generateNewID soll jedem Kunden automatisch eine ID zugeteilt werden
 * Falls im Laufe der Zeit ID wieder frei werden, sollen jene mithilfe dieser Funktion
 * ausfindig gemacht werden
 * Bsp: Es existieren folgende Kunden: 1, 2, 3, 4
 * Im Laufe der Zeit wird der Kunde mit der ID 2 gelöscht
 * Wird nun ein neuer Kunde erstellt, so bekommt er die ID = 2
 */
const generateNewID = function(){

    // Dieser token soll auf true gesetzt werden, wenn die ID des aktuellen Kunden mit dem Zähler übereinstmmt
    // So soll eine ID gefunden werden, die noch nicht verwendet wird

    var token = false;

    for(let i = 1; i < kundenListe.length + 2; i++) {

        for(let position = 0; position < kundenListe.length; position++){

            // Wird die aktuelle ID schon verwendet, so wird der token auf true gesetzt
            if(kundenListe[position].id == i){
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