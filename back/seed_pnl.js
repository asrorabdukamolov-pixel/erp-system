const { db } = require('./config/firebase');

async function seed() {
    const categories = [
        { code: '1000', name: 'Sotuvdan tushum', type: 'Revenue', isCalculated: false },
        { code: '2000', name: 'Sotuvdan chegirmalar va qaytimlar', type: 'Contra Revenue', isCalculated: false },
        { code: '3000', name: 'Tannarx / COGS', type: 'COGS', isCalculated: false },
        { code: '4000', name: 'Yalpi foyda', type: 'Calculated', isCalculated: true },
        { code: '5000', name: 'Sotuv va marketing xarajatlari', type: 'Expense', isCalculated: false },
        { code: '6000', name: 'Ma\'muriy-boshqaruv xarajatlari', type: 'Expense', isCalculated: false },
        { code: '7000', name: 'Boshqa operatsion daromad va xarajatlar', type: 'Other Income / Expense', isCalculated: false },
        { code: '8000', name: 'Operatsion foyda', type: 'Calculated', isCalculated: true },
        { code: '9000', name: 'Moliyaviy daromad va xarajatlar', type: 'Finance Income / Expense', isCalculated: false },
        { code: '10000', name: 'Soliq xarajatlari', type: 'Tax', isCalculated: false },
        { code: '11000', name: 'Sof foyda', type: 'Calculated', isCalculated: true }
    ];

    try {
        console.log("Seeding Firestore...");
        for (const cat of categories) {
            // Check if already exists by code
            const snapshot = await db.collection('pnl_categories').where('code', '==', cat.code).get();
            if (snapshot.empty) {
                await db.collection('pnl_categories').add(cat);
                console.log(`Added: ${cat.name}`);
            } else {
                // Update existing
                const docId = snapshot.docs[0].id;
                await db.collection('pnl_categories').doc(docId).update(cat);
                console.log(`Updated: ${cat.name}`);
            }
        }
        console.log("Seeding completed!");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
}

seed();
