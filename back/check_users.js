const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: './.env' });

async function check() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erp_system');
    const users = await User.find({}, 'name login role showroom');
    console.log('--- Barcha foydalanuvchilar ---');
    console.log(JSON.stringify(users, null, 2));
    process.exit();
}
check();
