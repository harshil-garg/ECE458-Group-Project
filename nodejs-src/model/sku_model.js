//Require mongoose package
const mongoose = require('mongoose');
const validator = require('../controllers/validator');
const sku_validator = require('../controllers/sku_validator');
const Formula = require('../model/formula_model');
const ProductLine = require('../model/product_line_model');
const ManufacturingLine = require('../model/manufacturing_line_model');
const ManufacturingSchedule = require('../model/manufacturing_schedule_model');
const autogen = require('../controllers/autogen');
const utils = require('../utils/utils');

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
    setup_cost: {
        type: Number,
        required: true
    },
    run_cost: {
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
    let type = 'skus';
    for(let [sku, sku_csv] of utils.zip(skus, skus_csv)){
        await this.syntaxValidation(sku, sku_csv, results, type);
    }
    
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
        for(let row of changelist){
            let deleted_lines = row.deleted_lines;
            delete row.deleted_lines
            let sku = await SKU.findOne({number: row.number}).exec();

            await SKU.findOneAndUpdate({number: row.number}, row).then(async () => {
                let result = await ManufacturingSchedule.find({'activity.sku': sku._id, 'manufacturing_line': {$in: deleted_lines}}).exec();
                await ManufacturingSchedule.deleteMany({'activity.sku': sku._id, 'manufacturing_line': {$in: deleted_lines}}).exec();
            }).catch((err) => {console.log(err);throw err});
        }
    }
    return true;
}

module.exports.syntaxValidation = async (sku, sku_csv, results, type) => {
    //use for both crud and import
    if(sku.number){
        let num_numeric = validator.isNumeric(sku.number);
        if(!num_numeric[0]){
            if(results){
                results[type].errorlist.push({
                    message: num_numeric[1],
                    data: sku_csv
                });
            }else{
                return num_numeric[1];
            }            
        }else{
            let num_positive = validator.isPositive(sku.number, 'Number');
            if(!num_positive[0]){
                if(results){
                    results[type].errorlist.push({
                        message: num_positive[1],
                        data: sku_csv
                    });
                }else{
                    return num_positive[1];
                }               
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
    let numeric_errors = validator.compileErrors(count_numeric, scale_numeric, rate_numeric);
    if(numeric_errors.length > 0){
        if(results){
            results[type].errorlist.push({
                message: numeric_errors,
                data: sku_csv
            });
        }else{
            return numeric_errors;
        }   
    }else{
        let count_positive = validator.isPositive(sku.count, 'Count');
        let scale_positive = validator.isPositive(sku.formula_scale_factor, 'Scale factor');
        let rate_positive = validator.isPositive(sku.manufacturing_rate, 'Manufacturing rate');
        let positive_errors = validator.compileErrors(count_positive, scale_positive, rate_positive);
        if(positive_errors.length > 0){
            if(results){
                results[type].errorlist.push({
                    message: positive_errors,
                    data: sku_csv
                });
            }else{
                return positive_errors;
            }   
        }
    }

    //allow default to 1.0
    if(sku.formula_scale_factor == ''){
        delete sku.formula_scale_factor;
    }
    let formula_passed = await validator.itemExists(Formula, sku.formula);
    if(!formula_passed[0]){
        results[type].errorlist.push({
            message: formula_passed[1],
            data: sku_csv
        });
        //don't count as error for regular crud
    }
    let product_passed = await validator.itemExists(ProductLine, sku.product_line);
    let manufacturings_passed = [];
    let manufacturing_ids = [];
    for(let line of sku.manufacturing_lines){
        let manufacturing_passed = await validator.itemExists(ManufacturingLine, line);
        manufacturings_passed.push(manufacturing_passed);
        manufacturing_ids.push(manufacturing_passed[2]);
    }   

    let existing_sku = await SKU.findOne({number: sku.number}).exec();

    let deleted_lines = []

    //SPECIAL SCHEDULE CHECKS
    if(existing_sku != null){
        //Prevent edit of manufacturing rate
        let map = await ManufacturingSchedule.findOne({'activity.sku': sku._id}).exec();
        if(map != null && sku.manufacturing_rate != existing_sku.manufacturing_rate){
            if(results){
                results[type].errorlist.push({
                    message: 'Cannot edit rate of a SKU that has been mapped to the Manufacturing Schedule',
                    data: sku_csv
                });
            }else{
                return 'Cannot edit rate of a SKU that has been mapped to the Manufacturing Schedule'
            }           
        }
        //check for deleted lines
        for(let old_line of existing_sku.manufacturing_lines){
            let deleted = true;
            for(let new_line of manufacturing_ids){
                //check if old line is in any of the new lines
                deleted = deleted && !old_line.equals(new_line); 
            }
            if(deleted){
                deleted_lines.push(old_line)
            }
        }
    }

    //add field of deleted lines
    sku['deleted_lines'] = deleted_lines;

    let errors = validator.compileErrors(name_passed, case_passed, unit_passed, product_passed, ...manufacturings_passed);
    if(errors.length > 0){
        if(results){
            results[type].errorlist.push({
                message: errors,
                data: sku_csv
            });
        }else{
            return errors;
        }       
    }   
    
    sku.formula = formula_passed[2];
    sku.product_line = product_passed[2];
    sku.manufacturing_lines = manufacturing_ids;
    console.log(sku)
}
