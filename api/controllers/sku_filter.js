const SKU = require('../model/sku_model');
const pagination = require('./paginate');

module.exports.none = function (pageNum, sortBy, res){
    let filter = SKU.find({});
    pagination.paginate(filter, SKU, pageNum, sortBy, res);
};

module.exports.keywords = function (pageNum, sortBy, keywords, res){
    let filter = SKU.find({
        $or:[
            {name: {$all: keywords}},
            {size: {$all: keywords}},
            {comment: {$all: keywords}}]
        }
    );
    pagination.paginate(filter, SKU, pageNum, sortBy, res);
};

module.exports.ingredients = function (pageNum, sortBy, ingredients, res){
    let filter = SKU.find({'ingredients.ingredient_name': {$all: ingredients}});
    pagination.paginate(filter, SKU, pageNum, sortBy, res);
};

module.exports.productLines = function (pageNum, sortBy, product_lines, res){
    let filter = SKU.find({product_line: {$all: product_lines}});
    pagination.paginate(filter, SKU, pageNum, sortBy, res);
};

module.exports.keywordsandIngredients = function (pageNum, sortBy, keywords, ingredients, res){
    let filter = SKU.find({'ingredients.ingredient_name': {$all: ingredients},       
        $or:[
            {name: {$all: keywords}},
            {size: {$all: keywords}},
            {comment: {$all: keywords}}
        ]
    });
    pagination.paginate(filter, SKU, pageNum, sortBy, res);
};

module.exports.keywordsandLines = function (pageNum, sortBy, keywords, product_lines, res){
    let filter = SKU.find({product_line: {$all: product_lines},
        $or:[
            {name: {$all: keywords}},
            {size: {$all: keywords}},
            {comment: {$all: keywords}}
        ]
    });
    pagination.paginate(filter, SKU, pageNum, sortBy, res);
};

module.exports.ingredientsandLines = function (pageNum, sortBy, ingredients, product_lines, res){
    let filter = SKU.find({'ingredients.ingredient_name': {$all: ingredients},
        product_line: {$all: product_lines}
    });
    pagination.paginate(filter, SKU, pageNum, sortBy, res);
};

module.exports.allFilters = (pageNum, sortBy, keywords, ingredients, product_lines, res) => {
    let filter = SKU.find({      
        product_line: {$all: product_lines},
        'ingredients.ingredient_name': {$all: ingredients},
        $or:[
            {name: {$all: keywords}},
            {size: {$all: keywords}},
            {comment: {$all: keywords}}
        ]
    });
    pagination.paginate(filter, SKU, pageNum, sortBy, res);
};
