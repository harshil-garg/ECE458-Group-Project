const express = require('express');
const router = express.Router();
const Ingredient = require('../model/ingredient_model');
const SKU = require('../model/sku_model');

let limit = 10;
//Get initial documents
//request params: sortBy, pageNum
router.post('/all', (req, res) => {
    const { sortBy, pageNum } = req.body;

    //check fields completed
    if(!sortBy || !pageNum){
        res.send('Please fill in all fields');
    }

    Ingredient.find({}, null, {skip: (pageNum-1)*limit, limit: limit, sort: sortBy}, (err, ingredients) => {
        if((pageNum-1)*limit >= ingredients.length){
            res.send('Page does not exist');
        }else{
            res.json({data: ingredients});
        }
        
    });
        
});

//Sort ingredients
router.post('/sort', (req, res) => {
    const { sortBy, pageNum, direction } = req.body;

    //check fields completed
    if(!sortBy || !pageNum || !direction){
        res.send('Please fill in all fields');
    }

    //find from already filtered results
});

//Filter ingredients
//request params: sortBy, pageNum, keywords, skus
router.post('/filter', (req, res) => {
    const { pageNum, keywords, skus } = req.body;

    //check fields completed
    if(!pageNum || !keywords || !skus){
        res.send('Please fill in all fields');
        return;
    }

    let key_exps = keywords.map((keyword) => {
        return new RegExp(keyword, 'i');
    });

    //find all ingredients containing any of the keywords

    let union = [];
    // for(let exp of key_exps) {
        Ingredient.find({$or:[
            {name: exp},
            {number: exp},
            {vendor_info: exp},
            {package_size: exp},
            {cost: exp},
            {comment: /good/i}
        ]}, (err, ingredients) => {
            union.concat(ingredients);
            console.log(ingredients);
        });
    // }
    //res.json({data: union});

    // Ingredient.find({$or:[
    //     {name: {$in: key_exps}}, 
    //     {number: {$in: key_exps}},
    //     {vendor_info: {$in: key_exps}},
    //     {package_size: {$in: key_exps}},
    //     {cost: {$in: key_exps}},
    //     {comment: {$in: key_exps}}]
    // }, (err, ingredients) => {
    //     res.json({data: ingredients});
    // });

    // Ingredient.find({comment: {$in: key_exps}}, (err, ingredients) => {
    //     res.json({data: ingredients});
    // })

    //get all ingredients with given SKUs
    // SKU.find({name: {$in: skus}}, ingredients, (err, ingredients) => {
    //     res.json({data: ingredients});
    // });

    //intersection of results
    
});

//Add ingredient
router.post('/add', (req, res) => {
    const { name, number, vendor_info, package_size, cost, comment } = req.body;
    //check fields completed
    if(!name || !number || !package_size || !cost){
        res.send('Please fill in all fields');
    }

    let ingredient = new Ingredient({name, number, vendor_info, package_size, cost, comment});
    Ingredient.addIngredient(ingredient, (err) => {
        if(err) {
            res.json({success: false, message: `Failed to create a new ingredient. Error: ${err}`});

        }else
            res.json({success:true, message: "Added successfully."});

    });

});

//Remove ingredient
//request params: name
router.post('/remove', (req, res) => {
    const name = req.body.name;
    Ingredient.removeIngredient(name, (err) => {
        if(err) {
            res.json({success: false, message: `Failed to remove ingredient. Error: ${err}`});

        }else
            res.json({success:true, message: "Removed successfully."});

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

        }else
            res.json({success:true, message: "Updated successfully."});

    });
});

module.exports = router;