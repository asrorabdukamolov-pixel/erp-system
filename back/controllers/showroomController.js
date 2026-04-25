const Showroom = require('../models/Showroom');
const User = require('../models/User');

// @desc    Get all showrooms
// @access  Private (Super Admin)
exports.getShowrooms = async (req, res) => {
    try {
        const showrooms = await Showroom.find().sort({ createdAt: -1 });
        res.json(showrooms);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};

// @desc    Create a showroom and its admin user
// @access  Private (Super Admin)
exports.createShowroom = async (req, res) => {
    try {
        const { name, address, adminName, adminSurname, login, password } = req.body;

        // Check if login already exists in Users
        let userExists = await User.findOne({ login: login.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ msg: 'Bu login allaqachon band' });
        }

        // 1. Create Showroom
        const newShowroom = new Showroom({
            name,
            address,
            adminName,
            adminSurname,
            login,
            password,
            status: 'Faol'
        });
        const showroom = await newShowroom.save();

        // 2. Create Admin User for this showroom
        const newUser = new User({
            name: adminName,
            surname: adminSurname,
            login: login.toLowerCase(),
            password, // User model pre-save hook will hash this
            role: 'showroom',
            showroom: name // Link by name or we could use ID
        });
        await newUser.save();

        res.json(showroom);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};

// @desc    Update showroom
// @access  Private (Super Admin)
exports.updateShowroom = async (req, res) => {
    try {
        const { name, address, adminName, adminSurname, login, password, status } = req.body;
        
        let showroom = await Showroom.findById(req.params.id);
        if (!showroom) return res.status(404).json({ msg: 'Showroom topilmadi' });

        // Update User account if login or password changed
        let user = await User.findOne({ login: showroom.login });
        if (user) {
            user.name = adminName;
            user.surname = adminSurname;
            user.login = login.toLowerCase();
            if (password) user.password = password; // Will be hashed by pre-save
            user.status = status === 'Faol' ? 'active' : 'inactive';
            await user.save();
        }

        // Update Showroom
        showroom = await Showroom.findByIdAndUpdate(
            req.params.id,
            { $set: { name, address, adminName, adminSurname, login, status } },
            { new: true }
        );

        res.json(showroom);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};

// @desc    Delete showroom
// @access  Private (Super Admin)
exports.deleteShowroom = async (req, res) => {
    try {
        const showroom = await Showroom.findById(req.params.id);
        if (!showroom) return res.status(404).json({ msg: 'Showroom topilmadi' });

        // Delete associated user
        await User.findOneAndDelete({ login: showroom.login });
        
        await Showroom.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Showroom o\'chirildi' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};
