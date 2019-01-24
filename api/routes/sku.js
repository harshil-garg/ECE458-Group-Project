const express = require('express');
const router = express.Router();
const Ingredient = require('../model/ingredient_model');
const SKU = require('../model/sku_model');

//Filter
router.post('/filter', (req, res) => {

});

//Add
router.post('/add', (req, res) => {
    const { name, number, case_upc, unit_upc, size, count, product_line, ingredients, comment } = req.body;

    //check required fields
    if(!name || !number, !case_upc || !unit_upc || !size || !count || !product_line || !ingredients){
        res.json({success: false, message: 'Please fill in all fields'});
        return;
    }

    //TODO: check that inputs are valid

    //check ingredients and product lines exist

    let sku = new SKU(name, number, case_upc, unit_upc, size, count, product_line, ingredients, comment);
    SKU.addSKU(sku, (err) => {
        if(err){
            res.json({success: false, message: `Failed to add SKU. Error: ${err}`});
        }else{
            res.json({success: true, message: "Added successfully"});
        }
    });
});

//Remove
router.post('/remove', (req, res) => {

});

module.exports = router;