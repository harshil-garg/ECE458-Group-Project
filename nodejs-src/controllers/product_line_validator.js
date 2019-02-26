const SKU = require('../model/sku_model');
//is product line in use by a sku
module.exports.productLineClear = async function(id) {
    let err_msg = `Product Line is in use`;
    let result = await SKU.findOne({product_line: id}).exec();
    return [!result, err_msg]; //if clear then there will be no result, thus !result will be true
};