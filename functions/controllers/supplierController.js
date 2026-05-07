const { db, formatQuery, formatDoc, admin } = require('../config/firebase');

exports.getSuppliers = async (req, res) => {
    try {
        const suppliersRef = db.collection('suppliers');
        let snapshot;

        if (req.user.role !== 'super') {
            snapshot = await suppliersRef.where(
                admin.firestore.Filter.or(
                    admin.firestore.Filter.where('showroom', '==', req.user.showroom),
                    admin.firestore.Filter.where('isGlobal', '==', true)
                )
            ).get();
        } else {
            snapshot = await suppliersRef.get();
        }

        const suppliers = formatQuery(snapshot);
        suppliers.sort((a, b) => (a.firm || '').localeCompare(b.firm || ''));
        res.json(suppliers);
    } catch (err) {
        console.error("GetSuppliers Error:", err.message);
        res.status(500).json({ message: 'Yetkazib beruvchilarni olishda xatolik: ' + err.message });
    }
};

exports.createSupplier = async (req, res) => {
    try {
        const newSupplier = {
            ...req.body,
            showroom: req.user.role === 'super' ? 'Global' : req.user.showroom || '',
            addedBy: req.user.name,
            isGlobal: req.user.role === 'super',
            createdAt: new Date().toISOString()
        };
        const docRef = await db.collection('suppliers').add(newSupplier);
        res.json({ _id: docRef.id, ...newSupplier });
    } catch (err) {
        res.status(500).json({ message: 'Saqlashda xatolik: ' + err.message });
    }
};

exports.updateSupplier = async (req, res) => {
    try {
        const supplierRef = db.collection('suppliers').doc(req.params.id);
        const doc = await supplierRef.get();
        if (!doc.exists) return res.status(404).json({ message: 'Topilmadi' });
        const supplier = doc.data();

        if (req.user.role !== 'super' && (supplier.isGlobal || supplier.showroom === 'Global')) {
            return res.status(403).json({ message: 'Siz Super Admin kiritgan ma\'lumotni o\'zgartira olmaysiz' });
        }

        await supplierRef.update(req.body);
        const updated = await supplierRef.get();
        res.json(formatDoc(updated));
    } catch (err) {
        res.status(500).json({ message: 'Yangilashda xatolik: ' + err.message });
    }
};

exports.deleteSupplier = async (req, res) => {
    try {
        const supplierRef = db.collection('suppliers').doc(req.params.id);
        const doc = await supplierRef.get();
        if (!doc.exists) return res.status(404).json({ message: 'Topilmadi' });
        const supplier = doc.data();

        if (req.user.role !== 'super' && (supplier.isGlobal || supplier.showroom === 'Global')) {
            return res.status(403).json({ message: 'Siz Super Admin kiritgan ma\'lumotni o\'chira olmaysiz' });
        }

        await supplierRef.delete();
        res.json({ message: 'Muvaffaqiyatli o\'chirildi' });
    } catch (err) {
        console.error("Delete Supplier Error:", err);
        res.status(500).json({ message: 'O\'chirishda xatolik: ' + err.message });
    }
};
