const utils = require('../utils/utils');

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

// Dependency checks
module.exports.itemExists = async function(model, item) {
    let results = [];
    let cursor = await model.aggregate([{$addFields: {num2str: {'$toLower' : '$number'}}}]).match({$or: [{num2str: item}, {name: item}, {shortname: item}]}).cursor({}).exec();
    await cursor.eachAsync((row) => {
        results.push(row);
    }); 
    let err_msg = `${model.modelName} doesn't exist`;

    if(results.length == 0){
        return [false, err_msg];
    }else{
        return [true, err_msg, results[0]._id];
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

module.exports.validDate = function(date){
    let err_msg = 'Invalid date';
    let dateobj = new Date(date);

    return [isNaN(dateobj), err_msg, dateobj];
}

module.exports.isNumeric = function(number){
    let err_msg = `${number} is not numeric`;
    return [!isNaN(number), err_msg];
}

function getProperties(model){
    let unique_keys = [];
    let properties = [];
    for(let field of Object.keys(model.schema.obj)){
        if(model.schema.obj[field].unique){
            unique_keys.push(field);
        }
        properties.push(field);
    }
    return [unique_keys, properties]
}

//Only for ingredients, skus, and product_lines
module.exports.conflictCheck = async function(model, data, data_csv, results, type){
    let [unique_keys, properties] = getProperties(model);

    for(let [row, row_csv] of utils.zip(data, data_csv)){
        let primary_key = getPrimaryKey(model)
        let primary_match = await model.findOne({[primary_key]: row[primary_key]}).exec();
        
        let pipeline = []
        let matches = [];
        for(let key of unique_keys){
            pipeline.push({[key]: row[key]})
        }
        matches = await model.find({$or: pipeline});

        if(matches.length > 1){
            results[type].errorlist.push({
                message: 'Ambiguous record',
                data: row_csv
            });
        }
        if(matches.length == 1){
            if(!matches[0].equals(primary_match)){
                results[type].errorlist.push({
                    message: 'Ambiguous record',
                    data: row_csv
                });
            }
        }
        if(primary_match){
            //check identical
            let identical = true;
            for(let property of properties){
                if(property == 'num_skus'){
                    continue;
                }

                identical = identical && row[property].toString() == primary_match[property].toString()                
            }
            
            //If row is identical to something in db, ignore
            if(identical){
                results[type].ignorelist.push(row_csv);
            }else{
                results[type].changelist.push(row_csv);
                results[type].changelist_model.push(row);
            }

        }else{
            results[type].createlist.push(row_csv);
            results[type].createlist_model.push(row);
        }
    }
}

function getPrimaryKey(model){
    if(model.modelName == 'ProductLine'){
        return 'name';
    }
    return 'number';
}

module.exports.duplicateCheck = (model, data, data_csv, results, type) => {
    let unique_key_sets = {}
    let [unique_keys, properties] = getProperties(model)
    //create a set for every unique key to check for duplicates
    for(let key of unique_keys){
        unique_key_sets[key] = new Set();
    }

    for(let [row, row_csv] of utils.zip(data, data_csv)){
        for(let field of Object.keys(unique_key_sets)){
            if(unique_key_sets[field].has(row[field])){
                results[type].errorlist.push({
                    message: 'Duplicate row in SKUs',
                    data: row_csv
                });
                return;
            }else{
                unique_key_sets[field].add(row[field]);
            }
        }
    }
}
