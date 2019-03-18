const mongoose = require('mongoose');

const Schema = mongoose.Schema;
/**
 * Customer schema to store the customers from the customer list into our db
 */
const CustomerSchema = new Schema({
    number: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Customer', CustomerSchema);
