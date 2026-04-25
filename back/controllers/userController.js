const User = require('../models/User');

// @desc    Get all users (filtered by query)
exports.getUsers = async (req, res) => {
    try {
        const { role, showroom } = req.query;
        let query = {};
        
        if (role) query.role = role;
        if (showroom) query.showroom = showroom;
        
        if (req.user.role !== 'super' && !role) {
            query.showroom = req.user.showroom;
        }

        const users = await User.find(query).select('-password').sort({ name: 1 });
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};

// @desc    Create a new user
exports.createUser = async (req, res) => {
    try {
        const { name, surname, login, password, role, showroom } = req.body;

        let user = await User.findOne({ login: login.toLowerCase() });
        if (user) {
            return res.status(400).json({ msg: 'Bu login allaqachon band' });
        }

        user = new User({
            name,
            surname,
            login: login.toLowerCase(),
            password,
            role,
            showroom: showroom || req.user.showroom
        });

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};

// @desc    Update user
exports.updateUser = async (req, res) => {
    try {
        const { name, surname, login, password, role, status } = req.body;
        
        let user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'Foydalanuvchi topilmadi' });

        user.name = name || user.name;
        user.surname = surname || user.surname;
        user.login = login ? login.toLowerCase() : user.login;
        if (password) user.password = password;
        user.role = role || user.role;
        user.status = status || user.status;

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};

// @desc    Delete user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'Foydalanuvchi topilmadi' });

        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Foydalanuvchi o\'chirildi' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};
