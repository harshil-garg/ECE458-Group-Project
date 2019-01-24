const express = require('express');
const router = express.Router();
const Ingredient = require('../model/ingredient_model');
const SKU = require('../model/sku_model');
const Validator = require('../model/ingredient_validation');

let limit = 10;

//Filter ingredients
//request params: sortBy, direction, pageNum, keywords, skus
router.post('/filter', (req, res) => {
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
        Ingredient.find({}, null, {skip: (pageNum-1)*limit, limit: limit, sort: sortBy}, (err, ingredients) => {
            if(err){
                res.json({success: false, message: err});
            }else{
                let pages = Math.ceil(ingredients.length/limit);
                res.json({success: true,
                    data: ingredients,
                    pages: pages});
            }
            
        });
    }
    //Keywords no SKUs
    else if(skus.length == 0){
        //find all ingredients containing any of the keywords
        Ingredient.find({$or:[
            {name: {$in: key_exps}}, 
            {number: {$in: key_exps}},
            {vendor_info: {$in: key_exps}},
            {package_size: {$in: key_exps}},
            {cost: {$in: key_exps}},
            {comment: {$in: key_exps}}]
        }, null, {skip: (pageNum-1)*limit, limit: limit, sort: sortBy}, (err, ingredients) => {
            if(err){
                res.json({success: false, message: err});
            }else{
                let pages = Math.ceil(ingredients.length/limit);
                res.json({success: true,
                    data: ingredients,
                    pages: pages});
            }
        });
    }
    //SKUs no keywords
    else if(keywords.length == 0){
        //get all ingredients with given SKUs
        SKU.find({name: {$in: skus}}, 'ingredients.ingredient_name', (err, skus) => {
            if(err){
                res.json({success: false, message: err});
            }else{
                let ingredient_names = new Set();
                for(let sku of skus){
                    for(let ingredient of sku.ingredients){
                        ingredient_names.add(ingredient.ingredient_name);
                    }
                }
                let names = Array.from(ingredient_names);

                //find ingredients with given names
                Ingredient.find({name: {$in: names}}, null, 
                    {skip: (pageNum-1)*limit, limit: limit, sort: sortBy}, (err, ingredients) => {
                    if(err){
                        res.json({success: false, message: err});
                    }else{
                        let pages = Math.ceil(ingredients.length/limit);
                        res.json({success: true,
                            data: ingredients,
                            pages: pages});
                    }
                })
            }
            
        });
    }
    //Keywords and SKUs
    else{
        SKU.find({name: {$in: skus}}, 'ingredients.ingredient_name', (err, skus) => {
            if(err){
                res.json({success: false, message: err});
            }else{
                let ingredient_names = new Set();
                for(let sku of skus){
                    for(let ingredient of sku.ingredients){
                        ingredient_names.add(ingredient.ingredient_name);
                    }
                }
                let names = Array.from(ingredient_names);

                //find ingredients with given names
                Ingredient.find({name: {$in: names},
                    $or:[
                        {name: {$in: key_exps}}, 
                        {number: {$in: key_exps}},
                        {vendor_info: {$in: key_exps}},
                        {package_size: {$in: key_exps}},
                        {cost: {$in: key_exps}},
                        {comment: {$in: key_exps}}]
                }, null, 
                    {skip: (pageNum-1)*limit, limit: limit, sort: sortBy}, (err, ingredients) => {
                    if(err){
                        res.json({success: false, message: err});
                    }else{
                        let pages = Math.ceil(ingredients.length/limit);
                        res.json({success: true,
                            data: ingredients,
                            pages: pages});
                    }
                })
            }
            
        });
    }

});

//Add ingredient
router.post('/add', (req, res) => {
    const { name, number, vendor_info, package_size, cost, comment } = req.body;
    
    var validation = Validator.add(name, number, package_size, cost);
    if (!validation.success) {
        res.json(validation);
    }

    if (number) {
        add_ingredient(res, name, number, vendor_info, package_size, cost, comment);
    } else {
        create_ingredient_number(function(id) {
            return add_ingredient(res, name, id, vendor_info, package_size, cost, comment);
        });
    }
});

function add_ingredient(res, name, number, vendor_info, package_size, cost, comment) {
    let ingredient = new Ingredient({name, number, vendor_info, package_size, cost, comment});
    console.log(ingredient);
    Ingredient.addIngredient(ingredient, (error) => {
        if (error) {
            console.log(error);
            res.json({success: false, message: "Failed to create a new ingredient. Error: ${err}"});

        } else{
            res.json({success:true, message: "Added successfully."});
        }
    });
}

function create_ingredient_number(callback) {
    Ingredient.find().sort({number: 1}).collation({locale: "en_US", numericOrdering: true}).exec(function(error, ingredients) {
        if (error) return error;
        return callback(smallest_missing_number(ingredients, 0, ingredients.length));
    })
}

function smallest_missing_number(ingredients, lo, hi) {
    if (lo > hi)
        return lo+1;
    let mid =  Math.floor(lo + (hi - lo) / 2);

    if (ingredients[mid] == mid+1) {
        return smallest_missing_number(ingredients, mid + 1, hi);
    } else {
        return smallest_missing_number(ingredients, lo, mid - 1);
    }
}

//Remove ingredient
//request params: name
router.post('/remove', (req, res) => {
    const name = req.body.name;
    Ingredient.removeIngredient(name, (err) => {
        if(err) {
            res.json({success: false, message: `Failed to remove ingredient. Error: ${err}`});

        }else{
            res.json({success: true, message: "Removed successfully."});
        }
    });
});

//Edit ingredient
router.post('/edit', (req, res) => {
    const { name, number, vendor_info, package_size, cost, comment } = req.body;

    Ingredient.updateIngredient(name, {
        name: name,
        number: number, 
        vendor_info: vendor_info,
        package_size: package_size,
        cost: cost, 
        comment: comment
    }, (err) => {
        if(err) {
            res.json({success: false, message: `Failed to update ingredient. Error: ${err}`});

        }else{
            res.json({success:true, message: "Updated successfully."});
        }
    });
});

module.exports = router;