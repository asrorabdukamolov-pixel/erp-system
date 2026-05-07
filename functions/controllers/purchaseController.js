const { db, formatQuery, formatDoc } = require('../config/firebase');

exports.getPurchases = async (req, res) => {
    try {
        let queryRef = db.collection('purchases');
        if (req.user.role !== 'super') {
            queryRef = queryRef.where('showroom', '==', req.user.showroom || '');
        }
        
        const snapshot = await queryRef.get();
        const purchases = formatQuery(snapshot);
        purchases.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(purchases);
    } catch (err) {
        console.error("GetPurchases Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.createPurchase = async (req, res) => {
    try {
        const newPurchase = {
            ...req.body,
            showroom: req.user.showroom || '',
            createdAt: new Date().toISOString()
        };
        const docRef = await db.collection('purchases').add(newPurchase);
        res.json({ _id: docRef.id, ...newPurchase });
    } catch (err) {
        console.error("CreatePurchase Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.updatePurchase = async (req, res) => {
    try {
        const purchaseRef = db.collection('purchases').doc(req.params.id);
        const doc = await purchaseRef.get();
        if (!doc.exists) return res.status(404).json({ msg: 'Xarid topilmadi' });

        await purchaseRef.update(req.body);
        const updated = await purchaseRef.get();
        res.json(formatDoc(updated));
    } catch (err) {
        console.error("UpdatePurchase Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.deletePurchase = async (req, res) => {
    try {
        const purchaseRef = db.collection('purchases').doc(req.params.id);
        const doc = await purchaseRef.get();
        if (!doc.exists) return res.status(404).json({ msg: 'Xarid topilmadi' });
        
        await purchaseRef.delete();
        res.json({ msg: 'Xarid o\'chirildi' });
    } catch (err) {
        console.error("DeletePurchase Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};
