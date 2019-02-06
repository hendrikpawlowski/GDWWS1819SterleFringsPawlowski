const express = require('express');
const router = express.Router();
const sortiment = require('../../sortimentDatenbank');


router.get("/information", (req,res) => {
    res.status(200).json({
        Standort: [51.021665, 7.5732967],
        Payback: false,
        Kaffeautomat: true,
        Pfandrueckgabe: ["PET"]
    })
});

router.get("/",(req,res) => {

    res.status(200).json({
        sortiment: sortiment
    });
});


router.get("/:artikelID",(req,res) => {

    const artikelID = req.params.artikelID;

    if(!findArtikelByID(artikelID)){
        res.status(404).json({
            message: "404 Not Found",
            problem: "Der Artikel mit der ID " + artikelID + " existiert nicht"
        })
    } else {
        res.status(200).json({
            artikel: findArtikelByID(artikelID)
        })
    }
});


const findArtikelByID = function (id) {

    for (let i = 0; i < sortiment.length; i++) {

        if (sortiment[i].id === id) {

            return sortiment[i];
        }
    }

    return false;
};

module.exports = router;