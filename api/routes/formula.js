const express = require('express');
const router = express.Router();
const Formula = require('../model/formula_model');
const Ingredient = require('../model/ingredient_model');
const generator = require('../controllers/autogen');
const validator = require('../controllers/validator');
const formula_validator = require('../controllers/formula_validator');
const formula_filter = require('../controllers/formula_filter');

//Autocomplete Ingredients
router.post('/autocomplete', async (req, res) => {
    const {input} = req.body;
    const required_params = {input};
    
    let results = await autocomplete.nameOrNumber(Ingredient, input);
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
    
    console.log(Formula.schema.obj)
    let result = await formula_filter.filter(pageNum, sortBy, page_size, key_exps, ingredients);
    
    res.json(result);
});

//Create
router.post('/create', async (req, res) => {
    const {name, number, ingredient_tuples, comment} = req.body;

    if(number){
        try{
            await createFormula(name, number, ingredient_tuples, comment, res);
            res.json({success: true, message: 'Created successfuly'});
        }catch(err){
            res.json({success: false, message: err});
        }
        
    }else{
        let gen_number = await generator.autogen(Formula);
        try{
            await createFormula(name, gen_number, ingredient_tuples, comment, res);
            res.json({success: true, message: 'Created successfuly'});
        }catch(err){
            res.json({success: false, message: err});
        }
    }


});

//Update
router.post('/update', async (req, res) => {
    const { name, number, newnumber, ingredient_tuples, comment} = req.body;

    let json = {};

    if (name) {
        name_passed = validator.proper_name_length(name);
        if(!name_passed[0]){
            res.json({success: false, message: name_passed[1]});
            return;
        }
        json["name"] = name;
    }
    if(newnumber){
        json["number"] = newnumber;
    }
    if(ingredient_tuples){
        let valid_tuples = [];
        for(let tuple of ingredient_tuples){
            valid_tuples.push(await formula_validator.validIngredientTuple(tuple.ingredient, tuple.unit));
        }
        let errors = validator.compileErrors(...valid_tuples);

        if(errors.length > 0){
            res.json({success: false, message: errors});
            return errors;
        }
        json["ingredient_tuples"] = ingredient_tuples;
    }
    if(comment){
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
        }else if(result.deletedCount == 0){
            res.json({success: false, message: 'Formula does not exist to delete'});
        }else{
            res.json({success: true, message: "Deleted successfully."});
        }
    });
});


module.exports.createFormula = async function(name, number, ingredient_tuples, comment, res){
    const required_params = { name, number, ingredient_tuples };
    let inputs_exist = validator.inputsExist(required_params);
    let name_passed = validator.proper_name_length(name);

    //Check if given ingredients exist and have valid units
    let valid_tuples = [];
    for(let tuple of ingredient_tuples){
        valid_tuples.push(await formula_validator.validIngredientTuple(tuple.ingredient, tuple.unit));
    }
    let errors = validator.compileErrors(inputs_exist, name_passed, ...valid_tuples);

    if(errors.length > 0){
        res.json({success: false, message: errors});
        return errors;
    }
    //change from ingredient name to id
    for(let i = 0; i < valid_tuples.length; i++){
        ingredient_tuples[i]['ingredient'] = valid_tuples[i][2]; //id of ingredient
    }
    const formula = new Formula({name, number, ingredient_tuples, comment});
    return Formula.create(formula);
}

module.exports.router = router;