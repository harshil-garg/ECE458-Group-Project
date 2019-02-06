const SKU = require('../model/sku_model');
const Ingredient = require('../model/ingredient_model');

module.exports.append = async function(ingredients){
    let newIngredients = []
    
    for(let ingredient of ingredients){                   
        ingredient = await getSKUS(ingredient);
        newIngredients.push(ingredient);
    }
    
    return newIngredients;
}

async function getSKUS(ingredient){
    let result = await SKU.find({"ingredients.ingredient_name": ingredient.name}, 'name size count').exec();
    ingredient.num_skus = result.length;

    await Ingredient.updateIngredient(ingredient.name, ingredient, (err) => {
        if(err){
            res.json({success: false, message: err});
        }       
    });

    ingredient.skus = result;

    return ingredient;
}
