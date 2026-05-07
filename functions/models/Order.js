const mongoose = require('mongoose');

const TimelineSchema = new mongoose.Schema({
    type: { type: String, default: 'system' }, // system, comment, file, status
    text: { type: String, required: true },
    time: { type: Date, default: Date.now },
    user: { type: String }
});

const FileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String }, // kp, contract, measurement, design
    uploadedBy: { type: String },
    uploadedAt: { type: Date, default: Date.now }
});

const OrderSchema = new mongoose.Schema({
    uniqueId: { type: String }, // Deal ID
    productionId: { type: String }, // ORD-001
    orderSeq: { type: Number },
    proposalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal' },
    proposalNumber: { type: String },
    status: { 
        type: String, 
        required: true, 
        default: 'yangi'
    },
    showroom: { type: String },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    managerName: { type: String },
    
    selectedCustomer: {
        firstName: { type: String, required: true },
        lastName: { type: String },
        phone: { type: String },
        phone2: { type: String },
        address: { type: String },
        source: { type: String }
    },
    
    propertyType: { type: String },
    propertyDetails: { type: String },
    
    deliveryDate: { type: Date },
    confirmedAt: { type: Date },
    
    assignedPmId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedPmName: { type: String },
    pmStatus: { type: String },
    assignedAt: { type: Date },
    
    checklist: {
        design3d: { type: Boolean, default: false },
        construction: { type: Boolean, default: false },
        color: { type: Boolean, default: false },
        handle: { type: Boolean, default: false },
        materials: { type: Boolean, default: false }
    },
    
    timeline: [TimelineSchema],
    files: [FileSchema],
    
    totalAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    currency: { type: String, default: 'UZS' },
    
    notes: { type: String },
    deleteReason: { type: String }, // For trash
    deletedBy: { type: String },
    deletedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
