const { admin } = require('./config/firebase');

const test = async () => {
    try {
        console.log("Checking Firestore collections...");
        const db = admin.firestore();
        const collections = await db.listCollections();
        console.log("Success! Found collections:", collections.map(c => c.id));
        process.exit(0);
    } catch (err) {
        console.error("Connection failed:", err);
        process.exit(1);
    }
};

test();
