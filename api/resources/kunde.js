const express = require('express');
const router = express.Router();
const fs = require('fs');
const http = require('http');
const geolib = require('geolib');

// Die lokale Kundendatenbank wird in einem Array in der Variable kundenListe gespeichert
const kundenListe = require('../../kundenDatenbank');

const ourUri = "localhost:3001";

// Notwendige Informationen um die Server der beiden Discounter zu erreichen
const aldiOptions = {
    host: "localhost",
    port: 3069,
    path: "/",
    method: "GET"
};

const lidlOptions = {
    host: "localhost",
    port: 3070,
    path: "/",
    method: "GET"
};

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
    var einkaufsliste = findEinkaufslisteByID(kundeID, einkaufslisteID);

    if(req.body.suchradius == undefined || req.body.standort == undefined || req.body.produkte == undefined){
        
        var missing = new Array();
        if(req.body.suchradius == undefined) missing.push("suchradius");
        if(req.body.standort == undefined) missing.push("standort");
        if(req.body.produkte == undefined) missing.push("produkte");

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

    updateEinkaufsliste(einkaufsliste, req.body, function (einkaufsliste) {

        if (req.query.allBio) einkaufsliste = filterBio(einkaufsliste)

        if (req.query.sort == "location") {
            sortByLocation(einkaufsliste);
        } else {
            sortByGesamtPreis(einkaufsliste);
        }
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

    if (!findKundeByID(kundeID)) {

        res.status(404).json({
            message: "404 Not Found",
            problem: "Der Kunde mit der ID " + kundeID + " existiert nicht"
        })
        return;
    }

    res.status(200).json({
        einkaufslisten: findKundeByID(kundeID).einkaufslisten
    })
})

/*
 * POST Verb auf Einkaufsliste
 * Es wird eine neue Einkaufsliste für den Kunden mit der jeweiligen KundenID erstellt
 */
router.post("/:kundeID/einkaufsliste", (req, res, next) => {

    const kundeID = req.params.kundeID;
    const currentKunde = findKundeByID(kundeID);
    const newId = generateNewID(currentKunde.einkaufslisten)

    if(req.body.suchradius == undefined || req.body.standort == undefined || req.body.produkte == undefined){
        
        var missing = new Array();
        if(req.body.suchradius == undefined) missing.push("suchradius");
        if(req.body.standort == undefined) missing.push("standort");
        if(req.body.produkte == undefined) missing.push("produkte");

        res.status(400).json({
            message: "Missing body in this POST",
            missing: missing
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

    var newEinkaufsliste = {
        uri: ourUri + req.originalUrl + "/" + newId,
        id: newId,
        produkte: req.body.produkte,
        einkaufslisteBeiDiscounter: []
    }

    currentKunde.einkaufslisten.push(newEinkaufsliste);
    saveData();

    // Die Methode updateEinkaufsliste wird ausgeführt
    // Die neue Einkaufsliste wird übergeben und dazu noch eine callback-Funktion, die ausgeführt wird,
    updateEinkaufsliste(newEinkaufsliste, req.body, function (newEinkaufsliste) {

        // Wenn im query allBio=true übergeben wird, so wird die Einkaufsliste nach Bio-Produkten gefiltert
        if (req.query.allBio) newEinkaufsliste = filterBio(newEinkaufsliste);

        // Wenn im query location=true übergeben wird, so werden die Einkaufslisten für den jeweiligen Discounter
        // nach der Distanz sortiert (gerinste Distanz als erstes)
        if (req.query.sort == "location") {
            sortByLocation(newEinkaufsliste)
        } else {
            // Wenn im query nichts übergeben wird, so werden die Einkaufslisten für den jeweiligen Discounter
            // nach dem Gesamtpreis sortiert (niedrigste Gesamtpreis als erstes)
            sortByGesamtPreis(newEinkaufsliste);
        }
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
    const standort = req.body.standort;
    const suchradius = req.body.suchradius;
    const produkte = req.body.produkte;
    var einkaufsliste = findEinkaufslisteByID(kundeID, einkaufslisteID);
    einkaufsliste.produkte = produkte;

    if(suchradius == undefined || standort == undefined || produkte == undefined){
        
        var missing = new Array();
        if(suchradius == undefined) missing.push("suchradius");
        if(standort == undefined) missing.push("standort");
        if(produkte == undefined) missing.push("produkte");

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

    updateEinkaufsliste(einkaufsliste, req.body, function (einkaufsliste) {

        // Wenn im query allBio=true übergeben wird, so wird die Einkaufsliste nach Bio-Produkten gefiltert
        if (req.query.allBio) einkaufsliste = filterBio(einkaufsliste);

        // Wenn im query location=true übergeben wird, so werden die Einkaufslisten für den jeweiligen Discounter
        // nach der Distanz sortiert (gerinste Distanz als erstes)
        if (req.query.sort == "location") {
            sortByLocation(einkaufsliste);
        } else {
            // Wenn im query nichts übergeben wird, so werden die Einkaufslisten für den jeweiligen Discounter
            // nach dem Gesamtpreis sortiert (niedrigste Gesamtpreis als erstes)
            sortByGesamtPreis(einkaufsliste);
        }

        saveData();
        res.status(200).json({
            changedEinkaufsliste: einkaufsliste
        })
    });
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
 * sortEinkaufslisteBeiDiscounter ist dazu da die Einkaufslisten für den jeweiligen Discountern nach dem Gesamtpreis zu sortieren
 */
const sortByGesamtPreis = function (currentEinkaufsliste) {

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

/*
 * filterLocation kommt zum Einsatz, wenn im query location=true steht
 * es wird eine Einkaufsliste eines Kunden übergeben
 * die Einkaufslisten für die jeweiligen Discounter dieser Einkaufsliste werden dann nach der Distanz
 * zum Kunden sortiert
 */

const sortByLocation = function (einkaufsliste) {

    einkaufsliste.einkaufslisteBeiDiscounter.sort(function (a, b) {
        if (a.distanz) {
            if (a.distanz > b.distanz) {
                return 1;
            }
            if (a.distanz < b.distanz) {
                return -1;
            }
            // a muss gleich b sein
            return 0;
        }
    });
}

// Findet Kunden in der kundenListe, anhand der angegebenen ID
const findKundeByID = function (id) {

    for (let i = 0; i < kundenListe.length; i++) {

        if (kundenListe[i].id == id) {

            return kundenListe[i];
        }
    }

    return false;
}

// Findet Einkaufsliste in der kundenListe, anhand der angegebenen kundenID und der angegebenen einkaufslistenID
const findEinkaufslisteByID = function (kundeID, einkaufslisteID) {

    const currentKunde = findKundeByID(kundeID);

    for (let i = 0; i < currentKunde.einkaufslisten.length; i++) {

        if (currentKunde.einkaufslisten[i].id == einkaufslisteID) {

            return currentKunde.einkaufslisten[i];
        }
    }

    return false;
}

// Findet Produkte in dem Sortiment des Discounters anhand der angegeben Produkte des Kunden und gibt die Einkaufsliste zurück
const setUpEinkaufslisteByDiscounter = function (discounterName, discounterDaten, kundeProdukte, body) {

    console.log("Hi");
    console.log("Discounter: " + discounterDaten.standort);
    console.log("Body: " + body.standort);
    const distanz = geolib.getDistance(discounterDaten.standort, body.standort) / 1000;
    console.log("Distanz" + distanz);

    if (distanz <= body.suchradius) {

        var gesamtPreis = 0;
        var produkte = new Array();
        const discounterProdukte = discounterDaten.sortiment;

        // Es wird jedes Produkt aus dem Sortiment des Discounters durchgegangen
        for (let i = 0; i < discounterProdukte.length; i++) {

            // Es wird jedes Produkt aus der Einkaufsliste des Kunden durchgegangen
            for (let j = 0; j < kundeProdukte.length; j++)

                // Wenn das ite Produkt aus dem Sortiment mit dem jten Produkt aus der Einkaufsliste des Kunden übereinstimmt
                // wird ein neues Produkt erstellt und dem Array produktListe hinzugefügt
                // In produktListe sind Informationen über die Produkte des Kunden bei dem jeweiligen Discounter drin
                if (discounterProdukte[i].name.toUpperCase() == kundeProdukte[j].toUpperCase()) {

                    const newProdukt = {
                        name: discounterProdukte[i].name,
                        marke: discounterProdukte[i].marke,
                        preis: discounterProdukte[i].preis,
                        gewicht: discounterProdukte[i].gramm,
                        bio: discounterProdukte[i].bio
                    }
                    produkte.push(newProdukt);
                    gesamtPreis += discounterProdukte[i].preis
                }
        }

        var einkaufsliste = {
            name: discounterName,
            gesamtPreis: gesamtPreis.toFixed(2),
            anzahlNichtGefundenerProdukte: kundeProdukte.length - produkte.length,
            distanz: distanz,
            standort: discounterDaten.standort,
            produkte: produkte,
            payback: discounterDaten.payback,
            kaffeautomat: discounterDaten.kaffeautomat,
            pfandrueckgabe: discounterDaten.pfandrueckgabe
        };

        return einkaufsliste;
    }
}

// Filter-Funktionen für QUERIES

/*
 * filterBio kommt zum Einsatz, wenn im query allBio=true steht
 * Die Methode nimmt eine Einkaufsliste entgegen und schaut für jedes Produkt, ob das Attribut bio
 * für dieses auf true steht
 * Anschließend wird die gefilterte Einkaufsliste zurückgegeben
 */
const filterBio = function (einkaufsliste) {

    const einkaufslisteBeiDiscounter = einkaufsliste.einkaufslisteBeiDiscounter;

    for (let j = 0; j < einkaufslisteBeiDiscounter.length; j++) {

        var bioProdukte = new Array();
        var gesamtPreis = 0;
        const produkte = einkaufslisteBeiDiscounter[j].produkte;

        for (let i = 0; i < produkte.length; i++) {
            console.log(produkte[i]);
            if (produkte[i].bio) {
                bioProdukte.push(produkte[i]);
                gesamtPreis += produkte[i].preis;
            }
        }
        einkaufslisteBeiDiscounter[j].gesamtPreis = gesamtPreis.toFixed(2);
        einkaufslisteBeiDiscounter[j].anzahlNichtGefundenerProdukte = einkaufsliste.produkte.length - bioProdukte.length;
        einkaufslisteBeiDiscounter[j].produkte = bioProdukte;
    }
    return einkaufsliste;
}

// REQUESTS AN UNERE SERVER

/*
 * updateEinkaufsliste nimmt eine Einkaufsliste und eine Callback-Funktion entgegen
 * Zuerst werden Requests an die Server der Discounter geschickt und das Attribut einkaufsliste.einkaufslisteBeiDiscounter
 * für jeden angefragten Discounter entsprechend verändert
 * Der Callback wird nach einer Sekunde ausgeführt und diesem wird die veränderte Einkaufsliste wieder mitgegeben,so wird
 * sichergestellt, dass der jeweilige Header erst nach den Requests gesetzt wird
 */
const updateEinkaufsliste = function (einkaufsliste, body, callback) {

    // Enthält die Einkaufsliste des Kunden bei den jeweiligen Discountern
    einkaufsliste.einkaufslisteBeiDiscounter = [];

    requestDiscounter(aldiOptions, function (discounterDaten) {

        einkaufslisteBeiAldi = setUpEinkaufslisteByDiscounter("Aldi", discounterDaten, einkaufsliste.produkte, body);
        if (einkaufslisteBeiAldi != null) einkaufsliste.einkaufslisteBeiDiscounter.push(einkaufslisteBeiAldi);
        saveData();
    })

    requestDiscounter(lidlOptions, function (discounterDaten) {

        einkaufslisteBeiLidl = setUpEinkaufslisteByDiscounter("Lidl", discounterDaten, einkaufsliste.produkte, body);
        if (einkaufslisteBeiLidl != null) einkaufsliste.einkaufslisteBeiDiscounter.push(einkaufslisteBeiLidl);
        saveData();
    })

    // Eine Sekunde lang haben die Requests Zeit bearbeitet zu werden
    // Durch den Timer wird sichergestellt, dass fehlerhafte oder zu lange dauernde Requests das Ergebnis für den Nutzer
    // nicht hinauszögern
    setTimeout(function () {
        callback(einkaufsliste);
    }, 1000);
}

const requestDiscounter = function (options, callback) {

    var request = http.request(options, function (res2) {

        var body = "";

        res2.on("data", function (content) {
            body += content;
        });

        res2.on("end", function () {
            const data = JSON.parse(body).daten;
            callback(data);
        });

    });

    // Server konnte nicht erreicht werden
    request.on("error", function (err) {
        console.log("Server " + options.host + ":" + options.port + "" + options.path + " wurde nicht erreicht");
    });

    request.end();
}

module.exports = router;