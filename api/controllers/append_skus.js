const SKU = require('../model/sku_model');

module.exports.append = async function(ingredients, pages, res){
    let newIngredients = []
    
    for(let ingredient of ingredients){                   
        ingredient = await getSKUS(ingredient);
        newIngredients.push(ingredient);
    }
    
    res.json({
        success: true,
        data: newIngredients,
        pages: pages
    });
}

async function getSKUS(ingredient){
    let result = await SKU.find({"ingredients.ingredient_name": ingredient.name}, 'name size count').exec((err, results) => {
        return results;
    });
    ingredient.skus = result;

    return ingredient;
}
