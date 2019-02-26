const express = require('express');
const router = express.Router();

const SKU = require('../model/sku_model');
const ManufacturingGoal = require('../model/manufacturing_goal_model');
const Ingredient = require('../model/ingredient_model');
const Formula = require('../model/formula_model');
const pagination = require('../controllers/paginate');
const validator = require('../controllers/validator');
const unit = require('../controllers/units');
const utils = require('../utils/utils');


function getUser(req){
    if(!req.user){
        return;
    }else {
        return req.user.email;
    }
}

router.post('/calculator', async (req, res) => {
    const { name } = req.body;


    let user = getUser(req);
    if(!user){
        res.json({success: false, message: 'No user logged in'});
        return;
    }

    let ingredientMap = {}

    let goal = await ManufacturingGoal.findOne({name: name, user: user}).exec();

    for(let sku_tuple of goal.sku_tuples){
        let sku = await SKU.findOne({_id: sku_tuple.sku}).exec();
        let formula = await Formula.findOne({_id: sku.formula}).exec();

        for(let ingr_tuple of formula.ingredient_tuples){
            // let key = ingr_tuple.ingredient; //maybe use id as key
            let ingredient = await Ingredient.findOne({_id: ingr_tuple.ingredient}).exec();
            let key = ingredient.name;

            let unit_value = sku_tuple.case_quantity * sku.formula_scale_factor * ingr_tuple.quantity * unit.convert(ingr_tuple.unit, ingredient.unit); // goal case quantity * sku scale factor * formula quantity * conversion


            // If ingredient already in map, update values
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
});

// Get all
router.post('/all', async (req, res) => {
    const { pageNum, sortBy, page_size } = req.body;
    
	let user = getUser(req);
    if(!user){
        res.json({success: false, message: 'No user logged in'});
        return;
    }

    let agg = ManufacturingGoal.aggregate([{$match: {user: user}}])
    .lookup({
        from: 'skus',
        localField: 'sku_tuples.sku',
        foreignField: '_id',
        as: 'skus'
    })
    .lookup({
        from: 'manufacturinglines',
        localField: 'skus.manufacturing_lines',
        foreignField: '_id',
        as: 'manufacturing_lines'
    });

    let results = await pagination.paginate(agg, pageNum, sortBy, page_size);

    //fuckin garbage
    for(let item of results.data){
        for(let sku of item.skus){
            let manufacturing_lines = [];
            
            for(let line of item.manufacturing_lines){
                for(let id of sku.manufacturing_lines){
                    if(line._id.equals(id)){
                        manufacturing_lines.push(line)
                    }
                }
            }
            sku.manufacturing_lines = manufacturing_lines

            for(let tuple of item.sku_tuples){
                if(sku._id.equals(tuple.sku)){
                    tuple.sku = sku;
                }
            }
        }

        delete item.skus;
        delete item.manufacturing_lines;
    }
    res.json(results);
});

// CREATE
router.post('/create', async (req, res) => {
    const { name, sku_tuples, deadline } = req.body;

    // Check that SKUS exist
    let valid_tuples = [];
    for(let tuple of sku_tuples){
        valid_tuples.push(await validator.itemExists(SKU, tuple.sku));
    }

    let errors = validator.compileErrors(...valid_tuples);
    // Return errors if any
    if(errors.length > 0){
        res.json({success: false, message: errors});
        return;
    }

    // Change from sku name to id
    for(let i = 0; i < valid_tuples.length; i++){
        sku_tuples[i]['sku'] = valid_tuples[i][2]; //id of sku
    }

    let user = getUser(req);
    if(!user){
        res.json({success: false, message: 'No user logged in'});
        return;
    }

    //TODO: replace with validator
    let deadline_date = new Date(deadline);
    if(isNaN(deadline_date)){
        res.json({success: false, message: deadline_date}); //message is: invalid date
        return;
    }

    createManufacturingGoal(name, sku_tuples, user, deadline_date, res);    

});

function createManufacturingGoal(name, sku_tuples, user, deadline, res){
    let goal = new ManufacturingGoal({name, sku_tuples, user, deadline});

    ManufacturingGoal.create(goal, (error) => {
        if (error) {
            res.json({success: false, message: `Failed to create a new manufacturing goal. Error: ${error}`});
        } else{
            res.json({success: true, message: "Added successfully."});
        }
    });
}

router.post('/read', (req, res) => {
    const { name, user } = req.body;

    ManufacturingGoal.findOne({name: name, user: user}, (error, goal) => {
        if (error) {
            res.send("Manufacturing goal not found " + error);
        }
        res.send(goal);
    });
});

router.post('/delete', (req, res) => {
    const { name } = req.body;
    
    ManufacturingGoal.deleteOne({name: name}, (err, result) => {
        if(err) {
            res.json({success: false, message: `Failed to delete manufacturing goal. Error: ${err}`});
        }else if(result.deletedCount == 0){
            res.json({success: false, message: 'Manufacturing goal does not exist to delete'});
        }else{
            res.json({success: true, message: "Deleted successfully."});
        }
    });
});

module.exports = router;
