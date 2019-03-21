const express = require('express');
const router = express.Router();
const Formula = require('../model/formula_model');
const Ingredient = require('../model/ingredient_model');
const generator = require('../controllers/autogen');
const validator = require('../controllers/validator');
const formula_validator = require('../controllers/formula_validator');
const formula_filter = require('../controllers/formula_filter');
const autocomplete = require('../controllers/autocomplete');
const Units = require('../controllers/units');

//Autocomplete 
router.post('/autocomplete', async (req, res) => {
    const {input} = req.body;
    const required_params = {input};
    
    let results = await autocomplete.nameOrNumber(Formula, input);
    res.json({success: true, data: results});
});

//Filter
router.post('/filter', async (req, res) => {
    const { sortBy, pageNum, page_size, keywords, ingredients } = req.body;
    const required_params = { sortBy, pageNum, keywords, ingredients };

    let key_exps;
    key_exps = keywords.map((keyword) => {
        return new RegExp(keyword, 'i');
    });
    
    let result = await formula_filter.filter(pageNum, sortBy, page_size, key_exps, ingredients);
    
    res.json(result);
});

//Create
router.post('/create', async (req, res) => {
    const {name, number, ingredient_tuples, comment} = req.body;

    if(number){
        try{
            await this.createFormula(name, number, ingredient_tuples, comment, res);
            res.json({success: true, message: 'Created successfuly'});
        }catch(err){
            console.log(err)
            res.json({success: false, message: err.toString()});
        }
        
    }else{
        let gen_number = await generator.autogen(Formula);
        await this.createFormula(name, gen_number, ingredient_tuples, comment, res)
        .then(() => {
            res.json({success: true, message: 'Created successfuly'});
        })
        .catch((err) => {
            // console.log(err)
            res.json({success: false, message: err.toString()});
        })
    }


});

//Update
router.post('/update', async (req, res) => {
    const { name, number, newnumber, ingredient_tuples, comment} = req.body;

    let json = {};

    if (name != undefined && name != NaN) {
        name_passed = validator.proper_name_length(name);
        if(!name_passed[0]){
            res.json({success: false, message: name_passed[1]});
            return;
        }
        json["name"] = name;
    }
    if(newnumber != undefined && newnumber != NaN){
        let num_numeric = validator.isNumeric(newnumber);
        if(!num_numeric[0]){
            res.json({success: false, message: num_numeric[1]});
            return;
        }else{
            let num_positive = validator.isPositive(newnumber, 'Number');
            if(!num_positive[0]){
                res.json({success: false, message: num_positive[1]});
                return;
            }
        }
        json["number"] = newnumber;
    }
    if(ingredient_tuples != undefined && ingredient_tuples != NaN){
        let valid_tuples = [];
        let valid_quantities = [];
        let positive_quantities = [];
        let valid_units = [];
        let ingredient_set = new Set();
        for(let tuple of ingredient_tuples){
            if(ingredient_set.has(tuple.ingredient)){
                continue;
            }
            ingredient_set.add(tuple.ingredient)
            valid_tuples.push(await formula_validator.validIngredientTuple(Ingredient, tuple.ingredient, tuple.unit));
            valid_quantities.push(validator.isNumeric(tuple.quantity));
            positive_quantities.push(validator.isPositive(tuple.quantity));
            valid_units.push(Units.validUnit(tuple.unit));
        }
        let errors = validator.compileErrors(...valid_tuples, ...valid_quantities, ...positive_quantities);

        if(errors.length > 0){
            res.json({success: false, message: errors});
            return;
        }
        for(let valid of valid_units){
            if(!valid){
                res.json({success: false, message: 'Invalid unit'});
                return;
            }
        }
        //change from ingredient name to id
        for(let i = 0; i < valid_tuples.length; i++){
            ingredient_tuples[i]['ingredient'] = valid_tuples[i][2]; //id of ingredient
        }
        json["ingredient_tuples"] = ingredient_tuples;
    }
    if(comment != undefined && comment != NaN){
        json["comment"] = comment;
    }

    Formula.findOneAndUpdate({number: number}, json, (err) => {
        if (err) {
            res.json({success: false, message: `Failed to update formula. Error: ${err}`});
        } else {
            res.json({success: true, message: "Updated successfully."});
        }
    })
});

//Delete
router.post('/delete', async (req, res) => {
    const { number } = req.body;

    let formula = await Formula.findOne({number: number}).exec();
    let formula_passed = await formula_validator.formulaClear(formula._id);

    if(!formula_passed[0]){
        res.json({success: false, message: formula_passed[1]});
        return;
    }

    Formula.deleteOne({number: number}, (err, result) => {
        if(err) {
            res.json({success: false, message: `Failed to delete formula. Error: ${err}`});
        }else if(!result || result.deletedCount == 0){
            res.json({success: false, message: 'Formula does not exist to delete'});
        }else{
            res.json({success: true, message: "Deleted successfully."});
        }
    });
});

module.exports.createFormula = async function(name, number, ingredient_tuples, comment, res){
    let name_passed = validator.proper_name_length(name);
    let num_numeric = validator.isNumeric(number);
    let num_positive = validator.isPositive(number, 'Number');

    //Check if given ingredients exist and have valid units
    let valid_tuples = [];
    let valid_quantities = [];
    let positive_quantities = [];
    let valid_units = [];
    let ingredient_set = new Set();
    for(let tuple of ingredient_tuples){
        if(ingredient_set.has(tuple.ingredient)){
            continue;
        }
        ingredient_set.add(tuple.ingredient)
        valid_tuples.push(await formula_validator.validIngredientTuple(Ingredient, tuple.ingredient, tuple.unit));
        valid_quantities.push(validator.isNumeric(tuple.quantity));
        positive_quantities.push(validator.isPositive(tuple.quantity));
        valid_units.push(Units.validUnit(tuple.unit));
    }

    let errors = validator.compileErrors(name_passed, num_numeric, num_positive, ...valid_tuples, ...valid_quantities, ...positive_quantities);

    if(errors.length > 0){
        throw(errors);
    }
    for(let valid of valid_units){
        if(!valid){
            throw('Invalid unit')
        }
    }
    //change from ingredient name to id
    for(let i = 0; i < valid_tuples.length; i++){
        ingredient_tuples[i]['ingredient'] = valid_tuples[i][2]; //id of ingredient
    }
    // console.log(formula)
    const formula = new Formula({name, number, ingredient_tuples, comment});
    return await Formula.create(formula)
}

module.exports.router = router;