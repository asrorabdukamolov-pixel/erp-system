const { db } = require('../config/firebase');

exports.getSuperAdminStats = async (req, res) => {
    try {
        // Get counts from Firestore/local DB
        const showroomsSnapshot = await db.collection('showrooms').get();
        const usersSnapshot = await db.collection('users').get();
        const ordersSnapshot = await db.collection('orders').get();

        const showroomsCount = showroomsSnapshot.size || showroomsSnapshot.docs.length;
        const activeAdminsCount = usersSnapshot.docs.filter(d => {
            const u = d.data();
            return u.role !== 'super' && u.status === 'active';
        }).length;

        // Recent activities
        const latestUsers = usersSnapshot.docs
            .filter(d => d.data().role !== 'super')
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 5);

        const latestShowrooms = showroomsSnapshot.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 5);

        const recentActivities = [
            ...latestUsers.map(u => ({
                id: u.id,
                type: 'user',
                title: `Yangi xodim: ${u.name || ''} ${u.surname || ''}`,
                time: u.createdAt,
                role: u.role
            })),
            ...latestShowrooms.map(s => ({
                id: s.id,
                type: 'showroom',
                title: `Yangi showroom: ${s.name || ''}`,
                time: s.createdAt,
                address: s.address || ''
            }))
        ].sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0)).slice(0, 5);

        res.json({
            showroomsCount,
            activeAdminsCount,
            totalSales: 0,
            monthlyGrowth: 0,
            recentActivities
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ msg: 'Statistikani olishda xatolik' });
    }
};
