//Require mongoose package
const mongoose = require('mongoose');
const Ingredient = require('./ingredient_model');

const utils = require( '../../utils/utils');

const Schema = mongoose.Schema;
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
    await utils.asyncForEach(Array.from(skuMap.keys()), async (key) => {
        console.log(key);
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
        await SKU.findOneAndUpdate({number: key}, {ingredients: newArray}).exec()
        .catch((error) => {
            console.log(error);
        });
    });
}
