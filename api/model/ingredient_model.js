//Require mongoose package
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const IngredientSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    number: {
        type: Number,
        required: true,
        unique: true
    },
    vendor_info: {
        type: String
    },
    package_size: {
        type: String,
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