const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema({
    uniqueId: { type: String, unique: true },
    kpNumber: { type: String }, // For search
    orderId: { type: String }, // Optional link
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner' },
    customer: {
        firstName: { type: String },
        lastName: { type: String },
        phone: { type: String }
    },
    items: [
        {
            name: { type: String },
            quantity: { type: Number },
            price: { type: Number },
            total: { type: Number },
            unit: { type: String }
        }
    ],
    totalAmount: { type: Number },
    discount: { type: Number, default: 0 },
    managerId: { type: String },
    managerName: { type: String },
    showroom: { type: String },
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'active' }, // active, trash
    deletedAt: { type: Date },
    deleteReason: { type: String },
    deletedBy: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Proposal', ProposalSchema);
