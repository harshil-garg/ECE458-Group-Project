const Formula = require('../model/formula_model');
const pagination = require('./paginate');

module.exports.filter = async function(pageNum, sortBy, page_size, keywords, ingredients){
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
        }//,
        // $addFields: {'ingredient_tuples.ingredient': {$match: {'ingredient_tuples.ingredient': 'ingredients.id'}}}
    });
    if(ingredients.length > 0){
        pipeline.push({$match: {'ingredients.name': {$all: ingredients}}});
    }

    let agg = Formula.aggregate(pipeline);

    let result = await pagination.paginate(agg, pageNum, sortBy, page_size);

    populateIngredients(result);

    return result;
}

function populateIngredients(result){
    for(let item of result.data){
        for(let ingredient of item.ingredients){
            for(let tuple of item.ingredient_tuples){
                if(ingredient._id.equals(tuple.ingredient)){
                    tuple.ingredient = ingredient;
                }
            }
        }
        delete item.ingredients;
    }
}