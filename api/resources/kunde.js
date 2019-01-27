const express = require('express');
const router = express.Router();
const fs = require('fs');
const http = require('http');

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

    if (req.body.name == undefined) {
        res.status(400).json({
            message: "Missing body in this PUT",
            missing: "name"
        });
        return;
    }
    if (!findKundeByID(kundeID)) {

        res.status(404).json({
            message: "404Not Found",
            problem: "Der Kunde mit der ID " + kundeID + " existiert nicht"
        })
        return;
    }

    findKundeByID(kundeID).name = req.body.name;
    saveData();

    res.status(200).json({
        changedKunde: findKundeByID(kundeID)
    })
})

/*
 * DELETE Verb auf einen speziellen Kunden
 * Der Kunde, mit dem die URI übereinstimmt, wird gelöscht
 */
router.delete("/:kundeID", (req, res, next) => {

    const kundeID = req.params.kundeID;

    if (!findKundeByID(kundeID)) {
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

    if (!findEinkaufslisteByID(kundeID, einkaufslisteID)) {

        res.status(404).json({
            message: "404 Not Found",
            problem: "Der Kunde oder die Einkaufsliste existiert nicht"
        })
        return;
    }

    res.status(200).json({
        einkaufsliste: findEinkaufslisteByID(kundeID, einkaufslisteID)
    })
})

/*
 * GET Verb auf alle Einkaufslisten eines speziellen Kunden
 * Alle Einkaufslisten eines Kunden, mit welchem die KundenID übereinstimmt, soll ausgegeben werden
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

    if (req.body.produkte == undefined) {

        res.status(400).json({
            message: "Missing body in this POST",
            missing: "produkte"
        })
        return;
    }
    if (!findKundeByID(kundeID)) {

        res.status(404).json({
            message: "404 Not Found",
            problem: "Der Kunde mit der ID " + kundeID + " existiert nicht"
        })
        return;
    }

    const currentKunde = findKundeByID(kundeID);
    const newId = generateNewID(currentKunde.einkaufslisten)
    const kundenEinkaufsliste = req.body.produkte;

    const newEinkaufsliste = {
        uri: ourUri + req.originalUrl + "/" + newId,
        id: newId,
        produkte: kundenEinkaufsliste,
        einkaufslisteBeiDiscounter: []
    }

    currentKunde.einkaufslisten.push(newEinkaufsliste);
    saveData();

    requestAldiServer(kundenEinkaufsliste, function (resultAldiServer) {
        newEinkaufsliste.einkaufslisteBeiDiscounter.push(resultAldiServer);
        saveData();

    })

    requestFakeServer(kundenEinkaufsliste, function (resultFakeServer) {
        newEinkaufsliste.einkaufslisteBeiDiscounter.push(resultFakeServer);
        saveData();
    })


    // Nach einer Sekunde wird der Status 201 - CREATED gesendet, in dieser Zeit werden die Requests abgearbeitet
    // Daten von Requests, die länger brauchen oder fehlerhaft sind werden nicht ausgewertet
    setTimeout(function () {
        sortEinkaufslisteBeiDiscounter(newEinkaufsliste);
        res.status(201).json({
            newEinkaufsliste: newEinkaufsliste
        })
    }, 1000);
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
        return;
    }

    const currentKunde = findKundeByID(kundeID);

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

    const currentKunde = findKundeByID(kundeID);

    if (!findKundeByID(kundeID)) {
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
    const kundeUndEinkaufsliste = findEinkaufslisteByID(kundeID, einkaufslisteID);

    if (req.body.produkte == undefined) {
        res.status(400).json({
            message: "Missing body in this PUT",
            missing: "produkte"
        })
        return;
    }
    if (!kundeUndEinkaufsliste) {

        res.status(404).json({
            message: "404 Not Found",
            problem: "Der Kunde oder die Einkaufsliste existiert nicht"
        })
        return;
    }

    kundeUndEinkaufsliste.produkte = req.body.produkte;
    saveData();

    kundeUndEinkaufsliste.einkaufslisteBeiDiscounter = [];

    requestAldiServer(kundeUndEinkaufsliste.produkte, function (resultAldiServer) {
        kundeUndEinkaufsliste.einkaufslisteBeiDiscounter.push(resultAldiServer);
        saveData();
    })

    requestFakeServer(kundeUndEinkaufsliste.produkte, function (resultFakeServer) {
        kundeUndEinkaufsliste.einkaufslisteBeiDiscounter.push(resultFakeServer);
        saveData();
    })

    // Nach einer Sekunde wird der Status 201 - CREATED gesendet, in dieser Zeit werden die Requests abgearbeitet
    // Daten von Requests, die länger brauchen oder fehlerhaft sind werden nicht ausgewertet
    setTimeout(function () {
        sortEinkaufslisteBeiDiscounter(kundeUndEinkaufsliste);
        res.status(200).json({
            einkaufsliste: kundeUndEinkaufsliste
        })
    }, 1000);

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

/*
 * sortEinkaufslisteBeiDiscounter ist dazu da die komplette KundenListe nach IDs zu sortieren
 */
const sortEinkaufslisteBeiDiscounter = function (currentEinkaufsliste) {

    currentEinkaufsliste.einkaufslisteBeiDiscounter.sort(function (a, b) {
        if (a.gesamtPreis > b.gesamtPreis) {
            return 1;
        }
        if (a.gesamtPreis < b.gesamtPreis) {
            return -1;
        }
        // a muss gleich b sein
        return 0;
    });
};


// Findet Kunden in der kundenListe, anhand der angegebenen ID
const findKundeByID = function (id) {

    for (let i = 0; i < kundenListe.length; i++) {

        if (kundenListe[i].id == id) {

            return kundenListe[i];
        }
    }

    return false;
}


// Finden Einkaufsliste in der kundenListe, anhand der angegebenen kundenID und der angegebenen einkaufslistenID
const findEinkaufslisteByID = function (kundeID, einkaufslisteID) {

    const currentKunde = findKundeByID(kundeID);

    for (let i = 0; i < currentKunde.einkaufslisten.length; i++) {

        if (currentKunde.einkaufslisten[i].id == einkaufslisteID) {

            return currentKunde.einkaufslisten[i];
        }
    }

    return false;
}

// Findet Produkt in einem Array, anhand des angegebenen Namens
const findProdukteByName = function (discounterName, discounterProdukte, kundeProdukte) {

    var gesamtPreis = 0;
    var produktListe = new Array();
    for (let i = 0; i < discounterProdukte.length; i++) {

        for (let j = 0; j < kundeProdukte.length; j++)

            if (discounterProdukte[i].name == kundeProdukte[j]) {

                const newProdukt = {
                    name: discounterProdukte[i].name,
                    marke: discounterProdukte[i].marke,
                    preis: discounterProdukte[i].preis,
                    gewicht: discounterProdukte[i].gramm
                }
                produktListe.push(newProdukt);
                gesamtPreis += discounterProdukte[i].preis
            }
    }

    var einkaufsliste = {
        name: discounterName,
        gesamtPreis: gesamtPreis.toFixed(2),
        produktListe: produktListe
    };
    return einkaufsliste;
}

// REQUESTS AN UNERE SERVER


const requestFakeServer = function (kundenEinkaufsliste, callback) {
    // Notwendige Informtionen, um Server per http.request anzusprechen
    const options = {
        host: "localhost",
        port: 3069,
        path: "/sortiment",
        method: "GET"
    };

    var request = http.request(options, function (res2) {

        var body = "";

        res2.on("data", function (content) {
            body += content;
        });

        res2.on("end", function () {
            const sortiment = JSON.parse(body);
            produkteArray = findProdukteByName("Fake Server", sortiment['Sortiment'], kundenEinkaufsliste);
            callback(produkteArray);
        });

    });

    // Server konnte nicht erreicht werden
    request.on("error", function (err) {
        console.log("Server " + options.host + ":" + options.port + "" + options.path + " wurde nicht erreicht");
    });

    request.end();
}

const requestAldiServer = function (kundenEinkaufsliste, callback) {

    // Notwendige Informtionen, um Server per http.request anzusprechen
    const options = {
        host: "localhost",
        port: 3070,
        path: "/aldiSortiment",
        method: "GET"
    };

    var request = http.request(options, function (res2) {

        var body = "";

        res2.on("data", function (content) {
            body += content;
        });

        res2.on("end", function () {
            const aldiSortiment = JSON.parse(body).AldiSortiment;
            produkteArray = findProdukteByName("Aldi", aldiSortiment, kundenEinkaufsliste);
            callback(produkteArray);
        });

    });

    // Server konnte nicht erreicht werden
    request.on("error", function (err) {
        console.log("Server " + options.host + ":" + options.port + "" + options.path + " wurde nicht erreicht");
    });

    request.end();

}

module.exports = router;