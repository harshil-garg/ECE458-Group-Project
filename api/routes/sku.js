const express = require('express');
const router = express.Router();
const SKU = require('../model/sku_model');
const Ingredient = require('../model/ingredient_model');
const ProductLine = require('../model/product_line_model');
const ManufacturingGoal = require('../model/manufacturing_goal_model');
const Formula = require('../model/formula_model');
const ManufacturingLine = require('../model/manufacturing_line_model');
const FormulaRoute = require('../routes/formula');
const sku_filter = require('../controllers/sku_filter');
const autocomplete = require('../controllers/autocomplete');
const validator = require('../controllers/validator');
const generator = require('../controllers/autogen');


//Autocomplete ingredients
router.post('/autocomplete_ingredients', (req, res) => {
    const {input} = req.body;

    autocomplete.ingredients(Ingredient, input, res);
});

//Autocomplete product lines
router.post('/autocomplete_product_lines', (req, res) => {
    const {input} = req.body;

    autocomplete.productLines(ProductLine, input, res);
});


//Filter
router.post('/filter', async (req, res) => {
    const { sortBy, pageNum, keywords, ingredients, product_lines } = req.body;

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
    const { name, number, case_upc, unit_upc, size, count, product_line, formula, scale_factor, manufacturing_lines, manufacturing_rate, comment } = req.body;

    let product_passed = await validator.itemExists(ProductLine, product_line);
    let manufacturings_passed = []
    let manufacturing_ids = [];
    for(let line of manufacturing_lines){
        let manufacturing_passed = await validator.itemExists(ManufacturingLine, line);
        manufacturings_passed.push(manufacturing_passed);
        manufacturing_ids.push(manufacturing_passed[2]);
    }   
    let case_passed = validator.isUPCStandard(case_upc);
    let unit_passed = validator.isUPCStandard(unit_upc);
    let name_passed = validator.proper_name_length(name);
    let count_passed = validator.isPositive(count);
    let scale_passed = validator.isPositive(scale_factor);
    let rate_passed = validator.isPositive(manufacturing_rate);
    
    let errors = validator.compileErrors(product_passed, ...manufacturing_passed, case_passed, unit_passed, name_passed, count_passed, scale_passed, rate_passed);
    if(errors.length > 0){
        res.json({success: false, message: errors});
        return;
    }
    count = validator.roundCost(count);
    let product_line_id = product_passed[2];

    let formula_id = await formulaHandler(formula);
    if(!formula_id){
        return;
    }

    if(number){
        create_SKU(name, number, case_upc, unit_upc, size, count, product_line_id, formula_id, scale_factor, manufacturing_ids, manufacturing_rate, comment, res);
    }else{
        let gen_number = await generator.autogen(SKU);
        create_SKU(name, gen_number, case_upc, unit_upc, size, count, product_line_id, formula_id, scale_factor, manufacturing_ids, manufacturing_rate, comment, res);        
    }    
});

async function formulaHandler(formula){
    if(!formula.ingredient_tuples){    //if no tuples then this should be existing formula
        let formula_passed = await validator.itemExists(Formula, formula.name);
        if(!formula_passed[0]){
            res.json({success: false, message: formula_passed[1]});
            return;
        }
        return formula_passed[2];
    }else{  //create new formula
        if(formula.number){
            try{
                let new_formula = await FormulaRoute.createFormula(formula.name, formula.number, formula.ingredient_tuples, formula.comment);
                return new_formula._id;
            }catch(err){
                res.json({success: false, message: err});
                return;
            }           
        }else{
            let gen_number = await generator.autogen(Formula);
            try{
                let new_formula = await FormulaRoute.createFormula(formula.name, gen_number, formula.ingredient_tuples, formula.comment);
                return new_formula._id;
            }catch(err){
                res.json({success: false, message: err});
                return;
            }        
        }
    }
}

function create_SKU(name, number, case_upc, unit_upc, size, count, product_line, formula, scale_factor, manufacturing_lines, manufacturing_rate, comment, res){
    let sku = new SKU({name, number, case_upc, unit_upc, size, count, product_line, formula, scale_factor, manufacturing_lines, manufacturing_rate, comment});
    SKU.createSKU(sku, (err) => {
        if(err){
            res.json({success: false, message: `Failed to create SKU. Error: ${err}`});
        }else{
            res.json({success: true, message: "Created successfully"});
        }
    });
}

//Update
router.post('/update', async (req, res) => {
    const { name, number, newnumber, case_upc, unit_upc, size, count, product_line, formula, scale_factor, manufacturing_lines, manufacturing_rate, comment } = req.body;
    const required_params = { number };

    if(!validator.passed(required_params, res)){
        return;
    }

    var json = {};
    let propagate = false;
    if (name) {
        name_passed = validator.proper_name_length(name);
        if(!name_passed[0]){
            res.json({success: false, message: name_passed[1]});
            return;
        }
        propagate = true;
        json["name"] = name;
    }
    if (newnumber) {
        json["number"] = newnumber;
    }
    if (case_upc) {
        let case_passed = validator.isUPCStandard(case_upc);
        if(!case_passed[0]){
            res.json({success: false, message: case_passed[1]});
            return;
        }
        json["case_upc"] = case_upc;
    }
    if (unit_upc) {
        let unit_passed = validator.isUPCStandard(unit_upc);
        if(!unit_passed[0]){
            res.json({success: false, message: unit_passed[1]});
            return;
        }
        json["unit_upc"] = unit_upc;
    }
    if (size) {
        json["size"] = size;
    }
    if (count) {
        let count_passed = validator.isUPCStandard(count);
        if(!count_passed[0]){
            res.json({success: false, message: count_passed[1]});
            return;
        }
        json["count"] = count;
    }
    if (product_line) {
        let product_passed = await validator.itemExists(ProductLine, product_line);
        if(!product_passed[0]){
            res.json({success: false, message: product_passed[1]});
            return;
        }
        json["product_line"] = product_line;
    }
    if (formula) {
        let formula_id = await formulaHandler(formula);
        if(!formula_id){
            return;
        }

        json["formula"] = formula_id;
    }
    if (scale_factor) {
        let scale_passed = validator.isPositive(scale_factor);
        if(!scale_passed[0]){
            res.json({success: false, message: scale_passed[1]});
            return;
        }
        json["formula_scale_factor"] = scale_factor;
    }
    if (manufacturing_lines) {
        let manufacturings_passed = []
        let ids = []
        for(let line of manufacturing_lines){
            let manufacturing_passed = await validator.itemExists(ManufacturingLine, line);
            manufacturings_passed.push(manufacturing_passed);
            ids.push(manufacturing_passed[2]);
        }   
        let errors = validator.compileErrors(manufacturings_passed);

        if(errors.length > 0){
            res.json({success: false, message: errors[0]});
            return;
        }
        json["manufacturing_lines"] = ids;
    }
    if (manufacturing_rate) {
        let rate_passed = validator.isPositive(manufacturing_rate);
        if(!rate_passed[0]){
            res.json({success: false, message: rate_passed[1]});
            return;
        }
        json["manufacturing_rate"] = manufacturing_rate;
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

    if(!validator.passed(required_params, res)){
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