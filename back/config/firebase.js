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
    fs.writeFileSync(dbPath, JSON.stringify({ cash_flow_items: [], cost_centers: [], users: [] }, null, 2));
}

const getLocalData = () => JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const saveLocalData = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

// Create local DB mock
function createLocalDb() {
    return {
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
                    const docs = items.map(item => ({
                        id: item.id,
                        data: () => item,
                        exists: true
                    }));
                    return {
                        empty: items.length === 0,
                        size: items.length,
                        docs,
                        forEach: (cb) => docs.forEach(cb)
                    };
                },
                limit: function() { return this; },
                doc: (id) => ({
                    set: async (data, options) => {
                        const store = getLocalData();
                        if (!store[name]) store[name] = [];
                        const idx = store[name].findIndex(i => i.id === id);
                        if (idx !== -1) {
                            if (options && options.merge) {
                                store[name][idx] = { ...store[name][idx], ...data };
                            } else {
                                store[name][idx] = { id, ...data };
                            }
                        } else {
                            store[name].push({ id, ...data });
                        }
                        saveLocalData(store);
                    },
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

// Start with local DB - initDb() will switch to Firestore if available
let _currentDb = createLocalDb();

// Proxy that always delegates to _currentDb - works even after destructuring
const db = new Proxy({}, {
    get: (target, prop) => {
        const val = _currentDb[prop];
        if (typeof val === 'function') {
            return val.bind(_currentDb);
        }
        return val;
    }
});

// Test Firestore connection - call before starting server
const initDb = async () => {
    try {
        const firestoreDb = getFirestore(admin.app());
        await firestoreDb.collection('_health_check').limit(1).get();
        _currentDb = firestoreDb;
        console.log("Firestore connection verified. Using Firestore.");
    } catch (err) {
        if (err.code === 5 || (err.message && err.message.includes('NOT_FOUND'))) {
            console.warn("WARNING: Firestore database not found. Using local_db.json");
            console.warn("To fix: Firebase Console -> Firestore Database -> Create Database");
        } else {
            console.warn("Firestore failed:", err.message, "- Using local_db.json");
        }
    }
};

const formatDoc = (doc) => {
    if (!doc || !doc.exists) return null;
    return { _id: doc.id, ...doc.data() };
};

const formatQuery = (snapshot) => {
    if (!snapshot || !snapshot.docs) return [];
    return snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
};

module.exports = { db, admin, formatDoc, formatQuery, initDb };

