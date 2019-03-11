const express = require('express');
const router = express.Router();
const Ingredient = require('../model/ingredient_model');
const SKU = require('../model/sku_model');
const Formula = require('../model/formula_model');
const ingredient_filter = require('../controllers/ingredient_filter');
const autocomplete = require('../controllers/autocomplete');
const generator = require('../controllers/autogen');
const validator = require('../controllers/validator');
const units = require('../controllers/units');

//Autocomplete
router.post('/autocomplete', async (req, res) => {
    const {input} = req.body;

    let results = await autocomplete.nameOrNumber(Ingredient, input);
    res.json({success: true, data: results});
});

//Filter ingredients
//request params: sortBy, direction, pageNum, keywords, skus
router.post('/filter', async (req, res) => {
    const { sortBy, pageNum, page_size, keywords, skus } = req.body;

    let key_exps = keywords.map((keyword) => {
        return new RegExp(keyword, 'i');
    });

    let result = await ingredient_filter.filter(pageNum, sortBy, page_size, key_exps, skus);
    
    res.json(result);
});

//CREATE
router.post('/create', async (req, res) => {
    const { name, number, vendor_info, package_size, unit, cost, comment } = req.body;
    let ingredient = {
        name: name,
        number: number,
        vendor_info: vendor_info,
        package_size: package_size,
        unit: unit,
        cost: cost,
        comment: comment
    }

    let error = await Ingredient.syntaxValidation(ingredient);
    if(error != null){
        console.log(error)
        res.json({success: false, message: error});
        return;
    }

    create_ingredient(res, name, sku.number, vendor_info, package_size, unit, sku.cost, comment);
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

// UPDATE
router.post('/update', async (req, res) => {
    const { name, newname, number, vendor_info, package_size, unit, cost, comment } = req.body;

    var json = {};

    if (newname) {
        json["name"] = newname;
    }
    if (number) {
        let num_numeric = validator.isNumeric(number);
        if(!num_numeric[0]){
            res.json({success: false, message: num_numeric[1]});
            return;
        }else{
            let num_positive = validator.isPositive(number, 'Number');
            if(!num_positive[0]){
                res.json({success: false, message: num_positive[1]});
                return;
            }
        }
        json["number"] = number;
    }
    if (vendor_info) {
        json["vendor_info"] = vendor_info;
    }
    if (package_size) {
        let size_numeric = validator.isNumeric(package_size);
        if(!size_numeric[0]){
            res.json({success: false, message: size_numeric[1]});
            return;
        }else{
            let size_positive = validator.isPositive(package_size, 'Package size');
            if(!size_positive[0]){
                res.json({success: false, message: size_positive[1]});
                return;
            }
        }
        json["package_size"] = package_size;
    }
    if (unit) {
        //check that new unit is of same type
        let unit_passed = units.validUnit(unit);
        if(!unit_passed){
            res.json({success: false, message: 'Invalid unit'});
            return;
        }
        let ingredient = await Ingredient.findOne({name: name}).exec();
        let old_category = units.category(ingredient.unit);
        let new_category = units.category(unit);
        if(old_category != new_category){
            res.json({success: false, message: 'Unit must be of same category as before'});
            return;
        }
        json["unit"] = unit;
    }
    if (cost) {
        let cost_numeric = validator.isNumeric(cost);
        if(!cost_numeric[0]){
            res.json({success: false, message: cost_numeric[1]});
            return;
        }else{
            let cost_positive = validator.isPositive(cost, 'Cost');
            if(!cost_positive[0]){
                res.json({success: false, message: cost_positive[1]});
                return;
            }
        }
        let rounded_cost = validator.roundCost(cost);
        json["cost"] = rounded_cost;
    }
    if (comment) {
        json["comment"] = comment;
    }

    Ingredient.updateIngredient(name, json, async (error) => {
        if (error) {
            res.json({success: false, message: `Failed to update ingredient. Error: ${error}`});
        } else {
            res.json({success: true, message: "Updated successfully."});
        }
    });
});

// DELETE
router.post('/delete', async (req, res) => {
    const {name} = req.body;
    let ingredient = await Ingredient.findOne({name: name}).exec();

    Ingredient.deleteIngredient(name, async (error, result) => {
        if (error) {
            res.json({success: false, message: `Failed to delete ingredient. Error: ${error}`});
        } else if(!result || result.deletedCount == 0){
            res.json({success: false, message: 'Ingredient does not exist to delete'});
        } else {
            
            await Formula.update({'ingredient_tuples.ingredient': ingredient._id}, {$pull: {ingredient_tuples: {ingredient: ingredient._id}}}, {multi: true}).exec();
            res.json({success: true, message: "Removed successfully."});
        }
    });
});

module.exports = router;
