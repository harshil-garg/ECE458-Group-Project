//Require mongoose package
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ManufacturingScheduleSchema = new Schema({
    manufacturing_goals: {
        type: [Schema.ObjectId],
        required: true,
        ref: 'ManufacturingGoal'
    }
});

let ManufacturingSchedule = mongoose.model('ManufacturingSchedule', ManufacturingScheduleSchema);
module.exports = ManufacturingSchedule;