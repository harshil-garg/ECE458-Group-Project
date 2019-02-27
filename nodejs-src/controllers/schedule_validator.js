const SKU = require('../model/sku_model');
const ManufacturingGoal = require('../model/manufacturing_goal_model');
const ManufacturingLine = require('../model/manufacturing_line_model');
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

module.exports.validLine = async function(sku_num, manufacturing_line){
    let err_msg;
    let sku = await SKU.findOne({number: sku_num}).exec();
    let line = await ManufacturingLine.findOne({shortname: manufacturing_line}).exec();

    if(!sku){
        err_msg = 'SKU does not exist'
        return [false, err_msg]
    }
    if(!line){
        err_msg = 'Manufacturing line doesn not exist'
        return [false, err_msg]
    }

    err_msg = 'SKU cannot be placed on this manufacturing line';
    let valid = false;
    for(let id of sku.manufacturing_lines){
        if(line._id.equals(id)){
            valid = true;
        }
    }

    return [valid, err_msg, line._id]
}