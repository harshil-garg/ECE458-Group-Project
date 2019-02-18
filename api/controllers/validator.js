const Ingredient = require('../model/ingredient_model');
const Units = require('../controllers/units');

module.exports.compileErrors = function(){
    let errors = [];
    for(let arg of arguments){
        //arg[0] contains the boolean value of iff the test passed
        if(!arg[0]){
            //arg[1] contains the error messages
            errors.push(arg[1]);
        }
    }
    return errors;
}

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

// Dependency checks
module.exports.itemExists = async function(model, itemName) {
    let result = await model.findOne({name: itemName}).exec();    
    let err_msg = `${model.modelName} doesn't exist`;
    return [!(!result), err_msg, result._id];
}

module.exports.inputsExist = function(params){
    let errors = [];
    for(let key of Object.keys(params)){
        if(!params[key]){
            errors.push(`Please fill in ${key}`);
        }
    }

    return [errors.length == 0, errors];
}

const first_digit = new Set(['0', '1', '6', '7', '8', '9'])
// Syntax checks
module.exports.isUPCStandard = function(upc_num) {
    let err_msg;
    if(upc_num.length != 12){
        //incorrect length
        err_msg = 'Invalid UPC length';
        return [false, err_msg];
    }
    let num = Number(upc_num);
    if(isNaN(num)){
        //not a number
        err_msg = 'UPC# must be a number ';
        return [false, err_msg];
    }

    if(!first_digit.has(upc_num[0])){
        //invalid first digit
        err_msg = 'Invalid UPC first digit';
        return [false, err_msg];
    }

    //checksum
    let sum = 0;
    for(let i = 0; i < upc_num.length; i++){
        if(i % 2 == 0){
            sum += 3*Number(upc_num[i]);
        }else{
            sum += Number(upc_num[i]);
        }
    }

    if(sum % 10 != 0){
        //invalid sum
        err_msg = 'Invalid UPC sum';
        return [false, err_msg];
    }

    return [true, err_msg];

}

module.exports.proper_name_length = function(name){
    let err_msg = 'Name must be 32 characters or fewer';
    return [name.length <= 32, err_msg];
}

module.exports.proper_shortname_length = function(shortname){
    let err_msg = 'Shortname must be 5 characters or fewer';
    return [shortname.length <= 5, err_msg];
}

module.exports.isPositive = function(number, field){
    let err_msg = `${field} must be positive`;
    return [number >= 0, err_msg];
}

module.exports.roundCost = function(cost){
    return (isNaN(cost)) ? cost : Number(cost).toFixed(2); //makes sure that toFixed is not called on strings
}

module.exports.forceInteger = function(number){
    return parseInt(number);
}