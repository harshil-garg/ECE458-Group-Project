const Ingredient = require('../model/ingredient_model');
const SKU = require('../model/sku_model');
const Formula = require('../model/formula_model');
const pagination = require('./paginate');
const validator = require('./validator');

module.exports.filter = async function(pageNum, sortBy, keywords, skus){
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
    if(skus.length > 0){
        let skuList = await SKU.find({name: {$in: skus}}, 'name size count number formula').exec();
        let formulaIDs = getFormulas(skuList);

        let formulaList = await Formula.find({_id: {$in: formulaIDs}});
        let ingredientIDs = getIngredients(formulaList);

        pipeline.push({$match: {_id: {$in: ingredientIDs}}},
            {$addFields: {skus: skuList}});
    }
    pipeline.push({$addFields: {cost: validator.roundCost('$cost')}})

    let agg = Ingredient.aggregate(pipeline);

    let result = await pagination.paginate(agg, Ingredient, pageNum, sortBy);

    return result;
}

function getFormulas(skus){
    let formulas = new Set();
    for(sku of skus){
        formulas.add(sku.formula);
    }
    return Array.from(formulas);
}

function getIngredients(formulas){
    let ingredients = new Set();
    for(let formula of formulas){
        for (let tuple of formula.ingredient_tuples){
            ingredients.add(tuple.ingredient);
        }
    }
    return Array.from(ingredients);
}


