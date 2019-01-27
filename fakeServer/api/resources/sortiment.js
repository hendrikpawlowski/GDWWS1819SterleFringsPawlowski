const express = require('express');
const router = express.Router();
const sortimentDatenbank = require('../../sortimentDatenbank');


router.get("/",(req,res,next) => {

    res.status(200).json({
        Sortiment: sortimentDatenbank
    });
});


router.get("/:artikelID",(req,res,next) => {

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

    for (let i = 0; i < sortimentDatenbank.length; i++) {

        if (sortimentDatenbank[i].id == id) {

            return sortimentDatenbank[i];
        }
    }

    return false;
}

module.exports = router;