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

    const newId = generateNewID(kundenListe);

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
    sortKundenListe();
    // Die Änderungen werden in der lokalen Datenbank gespeichert
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
        KundenListe: kundenListe
    });
})




/*
 * GET Verb auf einen speziellen Kunden
 * Der Kunde, mit dem die URI übereinstimmt wird zurückgegeben
 */
router.get("/:kundeID", (req, res, next) => {

    const kundeID = req.params.kundeID;

    if (!findKundeByID(kundeID)) {
        res.status(404).json({
            message: "404 Not Found",
            problem: "Der Kunde mit der ID " + kundeID + " existiert nicht"
        })
    } else {
        res.status(200).json({
            kunde: findKundeByID(kundeID)
        })
    }
})



/*
 * PUT Verb auf einen speziellen Kunden
 * Der Kunde, mit dem die URI übereinstimmt, wird mit neuen Daten gespeichert
 */
router.put("/:kundeID", (req, res, next) => {

    const kundeID = req.params.kundeID;

    if (!findKundeByID(kundeID)) {

        res.status(404).json({
            message: "404Not Found",
            problem: "Der Kunde mit der ID " + kundeID + " existiert nicht"
        })

    } else {

        findKundeByID(kundeID).name = req.body.name;
        saveData();

        res.status(200).json({
            changedKunde: findKundeByID(kundeID)
        })
    }
})



/*
 * DELETE Verb auf einen speziellen Kunden
 * Der Kunde, mit dem die URI übereinstimmt, wird gelöscht
 */
router.delete("/:kundeID", (req, res, next) => {

    const kundeID = req.params.kundeID;

    for (let i = 0; i < kundenListe.length; i++) {

        if (kundenListe[i].id == kundeID) {
            kundenListe.splice(i, 1);
            saveData();
        }
    }

    res.status(200).json({
        newKundenListe: kundenListe
    });
})



/*
 * GET Verb auf eine spezielle Einkaufsliste
 * Die Einkaufsliste mit der übereinstimmenden URI soll ausgegeben werden
 */
router.get("/:kundeID/einkaufsliste/:einkaufslisteID", (req, res, next) => {

    const kundeID = req.params.kundeID;
    const einkaufslisteID = req.params.einkaufslisteID;

    if (!findEinkaufslisteByID(kundeID, einkaufslisteID)) {

        res.status(404).json({
            message: "404 Not Found",
            problem: "Der Kunde oder die Einkaufsliste existiert nicht"
        })
    } else {

        res.status(200).json({
            einkaufsliste: findEinkaufslisteByID(kundeID, einkaufslisteID)
        })

    }
})



/*
 * GET Verb auf alle Einkaufslisten eines speziellen Kunden
 * Alle Einkaufsliste eines Kunden, mit welchem die KundenID übereinstimmt, soll ausgegeben werden
 */
router.get("/:kundeID/einkaufsliste", (req, res, next) => {

    const kundeID = req.params.kundeID;

    if (!findKundeByID(kundeID)) {

        res.status(404).json({
            message: "404 Not Found",
            problem: "Der Kunde mit der ID " + kundeID + " existiert nicht"
        })

    } else {

        res.status(200).json({
            einkaufslisten: findKundeByID(kundeID).einkaufslisten
        })
    }
})



/*
 * POST Verb auf Einkaufsliste
 * Es wird eine neue Einkaufsliste für den Kunden mit der jeweiligen KundenID erstellt
 */
router.post("/:kundeID/einkaufsliste", (req, res, next) => {

    const kundeID = req.params.kundeID;

    if (!findKundeByID(kundeID)) {

        res.status(404).json({
            message: "404 Not Found",
            problem: "Der Kunde mit der ID " + kundeID + " existiert nicht"
        })

    } else {

        const currentKunde = findKundeByID(kundeID);
        const newId = generateNewID(currentKunde.einkaufslisten);

        const newEinkaufsliste = {
            uri: ourUri + req.originalUrl + "/" + newId,
            id: newId,
            produkte: req.body.produkte
        }

        currentKunde.einkaufslisten.push(newEinkaufsliste);
        saveData();

        res.status(200).json({
            kunde: currentKunde
        })
    }
})



/*
 * DELETE Verb auf eine spezielle Einkaufsliste
 * Die Einkaufsliste mit der übereinstimmenden URI soll gelöscht werden
 */
