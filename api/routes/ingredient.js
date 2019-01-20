const express = require('express');
const router = express.Router();
const Ingredient = require('../model/ingredient');

let limit = 10;
//Get initial documents
router.post('/all/', (req, res) => {
    const {sortBy, pageNum } = req.body;

    //check fields completed
    if(!sortBy || !pageNum){
        res.send('Please fill in all fields');
    }
    let query = Ingredient.find({}, {skip: pageNum*limit, limit: limit, sort: sortBy});
    console.log(query);
        
});