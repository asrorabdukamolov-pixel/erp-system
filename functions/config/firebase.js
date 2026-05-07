const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config();

if (!admin.apps.length) {
    // If running in Firebase Functions environment, initialize without explicit credentials
    if (process.env.FIREBASE_CONFIG || process.env.FUNCTIONS_EMULATOR) {
        admin.initializeApp();
        console.log("Firebase Admin initialized automatically for Functions.");
    } else {
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
                // Fallback for local scripts
                const serviceAccount = require('../../back/config/firebase-service-account.json');
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
                console.log("Firebase Admin initialized via JSON file.");
            } catch (err) {
                console.error("Firebase Initialization Error: No credentials found.");
            }
        }
    }
}

// Determine the correct database ID based on the environment/project
const projectId = admin.app().options.projectId || process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID;
const dbId = projectId === 'express-erp-a764b' ? 'default' : '(default)';

const db = getFirestore(admin.app(), dbId);
const storage = admin.storage();

const formatDoc = (doc) => {
    if (!doc.exists) return null;
    return { _id: doc.id, ...doc.data() };
};

const formatQuery = (snapshot) => {
    return snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
};

module.exports = { db, admin, storage, formatDoc, formatQuery };
