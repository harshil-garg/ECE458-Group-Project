const express = require('express');
const router = express.Router();
const Ingredient = require('../model/ingredient_model');
const SKU = require('../model/sku_model');
const ingredient_filter = require('../controllers/ingredient_filter');
const autocomplete = require('../controllers/autocomplete');
const input_validator = require('../controllers/input_validation');
const generator = require('../controllers/autogen');
const validator = require('../controllers/validator');

//Autocomplete
router.post('/autocomplete', (req, res) => {
    const {input} = req.body;

    autocomplete.skus(SKU, input, res);
});

//Filter ingredients
//request params: sortBy, direction, pageNum, keywords, skus
router.post('/filter', async (req, res) => {
    const { sortBy, pageNum, keywords, skus } = req.body;

    let key_exps = keywords.map((keyword) => {
        return new RegExp(keyword, 'i');
    });

    let result = await ingredient_filter.filter(pageNum, sortBy, key_exps, skus);
    
    res.json(result);
});

//CREATE
router.post('/create', async (req, res) => {
    //TODO: add unit
    const { name, number, vendor_info, package_size, unit, cost, comment } = req.body;

    let cost_passed = validator.isPositive(cost);
    if(!cost_passed[0]){
        res.json({success: false, message: cost_passed[1]});
        return;
    }

    let rounded_cost = validator.roundCost(cost);
    //Autogen number logic
    if (number) {
        create_ingredient(res, name, number, vendor_info, package_size, unit, rounded_cost, comment);
    } else {
        let gen_number = await generator.autogen(Ingredient);
        create_ingredient(res, name, gen_number, vendor_info, package_size, unit, rounded_cost, comment);
    }
});

function create_ingredient(res, name, number, vendor_info, package_size, unit, cost, comment) {
    let ingredient = new Ingredient({name, number, vendor_info, package_size, unit, cost, comment});
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
    const { name, newname, number, vendor_info, package_size, unit, cost, comment } = req.body;
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
    if (package_size) {
        json["unit"] = unit;
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
