const express = require('express');
const router = express.Router();
const aldiSortimentDatenbank = require('../../aldiSortimentDatenbank');


router.get("/",(req,res) => {

    res.status(200).json({
        AldiSortiment: aldiSortimentDatenbank
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

    for (let i = 0; i < aldiSortimentDatenbank.length; i++) {

        if (aldiSortimentDatenbank[i].id === id) {

            return aldiSortimentDatenbank[i];
        }
    }

    return false;
};

module.exports = router;