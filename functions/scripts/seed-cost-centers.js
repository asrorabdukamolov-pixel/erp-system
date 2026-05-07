const admin = require('firebase-admin');
const serviceAccount = require('./test-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

const initialCostCenters = [
    // Production (Tannarx)
    { name: 'Xom-ashyo (Material)', category: 'production', code: 'PROD-001', description: 'Mebel ishlab chiqarish uchun materiallar' },
    { name: 'Fabrika Ijarasi', category: 'production', code: 'PROD-002', description: 'Sex va fabrika binosi uchun ijara' },
    { name: 'Fabrika Ish haqi', category: 'production', code: 'PROD-003', description: 'Usta va sex ishchilari maoshi' },
    
    // Selling (Sotish)
    { name: 'Marketing va Reklama', category: 'selling', code: 'SELL-001', description: 'SMM, Target va boshqa reklama xarajatlari' },
    { name: 'Showroom Ijarasi', category: 'selling', code: 'SELL-002', description: 'Savdo do\'konlari uchun ijara to\'lovlari' },
    { name: 'Logistika (Yetkazib berish)', category: 'selling', code: 'SELL-003', description: 'Mijozlarga yetkazib berish transport xarajatlari' },
    { name: 'Sotuv Komissiyasi', category: 'selling', code: 'SELL-004', description: 'Menejerlar uchun sotuvdan bonuslar' },

    // Admin (Ma'muriy)
    { name: 'Ofis Ijarasi', category: 'admin', code: 'ADM-001', description: 'Markaziy ofis ijara to\'lovi' },
    { name: 'Kommunal To\'lovlar', category: 'admin', code: 'ADM-002', description: 'Svet, gaz, suv va internet' },
    { name: 'Kantselyariya', category: 'admin', code: 'ADM-003', description: 'Ofis ashyolari va xarajatlari' },
    { name: 'Ma\'muriy Ish haqi', category: 'admin', code: 'ADM-004', description: 'Ofis xodimlari va rahbariyat maoshi' },

    // Financial (Moliyaviy)
    { name: 'Bank Komissiyasi', category: 'financial', code: 'FIN-001', description: 'Bank o\'tkazmalari va xizmatlari uchun to\'lovlar' },
    { name: 'Kredit Foizlari', category: 'financial', code: 'FIN-002', description: 'Bank kreditlari bo\'yicha to\'lanadigan foizlar' },
    { name: 'Valyuta Kursi Farqi', category: 'financial', code: 'FIN-003', description: 'Konvertatsiya va kurs o\'zgarishidan zararlar' }
];

async function seed() {
    console.log("Seeding Cost Centers...");
    const batch = db.batch();
    
    for (const center of initialCostCenters) {
        const ref = db.collection('costCenters').doc();
        batch.set(ref, {
            ...center,
            status: 'active',
            createdAt: new Date().toISOString()
        });
    }
    
    await batch.commit();
    console.log("Successfully seeded initial cost centers!");
    process.exit();
}

seed().catch(err => {
    console.error("Seed error:", err);
    process.exit(1);
});
