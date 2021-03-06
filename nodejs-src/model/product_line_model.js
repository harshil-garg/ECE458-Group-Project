//Require mongoose package
const mongoose = require('mongoose');
const validator = require('../controllers/validator');

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

module.exports.createProductLine = (product_line, callback) => {
    ProductLine.create(product_line, callback);
}

module.exports.deleteProductLine = (product_line_name, callback) => {
    var query = {name: product_line_name};
    ProductLine.deleteOne(query, callback);
}

module.exports.updateProductLine = (product_line_name, product_line_update, cb) => {
    var query = {name: product_line_name};
    ProductLine.findOneAndUpdate(query, product_line_update, cb);
}

module.exports.attemptImport = async (product_lines, product_lines_csv, results) => {
    let type = 'product_lines'
    await validator.duplicateCheck(ProductLine, product_lines, product_lines_csv, results, type)
    await validator.conflictCheck(ProductLine, product_lines, product_lines_csv, results, type);
}

module.exports.commitImport = async (createlist) => {
    if(createlist){
        for(let row of createlist){
            await ProductLine.create(row)//.catch((err) => {throw err});
        }
    }
    return true;
}
