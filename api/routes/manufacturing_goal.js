const express = require('express');
const router = express.Router();

const ManufacturingGoal = require('../model/manufacturing_goal_model');

router.post('/create', (req, res) => {
    const { name, skus, case_quantity } = req.body;

    if (!name || !skus || !case_quantity) {
        res.send("You messed up");
        return;
    }

    // Need to have a sanity check validation (SKUs must exist!)
    // TODO (will need a mongo query)
    for (i = 0; i < skus.length; i++) {
        console.log(skus[i]);
    }

    if (skus.length != case_quantity.length) {
        res.send("You messed up");
        return;
    }
    let user = req.user.email;
    let goal = new ManufacturingGoal({name, skus, case_quantity, user});
    ManufacturingGoal.create(goal, (error) => {
        if (error) {
            res.json({success: false, message: `Failed to create a new manufacturing goal. Error: ${error}`});
        } else{
            res.json({success: true, message: "Added successfully."});
        }
    })

})

module.exports = router;