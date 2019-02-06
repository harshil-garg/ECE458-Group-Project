const SKU = require('../model/sku_model');

//is product line in use by a sku
module.exports.in_use = async function(name) {
    let result = await SKU.findOne({product_line: name}).exec();
    return !(!result);
};