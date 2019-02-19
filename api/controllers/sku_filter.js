const SKU = require('../model/sku_model');
const pagination = require('./paginate');

module.exports.filter = async function(pageNum, sortBy, keywords, ingredients, product_lines){
    let pipeline = [];

    if(keywords.length > 0){
        pipeline.push({$addFields: {num2str: {'$toLower' : '$number'}}},
        {
            $match: {
                $or:[
                    {name: {$all: keywords}},
                    {num2str: {$all: keywords}},
                    {case_upc: {$all: keywords}},
                    {unit_upc: {$all: keywords}}]
                }
        });
    }
    pipeline.push({
        $lookup: {
            from: 'formulas',
            localField: 'formula',
            foreignField: '_id',
            as: 'formula'
        }
    },
    {$unwind: '$formula'})
    if(ingredients.length > 0){
        pipeline.push({
            $lookup: {
                from: 'ingredients',
                localField: 'formula.ingredient_tuples.ingredient',
                foreignField: '_id',
                as: 'ingredients'
            }
        },
        {
            $unwind: '$ingredients'
        },
        {
            $match: {'ingredients.name': {$all: ingredients}}
        });
    }
    pipeline.push({
        $lookup: {
            from: 'productlines',
            localField: 'product_line',
            foreignField: '_id',
            as: 'product_line'
        }
    },
    {$unwind: '$product_line'},
    {$addFields: {product_line: '$product_line.name'}});
    if(product_lines.length > 0){
        pipeline.push({$match: {'product_line.name': {$all: product_lines}}});   
    }

    let agg = SKU.aggregate(pipeline);

    let result = await pagination.paginate(agg, SKU, pageNum, sortBy);

    return result;
}
