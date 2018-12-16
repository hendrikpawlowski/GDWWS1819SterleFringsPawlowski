const express = require('express');
const router = express.Router();
const fs = require('fs');




router.post("/", (req, res, next) => {
    const kunde = {
        kundeID : req.body.kundeID,
        name: req.body.name
    }
    res.status(201).json({
        "uri" : settungs.url + ":" + settings.port + "/kunde/" + 1234,
        
        message: "Neuer Kunde wurde hinzugefügt",
        createdKunde: kunde
    });
})

router.get("/", (req, res, next) => {

    res.status(200).json({
        //Liste von Kunden
    });
})


router.get("/:kundeID", (req, res, next) => {
    const id = req.params.kundeID;

    if(id == 123)
    res.status(200).send("GET Request on /kunde/123");
})

router.put("/:kundeID", (req, res, next) => {

    res.status(200).json({

    });
})

router.delete("/:kundeID", (req, res, next) => {

    res.status(200).json({

    });
})

module.exports = router;