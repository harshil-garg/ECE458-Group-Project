//Require mongoose package
const mongoose = require('mongoose');
const validator = require('../controllers/validator');
const sku_validator = require('../controllers/sku_validator');
const Formula = require('../model/formula_model');
const ProductLine = require('../model/product_line_model');
const ManufacturingLine = require('../model/manufacturing_line_model');
const autogen = require('../controllers/autogen');
const utils = require('../../utils/utils');

const Schema = mongoose.Schema;
const SKUSchema = new Schema({
    number: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    case_upc: {
        type: String,
        required: true,
        unique: true
    },
    unit_upc: {
        type: String,
        required: true
    }, 
    size: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        required: true
    },
    product_line: {
        type: Schema.ObjectId,
        required: true,
        ref: 'ProductLine'
    },
    formula: {
        type: Schema.ObjectId,
        required: true,
        ref: 'Formula'
    },
    formula_scale_factor: {
        type: Number,
        required: true,
        default: 1.0
    },
    manufacturing_lines: {
        type: [Schema.ObjectId],
        ref: 'ManufacturingLine'
    },
    manufacturing_rate: {
        type: Number,
        required: true
    },
    comment: {
        type: String
    }
});

let SKU = mongoose.model('SKU', SKUSchema);
module.exports = SKU;


module.exports.createSKU = (sku, callback) => {
    SKU.create(sku, callback);
}

module.exports.deleteSKU = (sku_number, callback) => {
    var query = {number: sku_number};
    SKU.deleteOne(query, callback);
}

module.exports.updateSKU = (sku_number, sku_update, cb) => {
    var query = {number: sku_number};
    SKU.findOneAndUpdate(query, sku_update, cb);
}

module.exports.attemptImport = async (skus, skus_csv, results) => {
    let type = 'skus'
    await syntaxValidation(skus, skus_csv, results, type);
    await validator.duplicateCheck(SKU, skus, skus_csv, results, type);
    await validator.conflictCheck(SKU, skus, skus_csv, results, type);
}

module.exports.commitImport = async (createlist, changelist) => {
    if(createlist){       
        for(let row of createlist){
            await SKU.create(row).catch((err) => {throw err});
        }
    }
    if(changelist){
        for(let row of createlist){
            await SKU.findOneAndUpdate({number: row.number}, row).catch((err) => {throw err});
        }
    }
    return true;
}

async function syntaxValidation(skus, skus_csv, results, type) {
    for(let [sku, sku_csv] of utils.zip(skus, skus_csv)){
        if(sku.number){
            let num_numeric = validator.isNumeric(sku.number);
            if(!num_numeric[0]){
                results[type].errorlist.push({
                    message: num_numeric[1],
                    data: sku_csv
                });
            }else{
                let num_positive = validator.isPositive(sku.number, 'Number');
                if(!num_positive[0]){
                    results[type].errorlist.push({
                        message: num_positive[1],
                        data: sku_csv
                    });
                }
            }
            
        }else{
            sku.number = await autogen.autogen(SKU);
        }
        let name_passed = validator.proper_name_length(sku.name);
        let case_passed = sku_validator.isUPCStandard(sku.case_upc);
        let unit_passed = sku_validator.isUPCStandard(sku.unit_upc);

        let count_numeric = validator.isNumeric(sku.count);
        let scale_numeric = validator.isNumeric(sku.formula_scale_factor);
        let rate_numeric = validator.isNumeric(sku.manufacturing_rate);
        if(!count_numeric[0] || !scale_numeric[0] || !rate_numeric[0]){
            results[type].errorlist.push({
                message: [count_numeric[1], scale_numeric[1], rate_numeric[1]],
                data: sku_csv
            });
        }else{
            let count_positive = validator.isPositive(sku.count, 'Count');
            let scale_positive = validator.isPositive(sku.formula_scale_factor, 'Scale factor');
            let rate_positive = validator.isPositive(sku.manufacturing_rate, 'Manufacturing rate');
            if(!count_positive[0] || !scale_positive[0] || !rate_positive){
                results[type].errorlist.push({
                    message: [count_positive[1], scale_positive[1], rate_positive[1]],
                    data: sku_csv
                });
            }
        }

        //allow default to 1.0
        if(sku.formula_scale_factor == ''){
            delete sku.formula_scale_factor;
        }
        let formula_passed = await validator.itemExists(Formula, sku.formula);
        let product_passed = await validator.itemExists(ProductLine, sku.product_line);
        let manufacturings_passed = [];
        let manufacturing_ids = [];
        for(let line of sku.manufacturing_lines){
            let manufacturing_passed = await validator.itemExists(ManufacturingLine, line);
            manufacturings_passed.push(manufacturing_passed);
            manufacturing_ids.push(manufacturing_passed[2]);
        }   

        let errors = validator.compileErrors(name_passed, case_passed, unit_passed, formula_passed, product_passed, ...manufacturings_passed);
        if(errors.length > 0){
            results[type].errorlist.push({
                message: errors,
                data: sku_csv
            });
        }   
        
        sku.formula = formula_passed[2];
        sku.product_line = product_passed[2];
        sku.manufacturing_lines = manufacturing_ids;
        console.log(sku)
    }
}
