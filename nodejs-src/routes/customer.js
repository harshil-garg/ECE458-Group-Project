// Core dependencies
const express = require('express');
const router = express.Router();

// Request libraries
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

// Schemas and models
const Customer = require('../model/customer_model');

// Controllers
const autocomplete = require('../controllers/autocomplete');

//Autocomplete
router.post('/autocomplete', async (req, res) => {
    const {input} = req.body;

    let results = await autocomplete.nameOrNumber(Customer, input);
    res.json({success: true, data: results});
});

router.post('/all', async (req, res) => {
    let results = await Customer.find({}).exec();
    res.json({success: true, data: results});
});

//process customer page and save to db
async function process(response){
    let lines = response.match(/[^\r\n]+/g);

    let customers = [];
    for(let line of lines){
        if (line.startsWith("<tr>")) {
            let row = line.split("<td>");
            let customer = new Customer({
                number: row[1],
                name: row[2]
            })

            customers.push(customer);
        }
    }

    await Customer.insertMany(customers).catch((err) => {
        console.log(`IGNORE Duplicate customer: ${err}`);
    })
}

//Scrape customers from Bletch
let url = `http://hypomeals-sales.colab.duke.edu:8080/customers`;
let xmlHttp = new XMLHttpRequest();
xmlHttp.open("GET", url, true);
xmlHttp.onreadystatechange = function() { 
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        process(xmlHttp.responseText);
    }
}

xmlHttp.send();


module.exports = router;