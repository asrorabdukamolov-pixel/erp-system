const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { db } = require('./config/firebase');

const app = express();

// Middleware
app.use(cors());
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const path = require('path');

const functions = require('firebase-functions');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/showrooms', require('./routes/showroomRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/partners', require('./routes/partnerRoutes'));
app.use('/api/purchases', require('./routes/purchaseRoutes'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/migration', require('./routes/migration'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/proposals', require('./routes/proposalRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/factories', require('./routes/factoryRoutes'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/telegram', require('./routes/telegramRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/cost-centers', require('./routes/costCenterRoutes'));
app.use('/api/integrations', require('./routes/integrationRoutes'));

app.get('/api/setup', async (req, res) => {
    try {
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

        const batch = db.batch();
        const existing = await db.collection('cost_centers').get();
        if (existing.size > 0) return res.json({ msg: "Already seeded" });

        for (const cc of costCenters) {
            const docRef = db.collection('cost_centers').doc();
            batch.set(docRef, { ...cc, createdAt: new Date().toISOString() });
        }
        await batch.commit();
        res.json({ msg: "Success", count: costCenters.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Export as Firebase Function
exports.api = functions.https.onRequest(app);

// Keep listen for local development only
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} with Firestore`);
    });
}
