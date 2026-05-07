const { db, formatQuery } = require('../config/firebase');

exports.getDepartments = async (req, res) => {
    try {
        const snapshot = await db.collection('departments').get();
        const departments = formatQuery(snapshot);
        res.json(departments);
    } catch (err) {
        console.error("GetDepartments Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.createDepartment = async (req, res) => {
    try {
        const { name, key, description } = req.body;
        const newDep = {
            name,
            key,
            description: description || '',
            createdAt: new Date().toISOString()
        };
        const docRef = await db.collection('departments').add(newDep);
        res.json({ _id: docRef.id, ...newDep });
    } catch (err) {
        console.error("CreateDepartment Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};
