const User = require('../models/User');
const Order = require('../models/Order');
const Showroom = require('../models/Showroom');

exports.getSuperAdminStats = async (req, res) => {
    try {
        const showroomsCount = await Showroom.countDocuments();
        const activeAdminsCount = await User.countDocuments({ role: { $ne: 'super' }, status: 'active' });
        
        // Jami sotuvlarni hisoblash
        const orders = await Order.find({ status: { $ne: 'bekor_qilindi' } });
        const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        res.json({
            showroomsCount,
            activeAdminsCount,
            totalSales,
            monthlyGrowth: 0 // Hozircha 0, keyinchalik hisoblash mumkin
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ msg: 'Statistikani olishda xatolik' });
    }
};
