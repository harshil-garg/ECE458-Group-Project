const Ingredient = require('../model/ingredient_model');
const pagination = require('./paginate');

module.exports.none = function (pageNum, sortBy, res){
    let filter = Ingredient.find({});
    pagination.paginate(filter, Ingredient, pageNum, sortBy, res);
};

module.exports.keywords = function (pageNum, sortBy, keywords, res){
    let filter = Ingredient.find({$or:[
        {name: {$all: keywords}},
        {vendor_info: {$all: keywords}},
        {package_size: {$all: keywords}},
        {comment: {$all: keywords}}]
    });
    pagination.paginate(filter, Ingredient, pageNum, sortBy, res);
};

module.exports.skus = function (pageNum, sortBy, skus, res){
    let filter = Ingredient.find({name: {$in: getNames(skus)}});
    pagination.paginate(filter, Ingredient, pageNum, sortBy, res);
}

module.exports.keywordsAndSkus = function(pageNum, sortBy, keywords, skus, res){
    let filter = Ingredient.find({name: {$in: getNames(skus)},
        $or:[
            {name: {$all: keywords}},
            {vendor_info: {$all: keywords}},
            {package_size: {$all: keywords}},
            {comment: {$all: keywords}}]
    });
    pagination.paginate(filter, Ingredient, pageNum, sortBy, res);

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

