const Formula = require('../model/formula_model');
const Ingredient = require('../model/ingredient_model');
const Units = require('../controllers/units');
const autogen = require('../controllers/autogen');


module.exports.validIngredientTuple = async function(ingredient_name, unit){
    let err_msg;

    //check ingredients exist
    let ingredient = await Ingredient.findOne({name: ingredient_name}).exec();
    if(!ingredient){
        err_msg = `Ingredient ${ingredient_name} doesn't exist`;
        return [false, err_msg];
    }

    //check valid quantity units
    else if(Units.category(ingredient.unit) != Units.category(unit)){
        err_msg = `Unit of ${ingredient_name} must be of same type as ingredient`;
        return [false, err_msg];
    }else{
        return [true, err_msg, ingredient._id];
    }
}

function pairListHas(list, number, ingredient) {
    list.forEach((entity) => {
      if (entity.number == number && entity.ingredient == ingredient) {
        return true;
      }
    });
    return false;
}

module.exports.duplicateCheck = function(formulas, results){
    let pairList = [];

    for(let formula of formulas){
        if(pairListHas(pairList, formula.number, formula.ingredient)){
            results.formulas.errorlist.push({
                message: 'Duplicate row in formulas',
                data: row
            });
        }else{
            pairList.push({ number: formula.number, ingredient: formula.ingredient });
        }
    }
}

function createNewFormula(number, name, ingredient_tuples, comment){
    return {
        number: number,
        name: name,
        ingredient_tuples: ingredient_tuples,
        comment: comment
    }
}

module.exports.conflictCheck = async function(formulas, results){
    let past_formulas = new Set();
    let current_number, current_name, current_comment;
    let ingredient_tuples = [];
    
  
    for(let formula of formulas){
        let primary_match = await Formula.findOne({number: formula.number}).exec();
        let matches = await Formula.find({$or: [{number: formula.number}, {name: formula.name}]}).exec();


        //Check to autogen number
        if(!formula.number){
            formula.number = await autogen.autogen(Formula);
        } 

        //first line
        if(formula.number != current_number){
            past_formulas.add(current_number)

            //push to changelist
            let newObj = createNewFormula(current_number, current_name, ingredient_tuples, current_comment);
            if(primary_match){
                results.formulas.changelist.push(newObj);
            }else{
                results.formulas.createlist.push(newObj);
            }

            current_number = formula.number;
            current_name = formula.name;
            current_comment = formula.comment;
        }else{ //consecutive lines
            if(formula.name != current_name){
                results.formulas.errorlist.push({
                    message: `Name ${formula.name} does not match name ${current_name} for formula ${current_number}`,
                    data: row
                });
            }
            if(past_formulas.has(current_number)){
                results.formulas.errorlist.push({
                    message: `Formula ${current_number} not consecutive with other formulas of the same number`,
                    data: row
                });
            }
            if(matches.length > 1){
                results.formulas.errorlist.push({
                    message: 'Ambiguous record',
                    data: row
                });
            }else if(matches.length == 1){
                if(!matches[0].equals(primary_match)){
                    results.formulas.errorlist.push({
                        message: 'Ambiguous record',
                        data: row
                    });
                } 
            }else{
                let tuple = {
                    ingredient: formula.ingredient,
                    quantity: formula.quantity,
                    unit: formula.unit
                }
                ingredient_tuples.push(tuple);

                //At the end 
                if(formula.equals(formulas.pop())){
                    let newObj = createNewFormula(current_number, current_name, ingredient_tuples, current_comment);
                    if(primary_match){
                        results.formulas.changelist.push(newObj);
                    }else{
                        results.formulas.createlist.push(newObj);
                    }
                }
                
            } 
        }
    }
}

module.exports.formulaClear = async function(id) {
    let err_msg = `Formula is in use`;
    let result = await SKU.findOne({formula: id}).exec();
    return [!result, err_msg]; //if clear then there will be no result, thus !result will be true
};