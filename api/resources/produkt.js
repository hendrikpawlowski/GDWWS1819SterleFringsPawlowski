const express = require('express');
const router = express.Router();
const fs = require('fs');

const app = require('../../app');


router.get("/:produktID", (req, res, next) => {

    res.status(200).json({

    });
})

module.exports = router;