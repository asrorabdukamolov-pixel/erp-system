const { db, formatQuery } = require('../config/firebase');

exports.getCostCenters = async (req, res) => {
    try {
        const snapshot = await db.collection('costCenters').get();
        const centers = formatQuery(snapshot);
        res.json(centers);
    } catch (err) {
        console.error("GetCostCenters Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.createCostCenter = async (req, res) => {
    try {
        const { name, category, description, code } = req.body;
        
        // category should be one of: 'production', 'selling', 'admin', 'financial'
        const newCenter = {
            name,
            category,
            code: code || '',
            description: description || '',
            status: 'active',
            createdAt: new Date().toISOString()
        };
        
        const docRef = await db.collection('costCenters').add(newCenter);
        res.json({ _id: docRef.id, ...newCenter });
    } catch (err) {
        console.error("CreateCostCenter Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.updateCostCenter = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        await db.collection('costCenters').doc(id).update(updates);
        res.json({ msg: "Muvaffaqiyatli yangilandi" });
    } catch (err) {
        console.error("UpdateCostCenter Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.deleteCostCenter = async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('costCenters').doc(id).delete();
        res.json({ msg: "Muvaffaqiyatli o'chirildi" });
    } catch (err) {
        console.error("DeleteCostCenter Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};
