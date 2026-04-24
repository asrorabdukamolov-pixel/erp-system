const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    type: { 
        type: String, 
        required: true, 
        enum: ['income', 'expense'] 
    },
    category: { 
        type: String, 
        required: true 
    }, // Mijoz to'lovi, Maxsulot xaridi, Oylik, etc.
    amountUzs: { type: Number, required: true },
    amountUsd: { type: Number, default: 0 },
    exchangeRate: { type: Number, default: 1 },
    
    date: { type: Date, default: Date.now },
    description: { type: String },
    
    orderId: { type: String }, // Can be productionId or MongoID string
    orderRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    
    managerName: { type: String },
    showroom: { type: String },
    partnerId: { type: String },
    
    paymentMethod: { 
        type: String, 
        enum: ['cash', 'card', 'transfer', 'other'],
        default: 'cash'
    },
    
    createdBy: { type: String },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
