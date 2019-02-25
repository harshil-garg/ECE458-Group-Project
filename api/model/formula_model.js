//Require mongoose package
const mongoose = require('mongoose');
const validator = require('../controllers/validator');
const formula_validator = require('../controllers/formula_validator')
const autogen = require('../controllers/autogen');
const util = require('../../utils/utils');

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
        enum: ['oz.', 'lb.', 'ton', 'g', 'kg', 'fl. oz.', 'pt.', 'qt.', 'gal.', 'mL', 'L', 'count'],
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
    await formula_validator(formulas, formulas_csv, results, type);
}

async function syntaxValidation(formulas, formulas_csv, results, type) {
    for(let [formula, formula_csv] of util.zip(formulas, formulas_csv)){
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
            formula.number = await autogen.autogen(formula);
        }

        

    }
}