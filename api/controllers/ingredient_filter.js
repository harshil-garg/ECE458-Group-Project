const mongoose = require('mongoose');
const Ingredient = require('../model/ingredient_model');
const pagination = require('/paginate');

module.exports.noFilter = function (pageNum, limit, sortBy){
    Ingredient.find({}, null, {skip: (pageNum-1)*limit, sort: sortBy}, (err, results) => {
        if(err){
            res.json({success: false, message: err});
        }else{
            pagination.paginate(results, pageNum, res);
        }

    });
};

module.exports.keywordsFilter = function (pageNum, limit, sortBy, keywords){
    Ingredient.find({$or:[
        {name: {$all: keywords}},
        {vendor_info: {$all: keywords}},
        {package_size: {$all: keywords}},
        {comment: {$all: keywords}}]
    }, null, {skip: (pageNum-1)*limit, sort: sortBy}, (err, results) => {
        if(err){
            res.json({success: false, message: err});
        }else{
            pagination.paginate(results, pageNum, res);
        }
    });
};

module.exports.skuFilter = function (model, pageNum, limit, sortBy, skus){

}