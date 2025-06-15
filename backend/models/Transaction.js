const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['expense', 'income'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: 'No description'
    },
    date: {
        type: Date,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'upi', 'bank'],
        default: 'cash'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);