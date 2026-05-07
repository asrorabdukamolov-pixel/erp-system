const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  companyName: { type: String, default: 'EXPRESS MEBEL' },
  companyPhone: { type: String, default: '+998 88 737 54 43' },
  companyLogo: { type: String, default: '' }, // SVG or DataURI (Internal System)
  kpLogo: { type: String, default: '' }, // For KP PDF documents
  companyAddress: { type: String, default: "Toshkent sh. Jomiy ko'chasi" },
  instagram: { type: String, default: 'instagram.com/express_mebel__uz' },
  telegram: { type: String, default: 't.me/expressmebel' }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
