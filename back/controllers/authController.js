const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { name, surname, login, password, role, showroom } = req.body;

        let user = await User.findOne({ login });
        if (user) {
            return res.status(400).json({ msg: 'Foydalanuvchi allaqachon mavjud' });
        }

        user = new User({ name, surname, login, password, role, showroom });
        await user.save();

        const payload = { user: { id: user.id, role: user.role, name: user.name, showroom: user.showroom, phone: user.phone } };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: payload.user });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.login = async (req, res) => {
    try {
        const { login, password } = req.body;

        let user = await User.findOne({ login: login.toLowerCase() });
        if (!user) {
            return res.status(400).json({ msg: 'Login yoki parol xato' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Login yoki parol xato' });
        }

        const payload = { user: { id: user.id, role: user.role, name: user.name, showroom: user.showroom } };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: payload.user });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};
