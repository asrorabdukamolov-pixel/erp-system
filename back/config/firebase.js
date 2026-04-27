const admin = require('firebase-admin');
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

const db = admin.firestore();

const formatDoc = (doc) => {
    if (!doc.exists) return null;
    return { _id: doc.id, ...doc.data() };
};

const formatQuery = (snapshot) => {
    return snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
};

module.exports = { db, admin, formatDoc, formatQuery };
