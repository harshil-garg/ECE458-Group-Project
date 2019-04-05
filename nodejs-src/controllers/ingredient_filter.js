const Ingredient = require('../model/ingredient_model');
const SKU = require('../model/sku_model');
const Formula = require('../model/formula_model');
const pagination = require('./paginate');
const validator = require('./validator');

module.exports.filter = async function(pageNum, sortBy, page_size, keywords, skus){
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

        pipeline.push({$match: {_id: {$in: ingredientIDs}}});
    }
    pipeline.push({$addFields: {cost: validator.roundCost('$cost')}})
    //hallelujah dis be amazing
    pipeline.push({
        $lookup: {
            from: 'formulas',
            localField: '_id',
            foreignField: 'ingredient_tuples.ingredient',
            as: 'formulas'
        }
    });
    pipeline.push({
        $lookup: {
            from: 'skus',
            localField: 'formulas._id',
            foreignField: 'formula',
            as: 'skus'
        }
    })

    let agg = Ingredient.aggregate(pipeline);

    let result = await pagination.paginate(agg, pageNum, sortBy, page_size);
    
    return result
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

// async function appendSKUs(ingredients){
//     for(let ingredient of ingredients.data){
//         let formulas = await Formula.find({'ingredient_tuples.ingredient': ingredient._id}).exec();
//         let skus = [];
//         for(let formula of formulas){
//             let skuList = await SKU.find({formula: formula._id}, 'name size count number').exec();
//             skus = skus.concat(skuList);
//         }
//         ingredient.num_skus = skus.length;
//         //save num skus
//         await Ingredient.findOneAndUpdate({name: ingredient.name}, ingredient).exec();
//         ingredient.skus = skus;
//     }

//     return ingredients;
    
// }