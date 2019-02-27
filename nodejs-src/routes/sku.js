const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
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
const sku_validator = require('../controllers/sku_validator');
const generator = require('../controllers/autogen');



//Autocomplete ingredients
router.post('/autocomplete_ingredients', async (req, res) => {
    const {input} = req.body;

    let results = await autocomplete.nameOrNumber(Ingredient, input);
    res.json({success: true, data: results});
});

//Autocomplete product lines
router.post('/autocomplete_product_lines', async (req, res) => {
    const {input} = req.body;

    let results = await autocomplete.nameOrNumber(ProductLine, input);
    res.json({success: true, data: results});
});

//Autocomplete formulas
router.post('/autocomplete_formulas', async (req, res) => {
    const {input} = req.body;

    let results = await autocomplete.nameOrNumber(Formula, input);
    res.json({success: true, data: results});
});

//populate bulk edit
router.post('/populate_lines', async (req, res) => {
    const {skus} = req.body;

    let cursor = SKU.aggregate([{$match: {number: {$in: skus}}}])
        .lookup({
            from: 'manufacturinglines',
            localField: 'manufacturing_lines',
            foreignField: '_id',
            as: 'manufacturing_lines'
        }).cursor({}).exec();

    let all = new Set();
    let some = new Set();
    let none = [];

    let i = 0;
    await cursor.eachAsync((res) => {
        let lineSet = new Set();
        
        for(let line of res.manufacturing_lines){
            some.add(line.shortname);
            lineSet.add(line.shortname);   
        }
        if(i == 0){
            //first time add all lines to the set
            all = lineSet;
        }else{
            //otherwise take the intersection
            all = new Set([...all].filter(x => lineSet.has(x)));
        }
        i++;
    });
    all = Array.from(all);
    some = Array.from(some)

    let lines = await ManufacturingLine.find({shortname: {$nin: some}}).exec();
    for(let line of lines){
        none.push(line.shortname)
    }

    let results = {
        all: all,
        some: some,
        none: none
    }
    res.json({success: true, data: results});
});

//bulk edit
router.post('/bulk_edit', async (req, res) => {
    const {manufacturing_lines, skus, add} = req.body;

    let manufacturings_passed = []
    let manufacturing_ids = [];
    for(let line of manufacturing_lines){
        let manufacturing_passed = await validator.itemExists(ManufacturingLine, line);
        manufacturings_passed.push(manufacturing_passed);
        manufacturing_ids.push(manufacturing_passed[2]);
    }   
    let errors = validator.compileErrors(...manufacturings_passed);
    if(errors.length > 0){
        res.json({success: false, message: errors});
        return;
    }

    if(add){
        //add lines
        SKU.updateMany({number: {$in: skus}}, {$push: {manufacturing_lines: {$each: manufacturing_ids}}}, (err) => {
            if(err){
                res.json({success: false, message: 'Bulk edit failed: ' + err});
            }else{
                res.json({success: true, message: 'Bulk edit successful'});
            }
        })
    }else{
        //delete lines
        SKU.updateMany({number: {$in: skus}}, {$pull: {manufacturing_lines: {$in: manufacturing_ids}}}, (err) => {
            if(err){
                res.json({success: false, message: 'Bulk edit failed: '+err});
            }else{
                res.json({success: true, message: 'Bulk edit successful'});
            }
        })
    }  
});


//Filter
router.post('/filter', async (req, res) => {
    const { sortBy, pageNum, page_size, keywords, ingredients, product_lines } = req.body;

    let key_exps;
    key_exps = keywords.map((keyword) => {
        return new RegExp(keyword, 'i');
    });
    

    let result = await sku_filter.filter(pageNum, sortBy, page_size, key_exps, ingredients, product_lines);
    
    res.json(result);
});


