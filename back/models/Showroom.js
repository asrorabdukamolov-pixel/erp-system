const mongoose = require('mongoose');

const ShowroomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String },
    adminName: { type: String },
    adminSurname: { type: String },
    login: { type: String, required: true, unique: true },
    password: { type: String, default: '123' },
    status: { type: String, default: 'Faol' }
}, { timestamps: true });

module.exports = mongoose.model('Showroom', ShowroomSchema);
