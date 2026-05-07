const { db } = require('./config/firebase');

const listUsers = async () => {
    try {
        console.log("Listing users from Firestore...");
        const snapshot = await db.collection('users').get();
        if (snapshot.empty) {
            console.log("No users found.");
        } else {
            snapshot.forEach(doc => {
                const data = doc.data();
                console.log(`ID: ${doc.id}, Login: ${data.login}, Role: ${data.role}`);
            });
        }
        process.exit(0);
    } catch (err) {
        console.error("Error listing users:", err);
        process.exit(1);
    }
};

listUsers();
