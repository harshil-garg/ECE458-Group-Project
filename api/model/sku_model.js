//Require mongoose package
const mongoose = require('mongoose');

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
        required: true
    },
    formula: {
        type: Schema.ObjectId,
        required: true
    },
    formula_scale_factor: {
        type: Number,
        required: true,
        default: 1.0
    },
    manufacturing_lines: {
        type: [Schema.ObjectId],
        required: true
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