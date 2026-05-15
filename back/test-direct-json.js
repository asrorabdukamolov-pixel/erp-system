const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Path to your downloaded JSON file
const serviceAccountPath = 'c:/Users/Asus/Downloads/express-erp-a764b-firebase-adminsdk-fbsvc-25066309cd.json';

const test = async () => {
    try {
        console.log("Testing with direct JSON file...");
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }

        console.log("Firebase Admin initialized.");
        const db = admin.firestore();
        
        console.log("Attempting to write to 'test' collection...");
        await db.collection('test').doc('migration_test').set({ 
            status: 'success', 
            time: new Date().toISOString() 
        });
        console.log("Write success!");

        const doc = await db.collection('test').doc('migration_test').get();
        console.log("Read success:", doc.data());
        
        process.exit(0);
    } catch (err) {
        console.error("Test failed:", err);
        process.exit(1);
    }
};

test();