router.delete('/:kundeID/einkaufsliste/:einkaufslisteID', (req, res, next) => {

    const kundeID = req.params.kundeID;
    const einkaufslisteID = req.params.einkaufslisteID;

    if (!findEinkaufslisteByID(kundeID, einkaufslisteID)) {

        res.status(404).json({
            message: "404 Not Found",
            problem: "Der Kunde oder die Einkaufsliste existiert nicht"
        })

    } else {

        const currentKunde = findKundeByID(kundeID);

        for (let i = 0; i < currentKunde.einkaufslisten.length; i++) {

            if (currentKunde.einkaufslisten[i].id == einkaufslisteID) {

                currentKunde.einkaufslisten.splice(i, 1);
                saveData();

                res.status(200).json({
                    einkaufslisten: currentKunde.einkaufslisten
                })
            }
        }
    }
})



router.put('/:kundeID/einkaufsliste/:einkaufslisteID', (req, res, next) => {

    const kundeID = req.params.kundeID;
    const einkaufslisteID = req.params.einkaufslisteID;

    const kundeUndEinkaufsliste = findEinkaufslisteByID(kundeID, einkaufslisteID);

    if (!kundeUndEinkaufsliste) {
        res.status(404).json({
            message: "404 Not Found",
            problem: "Der Kunde oder die Einkaufsliste existiert nicht"
        })
    } else {

        kundeUndEinkaufsliste.produkte = req.body.produkte;

        saveData();

        res.status(200).json({
            changedEinkaufsliste: findEinkaufslisteByID(kundeID, einkaufslisteID)
        })
    }
})



// HILFS FUNKTIONEN



/*
 * saveData ist dazu da, um Daten, die in unserer lokalen Datenbank, in Benutzung unserer Anwendung, geändert
 * wurden wieder zu speichern.
 */
const saveData = function () {
    fs.writeFile('kundenDatenbank.json', JSON.stringify(kundenListe), function (error) {
        if (error) throw error;
    });
}



/*
 * Mit generateNewID soll jedem Element in einem Array automatisch eine ID zugeteilt werden
 * Falls im Laufe der Zeit IDs wieder frei werden, sollen jene mithilfe dieser Funktion
 * ausfindig gemacht werden
 * Bsp: Es existieren folgende Kunden: 1, 2, 3, 4
 * Im Laufe der Zeit wird der Kunde mit der ID 2 gelöscht
 * Wird nun ein neuer Kunde erstellt, so bekommt er die ID = 2
 */
const generateNewID = function (array) {

    // Dieser token soll auf true gesetzt werden, wenn die ID des aktuellen Kunden mit dem Zähler übereinstmmt
    // So soll eine ID gefunden werden, die noch nicht verwendet wird

    var token = false;

    for (let i = 1; i < array.length + 2; i++) {

        for (let position = 0; position < array.length; position++) {

            // Wird die aktuelle ID schon verwendet, so wird der token auf true gesetzt
            if (array[position].id == i) {
                token = true;
            }

        }
        // Ist der token = false, so wird der aktuelle Zähler zurückgegeben
        if (!token) {
            return i;
        }
        // Der token wird wieder auf false gesetzt, um alles nocheinmal mit dem nächsten Zähler machen zu können
        token = false;
    }
}



/*
 * sortKundenListe ist dazu da die komplette KundenListe nach IDs zu sortieren
 */
const sortKundenListe = function () {

    kundenListe.sort(function (a, b) {
        if (a.id > b.id) {
            return 1;
        }
        if (a.id < b.id) {
            return -1;
        }
        // a muss gleich b sein
        return 0;
    });
};



const findKundeByID = function (id) {

    for (let i = 0; i < kundenListe.length; i++) {

        if (kundenListe[i].id == id) {

            return kundenListe[i];
        }
    }

    return false;
}



const findEinkaufslisteByID = function (kundeID, einkaufslisteID) {

    const currentKunde = findKundeByID(kundeID);
    console.log("currentKunde: " + currentKunde);

    for (let i = 0; i < currentKunde.einkaufslisten.length; i++) {

        if (currentKunde.einkaufslisten[i].id == einkaufslisteID) {

            return currentKunde.einkaufslisten[i];
        }
    }

    return false;
}



module.exports = router;