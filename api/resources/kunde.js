const express = require('express');
const router = express.Router();
const fs = require('fs');

// Die lokale Kundendatenbank wird in einem Array in der Variable kundenListe gespeichert
const kundenListe = require('../../kundenDatenbank');


const ourUri = "localhost:3000";


console.log(kundenListe);
// console.log(kundenListe.length);



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



router.get("/", (req, res, next) => {

    res.status(200).json({
        KundenListe : kundenListe
    });
})




router.get("/:kundeID", (req, res, next) => {
    
    const id = req.params.kundeID;

    console.log(ourUri + req.originalUrl);

    // Der Kunde mit der übergebenen Kunden ID wird gesucht und in der Variable currentKunde gespeichert
    for(let i = 0; i < kundenListe.length; i++){
        if(kundenListe[i].uri == ourUri + req.originalUrl || ourUri + req.originalUrl + "/"){
            var currentKunde = kundenListe[i];
        }
    }

    res.status(200).json({
        kunde: currentKunde
    })
})



router.put("/:kundeID", (req, res, next) => {

    res.status(200).json({
        message: "Ein PUT Request auf Kunde " + kundeID
    });
})



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



const saveData = function(){
    fs.writeFile('kundenDatenbank.json', JSON.stringify(kundenListe), function(error){
        if(error) throw error;
    });
}



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