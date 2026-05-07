const mongoose = require('mongoose');
const { db } = require('../config/firebase');
require('dotenv').config();

const User = require('../models/User');
const Showroom = require('../models/Showroom');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Proposal = require('../models/Proposal');
const Partner = require('../models/Partner');
const Supplier = require('../models/Supplier');
const Transaction = require('../models/Transaction');
const Purchase = require('../models/Purchase');
const MoneyRequest = require('../models/MoneyRequest');
const Settings = require('../models/Settings');

const cleanData = (obj) => {
    if (obj === null || obj === undefined) return null;
    
    // Handle Mongoose/MongoDB ObjectId
    if (obj._bsontype === 'ObjectID' || (obj.constructor && obj.constructor.name === 'ObjectId')) {
        return obj.toString();
    }

    if (Buffer.isBuffer(obj)) {
        return obj.toString('base64');
    }

    if (Array.isArray(obj)) {
        return obj.map(cleanData);
    } 
    
    if (obj instanceof Date) {
        return obj.toISOString();
    }

    if (typeof obj === 'object') {
        // If it's a plain object but has a toJSON method (like Mongoose docs), use it
        const plainObj = (typeof obj.toJSON === 'function') ? obj.toJSON() : obj;
        
        const newObj = {};
        for (const key in plainObj) {
            if (plainObj[key] === undefined) continue;
            if (key.startsWith('$') || key === '__v') continue;

            newObj[key] = cleanData(plainObj[key]);
        }
        return newObj;
    }
    
    return obj;
};

const migrate = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected.");

        const collections = [
            { model: User, name: 'users' },
            { model: Showroom, name: 'showrooms' },
            { model: Customer, name: 'customers' },
            { model: Order, name: 'orders' },
            { model: Proposal, name: 'proposals' },
            { model: Partner, name: 'partners' },
            { model: Supplier, name: 'suppliers' },
            { model: Transaction, name: 'transactions' },
            { model: Purchase, name: 'purchases' },
            { model: MoneyRequest, name: 'money_requests' },
            { model: Settings, name: 'settings', singleton: true }
        ];

        for (const col of collections) {
            console.log(`Migrating ${col.name}...`);
            const docs = await col.model.find().lean();
            console.log(`Found ${docs.length} documents in ${col.name}.`);

            for (const doc of docs) {
                const id = doc._id.toString();
                delete doc._id;
                delete doc.__v;

                const cleanedDoc = cleanData(doc);

                try {
                    if (col.singleton) {
                        await db.collection(col.name).doc('global').set(cleanedDoc);
                    } else {
                        await db.collection(col.name).doc(id).set(cleanedDoc);
                    }
                } catch (err) {
                    console.error(`Failed to migrate doc ${id} in ${col.name}:`, err.message);
                }
            }
            console.log(`Finished ${col.name}.`);
        }

        console.log("Migration completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Migration fatal error:", err);
        process.exit(1);
    }
};

migrate();
