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

    // Der Kunde mit der übergebenen URI wird gesucht und in der Variable currentKunde gespeichert
    for (let i = 0; i < kundenListe.length; i++) {

        if (kundenListe[i].id == kundeID) {
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

    const kundeID = req.params.kundeID;

    var found = false;

    for (let i = 0; i < kundenListe.length; i++) {

        if (kundenListe[i].id == kundeID) {

            kundenListe[i].name = req.body.name;

            res.status(200).json({
                changedKunde: kundenListe[i]
            });

            saveData();
            found = true;
        }
    }
    if (!found) {
        res.status(404).json({
            message: "404 Not Found",
            problem: "Es existiert kein Kunde mit der ID: " + kundeID
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

    // Diese Variable wird auf true gesetzt, wenn der Kunde und seine Einkaufsliste gefunden wurden
    var found = false;

    // Der Kunde mit der jeweiligen Kunden ID wird gesucht
    for (let i = 0; i < kundenListe.length; i++) {

        if (kundenListe[i].id == kundeID) {

            for (let j = 0; j < kundenListe[i].einkaufslisten.length; j++)

                if (kundenListe[i].einkaufslisten[j].id == einkaufslisteID) {
                    
                    res.status(200).json({
                        einkaufsliste: kundenListe[i].einkaufslisten[j]
                    })
                    found = true;
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
router.get("/:kundeID/einkaufsliste", (req, res, next) => {

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
router.post("/:kundeID/einkaufsliste", (req, res, next) => {

    const kundeID = req.params.kundeID;

    for (let i = 0; i < kundenListe.length; i++) {

        if (kundenListe[i].id == kundeID) {

            const newId = generateNewID(kundenListe[i].einkaufslisten);

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
router.delete('/:kundeID/einkaufsliste/:einkaufslisteID', (req, res, next) => {

    const kundeID = req.params.kundeID;
    const einkaufslisteID = req.params.einkaufslisteID;

    // Diese Variable wird auf true gesetzt, wenn der Kunde und seine Einkaufsliste gefunden wurden
    var found = false;

    for (let i = 0; i < kundenListe.length; i++) {

        if (kundenListe[i].id == kundeID) {

            for (let j = 0; j < kundenListe[i].einkaufslisten.length; j++) {

                if (kundenListe[i].einkaufslisten[j].id == einkaufslisteID) {

                    kundenListe[i].einkaufslisten.splice(j, 1);
                    // Jede Einkaufsliste soll immer folgende ID haben:
                    // Position im Array + 1
                    // refreshIDs(i);
                    saveData();

                    res.status(200).json({
                        kunde: kundenListe[i]
                    })

                    found = true;
                }
            }
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
 * Mit generateNewID soll jedem Kunden automatisch eine ID zugeteilt werden
 * Falls im Laufe der Zeit ID wieder frei werden, sollen jene mithilfe dieser Funktion
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



/*
 * refreshIDs ist dazu da, um jeder Einkaufsliste des Kunden immer genau die ID zu übergeben,
 * die mit der Position im Einkaufsliste-Array des Kunden übereinstimmen
 * Bsp: Es existiert ein Kunde mit Liste1 und Liste2
 * Nun wird Liste1 gelöscht und dieser Kunde hat nur noch Liste2
 * Mit der refreshIDs-Methode wird nun aus dieser Liste2 die neue Liste1
 */
// const refreshIDs = function (i) {

//     for (let j = 0; j < kundenListe[i].einkaufslisten.length; j++) {

//         const newID = j + 1;
//         kundenListe[i].einkaufslisten[j].id = newID;
//         kundenListe[i].einkaufslisten[j].uri = kundenListe[i].uri + "/einkaufsliste/" + newID;
//     }
// }





module.exports = router;