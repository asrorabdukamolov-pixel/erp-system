const { db, formatQuery } = require('../config/firebase');
const bcrypt = require('bcryptjs');

exports.getFactories = async (req, res) => {
    try {
        const snapshot = await db.collection('factories').orderBy('createdAt', 'desc').get();
        res.json(formatQuery(snapshot));
    } catch (err) {
        console.error("GetFactories Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.createFactory = async (req, res) => {
    try {
        const { name, address, login, password, phone } = req.body;

        const usersRef = db.collection('users');
        const userSnapshot = await usersRef.where('login', '==', login.toLowerCase()).get();
        if (!userSnapshot.empty) {
            return res.status(400).json({ msg: 'Bu login allaqachon band' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newFactory = {
            name,
            address,
            phone,
            login: login.toLowerCase(),
            status: 'Faol',
            createdAt: new Date().toISOString()
        };

        const factoryDoc = await db.collection('factories').add(newFactory);

        const newUser = {
            name: name,
            surname: 'Fabrika',
            login: login.toLowerCase(),
            password: hashedPassword,
            role: 'fabrika',
            phone: phone,
            status: 'active',
            createdAt: new Date().toISOString()
        };

        await db.collection('users').add(newUser);

        res.json({ _id: factoryDoc.id, ...newFactory });
    } catch (err) {
        console.error("CreateFactory Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.updateFactory = async (req, res) => {
    try {
        const { name, address, login, password, status, phone } = req.body;
        
        const factoryRef = db.collection('factories').doc(req.params.id);
        const doc = await factoryRef.get();
        if (!doc.exists) return res.status(404).json({ msg: 'Fabrika topilmadi' });
        const oldData = doc.data();

        const userSnapshot = await db.collection('users').where('login', '==', oldData.login).get();
        if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            const userData = {};
            if (name) userData.name = name;
            if (login) userData.login = login.toLowerCase();
            if (phone) userData.phone = phone;
            if (status) userData.status = status === 'Faol' ? 'active' : 'inactive';
            
            if (password) {
                const salt = await bcrypt.genSalt(10);
                userData.password = await bcrypt.hash(password, salt);
            }
            await userDoc.ref.update(userData);
        }

        const factoryData = {
            name: name || oldData.name,
            address: address || oldData.address,
            login: login ? login.toLowerCase() : oldData.login,
            status: status || oldData.status,
            phone: phone || oldData.phone
        };

        await factoryRef.update(factoryData);
        res.json({ _id: req.params.id, ...factoryData });
    } catch (err) {
        console.error("UpdateFactory Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.deleteFactory = async (req, res) => {
    try {
        const factoryRef = db.collection('factories').doc(req.params.id);
        const doc = await factoryRef.get();
        if (!doc.exists) return res.status(404).json({ msg: 'Fabrika topilmadi' });
        const data = doc.data();

        const userSnapshot = await db.collection('users').where('login', '==', data.login).get();
        if (!userSnapshot.empty) {
            await userSnapshot.docs[0].ref.delete();
        }
        
        await factoryRef.delete();
        res.json({ msg: 'Fabrika o\'chirildi' });
    } catch (err) {
        console.error("DeleteFactory Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};
