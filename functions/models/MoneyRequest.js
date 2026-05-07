const mongoose = require('mongoose');

const MoneyRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String },
    category: { type: String, required: true },
    neededDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    orderId: { type: String },
    purchaseId: { type: String },
    comment: { type: String },
    status: { 
        type: String, 
        default: 'pending',
        enum: ['pending', 'approved', 'rejected', 'paid']
    },
    approvedBy: { type: String },
    approvedAt: { type: Date },
    paidAt: { type: Date },
    showroom: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('MoneyRequest', MoneyRequestSchema);
