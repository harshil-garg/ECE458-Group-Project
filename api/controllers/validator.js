const Ingredient = require('../model/ingredient_model');
const SKU = require('../model/sku_model');
const ManufacturingGoal = require('../model/manufacturing_goal_model');
const Units = require('../controllers/units');

module.exports.compileErrors = function(){
    let errors = [];
    for(let arg of arguments){
        //arg[0] contains the boolean value of iff the test passed
        if(!arg[0]){
            //arg[1] contains the error messages
            errors = errors.concat(arg[1]);
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

module.exports.validActivity = async function(activity){
    let err_msg;
    let sku = await SKU.findOne({number: activity.sku}).exec();
    let goal = await ManufacturingGoal.findOne({name: activity.manufacturing_goal}).exec();

    if(!sku){
        err_msg = `SKU ${activity.sku} doesn't exist`;
        return [false, err_msg];
    }
    if(!goal){
        err_msg = `Manufacturing goal ${activity.manufacturing_goal} doesn't exist`;
        return [false, err_msg];
    }
    let valid = false;
    err_msg = 'Invalid activity';
    for(let tuple of goal.sku_tuples){
        if(tuple.sku.equals(sku._id)){
            valid = true;
        }
    }
    return [valid, err_msg, sku._id, goal._id];
}

// Dependency checks
module.exports.itemExists = async function(model, item) {
    let result = await model.findOne({$or: [{name: item}, {number: item}, {shortname: item}]}).exec();    
    let err_msg = `${model.modelName} doesn't exist`;

    if(!result){
        return [!(!result), err_msg];
    }else{
        return [!(!result), err_msg, result._id];
    }   
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

module.exports.objectFieldsExist = function(obj, requiredFields){
    let errors = [];
    for(let field of requiredFields){
        if(!(field in obj)){
            errors.push(`Please fill in ${field}`);
        }
    }

    return [errors.length == 0, errors];
}

const first_digit = new Set(['0', '1', '6', '7', '8', '9']);

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
function generateUPCNumbers(){
    for(let i = 100000000000; i < 200000000000; i++){
        if(this.isUPCStandard(i.toString())[0]){
            console.log(i)
        }
    }
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

//is product line in use by a sku
module.exports.productLineClear = async function(id) {
    let err_msg = `Product Line is in use`;
    let result = await SKU.findOne({product_line: id}).exec();
    return [!result, err_msg]; //if clear then there will be no result, thus !result will be true
};

module.exports.formulaClear = async function(id) {
    let err_msg = `Formula is in use`;
    let result = await SKU.findOne({formula: id}).exec();
    return [!result, err_msg]; //if clear then there will be no result, thus !result will be true
};

module.exports.validDate = function(date){
    let err_msg = 'Invalid date';
    let dateobj = new Date(date);

    return [isNaN(dateobj), err_msg, dateobj];
}

module.exports.isNumeric = function(number){
    let err_msg = `${number} is not numeric`;
    return [!isNaN(number), err_msg];
}

//Only for ingredients, skus, and product_lines
module.exports.conflictCheck = async function(model, data, results, type){
    let unique_keys = {};
    let properties = [];
    for(let field of Object.keys(model.schema.obj)){
        if(field.unique){
            unique_keys[field] = field;
        }
        properties.push(field);
    }

    duplicateCheck(unique_keys, data, results, type);

    for(let row of data){
        let key = getPrimaryKey(model)
        let item = await model.findOne({[key]: row[key]}).exec();

        if(item){
            //check identical
            let identical = true;
            for(let property of properties){
                identical = identical && row[property] == item[property]
            }
            //check unique match
            let unique_match = false;
            for(let property of Object.keys(unique_keys)){
                if(property != key && row[property] == item[property]){
                    unique_match = true;
                    break;
                }
            }


            //If row is identical to something in db, ignore
            if(identical){
                results[type].ignorelist.push(row);
            }
            
            else if(unique_match){

            }
        }

        
    }
    
    if(unique_keys.length > 1){
        // if()
    }else{

    }


}

function getPrimaryKey(model){
    if(model.name == 'ProductLine'){
        return 'name';
    }
    return 'number';
}

function duplicateCheck(unique_keys, data, results, type){
    let unique_key_sets = {}
    //create a set for every unique key to check for duplicates
    for(let key of Object.keys(unique_keys)){
        unique_key_sets[key] = new Set();
    }

    for(let row of data){
        for(let field of Object.keys(unique_key_sets)){
            if(unique_key_sets[field].has(row[field])){
                results[type].errorlist.push({
                    message: 'Duplicate row in SKUs',
                    data: row
                });
                return;
            }else{
                unique_key_sets[field].add(row[field]);
            }
        }
    }
}