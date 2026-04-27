const { db, formatDoc, formatQuery } = require('../config/firebase');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    try {
        const { name, surname, login, password, role, showroom, phone } = req.body;

        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('login', '==', login.toLowerCase()).get();

        if (!snapshot.empty) {
            return res.status(400).json({ msg: 'Foydalanuvchi allaqachon mavjud' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            name,
            surname,
            login: login.toLowerCase(),
            password: hashedPassword,
            role,
            showroom: showroom || '',
            phone: phone || '',
            status: 'active',
            createdAt: new Date().toISOString()
        };

        const docRef = await usersRef.add(newUser);
        const userId = docRef.id;

        const payload = { 
            user: { 
                id: userId, 
                role, 
                name, 
                showroom: newUser.showroom, 
                phone: newUser.phone 
            } 
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: payload.user });
        });
    } catch (err) {
        console.error("Register Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.login = async (req, res) => {
    try {
        const { login, password } = req.body;

        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('login', '==', login.toLowerCase()).get();

        if (snapshot.empty) {
            return res.status(400).json({ msg: 'Login yoki parol xato' });
        }

        const userDoc = snapshot.docs[0];
        const user = userDoc.data();

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Login yoki parol xato' });
        }

        const payload = { 
            user: { 
                id: userDoc.id, 
                role: user.role, 
                name: user.name, 
                showroom: user.showroom, 
                phone: user.phone || '' 
            } 
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: payload.user });
        });
    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.getMe = async (req, res) => {
    try {
        const userDoc = await db.collection('users').doc(req.user.id).get();
        if (!userDoc.exists) {
            return res.status(404).json({ msg: 'Foydalanuvchi topilmadi' });
        }
        
        const userData = userDoc.data();
        delete userData.password;
        
        res.json({ _id: userDoc.id, ...userData });
    } catch (err) {
        console.error("GetMe Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};