//Create
router.post('/create', async (req, res) => {
    const { name, number, case_upc, unit_upc, size, count, product_line, formula, formula_scale_factor, manufacturing_lines, manufacturing_rate, comment } = req.body;

    let product_passed = await validator.itemExists(ProductLine, product_line);
    let manufacturings_passed = []
    let manufacturing_ids = [];
    for(let line of manufacturing_lines){
        let manufacturing_passed = await validator.itemExists(ManufacturingLine, line);
        manufacturings_passed.push(manufacturing_passed);
        manufacturing_ids.push(manufacturing_passed[2]);
    }   
    let case_passed = sku_validator.isUPCStandard(case_upc);
    let unit_passed = sku_validator.isUPCStandard(unit_upc);
    let name_passed = validator.proper_name_length(name);
    let count_passed = validator.isPositive(count, 'Count');
    let scale_passed = validator.isPositive(formula_scale_factor, 'Scale factor');
    let rate_passed = validator.isPositive(manufacturing_rate, 'Manufacturing Rate');
    
    let errors = validator.compileErrors(product_passed, ...manufacturings_passed, case_passed, unit_passed, name_passed, count_passed, scale_passed, rate_passed);
    if(errors.length > 0){
        res.json({success: false, message: errors});
        return;
    }
    let int_count = validator.forceInteger(count);
    let product_line_id = product_passed[2];

    let formula_id = await formulaHandler(formula, res);
    if(!formula_id){
        return;
    }
    if(number){
        create_SKU(name, number, case_upc, unit_upc, size, int_count, product_line_id, formula_id, formula_scale_factor, manufacturing_ids, manufacturing_rate, comment, res);
    }else{
        let gen_number = await generator.autogen(SKU);
        create_SKU(name, gen_number, case_upc, unit_upc, size, int_count, product_line_id, formula_id, formula_scale_factor, manufacturing_ids, manufacturing_rate, comment, res);        
    }    
});

async function formulaHandler(formula, res){
    if(!formula.ingredient_tuples){    //if no tuples then this should be existing formula
        let formula_passed = await validator.itemExists(Formula, formula.number.toString());
        if(!formula_passed[0]){
            res.json({success: false, message: formula_passed[1]});
            return;
        }
        return formula_passed[2];
    }else{  //create new formula
        if(formula.number){
            try{
                let new_formula = await FormulaRoute.createFormula(formula.name, formula.number, formula.ingredient_tuples, formula.comment, res);                
                if(!new_formula){
                    return;
                }
                return new_formula._id;
            }catch(err){
                res.json({success: false, message: err});
                return;
            }           
        }else{
            let gen_number = await generator.autogen(Formula);
            try{
                let new_formula = await FormulaRoute.createFormula(formula.name, gen_number, formula.ingredient_tuples, formula.comment, res);
                if(!new_formula){
                    return;
                }
                return new_formula._id;
            }catch(err){
                res.json({success: false, message: err});
                return;
            }        
        }
    }
}

function create_SKU(name, number, case_upc, unit_upc, size, count, product_line, formula, formula_scale_factor, manufacturing_lines, manufacturing_rate, comment, res){
    let sku = new SKU({name, number, case_upc, unit_upc, size, count, product_line, formula, formula_scale_factor, manufacturing_lines, manufacturing_rate, comment});
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
    const { name, number, newnumber, case_upc, unit_upc, size, count, product_line, formula, formula_scale_factor, manufacturing_lines, manufacturing_rate, comment } = req.body;

    var json = {};
    if (name) {
        name_passed = validator.proper_name_length(name);
        if(!name_passed[0]){
            res.json({success: false, message: name_passed[1]});
            return;
        }
        json["name"] = name;
    }
    if (newnumber) {
        json["number"] = newnumber;
    }
    if (case_upc) {
        let case_passed = sku_validator.isUPCStandard(case_upc);
        if(!case_passed[0]){
            res.json({success: false, message: case_passed[1]});
            return;
        }
        json["case_upc"] = case_upc;
    }
    if (unit_upc) {
        let unit_passed = sku_validator.isUPCStandard(unit_upc);
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
        let count_passed = validator.isPositive(count);
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
        let formula_id = await formulaHandler(formula, res);
        if(!formula_id){
            return;
        }

        json["formula"] = formula_id;
    }
    if (formula_scale_factor) {
        let scale_passed = validator.isPositive(formula_scale_factor);
        if(!scale_passed[0]){
            res.json({success: false, message: scale_passed[1]});
            return;
        }
        json["formula_scale_factor"] = formula_scale_factor;
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

    SKU.updateSKU(number, json, (err) => {
        if (err) {
            res.json({success: false, message: `Failed to update SKU. Error: ${err}`});
        } else if(manufacturing_rate){
            //TODO: propagate
        }else {
            res.json({success: true, message: "Updated successfully."});
        }
    })
})

//Delete
router.post('/delete', (req, res) => {
    const { number } = req.body;

    SKU.deleteSKU(number, async (err, result) => {
        if(err) {
            res.json({success: false, message: `Failed to delete SKU. Error: ${err}`});

        }else if(result.deletedCount == 0){
            res.json({success: false, message: 'SKU does not exist to delete'});
        }else{
            let sku = await SKU.findOne({number: number}).exec();
            await ManufacturingGoal.updateMany({'sku_tuples.sku': sku._id}, {$pull: {sku_tuples: {sku: sku._id}}}).exec();
            res.json({success: true, message: "Deleted successfully."});
        }
    });
});
module.exports = router;