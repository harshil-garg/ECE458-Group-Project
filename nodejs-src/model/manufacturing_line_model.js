//Require mongoose package
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ManufacturingLineSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    shortname: {
        type: String,
        required: true,
        unique: true
    },
    comment: {
        type: String
    }
});

let ManufacturingLine = mongoose.model('ManufacturingLine', ManufacturingLineSchema);
module.exports = ManufacturingLine;
