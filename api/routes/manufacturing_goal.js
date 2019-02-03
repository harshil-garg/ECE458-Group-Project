const express = require('express');
const router = express.Router();

const SKU = require('../model/sku_model');
const ManufacturingGoal = require('../model/manufacturing_goal_model');
const Ingredient = require('../model/ingredient_model');

router.post('/calculator', (req, res) => {
    const { name } = req.body;

    if (!name) {
        res.send("Name not specified");
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

// CREATE
router.post('/create', (req, res) => {
    const { name, skus } = req.body;

    if (!name || !skus) {
        res.send("You messed up");
        return;
    }

    // Need to have a sanity check validation (SKUs must exist!)
    // TODO (will need a mongo query)
    for (i = 0; i < skus.length; i++) {
        console.log(skus[i]);
    }

    let user = req.user.email;
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
    const { name } = req.body;

    if (!name) {
        res.send("Please specify the manufacturing goal name.");
        return;
    }

    ManufacturingGoal.findOne({name: name}, (error, goal) => {
        if (error) {
            res.send("Manufacturing goal not found " + error);
        }
        res.send(goal);
    });
});

module.exports = router;