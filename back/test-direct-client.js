const { Firestore } = require('@google-cloud/firestore');

const test = async () => {
    try {
        console.log("Testing with @google-cloud/firestore directly...");
        const firestore = new Firestore({
            projectId: 'express-erp-a764b',
            keyFilename: 'C:/Users/Asus/Downloads/express-erp-a764b-firebase-adminsdk-fbsvc-25066309cd.json'
        });

        console.log("Attempting to write...");
        await firestore.collection('test').doc('direct_test').set({
            msg: 'Hello from direct client',
            time: new Date().toISOString()
        });
        console.log("Write success!");

        const doc = await firestore.collection('test').doc('direct_test').get();
        console.log("Read success:", doc.data());
        process.exit(0);
    } catch (err) {
        console.error("Direct test failed:", err);
        process.exit(1);
    }
};

test();
