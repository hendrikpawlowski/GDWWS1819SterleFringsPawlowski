const express = require('express');
const router = express.Router();
const fs = require('fs');
const geolib = require('geolib');
// Dieses Modul beinhaltet Hilfsfunktionen
const helpFunction = require('../../own_modules/helpFunction');
// In diesem Modul stehen Funktionen, die für die Requests an unsere Fake Server notwendig sind
const requestFunction = require('../../own_modules/requestFunction');

// Die lokale Kundendatenbank wird in einem Array in der Variable kundenListe gespeichert
const kundenListe = require('../../kundenDatenbank');

const ourUri = "localhost:3001";

/*
 * POST Verb auf Kunde
 * Ein neuer Kunde wird angelegt
 */
router.post("/", (req, res, next) => {

    if (req.body.name == undefined) {
        res.status(400).json({
            message: "Missing body in this POST",
            missing: "name"
        });
        return;
    }

    const newId = helpFunction.generateNewID(kundenListe);

    // Ein neuer Kunde wird erstellt
    const kunde = {
        uri: ourUri + "/kunde/" + newId,
        id: newId,
        name: req.body.name,
        einkaufslisten: []
    }

    // Der Kunde wird dem Array hinzugefügt
    kundenListe.push(kunde);

    // Die KundenListe wird sortiert
    helpFunction.sortKundenListe(kundenListe);
    // Die Änderungen werden in der lokalen Datenbank gespeichert
    saveData();

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
        KundenListe: kundenListe
    });
})

/*
 * DELETE Verb auf alle Kunden
 * Die komplette Kunden-Liste wird gelöscht
 */
router.delete('/', (req, res, next) => {
    kundenListe.splice(0, kundenListe.length);
    saveData();
    res.send("204 Kunden-Liste erfolgreich zurückgesetzt").status(204);
})

/*
 * GET Verb auf einen speziellen Kunden
 * Der Kunde, mit dem die URI übereinstimmt wird zurückgegeben
 */
router.get("/:kundeID", (req, res, next) => {

    const kundeID = req.params.kundeID;
    const currentKunde = helpFunction.findKundeByID(kundenListe, kundeID);

    if (!currentKunde) {
        res.status(404).json({
            message: "404 Not Found",
            problem: "Der Kunde mit der ID " + kundeID + " existiert nicht"
        })
    } else {
        res.status(200).json({
            kunde: currentKunde
        })
    }
})

/*
 * PUT Verb auf einen speziellen Kunden
 * Der Kunde, mit dem die URI übereinstimmt, wird mit neuen Daten gespeichert
 */
router.put("/:kundeID", (req, res, next) => {

    const kundeID = req.params.kundeID;
    const currentKunde = helpFunction.findKundeByID(kundenListe, kundeID);

    if (req.body.name == undefined) {
        res.status(400).json({
            message: "Missing body in this PUT",
            missing: "name"
        });
        return;
    }
    if (!currentKunde) {
        res.status(404).json({
            message: "404Not Found",
            problem: "Der Kunde mit der ID " + kundeID + " existiert nicht"
        })
        return;
    }

    currentKunde.name = req.body.name;
    saveData();

    res.status(200).json({
        changedKunde: currentKunde
    })
})

/*
 * DELETE Verb auf einen speziellen Kunden
 * Der Kunde, mit dem die URI übereinstimmt, wird gelöscht
 */
router.delete("/:kundeID", (req, res, next) => {

    const kundeID = req.params.kundeID;
    const currentKunde = helpFunction.findKundeByID(kundenListe, kundeID);

    if (!currentKunde) {
        res.status(404).json({
            message: "404 Not Found",
            problem: "Ein Kunde mit der ID " + kundeID + " existiert nicht"
        })
        return;
    }

    for (let i = 0; i < kundenListe.length; i++) {
        if (kundenListe[i].id == kundeID) {
            kundenListe.splice(i, 1);
            saveData();
        }
    }

    res.send("204 Kunde " + kundeID + " erfolgreich gelöscht").status(204);
})

/*
 * GET Verb auf eine spezielle Einkaufsliste
 * Die Einkaufsliste mit der übereinstimmenden URI soll ausgegeben werden
 */
router.get("/:kundeID/einkaufsliste/:einkaufslisteID", (req, res, next) => {

    const kundeID = req.params.kundeID;
    const einkaufslisteID = req.params.einkaufslisteID;
    var einkaufsliste = helpFunction.findEinkaufslisteByID(kundenListe, kundeID, einkaufslisteID);

    if (req.body.suchradius == undefined || req.body.standort == undefined || req.body.produkte == undefined) {

        var missing = new Array();
        if (req.body.suchradius == undefined) missing.push("suchradius");
        if (req.body.standort == undefined) missing.push("standort");
        if (req.body.produkte == undefined) missing.push("produkte");

        res.status(400).json({
            message: "Missing body in this POST",
            missing: missing
        })
        return;
    }
    if (!einkaufsliste) {

        res.status(404).json({
            message: "404 Not Found",
            problem: "Der Kunde oder die Einkaufsliste existiert nicht"
        })
        return;
    }

    requestFunction.updateEinkaufsliste(einkaufsliste, req, function (einkaufsliste) {
        res.status(200).json({
            einkaufsliste: einkaufsliste
        })
    })
})

/*
 * GET Verb auf alle Einkaufslisten eines speziellen Kunden
 * Alle Einkaufslisten eines Kunden, mit welchem die KundenID übereinstimmt, soll ausgegeben werden
 */
