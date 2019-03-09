const mongoose = require('mongoose');

/**
 * SalesRecord schema which standardizes a representation for all SalesRecord(s) in our system. A SalesRecord
 * consists of a SKU reference, date, customer number, customer name, sales (# of cases sold), and price (of each
 * case). 
 * 
 * @since Evolution 3, Requirement 7.2
 */
const SalesRecordSchema = new mongoose.Schema({
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

module.exports = mongoose.model('SalesRecord', SalesRecordSchema);
