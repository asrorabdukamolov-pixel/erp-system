const User = require('../models/User');

// @desc    Get all users (filtered by query)
// @access  Private
exports.getUsers = async (req, res) => {
    try {
        const { role, showroom } = req.query;
        let query = {};
        
        if (role) query.role = role;
        if (showroom) query.showroom = showroom;
        
        // Super admin bo'lmasa, faqat o'z showroom-idagilarni ko'radi
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
