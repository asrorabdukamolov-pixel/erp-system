const admin = require('firebase-admin');
const serviceAccount = require('../config/firebase-service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

const defaultChains = [
    {
        key: 'pre_sale',
        name: 'Sotuvoldi xarajatlar arizalari (Pre-sale Expenses)',
        description: 'Sales Manager tomonidan sotuvoldi arizalarining tasdiqlanish jarayoni.',
        steps: [
            { id: 1, role: 'Savdo Rahbari (Sales Head)', condition: 'Barcha arizalar uchun', status: 'active' },
            { id: 2, role: 'Moliyaviy Rahbar (CFO)', condition: 'Agar summa > 5,000,000 UZS bo\'lsa', status: 'active' }
        ]
    },
    {
        key: 'purchase_request',
        name: 'Xarid arizalari (Purchase Requests)',
        description: 'Xoma-ashyo yoki ofis ehtiyojlari uchun sotib olish so\'rovlari.',
        steps: [
            { id: 1, role: 'Ombor mudiri / Sex boshlig\'i', condition: 'Barcha arizalar uchun', status: 'active' },
            { id: 2, role: 'Bosh direktor (CEO)', condition: 'Agar summa > 15,000,000 UZS bo\'lsa', status: 'active' }
        ]
    },
    {
        key: 'cash_outflow',
        name: 'Kassadan chiqim qilish arizalari (Cash Outflow)',
        description: 'Kassadan yoki bank hisobidan to\'lov qilish so\'rovlari.',
        steps: [
            { id: 1, role: 'Bosh Buxgalter', condition: 'Barcha chiqimlar uchun', status: 'active' },
            { id: 2, role: 'Moliyaviy rahbar (CFO)', condition: 'Barcha chiqimlar uchun', status: 'active' },
            { id: 3, role: 'Bosh direktor (CEO)', condition: 'Agar summa > 50,000,000 UZS bo\'lsa', status: 'active' }
        ]
    }
];

async function seed() {
  const colRef = db.collection('approval-matrix');
  const snapshot = await colRef.get();
  if (snapshot.empty) {
    for (const chain of defaultChains) {
      await colRef.add({ ...chain, createdAt: new Date().toISOString() });
    }
    console.log('Seeded approval matrix successfully');
  } else {
    console.log('Approval matrix already contains data');
  }
}

seed().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
