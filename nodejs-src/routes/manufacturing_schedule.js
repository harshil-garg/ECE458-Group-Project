const express = require('express');
const router = express.Router();
const ManufacturingSchedule = require('../model/manufacturing_schedule_model')
const SKU = require('../model/sku_model');
const ManufacturingGoal = require('../model/manufacturing_goal_model');
const ManufacturingLine = require('../model/manufacturing_line_model');
const validator = require('../controllers/validator');
const schedule_validator = require('../controllers/schedule_validator');
const autocomplete = require('../controllers/autocomplete');
const schedule_filter = require('../controllers/schedule_filter');

//Display manufacturing goals for admin to select, filter by name and username
router.post('/autocomplete', async (req, res) => {
    const { goal, user } = req.body;

    let results = await autocomplete.nameOrEmail(ManufacturingGoal, goal, user);
    res.json({success: true, data: results});
});

//Create a report
router.post('/report', async (req, res) => {
    const { manufacturing_line, start, end } = req.body;
    

    let results = await schedule_filter.filter(manufacturing_line, start, end);

    res.json({success: true, data: results});

});

router.post('/load',  async (req, res) => {
    let results = await schedule_filter.filter();

    res.json({success: true, data: results});
})

//Add an mapping of an activity to a manufacturing line
router.post('/create', async (req, res) => {
    let { activity, manufacturing_line, start_date, duration, duration_override } = req.body;
    
    let error = await createValidation(activity, manufacturing_line, start_date, duration, duration_override);
    if(!('sku' in error)){
        res.json({success: false, message: error});
        return;
    }

    let isUnique = await schedule_validator.uniqueActivity(activity);
    if(!isUnique[0]){
        res.json({success: false, message: isUnique[1]});
        return;
    }

    //calculate duration
    if(!duration){
        let sku = await SKU.findOne({_id: error.sku}).exec();
        let goal = await ManufacturingGoal.findOne({_id: error.manufacturing_goal}).exec();
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
    let { activity, manufacturing_line, start_date, duration, duration_override } = req.body; 

    let errors = await createValidation(activity, manufacturing_line, start_date);
    if(!('sku' in errors)){
        res.json({success: false, message: errors});
        return;
    }   

    let json = {};
    if(manufacturing_line){
        json['manufacturing_line'] = errors.manufacturing_line;
    }
    if(start_date){
        json['start_date'] = start_date;
    }
    if(duration){
        let sku = await SKU.findOne({_id: errors.sku}).exec();
        let goal = await ManufacturingGoal.findOne({_id: errors.manufacturing_goal}).exec();
        let quantity;
        if(sku != null && goal != null){
            for(let tuple of goal.sku_tuples){
                if(tuple.sku.equals(sku._id)){
                    quantity = tuple.case_quantity;
                }
            }
        }
        
        calculated_duration = quantity / sku.manufacturing_rate;

        json['duration'] = duration;

        if(duration == calculated_duration){
            json['duration_override'] = false;
        }else{
            json['duration_override'] = true;
        }
        
    }

    ManufacturingSchedule.findOneAndUpdate({'activity.sku': errors.sku, 
        'activity.manufacturing_goal': errors.manufacturing_goal}, json, (err) => {
            if (err) {
                res.json({success: false, message: `Failed to update mapping. Error: ${err}`});
            } else{
                res.json({success: true, message: "Updated successfully."});
            }
        });
});

//Remove a mapping
router.post('/delete', async (req, res) => {
    const { activity } = req.body;

    let activity_passed = await schedule_validator.validActivity(activity);
    if(!activity_passed[0]){
        res.json({success: false, message: activity_passed[1]})
    }

    ManufacturingSchedule.findOneAndDelete({'activity.sku': activity_passed[2], 
        'activity.manufacturing_goal': activity_passed[3]}, (err, result) => {
            if (err) {
                res.json({success: false, message: `Failed to delete mapping. Error: ${err}`});
            }else if(!result || result.deletedCount == 0){
                res.json({success: false, message: 'Mapping does not exist to delete'});
            }else{
                res.json({success: true, message: "Deleted successfully."});
            }
        });
});

async function createValidation(activity, manufacturing_line, start_date){
    // let required_params = { activity, manufacturing_line, start_date };
    let required_activity_params = ['sku', 'manufacturing_goal'];

    // //Check that all inputs and fields are present
    // let inputs_passed = validator.inputsExist(required_params);
    // if(!inputs_passed[0]){
    //     return inputs_passed[1];
    // }

    let activity_inputs_passed = validator.objectFieldsExist(activity, required_activity_params);
    if(!activity_inputs_passed[0]){
        return activity_inputs_passed[1];
    }

    let sku_isnumber = validator.isNumeric(activity.sku);
    if(!sku_isnumber[0]){
        return sku_isnumber[1];
    }

    //Check that given objects exist
    let activity_passed = await schedule_validator.validActivity(activity);
    let line_passed = await schedule_validator.validLine(activity.sku, manufacturing_line);

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