const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const init = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/erp_db';
        await mongoose.connect(mongoURI);
        console.log("Bazaga ulanish muvaffaqiyatli!");

        const adminExists = await User.findOne({ login: 'admin' });
        if (!adminExists) {
            const admin = new User({
                name: 'Super',
                surname: 'Admin',
                login: 'admin',
                password: 'admin123',
                role: 'super'
            });
            await admin.save();
            console.log("--------------------------------------");
            console.log("Birinchi Super Admin yaratildi!");
            console.log("Login: admin");
            console.log("Parol: admin123");
            console.log("--------------------------------------");
        } else {
            console.log("Admin foydalanuvchisi allaqachon mavjud.");
        }
        process.exit();
    } catch (err) {
        console.error("Xatolik:", err);
        process.exit(1);
    }
};

init();
