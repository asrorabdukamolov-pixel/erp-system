const { db } = require('./config/firebase');

const costCenters = [
    { code: 'PROD-001', name: 'Xom-ashyo (Material)', category: 'production', description: 'Mebel ishlab chiqarish uchun materiallar' },
    { code: 'SELL-001', name: 'Marketing va Reklama', category: 'selling', description: 'SMM, Target va boshqa reklama xarajatlari' },
    { code: 'FIN-002', name: 'Kredit Foizlari', category: 'financial', description: 'Bank kreditlari bo\'yicha to\'lanadigan foizlar' },
    { code: 'PROD-002', name: 'Fabrika Ijarasi', category: 'production', description: 'Sex va fabrika binosi uchun ijara' },
    { code: 'ADM-004', name: 'Ma\'muriy Ish haqi', category: 'admin', description: 'Ofis xodimlari va rahbariyat maoshi' },
    { code: 'SELL-003', name: 'Logistika (Yetkazib berish)', category: 'selling', description: 'Mijozlarga yetkazib berish transport xarajatlari' },
    { code: 'FIN-003', name: 'Valyuta Kursi Farqi', category: 'financial', description: 'Konvertatsiya va kurs o\'zgarishidan zararlar' },
    { code: 'ADM-001', name: 'Ofis Ijarasi', category: 'admin', description: 'Markaziy ofis ijara to\'lovi' },
    { code: 'SELL-002', name: 'Showroom Ijarasi', category: 'selling', description: 'Savdo do\'konlari uchun ijara to\'lovlari' },
    { code: 'PROD-003', name: 'Kommunal (Fabrika)', category: 'production', description: 'Fabrika elektr, suv va gaz xarajatlari' },
    { code: 'ADM-002', name: 'Ofis xarajatlari', category: 'admin', description: 'Kanselyariya, internet va xo\'jalik xarajatlari' },
    { code: 'FIN-001', name: 'Bank xizmatlari', category: 'financial', description: 'Bank komissiyalari va o\'tkazma xizmatlari' },
    { code: 'PROD-004', name: 'Usta ish haqi', category: 'production', description: 'Ishlab chiqarish ustalarining maoshlari' },
    { code: 'SELL-004', name: 'Sotuv menejeri bonusi', category: 'selling', description: 'Sotuvdan beriladigan foizlar' }
];

async function seed() {
    console.log("Starting to seed Cost Centers to " + process.env.GCLOUD_PROJECT);
    const batch = db.batch();
    
    for (const cc of costCenters) {
        const docRef = db.collection('cost_centers').doc();
        batch.set(docRef, {
            ...cc,
            createdAt: new Date().toISOString()
        });
    }
    
    await batch.commit();
    console.log("Successfully seeded 14 cost centers!");
    process.exit(0);
}

seed().catch(err => {
    console.error("Seed failed:", err);
    process.exit(1);
});
