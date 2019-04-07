//Require mongoose package
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Activity = new Schema({
    sku: {
        type: Schema.ObjectId,
        required: true
    },
    manufacturing_goal: {
        type: Schema.ObjectId,
        required: true
    }
})

//Mapping of activity to line, actual schedule is list of all mappings
const ManufacturingScheduleSchema = new Schema({
    activity: {
        type: Activity,
        required: true
    },
    manufacturing_line: {
        type: Schema.ObjectId,
        required: true
    },
    start_date: {
        type: Date,
        required: true
    },
    duration: {
        type: Number
    },
    duration_override: {
        type: Boolean,
        default: false
    },
    committed: {
        type: Boolean,
        default: true
    }
});

let ManufacturingSchedule = mongoose.model('ManufacturingSchedule', ManufacturingScheduleSchema);
module.exports = ManufacturingSchedule;
