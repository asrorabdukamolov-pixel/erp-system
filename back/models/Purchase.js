const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
    orderId: { type: String }, // Linked order
    supplier: { type: String, required: true },
    date: { type: Date, default: Date.now },
    items: [
        {
            name: { type: String },
            quantity: { type: Number },
            price: { type: Number },
            total: { type: Number }
        }
    ],
    total_amount: { type: Number },
    paid_amount: { type: Number, default: 0 },
    status: { type: String, default: 'kutilmoqda' }, // kutilmoqda, keldi, qisman
    paymentStatus: { type: String, default: 'to\'lanmagan' } // to'lanmagan, qisman, to'landi
}, { timestamps: true });

module.exports = mongoose.model('Purchase', PurchaseSchema);
