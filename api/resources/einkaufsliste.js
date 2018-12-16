const express = require('express');
const router = express.Router();
const fs = require('fs');

const app = require('../../app');

router.post("/", (req, res, next) => {
    const einkaufsliste = {
        name: req.body.name
        //produkte?
    }
    res.status(201).json({
        message: "Neue EInkaufsliste wurde erstellt",
        createdEinkaufsliste: einkaufsliste
    });
})

router.get("/:einkaufslisteID", (req, res, next) => {

    res.status(200).json({

    });
})

router.put("/:einkaufslisteID", (req, res, next) => {

    res.status(200).json({

    });
})

router.delete("/:einkaufslisteID", (req, res, next) => {

    res.status(200).json({

    });
})

module.exports = router;