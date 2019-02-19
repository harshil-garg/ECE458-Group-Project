const Formula = require('../model/formula_model');
const pagination = require('./paginate');

module.exports.filter = async function(pageNum, sortBy, keywords, ingredients){
    let pipeline = [];

    if(keywords.length > 0){
        pipeline.push({$addFields: {num2str: {'$toLower' : '$number'}}},
        {
            $match: {
                $or:[
                    {name: {$all: keywords}},
                    {num2str: {$all: keywords}}]
                }
        });
    }
    pipeline.push({
        $lookup: {
            from: 'ingredients',
            localField: 'ingredient_tuples.ingredient',
            foreignField: '_id',
            as: 'ingredients'
        }
    });
    if(ingredients.length > 0){
        pipeline.push({$match: {'ingredients.name': {$all: ingredients}}});
    }

    let agg = Formula.aggregate(pipeline);

    let result = await pagination.paginate(agg, pageNum, sortBy);

    return result;
}