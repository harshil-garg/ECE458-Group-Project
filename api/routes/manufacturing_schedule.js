const express = require('express');
const router = express.Router();
const ManufacturingSchedule = require('../model/manufacturing_schedule_model')
const SKU = require('../model/sku_model');
const ManufacturingGoal = require('../model/manufacturing_goal_model');
const ManufacturingLine = require('../model/manufacturing_line_model');
const validator = require('../controllers/validator');

//Display manufacturing goals for admin to select, filter by name and username
router.post('/filter_goals', (req, res) => {

});

//Add an mapping of an activity to a manufacturing line
router.post('/create', async (req, res) => {
    let { activity, manufacturing_line, start_date, duration, duration_override } = req.body;
    
    let error = await createValidation(activity, manufacturing_line, start_date, duration, duration_override);
    if(!('sku' in error)){
        res.json({success: false, message: error});
        return;
    }

    //calculate duration
    if(!duration){
        let sku = await SKU.findOne({_id: activity_passed[2]}).exec();
        let goal = await ManufacturingGoal.findOne({_id: activity_passed[3]}).exec();
        let quantity;
        for(let tuple of goal.sku_tuples){
            if(tuple.sku.equals(sku._id)){
                quantity = tuple.case_quantity;
            }
        }
        duration = quantity / sku.manufacturing_rate;
        
    }else{
        duration_override = true;
    }

    activity.sku = error.sku;
    activity.manufacturing_goal = error.manufacturing_goal;
    manufacturing_line = error.manufacturing_line;
    let mapping = new ManufacturingSchedule({activity, manufacturing_line, start_date, duration, duration_override});
    ManufacturingSchedule.create(mapping, (err) => {
        if (err) {
            res.json({success: false, message: `Failed to create a new mapping. Error: ${err}`});
        } else{
            res.json({success: true, message: "Added successfully."});
        }
    });
});



//Update a mapping
router.post('/update', async (req, res) => {
    //can change line, start date, and duration
    let { activity, manufacturing_line, start_date, new_start_date, duration } = req.body;

    let json = {};
    if(manufacturing_line){

    }
    if(new_start_date){

    }
    if(duration){

    }

    await ManufacturingSchedule.findOneAndUpdate({'activity.sku': activity.sku, 'activity.manufacturing_goal': activity.manufacturing_goal, start_date: start_date}).exec();


});

//Remove a mapping
router.post('/delete', (req, res) => {

});

async function createValidation(activity, manufacturing_line, start_date, duration, duration_override){
    let required_params = { activity, manufacturing_line, start_date };
    let required_activity_params = ['sku', 'manufacturing_goal'];

    //Check that all inputs and fields are present
    let inputs_passed = validator.inputsExist(required_params);
    if(!inputs_passed[0]){
        return inputs_passed[1];
    }

    let activity_inputs_passed = validator.objectFieldsExist(activity, required_activity_params);
    if(!activity_inputs_passed[0]){
        return activity_inputs_passed[1];
    }

    let sku_isnumber = validator.isNumeric(activity.sku);
    if(!sku_isnumber[0]){
        return sku_isnumber[1];
    }

    //Check that given objects exist
    let activity_passed = await validator.validActivity(activity);
    let line_passed = await validator.itemExists(ManufacturingLine, manufacturing_line);

    //Check date

    let errors = validator.compileErrors(activity_passed, line_passed);
    if(errors.length > 0){
        return errors;
    }

    return {
        sku: activity_passed[2],
        manufacturing_goal: activity_passed[3],
        manufacturing_line: line_passed[2]
    };
}

module.exports = router;