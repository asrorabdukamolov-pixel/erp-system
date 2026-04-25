const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected successfully');
        
        const Partner = require('./models/Partner');
        const partners = await Partner.find();
        console.log('Partners found:', partners.length);
        partners.forEach(p => {
            console.log(`- ${p.name}: logo length = ${p.logo ? p.logo.length : 0}`);
            if (p.logo && p.logo.length < 100) {
                console.log(`  [WARNING] Logo for ${p.name} is too short: "${p.logo}"`);
            }
        });
        
        process.exit(0);
    } catch (err) {
        console.error('Connection failed:', err);
        process.exit(1);
    }
};

testConnection();
