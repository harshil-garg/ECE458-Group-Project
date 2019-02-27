//Require mongoose package
const mongoose = require('mongoose');
const validator = require('../controllers/validator');
const Ingredient = require('../model/ingredient_model');
const formula_validator = require('../controllers/formula_validator')
const autogen = require('../controllers/autogen');
const utils = require('../utils/utils');
const unit = require('../controllers/units');

const Schema = mongoose.Schema;
const Ingredient_Tuple = new Schema({
    ingredient: {
        type: Schema.ObjectId,
        required: true,
        ref: 'Ingredient'
    },
    quantity: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        enum: ['oz', 'ounce', 'lb', 'pound', 'ton', 'g', 'gram', 'kg', 'kilogram', 'floz', 'fluidounce', 'pt', 'pint', 'qt', 'quart', 'gal', 'gallon', 'ml', 'milliliter', 'l', 'liter', 'ct', 'count'],
        required: true
    }
});

const FormulaSchema = new Schema({
    number: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    ingredient_tuples: {
        type: [Ingredient_Tuple],
    },
    comment: {
        type: String
    }

});

let Formula = mongoose.model('Formula', FormulaSchema);
module.exports = Formula;

module.exports.attemptImport = async (formulas, formulas_csv, results) => {
    let type = 'formulas'
    await syntaxValidation(formulas, formulas_csv, results, type);
    await formula_validator.duplicateCheck(formulas, formulas_csv, results, type);
    await formula_validator.conflictCheck(Formula, formulas, formulas_csv, results, type);
}

module.exports.commitImport = async (createlist, changelist) => {
    if(createlist){
        for(let row of createlist){
            await Formula.create(row).catch((err) => {throw err});
        }
    }
    if(changelist){
        for(let row of changelist){
            await Formula.findOneAndUpdate({number: row.number}, row).catch((err) => {throw err});
        }
    }
    return true;

}

async function syntaxValidation(formulas, formulas_csv, results, type) {
    for(let [formula, formula_csv] of utils.zip(formulas, formulas_csv)){
        if(formula.number){
            let num_numeric = validator.isNumeric(formula.number);
            if(!num_numeric[0]){
                results[type].errorlist.push({
                    message: num_numeric[1],
                    data: formula_csv
                });
            }else{
                let num_positive = validator.isPositive(formula.number, 'Number');
                if(!num_positive[0]){
                    results[type].errorlist.push({
                        message: num_positive[1],
                        data: formula_csv
                    });
                }
            }
        }else{
            formula.number = await autogen.autogen(Formula);
        }
        let quantity_numeric = validator.isNumeric(formula.quantity);
        if(!quantity_numeric[0]){
            results[type].errorlist.push({
                message: quantity_numeric[1],
                data: formula_csv
            });
        }else{
            let quantity_positive = validator.isPositive(formula.quantity, 'Quantity');
            if(!quantity_positive[0]){
                results[type].errorlist.push({
                    message: quantity_positive[1],
                    data: formula_csv
                });
            }
        }

        let unit_passed = unit.validUnit(formula.unit);
        if(!unit_passed){
            results[type].errorlist.push({
                message: 'Invalid unit',
                data: formula_csv
            });
        }
        let name_passed = validator.proper_name_length(formula.name);
        let ingredient_tuple_passed = await formula_validator.validIngredientTuple(Ingredient, formula.ingredient, formula.unit);
        let errors = validator.compileErrors(name_passed, ingredient_tuple_passed);
        if(errors.length > 0){
            results[type].errorlist.push({
                message: errors,
                data: formula_csv
            });
        }
        formula.ingredient = ingredient_tuple_passed[2];
    }
}
