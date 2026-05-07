const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected successfully');
        
        const User = require('./models/User');
        const users = await User.find({});
        console.log('Total Users found:', users.length);
        users.forEach(u => {
            console.log(`- ${u.name} (${u.login}): role="${u.role}", showroom="${u.showroom}"`);
        });
        
        process.exit(0);
    } catch (err) {
        console.error('Connection failed:', err);
        process.exit(1);
    }
};

testConnection();
