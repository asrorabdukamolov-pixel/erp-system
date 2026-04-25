const mongoose = require('mongoose');
const User = require('./models/User');
const Showroom = require('./models/Showroom');
require('dotenv').config({ path: './.env' });

async function fix() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erp_system');
    
    // 1. Showroomlarni ko'rib chiqamiz
    const showrooms = await Showroom.find({});
    
    for (const s of showrooms) {
        console.log(`Fixing showroom: ${s.name}, Admin login: ${s.login}`);
        // Ushbu showroom adminini topamiz va unga showroom nomini biriktiramiz
        await User.findOneAndUpdate(
            { login: s.login.toLowerCase(), role: 'showroom' },
            { showroom: s.name }
        );
        
        // Shu showroomga tegishli barcha xodimlarni ham tekshirib qo'yamiz
        // (Ular odatda to'g'ri bo'ladi, lekin ishonch hosil qilish uchun)
    }

    console.log('Tuzatish yakunlandi.');
    process.exit();
}
fix();
