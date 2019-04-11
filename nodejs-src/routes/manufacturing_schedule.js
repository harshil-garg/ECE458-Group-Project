const express = require('express');
const router = express.Router();
const ManufacturingSchedule = require('../model/manufacturing_schedule_model')
const SKU = require('../model/sku_model');
const Formula = require('../model/formula_model.js');
const ManufacturingGoal = require('../model/manufacturing_goal_model');
const ManufacturingLine = require('../model/manufacturing_line_model');
const Ingredient = require('../model/ingredient_model');
const validator = require('../controllers/validator');
const schedule_validator = require('../controllers/schedule_validator');
const autocomplete = require('../controllers/autocomplete');
const schedule_filter = require('../controllers/schedule_filter');
const unit = require('../controllers/units');
const jwtDecode = require('jwt-decode');

function getUser(req){
    let jwt = req.headers.authorization
    let payload = jwt.split(' ')[1]
    let decoded = jwtDecode(payload)

    return decoded.email;  
}

//Display manufacturing goals for admin to select, filter by name and username
router.post('/autocomplete', async (req, res) => {
    const { goal, user } = req.body;

    let results = await autocomplete.nameOrEmail(ManufacturingGoal, goal, user);
    res.json({success: true, data: results});
});

//Create a report
router.post('/report', async (req, res) => {
    const { manufacturing_line, start, end } = req.body;


    let results = await schedule_filter.filter(getUser(req), manufacturing_line, start, end);

    res.json({success: true, data: results});

});

// Given a list of activities
router.post('/report_calculate', async (req, res) => {
    const { manufacturing_tasks } = req.body;

    let user = getUser(req);
    if(!user){
        res.json({success: false, message: 'No user logged in'});
        return;
    }  

    let ingredientMap = {};

    for (let task of manufacturing_tasks) {
        let myTask = await ManufacturingSchedule.findOne({_id: task}).exec();
        let mySKU = await SKU.findOne({_id: myTask.activity.sku}).exec();
        let myFormula = await Formula.findOne({_id: mySKU.formula}).exec();
        let myManufacturingGoal = await ManufacturingGoal.findOne({_id: myTask.activity.manufacturing_goal}).exec();
        var case_quantity;
        for (let sku_tuple of myManufacturingGoal.sku_tuples) {
            if (String(sku_tuple.sku) == String(myTask.activity.sku)) {
                case_quantity = sku_tuple.case_quantity;
            }
        }

        for (let ingr_tuple of myFormula.ingredient_tuples) {
            let ingredient = await Ingredient.findOne({_id: ingr_tuple.ingredient}).exec();
            let key = ingredient.name;

            let unit_value = case_quantity * mySKU.formula_scale_factor * ingr_tuple.quantity * unit.convert(ingr_tuple.unit, ingredient.unit);

             if(key in ingredientMap){
                ingredientMap[key]['unit_value'] += unit_value;
                ingredientMap[key]['package_value'] = ingredientMap[key]['unit_value'] / ingredient.package_size;
            }else{
                ingredientMap[key] = {};
                ingredientMap[key]['unit_value'] = unit_value;
                ingredientMap[key]['unit'] = ingredient.unit;
                ingredientMap[key]['package_value'] = unit_value / ingredient.package_size;
            }

        }
    }
    res.json({success: true, data: ingredientMap});
})

router.post('/load',  async (req, res) => {
    let results = await schedule_filter.filter(getUser(req));
    res.json({success: true, data: results});
});

async function validatePermission(manufacturing_line, req){
    let user_model = await schedule_filter.getUserModel(getUser(req));

    let pass = false;
    for(let line of user_model.manufacturinglines){
        if(manufacturing_line == line.shortname || user_model.admin){
            pass = true;
            break;
        }
    }
    console.log(pass)
    return pass;
}

//Add an mapping of an activity to a manufacturing line
router.post('/create', async (req, res) => {
    let { activity, manufacturing_line, start_date, duration, duration_override } = req.body;

    if(!(await validatePermission(manufacturing_line, req))){
        return res.json({success: false, message: `User does not have access to manufacturing line ${manufacturing_line}`})
    }

    let mapping = await createMapping(res, activity, manufacturing_line, start_date, duration, duration_override);
    if (mapping.hasOwnProperty('success')) {
        return res.json(mapping);
    }

    ManufacturingSchedule.create(mapping, (err) => {
        if (err) {
            res.json({
                success: false, 
                message: `Failed to create a new mapping. Error: ${err}`
            });
        } else {
            res.json({
                success: true, 
                message: "Added successfully."
            });
        }
    });
});

async function createMapping(res, activity, manufacturing_line, start_date, duration, duration_override) {
    let validation = await createValidation(activity, manufacturing_line, start_date, duration, duration_override);
    if (!('sku' in validation)) {
        return {
            success: false, 
            message: validation
        };
    }

    let isUnique = await schedule_validator.uniqueActivity(activity);
    if (!isUnique[0]) {
        return {
            success: false, 
            message: isUnique[1]
        };
    }

    // Calculate duration
    let sku = await SKU.findOne({_id: validation.sku}).exec();
    let goal = await ManufacturingGoal.findOne({_id: validation.manufacturing_goal}).exec();
    let quantity;
    for (let tuple of goal.sku_tuples) {
        if (tuple.sku.equals(sku._id)) {
            quantity = tuple.case_quantity;
        }
    }
    calculated_duration = Math.ceil(quantity / sku.manufacturing_rate);
    if (duration) {
        if (duration != calculated_duration) {
            duration_override = true;
        }
    } else {
        duration = calculated_duration
    }

    activity.sku = validation.sku;
    activity.manufacturing_goal = validation.manufacturing_goal;
    manufacturing_line = validation.manufacturing_line;
    
    return new ManufacturingSchedule({activity, manufacturing_line, start_date, duration, duration_override});
}

router.post('/update', async (req, res) => {
    //can change line, start date, and duration
    let { activity, manufacturing_line, start_date, duration, duration_override } = req.body;

    if(!(await validatePermission(manufacturing_line, req))){
        return res.json({success: false, message: `User does not have access to manufacturing line ${manufacturing_line}`})
    }

    let errors = await createValidation(activity, manufacturing_line, start_date);
    if(!('sku' in errors)){
        res.json({success: false, message: errors});
        return;
    }

    let json = {};
    if(manufacturing_line != undefined && manufacturing_line != NaN){
        json['manufacturing_line'] = errors.manufacturing_line;
    }
    if(start_date != undefined && start_date != NaN){
        json['start_date'] = start_date;
    }
    if(duration != undefined && duration != NaN){
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
        calculated_duration = Math.ceil(quantity / sku.manufacturing_rate);

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

    let schedule = await ManufacturingSchedule.findOne({'activity.sku': activity_passed[2],'activity.manufacturing_goal': activity_passed[3]}).exec();
    
    let manufacturing_line = await ManufacturingLine.findOne({_id: schedule.manufacturing_line}).exec()

    if(!(await validatePermission(manufacturing_line.shortname, req))){
        return res.json({success: false, message: `User does not have access to manufacturing line ${manufacturing_line.shortname}`})
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
