const express = require('express');
const router = express.Router();
const Ingredient = require('../model/ingredient');

let limit = 10;
//Get initial documents
//request params: sortBy, pageNum
router.post('/all/', (req, res) => {
    const { sortBy, pageNum } = req.body;

    //check fields completed
    if(!sortBy || !pageNum){
        res.send('Please fill in all fields');
    }

    Ingredient.find({}, null, {skip: (pageNum-1)*limit, limit: limit, sort: sortBy}, (err, users) => {
        if((pageNum-1)*limit >= users.length){
            res.send('Page does not exist');
        }else{
            res.json({data: users});
        }
        
    });
        
});

//Filter ingredients
//request params: pageNum, keywords, skus
router.post('/filter', (req, res) => {

});

//Add ingredient
router.post('/add', (req, res) => {
    const { name, number, vendor_info, package_size, cost, comment } = req.body;
    //check fields completed
    if(!name || !number || !package_size || !cost){
        res.send('Please fill in all fields');
    }

    let ingredient = new Ingredient({name, number, vendor_info, package_size, cost, comment});

});

//Remove ingredient
router.post('/remove', (req, res) => {
    
});