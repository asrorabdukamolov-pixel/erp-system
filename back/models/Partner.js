const mongoose = require('mongoose');

const PartnerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    logo: { type: String }, // Base64 logo
    phone: { type: String },
    firm: { type: String },
    type: { type: String, default: 'supplier' }, // supplier, service, etc.
    showroom: { type: String },
    addedBy: { type: String },
    balance: { type: Number, default: 0 } // Current debt/credit
}, { timestamps: true });

module.exports = mongoose.model('Partner', PartnerSchema);
