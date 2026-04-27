const { db } = require('./config/firebase');

const test = async () => {
    try {
        console.log("Testing Firestore connection...");
        await db.collection('test').doc('test').set({ hello: 'world' });
        console.log("Write success!");
        const doc = await db.collection('test').doc('test').get();
        console.log("Read success:", doc.data());
        process.exit(0);
    } catch (err) {
        console.error("Test failed:", err);
        process.exit(1);
    }
};

test();
