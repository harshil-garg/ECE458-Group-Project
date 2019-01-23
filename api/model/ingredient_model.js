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
        type: String,
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
        type: String,
        required: true
    },
    comment: {
        type: String
    }
});

let Ingredients = mongoose.model('Ingredient', IngredientSchema);
module.exports = Ingredients;

//newUser.save is used to insert the document into MongoDB
module.exports.addIngredient = (ingredient, callback) => {
    Ingredients.create(ingredient, callback);
}

module.exports.removeIngredient = (ingredient_name, callback) => {
    var query = {name: ingredient_name};
    Ingredients.deleteOne(query, callback);
}

module.exports.updateIngredient = (ingredient_name, ingredient_update, cb) => {
    var query = {name: ingredient_name};
    Ingredients.findOneAndUpdate(query, ingredient_update, cb);
}