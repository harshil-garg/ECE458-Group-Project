//Require mongoose package
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const Ingredient_Tuple = new Schema({
    ingredient: {
        type: Schema.ObjectId,
        required: true,
        ref: 'Ingredient'
    },
    quantity: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        enum: ['oz.', 'lb.', 'ton', 'g', 'kg', 'fl. oz.', 'pt.', 'qt.', 'gal.', 'mL', 'L', 'count'],
        required: true
    }
});

const FormulaSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    number: {
        type: Number,
        required: true,
        unique: true
    },
    ingredient_tuples: {
        type: [Ingredient_Tuple],
    },
    comment: {
        type: String
    }

});

let Formula = mongoose.model('Formula', FormulaSchema);
module.exports = Formula;