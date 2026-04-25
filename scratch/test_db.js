const mongoose = require('mongoose');
require('dotenv').config({ path: './back/.env' });

const testConnection = async () => {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected successfully');
        
        const Settings = require('./back/models/Settings');
        const settings = await Settings.findOne();
        console.log('Settings found:', settings);
        
        process.exit(0);
    } catch (err) {
        console.error('Connection failed:', err);
        process.exit(1);
    }
};

testConnection();
