const { db, formatQuery, formatDoc } = require('../config/firebase');

exports.getAll = async (req, res) => {
    try {
        const snapshot = await db.collection('bank_accounts').orderBy('code').get();
        res.json(formatQuery(snapshot));
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const doc = await db.collection('bank_accounts').doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ msg: 'Hisob topilmadi' });
        res.json(formatDoc(doc));
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const docRef = await db.collection('bank_accounts').add({
            ...req.body,
            createdAt: new Date().toISOString()
        });
        const doc = await db.collection('bank_accounts').doc(docRef.id).get();
        res.json(formatDoc(doc));
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        await db.collection('bank_accounts').doc(req.params.id).update({
            ...req.body,
            updatedAt: new Date().toISOString()
        });
        const doc = await db.collection('bank_accounts').doc(req.params.id).get();
        res.json(formatDoc(doc));
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        await db.collection('bank_accounts').doc(req.params.id).delete();
        res.json({ msg: 'Hisob ўчирилди' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.seed = async (req, res) => {
    const sampleAccounts = [
        {
            code: '101',
            name: 'Asosiy Kassa',
            type: 'Cash',
            currency: 'UZS',
            bankName: '-',
            accountNumber: '-',
            responsiblePerson: 'Aliyev Vali',
            costCenter: 'Ma\'muriyat',
            status: 'Active',
            description: 'Asosiy do\'kon kassasi'
        },
        {
            code: '201',
            name: 'Ipak Yo\'li Banki (Valyuta)',
            type: 'Bank',
            currency: 'USD',
            bankName: 'Ipak Yo\'li',
            accountNumber: '20208840123456789001',
            responsiblePerson: 'G\'aniyeva Gulnoza',
            costCenter: 'Xaridlar',
            status: 'Active',
            description: 'Import to\'lovlari uchun'
        }
    ];

    try {
        const batch = db.batch ? db.batch() : null;
        if (batch) {
            for (const acc of sampleAccounts) {
                const docRef = db.collection('bank_accounts').doc();
                batch.set(docRef, acc);
            }
            await batch.commit();
        } else {
            for (const acc of sampleAccounts) {
                await db.collection('bank_accounts').add(acc);
            }
        }
        res.json({ msg: 'Namunaviy hisoblar қўшилди' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
