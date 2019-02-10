const express = require('express');
const router = express.Router();
const datenbank = require('../../datenbank');



router.get("/",(req,res) => {

    res.status(200).json({
        sortiment: datenbank.sortiment
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

    for (let i = 0; i < datenbank.sortiment.length; i++) {

        if (datenbank.sortiment[i].id == id) {

            return datenbank.sortiment[i];
        }
    }

    return false;
};

module.exports = router;