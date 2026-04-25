require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function fix() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // 1. Super Admin: admin / admin123
        let admin = await User.findOne({ login: 'admin' });
        if (!admin) {
            admin = new User({
                name: 'Admin',
                surname: 'System',
                login: 'admin',
                password: 'admin123',
                role: 'super'
            });
            await admin.save();
            console.log('Super Admin (admin/admin123) yaratildi');
        } else {
            admin.password = 'admin123';
            admin.role = 'super';
            await admin.save();
            console.log('Super Admin (admin/admin123) tiklandi');
        }

        // 2. Showroom Admin: asror / 123
        let asror = await User.findOne({ login: 'asror' });
        if (asror) {
            asror.role = 'showroom';
            asror.password = '123';
            await asror.save();
            console.log('Asror (showroom/123) tiklandi');
        }

        console.log('DONE');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

fix();
