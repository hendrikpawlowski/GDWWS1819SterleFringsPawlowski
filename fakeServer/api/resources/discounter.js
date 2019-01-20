const express = require('express');
const router = express.Router();
const sortiment = require('../../sortiment');

/*
 * GET Verb auf das komplette Sortiment des Discounters
 * Das Sortiment wird zurückgegeben
 */
router.get("/",(req,res,next) => {

    res.status(200).json({
        Sortiment: sortiment
    });
});

/*
 * GET Verb auf ein spezielles Produkt
 * Das Produkt, mit dem die URI übereinstimmt wird zurückgegeben
 */
router.get("/:produktID",(req,res,next) => {

    const produktID = req.params.produktID;

    if(!findProduktByID(produktID)){
        res.status(404).json({
            message: "404 Not Found",
            problem: "Der Artikel mit der ID " + produktID + " existiert nicht"
        })
    } else {
        res.status(200).json({
            produkt: findProduktByID(produktID)
        })
    }
});


const findProduktByID = function (id) {

    for (let i = 0; i < sortiment.length; i++) {

        if (sortiment[i].id == id) {

            return sortiment[i];
        }
    }

    return false;
}

module.exports = router;