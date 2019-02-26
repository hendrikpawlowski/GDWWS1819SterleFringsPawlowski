const express = require('express');
const router = express.Router();
const http = require('http');
const geolib = require('geolib');
const fs = require('fs');
const helpFunction = require('./helpFunction');

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

exports.updateEinkaufsliste = function (einkaufsliste, req, callback) {

    // Enthält die Einkaufsliste des Kunden bei den jeweiligen Discountern
    einkaufsliste.einkaufslisteBeiDiscounter = [];

    requestDiscounter(aldiOptions, function (discounterDaten) {

        einkaufslisteBeiAldi = setUpEinkaufslisteByDiscounter("Aldi", discounterDaten, einkaufsliste.produkte, req.body);
        if (einkaufslisteBeiAldi != null) einkaufsliste.einkaufslisteBeiDiscounter.push(einkaufslisteBeiAldi);
    })

    requestDiscounter(lidlOptions, function (discounterDaten) {

        einkaufslisteBeiLidl = setUpEinkaufslisteByDiscounter("Lidl", discounterDaten, einkaufsliste.produkte, req.body);
        if (einkaufslisteBeiLidl != null) einkaufsliste.einkaufslisteBeiDiscounter.push(einkaufslisteBeiLidl);
    })

    // Eine Sekunde lang haben die Requests Zeit bearbeitet zu werden
    // Durch den Timer wird sichergestellt, dass fehlerhafte oder zu lange dauernde Requests das Ergebnis für den Nutzer
    // nicht hinauszögern
    setTimeout(function () {

        // Wird als query allBio=true übergeben, wird die Einkaufsliste nach Bio-Produkten gefiltert
        if (req.query.allBio) einkaufsliste = helpFunction.filterBio(einkaufsliste)

        // Wird als query sort=location übergeben werden die Discounter nach der Entfernung sortiert
        // Standarmäßig wird nach dem Preis sortiert
        if (req.query.sort == "location") {
            helpFunction.sortByLocation(einkaufsliste);
        } else {
            helpFunction.sortByGesamtPreis(einkaufsliste);
        }

        callback(einkaufsliste);
    }, 1000);
}

/*
 * Diese Methode ist dazu da ein Objekt zu erzeugen, das die Einkaufsliste des Kunden in den jeweiligen Discountern 
 * umsetzt. Dieses Objekt wird später der Eigenschaft kunde.einkaufsliste.einkaufslisteBeiDiscounter hinzugefügt.
 * Es wird für jedes Produkt des Kunden geschaut, ob es dieses im Sortiment des Discounters gibt
 */
const setUpEinkaufslisteByDiscounter = function (discounterName, discounterDaten, kundeProdukte, body) {

    const distanz = geolib.getDistance(discounterDaten.standort, body.standort) / 1000;

    // Der Discounter muss sich in dem gewünschten Radius befinden, die im body übergeben wird
    if (distanz <= body.suchradius) {

        var gesamtPreis = 0;
        var produkte = new Array();
        const discounterProdukte = discounterDaten.sortiment;

        // Es wird jedes Produkt aus dem Sortiment des Discounters durchgegangen
        for (let i = 0; i < kundeProdukte.length; i++) {

            // Es wird jedes Produkt aus der Einkaufsliste des Kunden durchgegangen
            for (let j = 0; j < discounterProdukte.length; j++)

                // Wenn das ite Produkt aus dem Sortiment mit dem jten Produkt aus der Einkaufsliste des Kunden übereinstimmt
                // wird ein neues Produkt erstellt und dem Array produktListe hinzugefügt
                // In produktListe sind Informationen über die Produkte des Kunden bei dem jeweiligen Discounter drin
                if (kundeProdukte[i].toUpperCase() == discounterProdukte[j].name.toUpperCase()) {

                    const newProdukt = {
                        name: discounterProdukte[j].name,
                        marke: discounterProdukte[j].marke,
                        preis: discounterProdukte[j].preis,
                        gewicht: discounterProdukte[j].gramm,
                        bio: discounterProdukte[j].bio
                    }
                    produkte.push(newProdukt);
                    gesamtPreis += discounterProdukte[j].preis
                }
        }

        // Hier wird die Einkaufsliste bei dem jeweiligen Discounter erstellt
        // Sie enthält Informationen über den Discounter, inklusive eines Produkte-Arrays, welches mit dem
        // Produkte-Array des Kunden übereinstimmt
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