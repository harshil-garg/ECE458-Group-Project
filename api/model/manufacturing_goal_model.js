//Require mongoose package
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ManufacturingGoalSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    skus: {
        type: [String],
        required: true
    },
    case_quantity: {
        type: [Number],
        required: true
    },
    user: {
        type: String,
        required: true,
    }
});

let ManufacturingGoal = mongoose.model('ManufacturingGoal', ManufacturingGoalSchema);
module.exports = ManufacturingGoal;


module.exports.createManufacturingGoal = (manufacturing_goal, callback) => {
    ManufacturingGoal.create(manufacturing_goal, callback);
}

module.exports.deleteManufacturingGoal = (manufacturing_goal_name, callback) => {
    var query = {name: manufacturing_goal_name};
    ManufacturingGoal.deleteOne(query, callback);
}

module.exports.updateManufacturingGoal = (manufacturing_goal_name, manufacturing_goal_update, cb) => {
    var query = {name: manufacturing_goal_name};
    ManufacturingGoal.findOneAndUpdate(query, manufacturing_goal_update, cb);
}