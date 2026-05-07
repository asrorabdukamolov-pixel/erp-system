const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    orderId: { type: String },
    customerName: { type: String },
    customerPhone: { type: String },
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner' },
    quantity: { type: Number },
    pricePerUnit: { type: Number },
    totalAmount: { type: Number },
    date: { type: Date, default: Date.now },
    comment: { type: String },
    showroom: { type: String },
    status: { type: String, default: 'kutilmoqda' }
}, { timestamps: true });

module.exports = mongoose.model('Purchase', PurchaseSchema);
