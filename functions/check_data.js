const { db } = require('./config/firebase');

async function checkProposals() {
    try {
        const snapshot = await db.collection('proposals').limit(10).get();
        console.log(`Found ${snapshot.size} proposals.`);
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`ID: ${doc.id}, ManagerId: ${data.managerId}, ManagerName: ${data.managerName}, Role: ${data.role || 'N/A'}, Status: ${data.status}`);
        });
        
        const usersSnapshot = await db.collection('users').get();
        console.log(`\nFound ${usersSnapshot.size} users.`);
        usersSnapshot.forEach(doc => {
            const data = doc.data();
            console.log(`UserID: ${doc.id}, Name: ${data.name}, Role: ${data.role}`);
        });
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkProposals();
