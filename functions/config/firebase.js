const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config();

if (!admin.apps.length) {
    const envProjectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT;
    // Update to match newer Firebase bucket suffix seen in user's console
    const bucketName = `${envProjectId}.firebasestorage.app`;
    
    // If running in Firebase Functions environment, initialize without explicit credentials
    if (process.env.FIREBASE_CONFIG || process.env.FUNCTIONS_EMULATOR) {
        admin.initializeApp();
        console.log("Firebase Admin initialized automatically for Functions.");
    } else {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY 
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
            : undefined;

        if (envProjectId && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: envProjectId,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: privateKey
                }),
                projectId: envProjectId,
                storageBucket: bucketName
            });
            console.log(`Firebase Admin initialized via Environment Variables for project: ${envProjectId}`);
        } else {
            try {
                // Fallback for local scripts
                const serviceAccount = require('../../back/config/firebase-service-account.json');
                const finalProjectId = envProjectId || serviceAccount.project_id;
                const finalBucket = `${finalProjectId}.firebasestorage.app`;
                
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                    projectId: finalProjectId,
                    storageBucket: finalBucket
                });
                console.log(`Firebase Admin initialized via JSON file for project: ${finalProjectId}`);
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
