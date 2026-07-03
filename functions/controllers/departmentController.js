const { db, formatQuery, formatDoc } = require('../config/firebase');

exports.getDepartments = async (req, res) => {
    try {
        const snapshot = await db.collection('departments').get();
        const departments = formatQuery(snapshot);
        res.json(departments);
    } catch (err) {
        console.error("GetDepartments Error:", err.message);
        res.status(500).json({ msg: 'Server xatosi: ' + err.message });
    }
};

exports.createDepartment = async (req, res) => {
    try {
        const { name, key, description } = req.body;
        const newDep = {
            name,
            key: key.toLowerCase().trim(),
            description: description || '',
            createdAt: new Date().toISOString()
        };
        const docRef = await db.collection('departments').add(newDep);
        res.json({ _id: docRef.id, ...newDep });
    } catch (err) {
        console.error("CreateDepartment Error:", err.message);
        res.status(500).json({ msg: 'Server xatosi: ' + err.message });
    }
};

exports.updateDepartment = async (req, res) => {
    try {
        const { name, key, description } = req.body;
        const depRef = db.collection('departments').doc(req.params.id);
        const doc = await depRef.get();

        if (!doc.exists) return res.status(404).json({ msg: 'Bo\'lim topilmadi' });

        const updateData = {};
        if (name) updateData.name = name;
        if (key) updateData.key = key.toLowerCase().trim();
        if (description !== undefined) updateData.description = description;

        await depRef.update(updateData);
        const updatedDoc = await depRef.get();
        res.json(formatDoc(updatedDoc));
    } catch (err) {
        console.error("UpdateDepartment Error:", err.message);
        res.status(500).json({ msg: 'Server xatosi: ' + err.message });
    }
};

exports.deleteDepartment = async (req, res) => {
    try {
        const depRef = db.collection('departments').doc(req.params.id);
        const doc = await depRef.get();

        if (!doc.exists) return res.status(404).json({ msg: 'Bo\'lim topilmadi' });

        await depRef.delete();
        res.json({ msg: 'Bo\'lim o\'chirildi' });
    } catch (err) {
        console.error("DeleteDepartment Error:", err.message);
        res.status(500).json({ msg: 'Server xatosi: ' + err.message });
    }
};
