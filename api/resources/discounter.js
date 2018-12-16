const express = require('express');
const router = express.Router();
const fs = require('fs');

const app = require('../../app');

router.post("/", (req, res, next) => {
    const discounter = {
        name: req.body.name
    }
    res.status(200).json({
        message: "Neuer Discounter wurde hinzugefügt",
        createdDiscounter: discounter
    });
})

router.get("/:discounterID", (req, res, next) => {

    res.status(200).json({

    });
})

router.put("/:discounterID", (req, res, next) => {

    res.status(200).json({

    });
})

router.delete("/:discounterID", (req, res, next) => {

    res.status(200).json({

    });
})

module.exports = router;