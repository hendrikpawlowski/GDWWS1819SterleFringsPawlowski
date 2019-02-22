const express = require('express');
const router = express.Router();
const geolib = require('geolib');

/*
 * Mit generateNewID soll jedem Element in einem Array automatisch eine ID zugeteilt werden
 * Falls im Laufe der Zeit IDs wieder frei werden, sollen jene mithilfe dieser Funktion
 * ausfindig gemacht werden
 */
exports.generateNewID = function (array) {

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

exports.sortByLocation = function (einkaufsliste) {

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

exports.sortByGesamtPreis = function (currentEinkaufsliste) {

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
exports.findKundeByID = function (kundenListe, id) {

    for (let i = 0; i < kundenListe.length; i++) {

        if (kundenListe[i].id == id) {

            return kundenListe[i];
        }
    }

    return false;
}

const findKundeByID = function (kundenListe, id) {

    for (let i = 0; i < kundenListe.length; i++) {

        if (kundenListe[i].id == id) {

            return kundenListe[i];
        }
    }

    return false;
}

// Findet Einkaufsliste in der kundenListe, anhand der angegebenen kundenID und der angegebenen einkaufslistenID
exports.findEinkaufslisteByID = function (kundenListe, kundeID, einkaufslisteID) {

    const currentKunde = findKundeByID(kundenListe, kundeID);

    for (let i = 0; i < currentKunde.einkaufslisten.length; i++) {

        if (currentKunde.einkaufslisten[i].id == einkaufslisteID) {

            return currentKunde.einkaufslisten[i];
        }
    }

    return false;
}

exports.setUpEinkaufslisteByDiscounter = function (discounterName, discounterDaten, kundeProdukte, body) {

    const distanz = geolib.getDistance(discounterDaten.standort, body.standort) / 1000;

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
exports.filterBio = function (einkaufsliste) {

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

/*
 * sortKundenListe ist dazu da die komplette KundenListe nach IDs zu sortieren
 */
exports.sortKundenListe = function (kundenListe) {

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