//Require mongoose package
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const Tuple = new Schema({
    ingredient: String,
    quantity: Number
});
const SKUSchema = new Schema({
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
        type: String,
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