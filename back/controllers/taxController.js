const { db, formatQuery, formatDoc } = require('../config/firebase');

// TAX TYPES
exports.getAllTypes = async (req, res) => {
    try {
        const snapshot = await db.collection('tax_types').get();
        res.json(formatQuery(snapshot));
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.createType = async (req, res) => {
    try {
        const docRef = await db.collection('tax_types').add({
            ...req.body,
            createdAt: new Date().toISOString()
        });
        const doc = await db.collection('tax_types').doc(docRef.id).get();
        res.json(formatDoc(doc));
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.updateType = async (req, res) => {
    try {
        await db.collection('tax_types').doc(req.params.id).update({
            ...req.body,
            updatedAt: new Date().toISOString()
        });
        const doc = await db.collection('tax_types').doc(req.params.id).get();
        res.json(formatDoc(doc));
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.deleteType = async (req, res) => {
    try {
        await db.collection('tax_types').doc(req.params.id).delete();
        res.json({ msg: 'Soliq turi ўчирилди' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// TAX RATES
exports.getAllRates = async (req, res) => {
    try {
        const snapshot = await db.collection('tax_rates').get();
        res.json(formatQuery(snapshot));
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.createRate = async (req, res) => {
    try {
        const docRef = await db.collection('tax_rates').add({
            ...req.body,
            createdAt: new Date().toISOString()
        });
        const doc = await db.collection('tax_rates').doc(docRef.id).get();
        res.json(formatDoc(doc));
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.updateRate = async (req, res) => {
    try {
        await db.collection('tax_rates').doc(req.params.id).update({
            ...req.body,
            updatedAt: new Date().toISOString()
        });
        const doc = await db.collection('tax_rates').doc(req.params.id).get();
        res.json(formatDoc(doc));
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.deleteRate = async (req, res) => {
    try {
        await db.collection('tax_rates').doc(req.params.id).delete();
        res.json({ msg: 'Soliq stavkasi ўчирилди' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.seed = async (req, res) => {
    const sampleTypes = [
        {
            code: 'VAT',
            name: 'QQS (НДС)',
            group: 'QQS / VAT',
            accountingType: 'Invoice-based',
            accountingImpact: 'Balance Sheet & P&L',
            recoverable: true,
            pnlCategoryId: '',
            cashflowArticleId: '',
            active: true,
            description: 'Qo\'shilgan qiymat solig\'i'
        },
        {
            code: 'IT',
            name: 'Foyda solig\'i',
            group: 'Foyda solig\'i',
            accountingType: 'Profit-based',
            accountingImpact: 'P&L',
            recoverable: false,
            pnlCategoryId: '',
            cashflowArticleId: '',
            active: true,
            description: 'Daromad/Foyda solig\'i'
        },
        {
            code: 'PAY',
            name: 'Ijtimoiy soliq',
            group: 'Ish haqi soliqlari',
            accountingType: 'Payroll-based',
            accountingImpact: 'P&L Expense',
            recoverable: false,
            pnlCategoryId: '',
            cashflowArticleId: '',
            active: true,
            description: 'Ish haqi fondidan olinadigan soliq'
        }
    ];

    try {
        const batch = db.batch();
        for (const type of sampleTypes) {
            const docRef = db.collection('tax_types').doc();
            batch.set(docRef, type);
        }
        await batch.commit();
        res.json({ msg: 'Namunaviy soliqlar қўшилди' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
