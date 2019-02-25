const Units = require('../controllers/units');
const autogen = require('../controllers/autogen');
const utils = require('../../utils/utils');


module.exports.validIngredientTuple = async function(model, ingredient_id, unit){
    let err_msg;

    //check ingredients exist
    let ingredient = await model.findOne({$or: [{number: ingredient_id}, {name: ingredient_id}]}).exec();
    if(!ingredient){
        err_msg = `Ingredient ${ingredient_id} doesn't exist`;
        return [false, err_msg];
    }

    //check valid quantity units
    else if(Units.category(ingredient.unit) != Units.category(unit)){
        err_msg = `Unit of ${ingredient_id} must be of same type as ingredient`;
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

module.exports.duplicateCheck = function(formulas, formulas_csv, results, type){
    let pairList = [];

    for(let [formula, formula_csv] of utils.zip(formulas, formulas_csv)){
        if(pairListHas(pairList, formula.number, formula.ingredient)){
            results[type].errorlist.push({
                message: 'Duplicate row in formulas',
                data: formula_csv
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

module.exports.conflictCheck = async function(model, formulas, formulas_csv, results, type){
    let past_formulas = new Set();
    let prev_number, prev_name, prev_comment;
    let current_number, current_name, current_comment;
    let ingredient_tuples = [];
    
  
    for(let [formula, formula_csv] of utils.zip(formulas, formulas_csv)){
        let primary_match = await model.findOne({number: formula.number}).exec();
        let matches = await model.find({$or: [{number: formula.number}, {name: formula.name}]}).exec();

        //Check to autogen number
        if(!formula.number){
            formula.number = await autogen.autogen(model);
        } 
        let atEnd = formula.number == formulas[formulas.length-1].number && formula.ingredient.equals(formulas[formulas.length-1].ingredient);

        //first line
        if(formula.number != current_number){
            let newObj;
            //At the end 
            if(atEnd){
                let tuple = {
                    ingredient: formula.ingredient,
                    quantity: formula.quantity,
                    unit: formula.unit
                }
                ingredient_tuples.push(tuple);
                newObj = createNewFormula(formula.number, formula.name, ingredient_tuples, formula.comment);
            }else{
                newObj = createNewFormula(current_number, current_name, ingredient_tuples, current_comment)
            }
            
            if(primary_match){
                results[type].changelist.push(formula_csv);
                results[type].changelist_model.push(newObj);
            }else{
                results[type].createlist.push(formula_csv);
                results[type].createlist_model.push(newObj);
            }

            current_number = formula.number;
            current_name = formula.name;
            current_comment = formula.comment;
        }else{ //consecutive lines
            console.log('consecutive')
            if(formula.name != current_name){
                results[type].errorlist.push({
                    message: `Name ${formula.name} does not match name ${current_name} for formula ${current_number}`,
                    data: formula_csv
                });
            }
            if(past_formulas.has(current_number)){
                results[type].errorlist.push({
                    message: `Formula ${current_number} not consecutive with other formulas of the same number`,
                    data: formula_csv
                });
            }
            if(matches.length > 1){
                results[type].errorlist.push({
                    message: 'Ambiguous record',
                    data: formula_csv
                });
            }else if(matches.length == 1){
                if(!matches[0].equals(primary_match)){
                    results[type].errorlist.push({
                        message: 'Ambiguous record',
                        data: formula_csv
                    });
                } 
            }else{
                let tuple = {
                    ingredient: formula.ingredient,
                    quantity: formula.quantity,
                    unit: formula.unit
                }
                ingredient_tuples.push(tuple);
                if(primary_match){
                    results[type].changelist.push(formula);
                }else{
                    results[type].createlist.push(formula);
                }

                //At the end 
                if(formula.equals(formulas.pop())){
                    let newObj = createNewFormula(current_number, current_name, ingredient_tuples, current_comment);
                    if(primary_match){
                        results[type].changelist.push(formula_csv);
                        results[type].changelist_model.push(newObj);
                    }else{
                        results[type].createlist.push(formula_csv);
                        results[type].createlist_model.push(newObj);
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