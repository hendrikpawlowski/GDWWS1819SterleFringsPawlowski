const express = require('express');
const router = express.Router();
const fs = require('fs');
const kundenListe = require('../../kundenDatenbank');

console.log(kundenListe);

console.log(kundenListe.length);

//const db_javaObject = JSON.parse(db_jsonText);

/*
fs.readFile('kundenDatenbank.json', (err, data) => {  
    if (err) throw err;
    let kunden = JSON.parse(data);
    console.log(kunden.name);
});

//console.log(test);
*/


router.post("/", (req, res, next) => {
    
    //const kundenListe = new Array();
    //kundenListe = JSON.parse('kundenDatenbank.json');

    const newID = generateNewID();

    const kunde = {
        id: newID,
        name: req.body.name
    }

    kundenListe.push(kunde);

    fs.writeFile('kundenDatenbank.json', JSON.stringify(kundenListe), function(error){
        if(error) throw error;
    });

    res.status(201).json({
        uri : "localhost:3001/kunde/" + 1234,
        createdKunde: kunde
    });
})



router.get("/", (req, res, next) => {

    res.status(200).json({
        message: "Ein GET Request auf alle Kunden"
    });
})




router.get("/:kundeID", (req, res, next) => {
    
    const id = req.params.kundeID;

    res.status(200).json({
        message: "Ein GET auf Kunde" + id
    })
})



router.put("/:kundeID", (req, res, next) => {

    res.status(200).json({
        message: "Ein PUT Request auf Kunde " + kundeID
    });
})



router.delete("/:kundeID", (req, res, next) => {

    res.status(200).json({

    });
})

/*
const generateNewID = function(){

    let i = 0;
    let j = 1;

    for(let i = 0; i < ){

    }

    const hi = 0;
}
*/

module.exports = router;