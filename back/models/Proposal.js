const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema({
    orderId: { type: String }, // Optional link
    customerName: { type: String, required: true },
    customerPhone: { type: String },
    items: [
        {
            name: { type: String },
            quantity: { type: Number },
            price: { type: Number },
            total: { type: Number }
        }
    ],
    totalAmount: { type: Number },
    discount: { type: Number, default: 0 },
    managerName: { type: String },
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Proposal', ProposalSchema);
