const User = require('../models/User');
const Order = require('../models/Order');
const Showroom = require('../models/Showroom');

exports.getSuperAdminStats = async (req, res) => {
    try {
        const showroomsCount = await Showroom.countDocuments();
        const activeAdminsCount = await User.countDocuments({ role: { $ne: 'super' }, status: 'active' });
        
        // Oxirgi amallarni yig'ish
        const latestUsers = await User.find({ role: { $ne: 'super' } }).sort({ createdAt: -1 }).limit(5);
        const latestShowrooms = await Showroom.find().sort({ createdAt: -1 }).limit(5);

        const recentActivities = [
            ...latestUsers.map(u => ({
                id: u._id,
                type: 'user',
                title: `Yangi xodim: ${u.name} ${u.surname}`,
                time: u.createdAt,
                role: u.role
            })),
            ...latestShowrooms.map(s => ({
                id: s._id,
                type: 'showroom',
                title: `Yangi showroom: ${s.name}`,
                time: s.createdAt,
                address: s.address
            }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

        res.json({
            showroomsCount,
            activeAdminsCount,
            totalSales,
            monthlyGrowth: 0,
            recentActivities
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ msg: 'Statistikani olishda xatolik' });
    }
};
