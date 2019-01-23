//Require mongoose package
const mongoose = require('mongoose');
const Ingredient = require('../model/ingredient_model');

const Schema = mongoose.Schema;
const Tuple = new Schema({
    ingredient: [Ingredient.schema],
    quantity: Number
});
const SKUSchema = new Schema({
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
    case_upc: {
        type: Number,
        required: true,
        unique: true
    },
    unit_upc: {
        type: Number,
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
        type: String,
        required: true
    },
    ingredients: {
        type: [Tuple],
        required: true
    },
    comment: {
        type: String
    }
});

let SKU = mongoose.model('SKU', SKUSchema);
module.exports = SKU;