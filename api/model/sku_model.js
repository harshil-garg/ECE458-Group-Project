//Require mongoose package
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const Tuple = new Schema({
    ingredient_name: String,
    quantity: String
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


module.exports.createSKU = (sku, callback) => {
    SKU.create(sku, callback);
}

module.exports.deleteSKU = (sku_name, callback) => {
    var query = {name: sku_name};
    SKU.deleteOne(query, callback);
}

module.exports.updateSKU = (sku_name, sku_update, cb) => {
    var query = {name: sku_name};
    SKU.findOneAndUpdate(query, sku_update, cb);
}