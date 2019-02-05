const express = require('express');
const router = express.Router();
const SKU = require('../model/sku_model');
const Ingredient = require('../model/ingredient_model');
const ProductLine = require('../model/product_line_model');
const sku_filter = require('../controllers/sku_filter');
const autocomplete = require('../controllers/autocomplete');
const validator = require('../controllers/sku_validation');


//Autocomplete ingredients
router.post('/autocomplete_ingredients', (req, res) => {
    const input = req.body.input;

    autocomplete.ingredients(Ingredient, input, res);
});

//Autocomplete product lines
router.post('/autocomplete_product_lines', (req, res) => {
    const input = req.body.input;

    autocomplete.productLines(ProductLine, input, res);
});

//Filter
router.post('/filter', (req, res) => {
    const { sortBy, pageNum, keywords, ingredients, product_lines } = req.body;

    //check fields completed
    if(!sortBy || !pageNum || !keywords || !ingredients || !product_lines){
        res.json({success: false, message: "Please fill in all fields"});
        return;
    }

    let key_exps = keywords.map((keyword) => {
        return new RegExp(keyword, 'i');
    });
    
    if(keywords.length == 0 && ingredients.length == 0 && product_lines.length == 0){
        sku_filter.none(pageNum, sortBy, res);
    }else if(ingredients.length == 0 && product_lines.length == 0){
        sku_filter.keywords(pageNum, sortBy, key_exps, res);
    }else if(keywords.length == 0 && product_lines.length == 0){
        sku_filter.ingredients(pageNum, sortBy, ingredients, res);
    }else if(keywords.length == 0 && ingredients.length == 0){
        sku_filter.productLines(pageNum, sortBy, product_lines, res);
    }else if(product_lines.length == 0){
        sku_filter.keywordsandIngredients(pageNum, sortBy, key_exps, ingredients, res)
    }else if(keywords.length == 0){
        sku_filter.ingredientsandLines(pageNum, sortBy, ingredients, product_lines, res)
    }else if(ingredients.length == 0){
        sku_filter.keywordsandLines(pageNum, sortBy, key_exps, product_lines, res)
    }else{
        sku_filter.allFilters(pageNum, sortBy, key_exps, ingredients, product_lines, res)
    }
});

//Create
router.post('/create', (req, res) => {
    const { name, number, case_upc, unit_upc, size, count, product_line, ingredients, comment } = req.body;
    //check required fields
    if(!name || !number, !case_upc || !unit_upc || !size || !count || !product_line || !ingredients){
        res.json({success: false, message: 'Please fill in all fields'});
        return;
    }
    let ingredient_passed = true;
    for(let ingredient of ingredients) {
        let bool = validator.itemExists(Ingredient, ingredient.ingredient_name);
        ingredient_passed = bool && ingredient_passed;
    }
    console.log(ingredient_passed)
    
    let product_passed = validator.itemExists(ProductLine, product_line);
    let case_passed = validator.isUPCStandard(case_upc);
    let unit_passed = validator.isUPCStandard(unit_upc);
    
    if(!ingredient_passed || !product_passed || !case_passed || !unit_passed){
        res.json({success: false, message: 'Input invalid'});
        return;
    }


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