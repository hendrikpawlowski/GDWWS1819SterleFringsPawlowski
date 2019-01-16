const express = require('express');
const router = express.Router();
const fs = require('fs');

// Die lokale Einkaufslistendatenbank wird in einem Array in der Variable einkaufslisten gespeichert
const kundenListe = require('../../kundenDatenbank');

const ourUri = "localhost:3000";



/*
 * GET Verb auf eine spezielle Einkaufsliste
 * Die Einkaufsliste mit der übereinstimmenden URI soll ausgegeben werden
 */
router.get("/:einkaufslisteID/", (req, res, next) => {

    // Auf die einkaufslisteID wird zugegriffen
    const einkaufslisteID = req.params.einkaufslisteID;

    // Diese Variable wird auf true gesetzt, wenn der Kunde und seine Einkaufsliste gefunden wurden
    var found = false;

    // Der Kunde mit der jeweiligen Kunden ID wird gesucht
    for (let i = 0; i < kundenListe.length; i++) {

        if (kundenListe[i].uri + "/einkaufsliste/" + einkaufslisteID == ourUri + req.originalUrl) {

            for (let j = 0; j < kundenListe[i].einkaufslisten.length; j++) {

                 if (kundenListe[i].einkaufslisten[j].uri == ourUri + req.originalUrl) {

                // console.log(kundenListe[i].einkaufslisten[einkaufslisteID]);
                    res.status(200).json({
                        einkaufsliste: kundenListe[i].einkaufslisten[einkaufslisteID]
                    })

                    found = true;
                }
            }
        }
    }

    if (!found) {
        res.status(404).json({
            message: "404 Not Found",
            problem: "Der Kunde, oder die Einkaufsliste dieses Kunden existiert nicht"
        })
    }
})



/*
 * GET Verb auf alle Einkaufslisten eines speziellen Kunden
 * Alle Einkaufsliste eines Kunden, mit welchem die KundenID übereinstimmt, soll ausgegeben werden
 */
router.get("/", (req, res, next) => {

    // Diese Variable wird auf true gesetzt, wenn der Kunde gefunden wurde
    var found = false;

    // Der Kunde mit der passenden URI wird gesucht
    for (let i = 0; i < kundenListe.length; i++) {

        if (kundenListe[i].uri + "/einkaufsliste" == ourUri + req.originalUrl) {

            res.status(200).json({
                einkaufslisten: kundenListe[i].einkaufslisten,
            })

            found = true;
        }
    }

    if (!found) {
        res.status(404).json({
            message: "404 Not Found",
            problem: "Der gesuchte Kunde existiert nicht"
        })
    }
})



/*
 * POST Verb auf Einkaufsliste
 * Es wird eine neue Einkaufsliste für den Kunden mit der jeweiligen KundenID erstellt
 */
router.post("/", (req, res, next) => {

    for (let i = 0; i < kundenListe.length; i++) {

        if (kundenListe[i].uri + "/einkaufsliste" == ourUri + req.originalUrl) {

            const newId = kundenListe[i].einkaufslisten.length + 1;

            const newEinkaufsliste = {
                uri: ourUri + req.originalUrl + "/" + newId,
                id: newId,
                produkte: req.body.produkte
            }

            kundenListe[i].einkaufslisten.push(newEinkaufsliste);

            saveData();

            res.status(200).json({
                kunde: kundenListe[i]
            })
        }
    }
})



/*
 * DELETE Verb auf eine spezielle Einkaufsliste
 * Die Einkaufsliste mit der übereinstimmenden URI soll gelöscht werden
 */
router.delete('/:einkaufslisteID', (req, res, next) => {

    const einkaufslisteID = req.params.einkaufslisteID;
    console.log(einkaufslisteID);

    // Diese Variable wird auf true gesetzt, wenn der Kunde und seine Einkaufsliste gefunden wurden
    var found = false;

    for (let i = 0; i < kundenListe.length; i++) {

        if (kundenListe[i].uri + "/einkaufsliste/" + einkaufslisteID == ourUri + req.originalUrl) {

            kundenListe[i].einkaufslisten.splice(einkaufslisteID - 1, 1);
            // Jede Einkaufsliste soll immer folgende ID haben:
            // Position im Array + 1
            refreshIDs(i);
            saveData();

            res.status(200).json({
                kunde: kundenListe[i]
            })

            found = true;
        }
    }
    if (!true) {
        res.status(404).json({
            message: "404 Not Found",
            problem: "Der Kunde, oder die Einkaufsliste dieses Kunden existiert nicht"
        })
    }
})



// HILFS FUNKTIONEN



/*
 * saveData ist dazu da, um Daten die in unserer lokalen Datenbank in Benutzung unserer Anwendung geändert
 * wurden wieder zu speichern.
 */
const saveData = function () {
    fs.writeFile('kundenDatenbank.json', JSON.stringify(kundenListe), function (error) {
        if (error) throw error;
    });
}



/*
 * refreshIDs ist dazu da, um jeder Einkaufsliste des Kunden immer genau die ID zu übergeben,
 * die mit der Position im Einkaufsliste-Array des Kunden übereinstimmen
 * Bsp: Es existiert ein Kunde mit Liste1 und Liste2
 * Nun wird Liste1 gelöscht und dieser Kunde hat nur noch Liste2
 * Mit der refreshIDs-Methode wird nun aus dieser Liste2 die neue Liste1
 */
const refreshIDs = function (i) {

    for (let j = 0; j < kundenListe[i].einkaufslisten.length; j++) {

        const newID = j + 1;
        kundenListe[i].einkaufslisten[j].id = newID;
        kundenListe[i].einkaufslisten[j].uri = kundenListe[i].uri + "/einkaufsliste/" + newID;
    }
}



module.exports = router;