router.get("/:kundeID/einkaufsliste", (req, res, next) => {

    const kundeID = req.params.kundeID;
    const currentKunde = helpFunction.findKundeByID(kundenListe, kundeID);

    if (!currentKunde) {

        res.status(404).json({
            message: "404 Not Found",
            problem: "Der Kunde mit der ID " + kundeID + " existiert nicht"
        })
        return;
    }

    res.status(200).json({
        einkaufslisten: currentKunde.einkaufslisten
    })
})

/*
 * POST Verb auf Einkaufsliste
 * Es wird eine neue Einkaufsliste für den Kunden mit der jeweiligen KundenID erstellt
 */
router.post("/:kundeID/einkaufsliste", (req, res, next) => {

    console.log("POST");

    const kundeID = req.params.kundeID;
    const currentKunde = helpFunction.findKundeByID(kundenListe, kundeID);

    if (req.body.suchradius == undefined || req.body.standort == undefined || req.body.produkte == undefined) {

        var missing = new Array();
        if (req.body.suchradius == undefined) missing.push("suchradius");
        if (req.body.standort == undefined) missing.push("standort");
        if (req.body.produkte == undefined) missing.push("produkte");

        res.status(400).json({
            message: "Missing body in this POST",
            missing: missing
        })
        return;
    }
    if (!currentKunde) {

        res.status(404).json({
            message: "404 Not Found",
            problem: "Der Kunde mit der ID " + kundeID + " existiert nicht"
        })
        return;
    }

    const newId = helpFunction.generateNewID(currentKunde.einkaufslisten);

    var newEinkaufsliste = {
        uri: ourUri + req.originalUrl + "/" + newId,
        id: newId,
        produkte: req.body.produkte,
        einkaufslisteBeiDiscounter: []
    }

    currentKunde.einkaufslisten.push(newEinkaufsliste);

    requestFunction.updateEinkaufsliste(newEinkaufsliste, req, function (newEinkaufsliste) {

        saveData();
        res.status(201).json({
            einkaufsliste: newEinkaufsliste
        });
    })
})

/*
 * DELETE Verb auf eine spezielle Einkaufsliste
 * Die Einkaufsliste mit der übereinstimmenden URI soll gelöscht werden
 */
router.delete('/:kundeID/einkaufsliste/:einkaufslisteID', (req, res, next) => {

    const kundeID = req.params.kundeID;
    const einkaufslisteID = req.params.einkaufslisteID;
    const currentKunde = helpFunction.findKundeByID(kundenListe, kundeID);
    const einkaufsliste = helpFunction.findEinkaufslisteByID(kundenListe, kundeID, einkaufslisteID)

    if (!einkaufsliste) {
        res.status(404).json({
            message: "404 Not Found",
            problem: "Der Kunde oder die Einkaufsliste existiert nicht"
        })
        return;
    }

    for (let i = 0; i < currentKunde.einkaufslisten.length; i++) {

        if (currentKunde.einkaufslisten[i].id == einkaufslisteID) {

            currentKunde.einkaufslisten.splice(i, 1);
            saveData();

            res.send("204 Einkaufsliste " + einkaufslisteID + " von Kunde " + kundeID + " erfolgreich gelöscht").status(204);
        }
    }
})

router.delete('/:kundeID/einkaufsliste', (req, res, next) => {

    const kundeID = req.params.kundeID;
    const currentKunde = helpFunction.findKundeByID(kundenListe, kundeID);

    if (!currentKunde) {
        res.status(404).json({
            message: "404 Not Found",
            problem: "Ein Kunde mit der ID " + kundeID + " existiert nicht"
        })
        return;
    }

    currentKunde.einkaufslisten.splice(0, currentKunde.einkaufslisten.length);
    saveData();

    res.send("204 Alle Einkaufslisten von Kunde " + kundeID + " erfolgreich gelöscht").status(204);
})

router.put('/:kundeID/einkaufsliste/:einkaufslisteID', (req, res, next) => {

    const kundeID = req.params.kundeID;
    const einkaufslisteID = req.params.einkaufslisteID;
    var einkaufsliste = helpFunction.findEinkaufslisteByID(kundenListe, kundeID, einkaufslisteID);
    einkaufsliste.produkte = req.body.produkte;

    if (req.body.suchradius == undefined || req.body.standort == undefined || req.body.produkte == undefined) {

        var missing = new Array();
        if (req.body.suchradius == undefined) missing.push("suchradius");
        if (req.body.standort == undefined) missing.push("standort");
        if (req.body.produkte == undefined) missing.push("produkte");

        res.status(400).json({
            message: "Missing body in this POST",
            missing: missing
        })
        return;
    }
    if (!einkaufsliste) {

        res.status(404).json({
            message: "404 Not Found",
            problem: "Der Kunde oder die Einkaufsliste existiert nicht"
        })
        return;
    }

    requestFunction.updateEinkaufsliste(einkaufsliste, req, function (einkaufsliste) {

        saveData();
        res.status(200).json({
            changedEinkaufsliste: einkaufsliste
        })
    });
})

/*
 * saveData ist dazu da, um Daten, die in unserer lokalen Datenbank, in Benutzung unserer Anwendung, geändert
 * wurden wieder zu speichern.
 */
const saveData = function () {
    fs.writeFile('kundenDatenbank.json', JSON.stringify(kundenListe), function (error) {
        if (error) throw error;
    });
}

module.exports = router;