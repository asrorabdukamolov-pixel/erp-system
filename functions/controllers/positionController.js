const { db, formatQuery, formatDoc } = require('../config/firebase');

exports.getPositions = async (req, res) => {
    try {
        const snapshot = await db.collection('positions').get();
        res.json(formatQuery(snapshot));
    } catch (err) {
        console.error("GetPositions Error:", err.message);
        res.status(500).json({ msg: 'Server xatosi: ' + err.message });
    }
};

exports.createPosition = async (req, res) => {
    try {
        const { name, code, description, departmentId, departmentName } = req.body;
        const newPos = {
            name,
            code: code.toUpperCase().trim(),
            description: description || '',
            departmentId: departmentId || '',
            departmentName: departmentName || '',
            createdAt: new Date().toISOString()
        };
        const docRef = await db.collection('positions').add(newPos);
        res.json({ _id: docRef.id, ...newPos });
    } catch (err) {
        console.error("CreatePosition Error:", err.message);
        res.status(500).json({ msg: 'Server xatosi: ' + err.message });
    }
};

exports.updatePosition = async (req, res) => {
    try {
        const { name, code, description, departmentId, departmentName } = req.body;
        const posRef = db.collection('positions').doc(req.params.id);
        const doc = await posRef.get();

        if (!doc.exists) return res.status(404).json({ msg: 'Lavozim topilmadi' });

        const updateData = {};
        if (name) updateData.name = name;
        if (code) updateData.code = code.toUpperCase().trim();
        if (description !== undefined) updateData.description = description;
        if (departmentId !== undefined) updateData.departmentId = departmentId;
        if (departmentName !== undefined) updateData.departmentName = departmentName;

        await posRef.update(updateData);
        const updatedDoc = await posRef.get();
        res.json(formatDoc(updatedDoc));
    } catch (err) {
        console.error("UpdatePosition Error:", err.message);
        res.status(500).json({ msg: 'Server xatosi: ' + err.message });
    }
};

exports.deletePosition = async (req, res) => {
    try {
        const posRef = db.collection('positions').doc(req.params.id);
        const doc = await posRef.get();

        if (!doc.exists) return res.status(404).json({ msg: 'Lavozim topilmadi' });

        await posRef.delete();
        res.json({ msg: 'Lavozim o\'chirildi' });
    } catch (err) {
        console.error("DeletePosition Error:", err.message);
        res.status(500).json({ msg: 'Server xatosi: ' + err.message });
    }
};
