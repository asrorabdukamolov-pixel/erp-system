const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Responsible person
    firm: { type: String, required: true }, // Company name
    phone: { type: String },
    address: { type: String },
    balance: { type: Number, default: 0 },
    showroom: { type: String }, // 'Global' or Showroom ID/Name
    addedBy: { type: String },
    isGlobal: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', SupplierSchema);
