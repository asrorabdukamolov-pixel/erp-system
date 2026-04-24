const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String },
    phone: { type: String, required: true },
    phone2: { type: String },
    address: { type: String },
    source: { type: String }, // Instagram, FB, etc.
    showroom: { type: String },
    addedBy: { type: String },
    status: { type: String, default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);
