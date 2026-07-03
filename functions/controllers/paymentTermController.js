const { db, formatQuery, formatDoc } = require('../config/firebase');

exports.getAll = async (req, res) => {
    try {
        const snapshot = await db.collection('payment_terms').orderBy('code').get();
        res.json(formatQuery(snapshot));
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const doc = await db.collection('payment_terms').doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ msg: 'To\'lov sharti topilmadi' });
        res.json(formatDoc(doc));
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const docRef = await db.collection('payment_terms').add({
            ...req.body,
            createdAt: new Date().toISOString()
        });
        const doc = await db.collection('payment_terms').doc(docRef.id).get();
        res.json(formatDoc(doc));
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        await db.collection('payment_terms').doc(req.params.id).update({
            ...req.body,
            updatedAt: new Date().toISOString()
        });
        const doc = await db.collection('payment_terms').doc(req.params.id).get();
        res.json(formatDoc(doc));
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        await db.collection('payment_terms').doc(req.params.id).delete();
        res.json({ msg: 'To\'lov sharti ўчирилди' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.seed = async (req, res) => {
    const sampleTerms = [
        {
            code: 'PT-001',
            name: '100% Oldindan to\'lov',
            type: 'Universal',
            model: 'Oldindan to\'lov',
            prepaymentPercent: 100,
            intermediatePercent: 0,
            finalPercent: 0,
            postponementDays: 0,
            trigger: 'Shartnoma imzolanganda',
            status: 'Active',
            description: 'To\'liq oldindan to\'lov sharti'
        },
        {
            code: 'PT-002',
            name: '50/50 Bosqichma-bosqich',
            type: 'Mijoz',
            model: 'Bosqichma-bosqich',
            prepaymentPercent: 50,
            intermediatePercent: 0,
            finalPercent: 50,
            postponementDays: 0,
            trigger: '50% buyurtmada, 50% tayyor bo\'lganda',
            status: 'Active',
            description: 'Standart mijoz to\'lov sharti'
        },
        {
            code: 'PT-003',
            name: '30 kunlik Отсрочка',
            type: 'Ta\'minotchi',
            model: 'Отсрочка',
            prepaymentPercent: 0,
            intermediatePercent: 0,
            finalPercent: 100,
            postponementDays: 30,
            trigger: 'Yuk qabul qilingandan so\'ng',
            status: 'Active',
            description: 'Yetkazib beruvchilar uchun kechiktirilgan to\'lov'
        }
    ];

    try {
        const batch = db.batch();
        for (const term of sampleTerms) {
            const docRef = db.collection('payment_terms').doc();
            batch.set(docRef, term);
        }
        await batch.commit();
        res.json({ msg: 'Namunaviy to\'lov shartlari қўшилди' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
