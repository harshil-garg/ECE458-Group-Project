//Require mongoose package
const mongoose = require('mongoose');
const Ingredient = require('./ingredient_model');

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

module.exports.addFormulaRow = (row, cb) => {
    var query = {number: row['SKU#']};
    SKU.findOne(query, (err, sku) => {
        if (err) {
            cb(err);
        }
        else {
            Ingredient.findOne({number: row['Ingr#']}, (err, ingredient) => {
                if (err) {
                    cb(err);
                }
                else {
                    var ingredients = sku.ingredients.slice();
                    ingredients.push({ingredient_name: ingredient.name, quantity: row['Quantity']});
                    SKU.findOneAndUpdate(query, {ingredients: ingredients}, cb);
                }
            })
            
        }
    })
}

module.exports.updateFormulaRow = (row, cb) => {
    var query = {number: row['SKU#']};
    SKU.findOne(query, (err, sku) => {
        if (err) {
            cb(err);
        }
        else {
            Ingredient.findOne({number: row['Ingr#']}, (err, ingredient) => {
                if (err) {
                    cb(err);
                }
                else {
                    var ingredients = sku.ingredients.slice();
                    for (var i = 0; i < ingredients.length; i++) {
                        if (ingredients[i].ingredient_name == ingredient.name) {
                            ingredients[i] = {ingredient_name: ingredient.name, quantity: row['Quantity']};
                            break;
                        }
                    }
                    SKU.findOneAndUpdate(query, {ingredients: ingredients}, cb);
                }
            })
            
        }
    })
}
