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
    const parents = [
        { code: '1000', name: 'Daromad', type: 'Revenue', isCalculated: false },
        { code: '2000', name: 'Sotuvdan chegirmalar va qaytimlar', type: 'Contra Revenue', isCalculated: false },
        { code: '3000', name: 'Tannarx / COGS', type: 'COGS', isCalculated: false },
        { code: '4000', name: 'Yalpi foyda', type: 'Calculated', isCalculated: true },
        { code: '5000', name: 'Sotuv va marketing xarajatlari', type: 'Expense', isCalculated: false },
        { code: '6000', name: 'Ma’muriy-boshqaruv xarajatlari', type: 'Expense', isCalculated: false },
        { code: '7000', name: 'Boshqa operatsion daromad va xarajatlar', type: 'Other Income / Expense', isCalculated: false },
        { code: '8000', name: 'Operatsion foyda', type: 'Calculated', isCalculated: true },
        { code: '9000', name: 'Moliyaviy daromad va xarajatlar', type: 'Finance Income / Expense', isCalculated: false },
        { code: '10000', name: 'Soliq xarajatlari', type: 'Tax', isCalculated: false },
        { code: '11000', name: 'Sof foyda', type: 'Calculated', isCalculated: true }
    ];

    const children = [
        { code: '1010', name: 'Mebel mahsulotlaridan daromad', type: 'Revenue', parentCode: '1000' },
        { code: '1020', name: 'Individual buyurtmalardan daromad', type: 'Revenue', parentCode: '1000' },
        { code: '1030', name: 'Korporativ buyurtmalardan daromad', type: 'Revenue', parentCode: '1000' },
        { code: '1040', name: 'Dilerlar orqali sotuvdan daromad', type: 'Revenue', parentCode: '1000' },
        { code: '1050', name: 'Franshiza orqali daromad', type: 'Revenue', parentCode: '1000' },
        { code: '1060', name: 'Yetkazib berish xizmatidan daromad', type: 'Revenue', parentCode: '1000' },
        { code: '1070', name: 'Montaj xizmatidan daromad', type: 'Revenue', parentCode: '1000' },
        { code: '1080', name: 'Boshqa sotuv daromadlari', type: 'Revenue', parentCode: '1000' },
        { code: '2010', name: 'Chegirmalar', type: 'Contra Revenue', parentCode: '2000' },
        { code: '2020', name: 'Qaytimlar', type: 'Contra Revenue', parentCode: '2000' },
        { code: '2030', name: 'Narx tuzatishlari', type: 'Contra Revenue', parentCode: '2000' },
        { code: '2040', name: 'Bekor qilingan sotuvlar', type: 'Contra Revenue', parentCode: '2000' },
        { code: '2050', name: 'Reklamatsiya sababli kamaytirishlar', type: 'Contra Revenue', parentCode: '2000' },
        { code: '3010', name: 'Xom ashyo va asosiy materiallar tannarxi', type: 'COGS', parentCode: '3000' },
        { code: '3020', name: 'Furnitura tannarxi', type: 'COGS', parentCode: '3000' },
        { code: '3030', name: 'Qadoqlash materiallari tannarxi', type: 'COGS', parentCode: '3000' },
        { code: '3040', name: 'Bevosita mehnat xarajatlari', type: 'COGS', parentCode: '3000' },
        { code: '3050', name: 'Tashqi xizmatlar tannarxi', type: 'COGS', parentCode: '3000' },
        { code: '3060', name: 'Bilvosita ishlab chiqarish xarajatlari', type: 'COGS', parentCode: '3000' },
        { code: '3070', name: 'Yetkazib berish tannarxi', type: 'COGS', parentCode: '3000' },
        { code: '3080', name: 'Montaj tannarxi', type: 'COGS', parentCode: '3000' },
        { code: '3090', name: 'Brak va qayta ishlash tannarxi', type: 'COGS', parentCode: '3000' },
        { code: '5010', name: 'Reklama xarajatlari', type: 'Expense', parentCode: '5000' },
        { code: '5020', name: 'SMM va kontent xarajatlari', type: 'Expense', parentCode: '5000' },
        { code: '5030', name: 'Target reklama xarajatlari', type: 'Expense', parentCode: '5000' },
        { code: '5040', name: 'Foto va video xarajatlari', type: 'Expense', parentCode: '5000' },
        { code: '5050', name: 'Sales manager ish haqi', type: 'Expense', parentCode: '5000' },
        { code: '5060', name: 'Sales bonus', type: 'Expense', parentCode: '5000' },
        { code: '5070', name: 'Komissiya xarajatlari', type: 'Expense', parentCode: '5000' },
        { code: '5080', name: 'Showroom xarajatlari', type: 'Expense', parentCode: '5000' },
        { code: '5090', name: 'Mijozlar bilan ishlash xarajatlari', type: 'Expense', parentCode: '5000' },
        { code: '5100', name: 'Sotuvoldi xarajatlari', type: 'Expense', parentCode: '5000' },
        { code: '5110', name: 'Yo‘qotilgan KP bo‘yicha xarajatlar', type: 'Expense', parentCode: '5000' },
        { code: '5120', name: 'Sovg‘a va mijozlarni kutib olish xarajatlari', type: 'Expense', parentCode: '5000' },
        { code: '6010', name: 'Rahbariyat ish haqi', type: 'Expense', parentCode: '6000' },
        { code: '6020', name: 'Moliya va buxgalteriya ish haqi', type: 'Expense', parentCode: '6000' },
        { code: '6030', name: 'HR xarajatlari', type: 'Expense', parentCode: '6000' },
        { code: '6040', name: 'Yuridik xizmatlar', type: 'Expense', parentCode: '6000' },
        { code: '6050', name: 'Ofis ijara xarajatlari', type: 'Expense', parentCode: '6000' },
        { code: '6060', name: 'Ofis kommunal xarajatlari', type: 'Expense', parentCode: '6000' },
        { code: '6070', name: 'Internet va aloqa', type: 'Expense', parentCode: '6000' },
        { code: '6080', name: 'Kanselyariya xarajatlari', type: 'Expense', parentCode: '6000' },
        { code: '6090', name: 'Cleaning va security', type: 'Expense', parentCode: '6000' },
        { code: '6100', name: 'Konsalting xizmatlari', type: 'Expense', parentCode: '6000' },
        { code: '6110', name: 'Audit xizmatlari', type: 'Expense', parentCode: '6000' },
        { code: '6120', name: 'IT va raqamli infratuzilma xarajatlari', type: 'Expense', parentCode: '6000' },
        { code: '6130', name: 'Ofis uskunalari xarajatlari', type: 'Expense', parentCode: '6000' },
        { code: '7010', name: 'Boshqa operatsion daromadlar', type: 'Other Income / Expense', parentCode: '7000' },
        { code: '7020', name: 'Boshqa operatsion xarajatlar', type: 'Other Income / Expense', parentCode: '7000' },
        { code: '7030', name: 'Jarima va penya xarajatlari', type: 'Other Income / Expense', parentCode: '7000' },
        { code: '7040', name: 'Materiallarni hisobdan chiqarish', type: 'Other Income / Expense', parentCode: '7000' },
        { code: '7050', name: 'Inventarizatsiya kamomadi', type: 'Other Income / Expense', parentCode: '7000' },
        { code: '7060', name: 'Eskirgan materiallar hisobdan chiqarilishi', type: 'Other Income / Expense', parentCode: '7000' },
        { code: '7070', name: 'Boshqa aktivlarni sotishdan daromad yoki zarar', type: 'Other Income / Expense', parentCode: '7000' },
        { code: '7080', name: 'Kompensatsiya va qoplamalar', type: 'Other Income / Expense', parentCode: '7000' },
        { code: '9010', name: 'Bank komissiyalari', type: 'Finance Income / Expense', parentCode: '9000' },
        { code: '9020', name: 'POS va online payment komissiyalari', type: 'Finance Income / Expense', parentCode: '9000' },
        { code: '9030', name: 'Kredit foizlari', type: 'Finance Income / Expense', parentCode: '9000' },
        { code: '9040', name: 'Leasing foizlari', type: 'Finance Income / Expense', parentCode: '9000' },
        { code: '9050', name: 'Valyuta kurs farqlari bo‘yicha zarar', type: 'Finance Income / Expense', parentCode: '9000' },
        { code: '9060', name: 'Valyuta kurs farqlari bo‘yicha daromad', type: 'Finance Income / Expense', parentCode: '9000' },
        { code: '9070', name: 'Foiz daromadlari', type: 'Finance Income / Expense', parentCode: '9000' },
        { code: '9080', name: 'Boshqa moliyaviy xarajatlar', type: 'Finance Income / Expense', parentCode: '9000' },
        { code: '9090', name: 'Boshqa moliyaviy daromadlar', type: 'Finance Income / Expense', parentCode: '9000' },
        { code: '10010', name: 'Foyda solig‘i', type: 'Tax', parentCode: '10000' },
        { code: '10020', name: 'Ijtimoiy soliq', type: 'Tax', parentCode: '10000' },
        { code: '10030', name: 'Mol-mulk solig‘i', type: 'Tax', parentCode: '10000' },
        { code: '10040', name: 'Yer solig‘i', type: 'Tax', parentCode: '10000' },
        { code: '10050', name: 'Suv resurslaridan foydalanganlik solig‘i', type: 'Tax', parentCode: '10000' },
        { code: '10060', name: 'Boshqa soliq xarajatlari', type: 'Tax', parentCode: '10000' }
    ];

    try {
        const snapshot = await db.collection('pnl_categories').get();
        const batchDelete = db.batch ? db.batch() : null;
        if (batchDelete) {
            snapshot.forEach(doc => batchDelete.delete(doc.ref));
            await batchDelete.commit();
        } else {
            for (const doc of snapshot.docs) {
                await doc.ref.delete();
            }
        }

        const parentCodeToIdMap = {};
        for (const p of parents) {
            const docRef = await db.collection('pnl_categories').add(p);
            parentCodeToIdMap[p.code] = docRef.id;
        }

        for (const c of children) {
            const parentId = parentCodeToIdMap[c.parentCode];
            if (!parentId) continue;
            await db.collection('pnl_categories').add({
                code: c.code,
                name: c.name,
                type: c.type,
                isCalculated: false,
                parentId: parentId
            });
        }
        res.json({ msg: 'Kategoriyalar muvaffaqiyatli qo\'shildi' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
