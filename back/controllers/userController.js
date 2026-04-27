const { db, formatQuery, formatDoc } = require('../config/firebase');
const bcrypt = require('bcryptjs');

exports.getUsers = async (req, res) => {
    try {
        const { role, showroom } = req.query;
        let queryRef = db.collection('users');

        if (req.user.role !== 'super') {
            if (!req.user.showroom) return res.json([]);
            queryRef = queryRef.where('showroom', '==', req.user.showroom);
        } else {
            if (role) queryRef = queryRef.where('role', '==', role);
            if (showroom) queryRef = queryRef.where('showroom', '==', showroom);
        }

        const snapshot = await queryRef.get();
        let users = formatQuery(snapshot);

        if (req.user.role !== 'super') {
            users = users.filter(u => u._id !== req.user.id && u.role !== 'super');
        }

        users.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        users = users.map(u => {
            delete u.password;
            return u;
        });

        res.json(users);
    } catch (err) {
        console.error("GetUsers Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.createUser = async (req, res) => {
    try {
        const { name, surname, login, password, role, showroom, phone } = req.body;

        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('login', '==', login.toLowerCase()).get();

        if (!snapshot.empty) {
            return res.status(400).json({ msg: 'Bu login allaqachon band' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            name,
            surname,
            login: login.toLowerCase(),
            password: hashedPassword,
            role,
            phone: phone || '',
            showroom: showroom || req.user.showroom || '',
            status: 'active',
            createdAt: new Date().toISOString()
        };

        const docRef = await usersRef.add(newUser);
        res.json({ _id: docRef.id, ...newUser });
    } catch (err) {
        console.error("CreateUser Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { name, surname, login, password, role, status, phone } = req.body;
        const userRef = db.collection('users').doc(req.params.id);
        const doc = await userRef.get();

        if (!doc.exists) return res.status(404).json({ msg: 'Foydalanuvchi topilmadi' });

        const updateData = {};
        if (name) updateData.name = name;
        if (surname) updateData.surname = surname;
        if (login) updateData.login = login.toLowerCase();
        if (role) updateData.role = role;
        if (status) updateData.status = status;
        if (phone !== undefined) updateData.phone = phone;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        await userRef.update(updateData);
        const updatedDoc = await userRef.get();
        res.json(formatDoc(updatedDoc));
    } catch (err) {
        console.error("UpdateUser Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userRef = db.collection('users').doc(req.params.id);
        const doc = await userRef.get();

        if (!doc.exists) return res.status(404).json({ msg: 'Foydalanuvchi topilmadi' });

        await userRef.delete();
        res.json({ msg: 'Foydalanuvchi o\'chirildi' });
    } catch (err) {
        console.error("DeleteUser Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};
