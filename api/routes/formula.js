const express = require('express');
const router = express.Router();
const Formula = require('../model/formula_model');
const Ingredient = require('../model/ingredient_model');
const generator = require('../controllers/autogen');
const validator = require('../controllers/validator');

//Autocomplete Ingredients
router.post('/autocomplete', (req, res) => {
    const {input} = req.body;
    const required_params = {input};
    


    autocomplete.ingredients(Ingredient, input, res);
});

//Filter
router.post('/filter', (req, res) => {
    const { sortBy, pageNum, keywords, ingredients } = req.body;
    const required_params = { sortBy, pageNum, keywords, ingredients };
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
router.post('/update', (req, res) => {

});

//Delete
router.post('/delete', (req, res) => {

});


module.exports.createFormula = async function(name, number, ingredient_tuples, comment, res){
    const required_params = { name, number, ingredient_tuples };
    let inputs_exist = validator.inputsExist(required_params);

    //Check if given ingredients exist and have valid units
    let valid_tuples = [];
    for(let tuple of ingredient_tuples){
        valid_tuples.push(await validator.validIngredientTuple(tuple.ingredient, tuple.unit));
    }
    
    let errors = validator.compileErrors(inputs_exist, ...valid_tuples);

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

module.exports.updateFormula = function(){

}