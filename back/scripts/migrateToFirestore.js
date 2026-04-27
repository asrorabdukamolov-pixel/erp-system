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

                if (col.singleton) {
                    await db.collection(col.name).doc('global').set(doc);
                } else {
                    await db.collection(col.name).doc(id).set(doc);
                }
            }
            console.log(`Finished ${col.name}.`);
        }

        console.log("Migration completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
};

migrate();
