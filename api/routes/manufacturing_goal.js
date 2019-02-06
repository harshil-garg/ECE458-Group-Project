const express = require('express');
const router = express.Router();

const SKU = require('../model/sku_model');
const ManufacturingGoal = require('../model/manufacturing_goal_model');
const Ingredient = require('../model/ingredient_model');
const pagination = require('../controllers/paginate');
const validator = require('../controllers/sku_validation');
const input_validator = require('../controllers/input_validation');

router.post('/calculator', (req, res) => {
    const { name } = req.body;
    const required_params = { name };

    if(!input_validator.passed(required_params, res)){
        return;
    }

    ManufacturingGoal.findOne({name: name}, (error, goal) => {
        if (error) {
            res.send("Manufacturing goal not found " + error);
        }

        var queue = [];
        var data = [];

        for (i = 0; i < goal.skus.length; i++) {
            queue.push(i);
            SKU.findOne({name: goal.skus[i].sku_name}, (error, sku) => {
                if (error) {
                    res.send("SKU not found " + error);
                }
                queue.pop();
                data.push(sku);
                if (queue.length == 0) {
                    var result = {};
                    data.forEach(e => {
                        e.ingredients.forEach(f => {
                            let name = f.ingredient_name;
                            let quantity = f.quantity;
                            if (!result[name])
                                result[name] = 0;
                            // Since this is embedded in a callback, we can't access the case quantity of the SKU
                            // from the goal object via goal.skus[i]
                            for (j = 0; j < goal.skus.length; j++) {
                                if (goal.skus[j].sku_name == e.name) {
                                    result[name] += goal.skus[j].case_quantity * quantity;
                                }
                            }
                        });
                    });
                    runIngredientDBQuery(result, res);
                }
            });
        }
    });
});

function runIngredientDBQuery(result, res) {
    var queue = [];
    var ingredients = [];
    for (var key in result) {
        if (!result.hasOwnProperty(key)) {
            continue;
        }
        queue.push(key);
        Ingredient.findOne({name: key}, (error, ingredient) => {
            if (error) {
                res.send("Ingredient not found " + error);
                return;
            }
            queue.pop();
            ingredients.push(ingredient);
            if (queue.length == 0) {
                var data = [];
                for (i = 0; i < ingredients.length; i++) {
                    var temp = {};
                    let p = ingredients[i];
                    for (var k in p) {
                        if (!p.hasOwnProperty(k) || k != "_doc") {
                            continue;
                        }
                        for (var k2 in p[k]) {
                            if (!p[k].hasOwnProperty(k2)) {
                                continue;
                            }
                            temp[k2] = p[k][k2];
                        }
                    }
                    temp["calculated_quantity"] = result[p.name];
                    data.push(temp);
                }
                res.send(data);
            }
        });
    }
}

// Get all
router.post('/all', async (req, res) => {
    const { pageNum, sortBy, user } = req.body;

    const required_params = { pageNum, sortBy, user };

    if(!input_validator.passed(required_params, res)){
        return;
    }
    let results = await pagination.paginate(ManufacturingGoal.find({user: user}), ManufacturingGoal, pageNum, sortBy, res);
    res.json(results);
});

// CREATE
router.post('/create', async (req, res) => {
    const { name, skus } = req.body;
    const required_params = { name, skus };

    if(!input_validator.passed(required_params, res)){
        return;
    }

    // Need to have a sanity check validation (SKUs must exist!)
    // TODO (will need a mongo query)
    let sku_exists = true;
    for (let sku of skus) {
        let ans = await validator.itemExists(SKU, sku.sku_name)
        sku['sku_number'] = ans.number;
        sku_exists = sku_exists && ans.bool;
    }

    if(!sku_exists){
        res.json({success: false, message: 'One or more SKU does not exist'});
        return;
    }
    let user;
    if(!req.user){
        res.json({success: false, message: 'No user logged in'});
        return;
    }else{
        user = req.user.email;
    }

    let goal = new ManufacturingGoal({name, skus, user});

    ManufacturingGoal.create(goal, (error) => {
        if (error) {
            res.json({success: false, message: `Failed to create a new manufacturing goal. Error: ${error}`});
        } else{
            res.json({success: true, message: "Added successfully."});
        }
    });

});

router.post('/read', (req, res) => {
    const { name, user } = req.body;
    const required_params = { name, user };

    if(!input_validator.passed(required_params, res)){
        return;
    }

    ManufacturingGoal.findOne({name: name, user: user}, (error, goal) => {
        if (error) {
            res.send("Manufacturing goal not found " + error);
        }
        res.send(goal);
    });
});

router.post('/delete', (req, res) => {
  const { name } = req.body;
  ManufacturingGoal.deleteOne({name: name}, (error, goal) => {
    if (error) {
      res.send("Deletion failed");
    }
    res.json({success: true});
  });

})

module.exports = router;
