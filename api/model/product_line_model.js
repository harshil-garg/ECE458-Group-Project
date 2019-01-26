//Require mongoose package
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProductLineSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
});

let ProductLine = mongoose.model('ProductLine', ProductLineSchema);
module.exports = ProductLine;

module.exports.addProductLine = (product_line, callback) => {
    ProductLine.create(product_line, callback);
}

module.exports.removeProductLine = (product_line_name, callback) => {
    var query = {name: product_line_name};
    ProductLine.deleteOne(query, callback);
}

module.exports.updateProductLine = (product_line_name, product_line_update, cb) => {
    var query = {name: product_line_name};
    ProductLine.findOneAndUpdate(query, product_line_update, cb);
}