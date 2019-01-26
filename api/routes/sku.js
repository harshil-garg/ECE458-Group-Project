const express = require('express');
const router = express.Router();
const Ingredient = require('../model/ingredient_model');
const SKU = require('../model/sku_model');

//Filter
router.post('/filter', (req, res) => {

});

//Create
router.post('/create', (req, res) => {
    const { name, number, case_upc, unit_upc, size, count, product_line, ingredients, comment } = req.body;
    //check required fields
    if(!name || !number, !case_upc || !unit_upc || !size || !count || !product_line || !ingredients){
        res.json({success: false, message: 'Please fill in all fields'});
        return;
    }

    //TODO: check that inputs are valid (upca standard, numbers are numeric)

    //check ingredients and product lines exist

    let sku = new SKU({name, number, case_upc, unit_upc, size, count, product_line, ingredients, comment});
    SKU.createSKU(sku, (err) => {
        if(err){
            res.json({success: false, message: `Failed to create SKU. Error: ${err}`});
        }else{
            res.json({success: true, message: "Created successfully"});
        }
    });
});

//Update
router.post('/update', (req, res) => {
    const { name, number, newnumber, case_upc, unit_upc, size, count, product_line, ingredients, comment } = req.body;

    var json = {};

    if (name) {
        json["name"] = name;
    }
    if (newnumber) {
        json["number"] = newnumber;
    }
    if (case_upc) {
        json["case_upc"] = case_upc;
    }
    if (unit_upc) {
        json["unit_upc"] = unit_upc;
    }
    if (size) {
        json["size"] = size;
    }
    if (count) {
        json["count"] = count;
    }
    if (product_line) {
        json["product_line"] = product_line;
    }
    if (ingredients) {
        json["ingredients"] = ingredients;
    }
    if (comment) {
        json["comment"] = comment;
    }

    SKU.updateSKU(number, json, (err) => {
        if (err) {
            res.json({success: false, message: `Failed to update SKU. Error: ${err}`});
        } else {
            res.json({success: true, message: "Updated successfully."});
        }
    })
})

//Delete
router.post('/delete', (req, res) => {
    const number = req.body.number;

    SKU.deleteSKU(number, (err) => {
        if(err) {
            res.json({success: false, message: `Failed to delete SKU. Error: ${err}`});

        }else{
            res.json({success: true, message: "Deleted successfully."});
        }
    })
});
module.exports = router;