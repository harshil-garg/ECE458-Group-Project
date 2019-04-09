//Require mongoose package
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SKU_Tuple = new Schema({
    sku: {
        type: Schema.ObjectId,
        required: true,
        ref: 'SKU'
    },
    case_quantity: Number
});

const ManufacturingGoalSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    sku_tuples: {
        type: [SKU_Tuple],
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    enabled: {
        type: Boolean,
        default: false
    },
    author: {
        type: String,
        required: true
    },
    last_edit: {
        type: Date,
        required: true
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
