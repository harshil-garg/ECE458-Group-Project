const express = require('express');
const router = express.Router();
const Ingredient = require('../model/ingredient_model');
const SKU = require('../model/sku_model');
const ingredient_filter = require('../controllers/ingredient_filter');
const autocomplete = require('../controllers/autocomplete');
const input_validator = require('../controllers/input_validation');
const generator = require('../controllers/autogen');
const validator = require('../controllers/ingredient_validation');

//Autocomplete
router.post('/autocomplete', (req, res) => {
    const {input} = req.body;
    const required_params = { input };

    if(!input_validator.passed(required_params, res)){
        return;
    }
    autocomplete.skus(SKU, input, res);
});

//Filter ingredients
//request params: sortBy, direction, pageNum, keywords, skus
router.post('/filter', async (req, res) => {
    const { sortBy, pageNum, keywords, skus } = req.body;
    const required_params = { sortBy, pageNum, keywords, skus };

    if(!input_validator.passed(required_params, res)){
        return;
    }

    let key_exps = keywords.map((keyword) => {
        return new RegExp(keyword, 'i');
    });

    //No filter, return all
    if(keywords.length == 0 && skus.length == 0){
        let results = await ingredient_filter.none(pageNum, sortBy);
        res.json(results);
    }
    //Keywords no SKUs
    else if(skus.length == 0){
        let results = await ingredient_filter.keywords(pageNum, sortBy, key_exps);
        res.json(results);
    }
    //SKUs no keywords
    else if(keywords.length == 0){
        //get all ingredients with given SKUs
        let skuList = await SKU.find({name: {$in: skus}}, 'ingredients.ingredient_name').exec();

        let results = await ingredient_filter.skus(pageNum, sortBy, skuList);
        res.json(results);
    }
    //Keywords and SKUs
    else{
        let skuList = await SKU.find({name: {$in: skus}}, 'ingredients.ingredient_name').exec();
        
        let results = await ingredient_filter.keywordsAndSkus(pageNum, sortBy, key_exps, skuList);
        res.json(results);
    }
});

//CREATE
router.post('/create', async (req, res) => {
    //TODO: add unit
    const { name, number, vendor_info, package_size, cost, comment } = req.body;
    const required_params = { name, package_size, cost };

    if(!input_validator.passed(required_params, res)){
        return;
    }
    if(!validator.valid_cost(cost)){
        res.json({success: false, message: 'Input invalid'});
        return;
    }

    let rounded_cost = validator.round_cost(cost);
    //Autogen number logic
    if (number) {
        create_ingredient(res, name, number, vendor_info, package_size, rounded_cost, comment);
    } else {
        let gen_number = await generator.autogen(Ingredient);
        create_ingredient(res, name, gen_number, vendor_info, package_size, rounded_cost, comment);
    }
});

function create_ingredient(res, name, number, vendor_info, package_size, cost, comment) {
    let ingredient = new Ingredient({name, number, vendor_info, package_size, cost, comment});
    Ingredient.createIngredient(ingredient, (error) => {
        if (error) {
            res.json({success: false, message: `Failed to create a new ingredient. Error: ${error}`});
        } else{
            res.json({success: true, message: "Added successfully."});
        }
    });
}

// TODO: READ (SEARCH)

// UPDATE
router.post('/update', (req, res) => {
    const { name, newname, number, vendor_info, package_size, cost, comment } = req.body;
    const required_params = { name };

    if(!input_validator.passed(required_params, res)){
        return;
    }

    var json = {};

    let propagate = false;
    if (newname) {
        propagate = true;
        json["name"] = newname;
    }
    if (number) {
        json["number"] = number;
    }
    if (vendor_info) {
        json["vendor_info"] = vendor_info;
    }
    if (package_size) {
        json["package_size"] = package_size;
    }
    if (cost) {
        if(!validator.valid_cost(cost)){
            res.json({success: false, message: 'Input invalid'});
            return;
        }
        let rounded_cost = validator.round_cost(cost);
        json["cost"] = rounded_cost;
    }
    if (comment) {
        json["comment"] = comment;
    }

    Ingredient.updateIngredient(name, json, async (error) => {
        if (error) {
            res.json({success: false, message: `Failed to update ingredient. Error: ${error}`});
        } else {
            if(propagate){
                await SKU.update({'ingredients.ingredient_name': name}, {'ingredients.$.ingredient_name' : newname}, {multi: true}).exec();               
            }
            res.json({success: true, message: "Updated successfully."});
        }
    });
});

// DELETE
router.post('/delete', (req, res) => {
    const {name} = req.body;
    const required_params = { name };

    if(!input_validator.passed(required_params, res)){
        return;
    }

    Ingredient.deleteIngredient(name, async (error, result) => {
        if (error) {
            res.json({success: false, message: `Failed to delete ingredient. Error: ${error}`});
        } else if(result.deletedCount == 0){
            res.json({success: false, message: 'Ingredient does not exist to delete'});
        } else {
            await SKU.update({'ingredients.ingredient_name': name}, {$pull: {ingredients : {ingredient_name : name}}}, {multi: true}).exec();
            res.json({success: true, message: "Removed successfully."});
        }
    });
});

module.exports = router;
