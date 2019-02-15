const SKU = require('../model/sku_model');
const pagination = require('./paginate');

module.exports.none = async function (pageNum, sortBy){
    let filter = SKU.find({});
    return await pagination.paginate(filter, SKU, pageNum, sortBy);
};

module.exports.keywords = async function (pageNum, sortBy, keywords){
    let filter = SKU.find({
        $or:[
            {name: {$all: keywords}},
            {case_upc: {$all: keywords}},
            {unit_upc: {$all: keywords}}]
        }
    );
    return await pagination.paginate(filter, SKU, pageNum, sortBy);
};

module.exports.ingredients = async function (pageNum, sortBy, ingredients){
    let filter = SKU.find({'ingredients.ingredient_name': {$all: ingredients}});
    return await pagination.paginate(filter, SKU, pageNum, sortBy);
};

module.exports.productLines = async function (pageNum, sortBy, product_lines){
    let filter = SKU.find({product_line: {$all: product_lines}});
    return await pagination.paginate(filter, SKU, pageNum, sortBy);
};

module.exports.keywordsandIngredients = async function (pageNum, sortBy, keywords, ingredients){
    let filter = SKU.find({'ingredients.ingredient_name': {$all: ingredients},       
        $or:[
            {name: {$all: keywords}},
            {case_upc: {$all: keywords}},
            {unit_upc: {$all: keywords}}
        ]
    });
    return await pagination.paginate(filter, SKU, pageNum, sortBy);
};

module.exports.keywordsandLines = async function (pageNum, sortBy, keywords, product_lines){
    let filter = SKU.find({product_line: {$all: product_lines},
        $or:[
            {name: {$all: keywords}},
            {case_upc: {$all: keywords}},
            {unit_upc: {$all: keywords}}
        ]
    });
    return await pagination.paginate(filter, SKU, pageNum, sortBy);
};

module.exports.ingredientsandLines = async function (pageNum, sortBy, ingredients, product_lines){
    let filter = SKU.find({'ingredients.ingredient_name': {$all: ingredients},
        product_line: {$all: product_lines}
    });
    return await pagination.paginate(filter, SKU, pageNum, sortBy);
};

module.exports.allFilters = async function (pageNum, sortBy, keywords, ingredients, product_lines) {
    let filter = SKU.find({      
        product_line: {$all: product_lines},
        'ingredients.ingredient_name': {$all: ingredients},
        $or:[
            {name: {$all: keywords}},
            {case_upc: {$all: keywords}},
            {unit_upc: {$all: keywords}}
        ]
    });
    return await pagination.paginate(filter, SKU, pageNum, sortBy);
};
