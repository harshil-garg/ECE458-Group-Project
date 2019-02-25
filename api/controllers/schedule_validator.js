const SKU = require('../model/sku_model');
const ManufacturingGoal = require('../model/manufacturing_goal_model');
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