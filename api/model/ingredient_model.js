//Require mongoose package
const mongoose = require('mongoose');
const validator = require('../controllers/validator');
const autogen = require('../controllers/autogen');
const utils = require('../../utils/utils');

const Schema = mongoose.Schema;
const IngredientSchema = new Schema({
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
    vendor_info: {
        type: String
    },
    package_size: {
        type: Number,
        required: true
    }, 
    unit: {
        type: String,
        enum: ['oz.', 'lb.', 'ton', 'g', 'kg', 'fl. oz.', 'pt.', 'qt.', 'gal.', 'mL', 'L', 'count'],
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    comment: {
        type: String
    },
    num_skus: {
        type: Number,
        default: 0
    }
});

let Ingredients = mongoose.model('Ingredient', IngredientSchema);
module.exports = Ingredients;

module.exports.createIngredient = (ingredient, callback) => {
    Ingredients.create(ingredient, callback);
}

module.exports.deleteIngredient = (ingredient_name, callback) => {
    var query = {name: ingredient_name};
    Ingredients.deleteOne(query, callback);
}

module.exports.updateIngredient = (ingredient_name, ingredient_update, cb) => {
    var query = {name: ingredient_name};
    Ingredients.findOneAndUpdate(query, ingredient_update, cb);
}

module.exports.attemptImport = async (ingredients, ingredients_csv, results) => {
    let type = 'ingredients'
    await syntaxValidation(ingredients, ingredients_csv, results, type);
    await validator.conflictCheck(Ingredient, ingredients, results, type);
}

module.exports.commitImport = async (createlist, changelist) => {
    if(createlist){
        for(let row of createlist){
            let result = await Ingredient.create(row);
            if(!result){
                return false;
            }
        }
    }
    if(changelist){
        for(let row of createlist){
            let result = await Ingredient.findOneAndUpdate({number: row.number}, row);
            if(!result){
                return false;
            }
        }
    }
    return true;
}



async function syntaxValidation(ingredients, ingredients_csv, results, type) {
    for(let [ingredient, ingredient_csv] of utils.zip(ingredients, ingredients_csv)){
        if(ingredient.number){
            let num_numeric = validator.isNumeric(ingredient.number);
            if(!num_numeric[0]){
                results[type].errorlist.push({
                    message: num_numeric[1],
                    data: ingredient_csv
                });
            }else{
                let num_positive = validator.isPositive(ingredient.number, 'Number');
                if(!num_positive[0]){
                    results[type].errorlist.push({
                        message: num_positive[1],
                        data: ingredient_csv
                    });
                }
            }
        }else{
            ingredient.number = await autogen.autogen(Ingredient);
        }

        let cost_numeric = validator.isNumeric(ingredient.cost);
        if(!cost_numeric[0]){
            results[type].errorlist.push({
                message: cost_numeric[1],
                data: ingredient_csv
            });
        }else{
            let cost_positive = validator.isPositive(ingredient.cost, 'Cost');
            if(!cost_positive[0]){
                results[type].errorlist.push({
                    message: cost_positive[1],
                    data: ingredient_csv
                });
            }
            ingredient.cost = validator.roundCost(cost);
        }

    }
}