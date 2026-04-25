const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const init = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/erp_db';
        await mongoose.connect(mongoURI);
        console.log("Bazaga ulanish muvaffaqiyatli!");

        let admin = await User.findOne({ login: 'admin' });
        if (!admin) {
            admin = new User({
                name: 'Super',
                surname: 'Admin',
                login: 'admin',
                password: 'admin123',
                role: 'super'
            });
            console.log("Super Admin yangidan yaratildi.");
        } else {
            admin.password = 'admin123';
            console.log("Mavjud Admin paroli yangilandi.");
        }
        await admin.save();
        console.log("--------------------------------------");
        console.log("Login: admin");
        console.log("Parol: admin123");
        console.log("--------------------------------------");
        process.exit();
    } catch (err) {
        console.error("Xatolik:", err);
        process.exit(1);
    }
};

init();
