const mongoose = require('mongoose');
const SKU = require('../model/sku_model');
const pagination = require('./paginate');

const limit = 10;
module.exports.none = function (pageNum, sortBy, res){
    SKU.find({}, null, {skip: (pageNum-1)*limit, sort: sortBy}, (err, results) => {
        if(err){
            res.json({success: false, message: err});
        }else{
            pagination.paginate(results, pageNum, limit, res);
        }

    });
};

module.exports.keywords = function (pageNum, sortBy, keywords, res){
    SKU.find({$or:[
        {name: {$all: keywords}},
        {size: {$all: keywords}},
        {comment: {$all: keywords}}]}, null, {skip: (pageNum-1)*limit, sort: sortBy}, (err, results) => {
        if(err){
            res.json({success: false, message: err});
        }else{
            pagination.paginate(results, pageNum, limit, res);
            // callback(results)
        }

    });
};

module.exports.ingredients = function (pageNum, sortBy, ingredients, res){
    SKU.find({'ingredients.ingredient_name': {$all: ingredients}}, null, {skip: (pageNum-1)*limit, sort: sortBy}, (err, results) => {
        if(err){
            res.json({success: false, message: err});
        }else{
            pagination.paginate(results, pageNum, limit, res);
            // callback(results);
        }

    });
};

module.exports.productLines = function (pageNum, sortBy, product_lines, res){
    SKU.find({product_line: {$all: product_lines}}, null, {skip: (pageNum-1)*limit, sort: sortBy}, (err, results) => {
        if(err){
            res.json({success: false, message: err});
        }else{
            pagination.paginate(results, pageNum, limit, res);
            // callback(results);
        }

    });
};

module.exports.keywordsandIngredients = function (pageNum, sortBy, keywords, ingredients, res){
    SKU.find({'ingredients.ingredient_name': {$all: ingredients},       
        $or:[
            {name: {$all: keywords}},
            {size: {$all: keywords}},
            {comment: {$all: keywords}}],
        }, null, {skip: (pageNum-1)*limit, sort: sortBy}, (err, results) => {
        if(err){
            res.json({success: false, message: err});
        }else{
            console.log(results)
            pagination.paginate(results, pageNum, limit, res);
            // callback(results)
        }

    });
};

module.exports.keywordsandLines = function (pageNum, sortBy, keywords, product_lines, res){
    SKU.find({product_line: {$all: product_lines},
        $or:[
            {name: {$all: keywords}},
            {size: {$all: keywords}},
            {comment: {$all: keywords}}]
        }, null, {skip: (pageNum-1)*limit, sort: sortBy}, (err, results) => {
        if(err){
            res.json({success: false, message: err});
        }else{
            pagination.paginate(results, pageNum, limit, res);
            // callback(results)
        }

    });
};

module.exports.ingredientsandLines = function (pageNum, sortBy, ingredients, product_lines, res){
    SKU.find({'ingredients.ingredient_name': {$all: ingredients},
        product_line: {$all: product_lines}}, null, {skip: (pageNum-1)*limit, sort: sortBy}, (err, results) => {
        if(err){
            res.json({success: false, message: err});
        }else{
            pagination.paginate(results, pageNum, limit, res);
            // callback(results)
        }

    });
};

module.exports.all = function (pageNum, sortBy, keywords, ingredients, product_lines, res){
    SKU.find({'ingredients.ingredient_name': {$all: ingredients},
        product_line: {$all: product_lines},
        $or:[
            {name: {$all: keywords}},
            {size: {$all: keywords}},
            {comment: {$all: keywords}}]
        }, null, {skip: (pageNum-1)*limit, sort: sortBy}, (err, results) => {
        if(err){
            res.json({success: false, message: err});
        }else{
            pagination.paginate(results, pageNum, limit, res);
            // callback(results)
        }

    });
};

module.exports.filter = (pageNum, sortBy, keywords, ingredients, product_lines, res) => {
    SKU.find({      
        product_line: {$all: product_lines},
        'ingredients.ingredient_name': {$all: ingredients},
        $or:[
            {name: {$all: keywords}},
            {size: {$all: keywords}},
            {comment: {$all: keywords}}]
    }, null, {skip: (pageNum-1)*limit, sort: sortBy}, (err, results) => {
        if(err){
            res.json({success: false, message: err});
        }else{
            pagination.paginate(results, pageNum, limit, res);
        }
    });
};
