const { db, formatQuery, formatDoc } = require('../config/firebase');
const bcrypt = require('bcryptjs');

exports.getShowrooms = async (req, res) => {
    try {
        const snapshot = await db.collection('showrooms').orderBy('createdAt', 'desc').get();
        res.json(formatQuery(snapshot));
    } catch (err) {
        console.error("GetShowrooms Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.createShowroom = async (req, res) => {
    try {
        const { name, address, adminName, adminSurname, login, password, phone } = req.body;

        const usersRef = db.collection('users');
        const userSnapshot = await usersRef.where('login', '==', login.toLowerCase()).get();
        if (!userSnapshot.empty) {
            return res.status(400).json({ msg: 'Bu login allaqachon band' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newShowroom = {
            name,
            address,
            adminName,
            adminSurname,
            phone,
            login: login.toLowerCase(),
            status: 'Faol',
            createdAt: new Date().toISOString()
        };

        const showroomDoc = await db.collection('showrooms').add(newShowroom);

        const newUser = {
            name: adminName,
            surname: adminSurname,
            login: login.toLowerCase(),
            password: hashedPassword,
            role: 'showroom',
            phone: phone,
            showroom: name,
            status: 'active',
            createdAt: new Date().toISOString()
        };

        await db.collection('users').add(newUser);

        res.json({ _id: showroomDoc.id, ...newShowroom });
    } catch (err) {
        console.error("CreateShowroom Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.updateShowroom = async (req, res) => {
    try {
        const { name, address, adminName, adminSurname, login, password, status, phone } = req.body;
        
        const showroomRef = db.collection('showrooms').doc(req.params.id);
        const doc = await showroomRef.get();
        if (!doc.exists) return res.status(404).json({ msg: 'Showroom topilmadi' });
        const oldData = doc.data();

        const userSnapshot = await db.collection('users').where('login', '==', oldData.login).get();
        if (!userSnapshot.empty) {
            const userDoc = userSnapshot.docs[0];
            const userData = {};
            if (adminName) userData.name = adminName;
            if (adminSurname) userData.surname = adminSurname;
            if (login) userData.login = login.toLowerCase();
            if (phone) userData.phone = phone;
            if (status) userData.status = status === 'Faol' ? 'active' : 'inactive';
            
            if (password) {
                const salt = await bcrypt.genSalt(10);
                userData.password = await bcrypt.hash(password, salt);
            }
            await userDoc.ref.update(userData);
        }

        const showroomData = {
            name: name || oldData.name,
            address: address || oldData.address,
            adminName: adminName || oldData.adminName,
            adminSurname: adminSurname || oldData.adminSurname,
            login: login ? login.toLowerCase() : oldData.login,
            status: status || oldData.status,
            phone: phone || oldData.phone
        };

        await showroomRef.update(showroomData);
        res.json({ _id: req.params.id, ...showroomData });
    } catch (err) {
        console.error("UpdateShowroom Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.deleteShowroom = async (req, res) => {
    try {
        const showroomRef = db.collection('showrooms').doc(req.params.id);
        const doc = await showroomRef.get();
        if (!doc.exists) return res.status(404).json({ msg: 'Showroom topilmadi' });
        const data = doc.data();

        const userSnapshot = await db.collection('users').where('login', '==', data.login).get();
        if (!userSnapshot.empty) {
            await userSnapshot.docs[0].ref.delete();
        }
        
        await showroomRef.delete();
        res.json({ msg: 'Showroom o\'chirildi' });
    } catch (err) {
        console.error("DeleteShowroom Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};
