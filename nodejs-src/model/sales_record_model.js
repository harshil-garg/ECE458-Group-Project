const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const SalesRecordSchema = new Schema({
    sku: {
        type: Schema.ObjectId,
        required: true,
        ref: 'SKU'
    },
    date: {
        type: Date,
        required: true
    },
    customer_number: {
        type: Number,
        required: true
    },
    customer_name: {
        type: String,
        required: true
    },
    sales: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
});

let SalesRecord = mongoose.model('SalesRecord', SalesRecordSchema);
module.exports = SalesRecord;
