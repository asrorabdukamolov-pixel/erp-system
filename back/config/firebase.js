const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config();

if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY 
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
        : undefined;

    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey
            })
        });
        console.log("Firebase Admin initialized via Environment Variables.");
    } else {
        try {
            const serviceAccount = require('./firebase-service-account.json');
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log("Firebase Admin initialized via JSON file.");
        } catch (err) {
            console.error("Firebase Initialization Error: No credentials found in ENV or JSON file.");
        }
    }
}

const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../local_db.json');

// Ensure local_db.json exists
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ cash_flow_items: [], cost_centers: [] }, null, 2));
}

const getLocalData = () => JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const saveLocalData = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

// Target the 'default' database explicitly
let db;
try {
    db = getFirestore(admin.app());
} catch (err) {
    console.warn("Fundamental Fix: Using local_db.json because Firebase key is missing.");
    db = {
        collection: (name) => {
            let filterField, filterOp, filterVal;
            const collectionMock = {
                add: async (data) => {
                    const store = getLocalData();
                    if (!store[name]) store[name] = [];
                    const newItem = { id: Date.now().toString(), ...data };
                    store[name].push(newItem);
                    saveLocalData(store);
                    return { id: newItem.id };
                },
                get: async () => {
                    const store = getLocalData();
                    let items = store[name] || [];
                    if (filterField && filterOp === '==' && filterVal !== undefined) {
                        items = items.filter(i => i[filterField] === filterVal);
                    }
                    return {
                        empty: items.length === 0,
                        docs: items.map(item => ({
                            id: item.id,
                            data: () => item,
                            exists: true
                        }))
                    };
                },
                doc: (id) => ({
                    update: async (data) => {
                        const store = getLocalData();
                        if (store[name]) {
                            const idx = store[name].findIndex(i => i.id === id);
                            if (idx !== -1) {
                                store[name][idx] = { ...store[name][idx], ...data };
                                saveLocalData(store);
                            }
                        }
                    },
                    delete: async () => {
                        const store = getLocalData();
                        if (store[name]) {
                            store[name] = store[name].filter(i => i.id !== id);
                            saveLocalData(store);
                        }
                    },
                    get: async () => {
                        const store = getLocalData();
                        const item = (store[name] || []).find(i => i.id === id);
                        return {
                            exists: !!item,
                            id: item?.id,
                            data: () => item
                        };
                    }
                }),
                orderBy: function() { return this; },
                where: function(field, op, val) {
                    filterField = field;
                    filterOp = op;
                    filterVal = val;
                    return this;
                }
            };
            return collectionMock;
        }
    };

}

const formatDoc = (doc) => {
    if (!doc || !doc.exists) return null;
    return { _id: doc.id, ...doc.data() };
};

const formatQuery = (snapshot) => {
    if (!snapshot || !snapshot.docs) return [];
    return snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
};

module.exports = { db, admin, formatDoc, formatQuery };


