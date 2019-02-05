const express = require('express');
const router = express.Router();
const Ingredient = require('../model/ingredient_model');
const SKU = require('../model/sku_model');
const ingredient_filter = require('../controllers/ingredient_filter');
const Validator = require('../controllers/ingredient_validation');
const autocomplete = require('../controllers/autocomplete');

//Autocomplete
router.post('/autocomplete', (req, res) => {
    const input = req.body.input;
    autocomplete.skus(SKU, input, res);
});

//Filter ingredients
//request params: sortBy, direction, pageNum, keywords, skus
router.post('/filter', async (req, res) => {
    const { sortBy, pageNum, keywords, skus } = req.body;

    //check fields completed
    if(!sortBy || !pageNum || !keywords || !skus){
        res.json({success: false, message: "Please fill in all fields"});
        return;
    }

    let key_exps = keywords.map((keyword) => {
        return new RegExp(keyword, 'i');
    });

    //No filter, return all
    if(keywords.length == 0 && skus.length == 0){
        ingredient_filter.none(pageNum, sortBy, res);
    }
    //Keywords no SKUs
    else if(skus.length == 0){
        ingredient_filter.keywords(pageNum, sortBy, key_exps, res);
    }
    //SKUs no keywords
    else if(keywords.length == 0){
        //get all ingredients with given SKUs
        let skuList = await SKU.find({name: {$in: skus}}, 'ingredients.ingredient_name').exec((err, results) => {
            return results;
        });

        ingredient_filter.skus(pageNum, sortBy, skuList, res);
    }
    //Keywords and SKUs
    else{
        let skuList = await SKU.find({name: {$in: skus}}, 'ingredients.ingredient_name').exec((err, results) => {
            return results;
        });
        
        ingredient_filter.keywordsAndSkus(pageNum, sortBy, key_exps, skuList, res);
    }
});

//CREATE
router.post('/create', (req, res) => {
    const { name, number, vendor_info, package_size, cost, comment } = req.body;

    // var validation = Validator.create(name, number, package_size, cost);
    // if (!validation.success) {
    //     res.json(validation);
    // }

    let rounded_cost = cost.toFixed(2);
    //Autogen number logic
    if (number) {
        create_ingredient(res, name, number, vendor_info, package_size, rounded_cost, comment);
    } else {
        create_ingredient_number(function(id) {
            return create_ingredient(res, name, id, vendor_info, package_size, rounded_cost, comment);
        });
    }
});

function create_ingredient(res, name, number, vendor_info, package_size, cost, comment) {
    let ingredient = new Ingredient({name, number, vendor_info, package_size, cost, comment});
    Ingredient.createIngredient(ingredient, (error) => {
        if (error) {
            res.json({success: false, message: `Failed to create a new ingredient. Error: ${error}`});
        } else{
            res.json({success: true, message: "Added successfully."});
        }
    });
}

function create_ingredient_number(callback) {
    Ingredient.find().sort({number: 1}).collation({locale: "en_US", numericOrdering: true}).exec(function(error, ingredients) {
        if (error) return error;
        return callback(smallest_missing_number(ingredients, 0, ingredients.length - 1));
    })
}

function smallest_missing_number(ingredients, lo, hi) {
    if (lo > hi)
        return lo + 1;
    let mid =  Math.floor(lo + (hi - lo) / 2);

    if (ingredients[mid].number == mid+1) {
        return smallest_missing_number(ingredients, mid + 1, hi);
    } else {
        return smallest_missing_number(ingredients, lo, mid - 1);
    }
}

// TODO: READ (SEARCH)

// UPDATE
router.post('/update', (req, res) => {
    const { name, newname, number, vendor_info, package_size, cost, comment } = req.body;

    // var validation = Validator.update(number, cost);
    // if (!validation.success) {
    //     res.json(validation);
    // }

    var json = {};

    if (newname) {
        json["name"] = newname;
    }
    if (number) {
        json["number"] = number;
    }
    if (vendor_info) {
        json["vendor_info"] = vendor_info;
    }
    if (package_size) {
        json["package_size"] = package_size;
    }
    if (cost) {
        json["cost"] = cost;
    }
    if (comment) {
        json["comment"] = comment;
    }

    Ingredient.updateIngredient(name, json, (error) => {
        if (error) {
            res.json({success: false, message: `Failed to update ingredient. Error: ${error}`});
        } else {
            res.json({success: true, message: "Updated successfully."});
        }
    });
});

// DELETE
router.post('/delete', (req, res) => {
    const name = req.body.name;
    Ingredient.deleteIngredient(name, (error, result) => {
        if (error) {
            res.json({success: false, message: `Failed to delete ingredient. Error: ${error}`});
        } else if(result.deletedCount == 0){
            res.json({success: false, message: 'Ingredient does not exist to delete'});
        } else {
            res.json({success: true, message: "Removed successfully."});
        }
    });
});

module.exports = router;
