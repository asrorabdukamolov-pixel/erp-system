const { db, formatQuery, formatDoc } = require('../config/firebase');

exports.getAll = (collectionName) => async (req, res) => {
    try {
        const snapshot = await db.collection(collectionName).get();
        res.json(formatQuery(snapshot));
    } catch (err) {
        console.error(`Get ${collectionName} Error:`, err.message);
        res.status(500).json({ msg: 'Server xatosi: ' + err.message });
    }
};

exports.create = (collectionName) => async (req, res) => {
    try {
        const data = { 
            ...req.body,
            createdAt: new Date().toISOString()
        };
        const docRef = await db.collection(collectionName).add(data);
        res.json({ _id: docRef.id, ...data });
    } catch (err) {
        console.error(`Create ${collectionName} Error:`, err.message);
        res.status(500).json({ msg: 'Server xatosi: ' + err.message });
    }
};

exports.update = (collectionName) => async (req, res) => {
    try {
        const docRef = db.collection(collectionName).doc(req.params.id);
        const doc = await docRef.get();

        if (!doc.exists) return res.status(404).json({ msg: 'Ma\'lumot topilmadi' });

        await docRef.update(req.body);
        const updatedDoc = await docRef.get();
        res.json(formatDoc(updatedDoc));
    } catch (err) {
        console.error(`Update ${collectionName} Error:`, err.message);
        res.status(500).json({ msg: 'Server xatosi: ' + err.message });
    }
};

exports.delete = (collectionName) => async (req, res) => {
    try {
        const docRef = db.collection(collectionName).doc(req.params.id);
        const doc = await docRef.get();

        if (!doc.exists) return res.status(404).json({ msg: 'Ma\'lumot topilmadi' });

        await docRef.delete();
        res.json({ msg: 'Ma\'lumot o\'chirildi' });
    } catch (err) {
        console.error(`Delete ${collectionName} Error:`, err.message);
        res.status(500).json({ msg: 'Server xatosi: ' + err.message });
    }
};
