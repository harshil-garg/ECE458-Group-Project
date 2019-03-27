const Units = require('../controllers/units');
const autogen = require('../controllers/autogen');
const utils = require('../utils/utils');


module.exports.validIngredientTuple = async function(model, ingredient_id, unit){
    let err_msg;

    //check ingredients exist
    let results = [];
    let cursor = await model.aggregate([{$addFields: {num2str: {'$toLower' : '$number'}}}]).match({$or: [{num2str: ingredient_id}, {name: ingredient_id}]}).cursor({}).exec();
    await cursor.eachAsync((row) => {
        results.push(row);
    });

    if(results.length == 0){
        err_msg = `Ingredient ${ingredient_id} doesn't exist`;
        return [false, err_msg];
    }

    let ingredient = results[0];
    //check valid quantity units
    if(Units.category(ingredient.unit) != Units.category(unit)){
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
    let formula_map = new Map();
    let past_formulas = new Set();
    let prev_formula;

    for(let [formula, formula_csv] of utils.zip(formulas, formulas_csv)){
        //conflict checks
        let primary_match = await model.findOne({number: formula.number}).exec();
        let matches = await model.find({$or: [{number: formula.number}, {name: formula.name}]}).exec();
            
        if(matches.length > 1){
            results[type].errorlist.push({
                message: 'Ambiguous record',
                data: formula_csv
            });
            continue;
        }
        if(matches.length == 1){
            if(!matches[0].equals(primary_match)){
                results[type].errorlist.push({
                    message: 'Ambiguous record',
                    data: formula_csv
                });
                continue;
            } 
        }

        //ensure formulas consecutive
        if(past_formulas.has(formula.number) && formula.number != prev_formula){
            results[type].errorlist.push({
                message: `Formula ${current_number} not consecutive with other formulas of the same number`,
                data: formula_csv
            });
            continue;
        }

        let tuple = {
            ingredient: formula.ingredient,
            quantity: formula.quantity,
            unit: formula.unit
        }

        if(formula_map.has(formula.number)){
            if(formula.name != formula_map.get(formula.number)['name']){
                results[type].errorlist.push({
                    message: `Name ${formula.name} does not match name ${current_name} for formula ${current_number}`,
                    data: formula_csv
                });
                continue;
            }

            formula_map.get(formula.number)['ingredient_tuples'].push(tuple);
        }else{       
            let tuple_list = [];
            tuple_list.push(tuple);

            let formula_obj = {
                number: formula.number,
                name: formula.name,
                ingredient_tuples: tuple_list,
                comment: formula.comment
            };

            formula_map.set(formula.number, formula_obj)
        }

        if(primary_match){
            results[type].changelist.push(formula_csv);
        }else{
            results[type].createlist.push(formula_csv);
        }

        past_formulas.add(formula.number);
        prev_formula = formula.number;
    }
    for(let obj of results[type].changelist){
        console.log(obj)
    }


    if(results[type].errorlist.length == 0){
        for(let formula of formula_map.values()){
            let primary_match = await model.findOne({number: formula.number}).exec();
            if(primary_match){
                results[type].changelist_model.push(formula);
            }else{
                results[type].createlist_model.push(formula);
            }
        }
    }
}

module.exports.formulaClear = async function(id) {
    let err_msg = `Formula is in use`;
    let result = await SKU.findOne({formula: id}).exec();
    return [!result, err_msg]; //if clear then there will be no result, thus !result will be true
};
