const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema({
    kpNumber: { type: String, required: true },
    customer: {
        firstName: { type: String },
        lastName: { type: String },
        phone: { type: String },
        address: { type: String }
    },
    deadline: { type: String },
    deadlineBasis: { type: String },
    customBasis: { type: String },
    selectedPartners: [{ type: String }],
    items: [
        {
            name: { type: String },
            desc: { type: String },
            qty: { type: Number },
            unit: { type: String },
            price: { type: Number },
            image: { type: String } // Base64
        }
    ],
    services: {
        eco: { type: Boolean, default: false },
        cleaning: { type: Boolean, default: false },
        packing: { type: Boolean, default: false }
    },
    servicePrices: {
        eco: { type: Number, default: 0 },
        cleaning: { type: Number, default: 0 },
        packing: { type: Number, default: 0 }
    },
    grandTotal: { type: Number },
    managerId: { type: String },
    managerName: { type: String },
    showroom: { type: String },
    status: { type: String, default: 'active' }, // active, trash
    deletedAt: { type: Date },
    deleteReason: { type: String },
    deletedBy: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Proposal', ProposalSchema);
