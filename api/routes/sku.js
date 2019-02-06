const express = require('express');
const router = express.Router();
const SKU = require('../model/sku_model');
const Ingredient = require('../model/ingredient_model');
const ProductLine = require('../model/product_line_model');
const ManufacturingGoal = require('../model/manufacturing_goal_model');
const sku_filter = require('../controllers/sku_filter');
const autocomplete = require('../controllers/autocomplete');
const validator = require('../controllers/sku_validation');
const input_validator = require('../controllers/input_validation');


//Autocomplete ingredients
router.post('/autocomplete_ingredients', (req, res) => {
    const {input} = req.body;
    const required_params = {input};
    
    if(!input_validator.passed(required_params, res)){
        return;
    }

    autocomplete.ingredients(Ingredient, input, res);
});

//Autocomplete product lines
router.post('/autocomplete_product_lines', (req, res) => {
    const {input} = req.body;
    const required_params = {input};
    
    if(!input_validator.passed(required_params, res)){
        return;
    }

    autocomplete.productLines(ProductLine, input, res);
});


//Filter
router.post('/filter', async (req, res) => {
    const { sortBy, pageNum, keywords, ingredients, product_lines } = req.body;
    const required_params = { sortBy, pageNum, keywords, ingredients, product_lines };

    if(!input_validator.passed(required_params, res)){
        return;
    }

    let key_exps = keywords.map((keyword) => {
        return new RegExp(keyword, 'i');
    });
    
    if(keywords.length == 0 && ingredients.length == 0 && product_lines.length == 0){
        let results = await sku_filter.none(pageNum, sortBy);
        res.json(results);
    }else if(ingredients.length == 0 && product_lines.length == 0){
        let results = await sku_filter.keywords(pageNum, sortBy, key_exps);
        res.json(results);
    }else if(keywords.length == 0 && product_lines.length == 0){
        let results = await sku_filter.ingredients(pageNum, sortBy, ingredients);
        res.json(results);
    }else if(keywords.length == 0 && ingredients.length == 0){
        let results = await sku_filter.productLines(pageNum, sortBy, product_lines);
        res.json(results);
    }else if(product_lines.length == 0){
        let results = await sku_filter.keywordsandIngredients(pageNum, sortBy, key_exps, ingredients);
        res.json(results);
    }else if(keywords.length == 0){
        let results = await sku_filter.ingredientsandLines(pageNum, sortBy, ingredients, product_lines);
        res.json(results);
    }else if(ingredients.length == 0){
        let results = await sku_filter.keywordsandLines(pageNum, sortBy, key_exps, product_lines);
        res.json(results);
    }else{
        let results = await sku_filter.allFilters(pageNum, sortBy, key_exps, ingredients, product_lines);
        res.json(results);
    }
});

//Create
router.post('/create', async (req, res) => {
    const { name, number, case_upc, unit_upc, size, count, product_line, ingredients, comment } = req.body;
    const required_params = { name, number, case_upc, unit_upc, size, count, product_line, ingredients };

    if(!input_validator.passed(required_params, res)){
        return;
    }

    let ingredient_passed = true;
    for(let ingredient of ingredients) {
        let ans = await validator.itemExists(Ingredient, ingredient.ingredient_name);
        ingredient['ingredient_number'] = ans.number
        ingredient_passed = ans.bool && ingredient_passed;
    }
    
    let product_passed = await validator.itemExists(ProductLine, product_line);
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
router.post('/update', async (req, res) => {
    const { name, number, newnumber, case_upc, unit_upc, size, count, product_line, ingredients, comment } = req.body;
    const required_params = { number };

    if(!input_validator.passed(required_params, res)){
        return;
    }

    var json = {};
    let propagate = false;
    if (name) {
        propagate = true;
        json["name"] = name;
    }
    if (newnumber) {
        json["number"] = newnumber;
    }
    if (case_upc) {
        let case_passed = validator.isUPCStandard(case_upc);
        if(!case_passed){
            res.json({success: false, message: 'Input invalid'});
            return;
        }
        json["case_upc"] = case_upc;
    }
    if (unit_upc) {
        let unit_passed = validator.isUPCStandard(unit_upc);
        if(!unit_passed){
            res.json({success: false, message: 'Input invalid'});
            return;
        }
        json["unit_upc"] = unit_upc;
    }
    if (size) {
        json["size"] = size;
    }
    if (count) {
        json["count"] = count;
    }
    if (product_line) {
        let product_passed = await validator.itemExists(ProductLine, product_line);
        if(!product_passed){
            res.json({success: false, message: 'Input invalid'});
            return;
        }
        json["product_line"] = product_line;
    }
    if (ingredients) {
        let ingredient_passed = true;
        for(let ingredient of ingredients) {
            let ans = await validator.itemExists(Ingredient, ingredient.ingredient_name);
            ingredient['ingredient_number'] = ans.number
            ingredient_passed = ans.bool && ingredient_passed;
        }
        if(!ingredient_passed){
            res.json({success: false, message: 'Input invalid'});
            return;
        }
        json["ingredients"] = ingredients;
    }
    if (comment) {
        json["comment"] = comment;
    }

    SKU.updateSKU(number, json, async (err) => {
        if (err) {
            res.json({success: false, message: `Failed to update SKU. Error: ${err}`});
        } else {
            if(propagate){
                await ManufacturingGoal.update({'skus.sku_number': number}, {'skus.$.sku_name' : name}, {multi: true}).exec();
            }
            
            res.json({success: true, message: "Updated successfully."});
        }
    })
})

//Delete
router.post('/delete', (req, res) => {
    const { number } = req.body;

    const required_params = { number};

    if(!input_validator.passed(required_params, res)){
        return;
    }

    SKU.deleteSKU(number, async (err, result) => {
        if(err) {
            res.json({success: false, message: `Failed to delete SKU. Error: ${err}`});

        }else if(result.deletedCount == 0){
            res.json({success: false, message: 'SKU does not exist to delete'});
        }else{
            await ManufacturingGoal.update({'skus.sku_number': name}, {$pull: {skus : {sku_number : number}}}, {multi: true}).exec();
            res.json({success: true, message: "Deleted successfully."});
        }
    })
});
module.exports = router;