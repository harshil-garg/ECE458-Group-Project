const Ingredient = require('../model/ingredient_model');
const pagination = require('./paginate');

module.exports.none = async function (pageNum, sortBy){
    let filter = Ingredient.find({});
    return await pagination.paginate(filter, Ingredient, pageNum, sortBy);
};

module.exports.keywords = async function (pageNum, sortBy, keywords){
    let filter = Ingredient.find({$or:[
        {name: {$all: keywords}},
        {vendor_info: {$all: keywords}},
        {package_size: {$all: keywords}},
        {comment: {$all: keywords}}]
    });
    return await pagination.paginate(filter, Ingredient, pageNum, sortBy);
};

module.exports.skus = async function (pageNum, sortBy, skus){
    let filter = Ingredient.find({name: {$in: getNames(skus)}});
    return await pagination.paginate(filter, Ingredient, pageNum, sortBy);
}

module.exports.keywordsAndSkus = async function(pageNum, sortBy, keywords, skus){
    let filter = Ingredient.find({name: {$in: getNames(skus)},
        $or:[
            {name: {$all: keywords}},
            {vendor_info: {$all: keywords}},
            {package_size: {$all: keywords}},
            {comment: {$all: keywords}}]
    });
    return await pagination.paginate(filter, Ingredient, pageNum, sortBy);

}

function getNames(skus) {
    let ingredient_names = new Set();
    for(let sku of skus){
        for(let ingredient of sku.ingredients){
            ingredient_names.add(ingredient.ingredient_name);
        }
    }
    return Array.from(ingredient_names);
}

