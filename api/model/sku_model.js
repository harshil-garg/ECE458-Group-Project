//Require mongoose package
const mongoose = require('mongoose');
const Ingredient = require('./ingredient_model');

const utils = require( '../../utils/utils');

const Schema = mongoose.Schema;
const Tuple = new Schema({
    ingredient_name: String,
    quantity: Number
});
const SKUSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    number: {
        type: Number,
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
        type: Number,
        required: true
    },
    product_line: {
        type: String,
        required: true
    },
    ingredients: {
        type: [Tuple],
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

module.exports.importFormulas = async (formulas) => {
    var skuMap = new Map();
    formulas.forEach((formula) => {
        if (!skuMap.has(formula['SKU#'])) {
            skuMap.set(formula['SKU#'], [formula]);
        }
        else {
            skuMap.get(formula['SKU#']).push(formula);
        }
    });
    // in order to import a tuple, we need SKU#, we need ingr#, we need ingrname, and we need quantity
    await utils.asyncForEach(skuMap.keys, async (key) => {
        var newArray = [];
        // for each set of formulas for a sku, generate the ingredient names
        await utils.asyncForEach(skuMap.get(key), async (formula) => {
            var ingredient = await Ingredient.findOne({number: formula['Ingr#']}).exec();
            newArray.push({
                ingredient_name: ingredient.name,
                ingredient_number: formula['Ingr#'],
                quantity: formula['Quantity']
            });
        });
        await SKU.findOneAndUpdate({number: key}, {ingredients: newArray}).exec();
    });
}
