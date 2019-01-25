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
    for (i = 0; i < skus.length; i++) {
        console.log(skus[i]);
    }

    let goal = new ManufacturingGoal({name, skus, case_quantity});
    ManufacturingGoal.create(goal, (error) => {
        if (error) {
            res.json({success: false, message: "Failed to create a new manufacturing goal. Error: ${err}"});
        } else{
            res.json({success: true, message: "Added successfully."});
        }
    })

})

module.exports = router;