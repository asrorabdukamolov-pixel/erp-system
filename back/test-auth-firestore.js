const { admin } = require('./config/firebase');

const test = async () => {
    try {
        console.log("Testing Firebase Auth connection...");
        const listUsers = await admin.auth().listUsers(1);
        console.log("Auth Success! Found users count:", listUsers.users.length);
        
        console.log("Testing Firestore connection...");
        const db = admin.firestore();
        await db.collection('test').doc('ping').set({ time: new Date().toISOString() });
        console.log("Firestore Success!");
        
        process.exit(0);
    } catch (err) {
        console.error("Test failed:", err.message);
        if (err.code) console.log("Error Code:", err.code);
        process.exit(1);
    }
};

test();
