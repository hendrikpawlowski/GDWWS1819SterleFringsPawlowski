const express = require('express');
const router = express.Router();
const fs = require('fs');
const http = require('http');

const options = {
    host: "localhost",
    port: 3069,
    path: "/discounter",
    method: "GET"
};


// Die lokale Kundendatenbank wird in einem Array in der Variable kundenListe gespeichert
const kundenListe = require('../../kundenDatenbank');

const ourUri = "localhost:3000";


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

    res.json({
        neueKundenListe: kundenListe
    });
    res.status(204);
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


var preis = 0;
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
    const newId = generateNewID(currentKunde.einkaufslisten);

    // const newEinkaufsliste = {
    //     uri: ourUri + req.originalUrl + "/" + newId,
    //     id: newId,
    //     produkte: req.body.produkte
    // }



    // const discounterInformations = getDiscounterInformations(req, () => {

    // newEinkaufsliste.discounterInformations = discounterInformations;

    // currentKunde.einkaufslisten.push(newEinkaufsliste);
    //  saveData();

    http.request(options, function (res2) {
        var body = "";

        res2.on("data", function (content) {
            body += content;
        });
        res2.on("end", function () {
            
            const sortiment = JSON.parse(body);
            console.log(sortiment);
            produkteArray = findProdukteByName(sortiment['Sortiment'], req.body.produkte);

            const newEinkaufsliste = {
                uri: ourUri + req.originalUrl + "/" + newId,
                id: newId,
                produkte: req.body.produkte
            }

            newEinkaufsliste.einkaufslisteBeiDiscounterLol = produkteArray;

            currentKunde.einkaufslisten.push(newEinkaufsliste);
            saveData();

            res.status(201).json({
                kunde: currentKunde
            })
        })
    }).end();
})

// const getDiscounterInformations = function (req, callback) {

//     http.request(options, function (res2) {
//         var body = "";

//         res2.on("data", function (content) {
//             body += content;
//         });

//         res2.on("end", function () {
//             const sortiment = JSON.parse(body);
//             produkteArray = findProdukteByName(sortiment['sortiment'], req.body.produkte);

//             // return produkteArray;
//             callback();
//             // const newEinkaufsliste = {
//             //     uri: ourUri + req.originalUrl + "/" + newId,
//             //     id: newId,
//             //     produkte: req.body.produkte
//             // }

//             // newEinkaufsliste.einkaufslisteBeiDiscounterLol = produkteArray;

//             // currentKunde.einkaufslisten.push(newEinkaufsliste);
//             // saveData();

//             // res.status(201).json({
//             // kunde: currentKunde
//             // })
//         })
//     }).end();
// }



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

            res.json({
                Kunde: findKundeByID(kundeID)
            })
            res.status(204);
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

            res.json({
                Kunde: findKundeByID(kundeID)
            })
            res.status(204);
<<<<<<< HEAD
=======
    
<<<<<<< HEAD
=======
>>>>>>> 5fabdb069d8040b9d742ae7712928bcbeb545471
>>>>>>> e8b7af2b1a6bf0c5a26b5a6d2d54d0910e6914bb
>>>>>>> 83fad1425e6707121bba2f9b32345f7d399676bb
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

    res.status(200).json({
        changedEinkaufsliste: findEinkaufslisteByID(kundeID, einkaufslisteID)
    })
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


//findet Kunden in der kundenListe, anhand der angegebenen ID
const findKundeByID = function (id) {

    for (let i = 0; i < kundenListe.length; i++) {

        if (kundenListe[i].id == id) {

            return kundenListe[i];
        }
    }

    return false;
}


//finden Einkaufsliste in der kundenListe, anhand der angegebenen kundenID und der angegebenen einkaufslistenID
const findEinkaufslisteByID = function (kundeID, einkaufslisteID) {

    const currentKunde = findKundeByID(kundeID);

    for (let i = 0; i < currentKunde.einkaufslisten.length; i++) {

        if (currentKunde.einkaufslisten[i].id == einkaufslisteID) {

            return currentKunde.einkaufslisten[i];
        }
    }

    return false;
}

//findet Produkt in einem Array, anhand des angegebenen Namens
const findProdukteByName = function (discounterProdukte, kundeProdukte) {

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

    var einkaufslisteBeiDiscounterLol = {
        gesamtPreis: gesamtPreis.toFixed(2),
        produktListe: produktListe
    };
    return einkaufslisteBeiDiscounterLol;
}

/* GET Zugriff auf Server (Server wird anhand der options bestimmt)
   Preis wird der Response, anhand des angegebenen Produktnamens entnommen
 */
function getEinkaufslistePreis(options, produktName) {
    http.request(options, function (res) {
        var body = "";

        res.on("data", function (content) {
            body += content;
        });

        res.on("end", function () {
            const sortiment = JSON.parse(body);
            preis = findProduktByName(sortiment['sortiment'], produktName).preis;
        })
    }).end();
}

module.exports = router;