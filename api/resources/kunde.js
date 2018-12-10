const express = require("express")
const router = express.Router()
const fs = require("fs")

router.get("/", (req, res, next) => {
    res.status(200).send("get bitches")
})

router.get("/:kundeID", (req, res, next) => {
    const id = req.params.kundeID

    if(id == 123)
    res.status(200).send("verpiss dich")
})

module.exports = router;