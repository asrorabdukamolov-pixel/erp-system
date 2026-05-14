const { db, formatQuery, formatDoc } = require('../config/firebase');

exports.getAll = async (req, res) => {
    try {
        const snapshot = await db.collection('currencies').orderBy('code').get();
        res.json(formatQuery(snapshot));
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const doc = await db.collection('currencies').doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ msg: 'Valyuta topilmadi' });
        res.json(formatDoc(doc));
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        // If this is set as base, unset others
        if (req.body.isBase) {
            const batch = db.batch();
            const bases = await db.collection('currencies').where('isBase', '==', true).get();
            bases.forEach(doc => {
                batch.update(doc.ref, { isBase: false });
            });
            await batch.commit();
        }

        const docRef = await db.collection('currencies').add({
            ...req.body,
            createdAt: new Date().toISOString()
        });
        const doc = await db.collection('currencies').doc(docRef.id).get();
        res.json(formatDoc(doc));
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        if (req.body.isBase) {
            const batch = db.batch();
            const bases = await db.collection('currencies').where('isBase', '==', true).get();
            bases.forEach(doc => {
                if (doc.id !== req.params.id) {
                    batch.update(doc.ref, { isBase: false });
                }
            });
            await batch.commit();
        }

        await db.collection('currencies').doc(req.params.id).update({
            ...req.body,
            updatedAt: new Date().toISOString()
        });
        const doc = await db.collection('currencies').doc(req.params.id).get();
        res.json(formatDoc(doc));
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        await db.collection('currencies').doc(req.params.id).delete();
        res.json({ msg: 'Valyuta ўчирилди' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.seed = async (req, res) => {
    const sampleCurrencies = [
        {
            code: 'UZS',
            name: 'O\'zbek so\'mi',
            symbol: 'so\'m',
            isBase: true,
            decimalPlaces: 0,
            needsRate: false,
            status: 'Active',
            description: 'Milliy valyuta'
        },
        {
            code: 'USD',
            name: 'AQSH Dollari',
            symbol: '$',
            isBase: false,
            decimalPlaces: 2,
            needsRate: true,
            status: 'Active',
            description: 'AQSH dollari'
        },
        {
            code: 'EUR',
            name: 'Evro',
            symbol: '€',
            isBase: false,
            decimalPlaces: 2,
            needsRate: true,
            status: 'Active',
            description: 'Evropa valyutasi'
        }
    ];

    try {
        const batch = db.batch();
        for (const curr of sampleCurrencies) {
            const docRef = db.collection('currencies').doc();
            batch.set(docRef, curr);
        }
        await batch.commit();
        res.json({ msg: 'Namunaviy valyutalar қўшилди' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
