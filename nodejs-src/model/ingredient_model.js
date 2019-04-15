//Require mongoose package
const mongoose = require('mongoose');
const validator = require('../controllers/validator');
const autogen = require('../controllers/autogen');
const utils = require('../utils/utils');
const unit = require('../controllers/units');

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
        enum: ['oz', 'ounce', 'lb', 'pound', 'ton', 'g', 'gram', 'kg', 'kilogram', 'floz', 'fluidounce', 'pt', 'pint', 'qt', 'quart', 'gal', 'gallon', 'ml', 'milliliter', 'l', 'liter', 'ct', 'count'],
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    comment: {
        type: String
    }
});

let Ingredient = mongoose.model('Ingredient', IngredientSchema);
module.exports = Ingredient;

module.exports.createIngredient = (ingredient, callback) => {
    Ingredient.create(ingredient, callback);
}

module.exports.deleteIngredient = (ingredient_name, callback) => {
    var query = {name: ingredient_name};
    Ingredient.deleteOne(query, callback);
}

module.exports.updateIngredient = (ingredient_name, ingredient_update, cb) => {
    var query = {name: ingredient_name};
    Ingredient.findOneAndUpdate(query, ingredient_update, cb);
}

module.exports.attemptImport = async (ingredients, ingredients_csv, results) => {
    let type = 'ingredients'
    for(let [ingredient, ingredient_csv] of utils.zip(ingredients, ingredients_csv)){
        await module.exports.syntaxValidation(ingredient, ingredient_csv, results, type);
    }
    
    await validator.duplicateCheck(Ingredient, ingredients, ingredients_csv, results, type);
    await validator.conflictCheck(Ingredient, ingredients, ingredients_csv, results, type);
}

module.exports.commitImport = async (createlist, changelist) => {
    if(createlist){
        for(let row of createlist){
            await Ingredient.create(row).catch((err) => {console.log(err);throw err});
        }
    }
    if(changelist){
        for(let row of changelist){
            await Ingredient.findOneAndUpdate({number: row.number}, row).catch((err) => {console.log(err);throw err});
        }
    }
    return true;
}

module.exports.syntaxValidation = async (ingredient, ingredient_csv, results, type) => {
    if(ingredient.number){
        let num_numeric = validator.isNumeric(ingredient.number);
        if(!num_numeric[0]){
            if(results){
                results[type].errorlist.push({
                    message: num_numeric[1],
                    data: ingredient_csv
                });
            }else{
                return num_numeric[1]
            }            
        }else{
            let num_positive = validator.isPositive(ingredient.number, 'Number');
            if(!num_positive[0]){
                if(results){
                    results[type].errorlist.push({
                    message: num_positive[1],
                    data: ingredient_csv
                    });
                }else{
                    return num_positive[1]
                }
            }
        }
    }else{
        ingredient.number = await autogen.autogen(Ingredient)
    }
    let cost_numeric = validator.isNumeric(ingredient.cost);
    let size_numeric = validator.isNumeric(ingredient.package_size);
    let errors = validator.compileErrors(cost_numeric, size_numeric);
    if(errors.length > 0){
        if(results){
            results[type].errorlist.push({
                message: errors,
                data: ingredient_csv
            });
        }else{
            return errors;
        }       
    }else{
        let cost_positive = validator.isPositive(ingredient.cost, 'Cost');
        let size_positive = validator.isPositive(ingredient.package_size, 'Package size')
        let pos_errors = validator.compileErrors(cost_positive, size_positive);
        if(errors.length > 0){
            if(results){
                results[type].errorlist.push({
                    message: pos_errors,
                    data: ingredient_csv
                });
            }else{
                return pos_errors;
            }           
        }

        ingredient.cost = validator.roundCost(ingredient.cost);
    }            

    let unit_passed = unit.validUnit(ingredient.unit);
    if(!unit_passed){
        if(results){
            results[type].errorlist.push({
                message: 'Invalid unit',
                data: ingredient_csv
            });
        }else{
            return 'Invalid unit';
        }       
    }

}
