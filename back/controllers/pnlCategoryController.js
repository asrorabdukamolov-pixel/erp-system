const { db, formatQuery, formatDoc } = require('../config/firebase');

exports.getAll = async (req, res) => {
    try {
        const snapshot = await db.collection('pnl_categories').orderBy('code').get();
        res.json(formatQuery(snapshot));
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const docRef = await db.collection('pnl_categories').add(req.body);
        const doc = await db.collection('pnl_categories').doc(docRef.id).get();
        res.json(formatDoc(doc));
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        await db.collection('pnl_categories').doc(req.params.id).update(req.body);
        const doc = await db.collection('pnl_categories').doc(req.params.id).get();
        res.json(formatDoc(doc));
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        await db.collection('pnl_categories').doc(req.params.id).delete();
        res.json({ msg: 'Kategoriya o\'chirildi' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

exports.seed = async (req, res) => {
    const categories = [
        { code: '1000', name: 'Daromad', type: 'Revenue', isCalculated: false },
        { code: '1010', name: 'Mebel mahsulotlari sotuvdan tushum', type: 'Revenue', isCalculated: false, parentCode: '1000' },
        { code: '1020', name: 'Individual buyurtmalar bo‘yicha tushum', type: 'Revenue', isCalculated: false, parentCode: '1000' },
        { code: '1030', name: 'Korporativ buyurtmalar bo‘yicha tushum', type: 'Revenue', isCalculated: false, parentCode: '1000' },
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
        const batch = db.batch ? db.batch() : null;
        
        // We need to handle parentId linking in seed. 
        // First add all, then we'd need IDs. For seed, I'll just save them.
        // The UI will handle parentId based on _id.
        
        if (batch) {
            for (const cat of categories) {
                const docRef = db.collection('pnl_categories').doc();
                batch.set(docRef, cat);
            }
            await batch.commit();
        } else {
            for (const cat of categories) {
                await db.collection('pnl_categories').add(cat);
            }
        }
        res.json({ msg: 'Kategoriyalar muvaffaqiyatli qo\'shildi' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
