const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const SKU = require('../model/sku_model');
const Ingredient = require('../model/ingredient_model');
const ProductLine = require('../model/product_line_model');
const ManufacturingGoal = require('../model/manufacturing_goal_model');
const Formula = require('../model/formula_model');
const ManufacturingLine = require('../model/manufacturing_line_model');
const ManufacturingSchedule = require('../model/manufacturing_schedule_model');
const FormulaRoute = require('../routes/formula');
const sku_filter = require('../controllers/sku_filter');
const autocomplete = require('../controllers/autocomplete');
const validator = require('../controllers/validator');
const sku_validator = require('../controllers/sku_validator');
const generator = require('../controllers/autogen');

//Autocomplete
router.post('/autocomplete', async (req, res) => {
    const {input} = req.body;

    let results = await autocomplete.nameOrNumber(SKU, input);
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

    some = new Set(some)
    for(let line of all){
        some.delete(line);
    }
    some = Array.from(some);

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

    let sku = {
        name: name,
        number: number,
        case_upc: case_upc,
        unit_upc: unit_upc,
        size: size,
        count: count,
        product_line: product_line,
        formula: formula.number,
        formula_scale_factor: formula_scale_factor,
        manufacturing_lines: manufacturing_lines,
        manufacturing_rate: manufacturing_rate,
        comment: comment
    }

    let error = await SKU.syntaxValidation(sku);
    if(error != null){
        console.log(error)
        res.json({success: false, message: error});
        return;
    }
    
    let int_count = validator.forceInteger(count);

    let formula_id = await formulaHandler(formula, res);
    if(!formula_id){
        res.json({success: false, message: 'Formula creation unsuccessful'});
        return;
    }

    create_SKU(name, sku.number, case_upc, unit_upc, size, int_count, sku.product_line, formula_id, formula_scale_factor, sku.manufacturing_lines, manufacturing_rate, comment, res);
});

async function formulaHandler(formula, res){
    let formula_exists = await Formula.findOne({name: formula.name});
    if(formula_exists != null){    //existing formula
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
            console.log(err)
            res.json({success: false, message: `Failed to create SKU. Error: ${err}`});
            return;
        }else{
            res.json({success: true, message: "Created successfully"});
            return;
        }
    });
}

//Update
router.post('/update', async (req, res) => {
    const { name, number, newnumber, case_upc, unit_upc, size, count, product_line, formula, formula_scale_factor, manufacturing_lines, manufacturing_rate, comment } = req.body;

    let sku = await SKU.findOne({number: number}).exec();
    if(sku == null){
        res.json({success: false, message: 'SKU does not exist to update'});
        return;
    }
    let deleted_lines = []

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
        json["product_line"] = product_passed[2];
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
        //check for deleted lines
        for(let old_line of sku.manufacturing_lines){
            let deleted = true;
            for(let new_line of ids){
                //check if old line is in any of the new lines
                deleted = deleted && !oldline.equals(new_line); 
            }
            if(deleted){
                deleted_lines.push(old_line)
            }
        }

        json["manufacturing_lines"] = ids;
    }
    if (manufacturing_rate) {       
        let map = await ManufacturingSchedule.findOne({'activity.sku': sku._id}).exec();
        if(map != null && manufacturing_rate != sku.manufacturing_rate){
            res.json({success: false, message: 'Cannot edit rate of a SKU that has been mapped to the Manufacturing Schedule'});
            return;
        }

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

    SKU.updateSKU(number, json, async(err) => {
        if (err) {
            res.json({success: false, message: `Failed to update SKU. Error: ${err}`});
        }else {
            //delete any mappings if the line has been removed from the sku
            await ManufacturingSchedule.deleteMany({'activity.sku': sku._id, 'manufacturing_line': {$in: deleted_lines}}).exec()
            res.json({success: true, message: "Updated successfully."});
        }
    })
})

//Delete
router.post('/delete', async (req, res) => {
    const { number } = req.body;
    let sku = await SKU.findOne({number: number}).exec();

    SKU.deleteSKU(number, async (err, result) => {
        if(err) {
            res.json({success: false, message: `Failed to delete SKU. Error: ${err}`});

        }else if(!result || result.deletedCount == 0){
            res.json({success: false, message: 'SKU does not exist to delete'});
        }else{
            //delete mappings with this sku as well
            await ManufacturingSchedule.deleteMany({'activity.sku': sku._id}).exec();
            
            //remove the sku from goals containing it
            await ManufacturingGoal.updateMany({'sku_tuples.sku': sku._id}, {$pull: {sku_tuples: {sku: sku._id}}}).exec();
            res.json({success: true, message: "Deleted successfully."});
        }
    });
});
module.exports = router;