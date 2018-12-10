const express = require('express');
const router = express.Router();
const fs = require('fs');

const app = require('../../app');
let kundelol = app.getKunde();






router.get("/", (req, res, next) => {

    res.status(200).json({
        id: kundelol.id,
        benutzername: kundelol.benutzername,
        passwort: kundelol.passwort
    });
})


router.get("/:kundeID", (req, res, next) => {
    const id = req.params.kundeID;

    if(id == 123)
    res.status(200).send("GET Request on /kunde/123");
})


module.exports = router;