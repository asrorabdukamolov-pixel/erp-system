const { db } = require('../config/firebase');

exports.getSuperAdminStats = async (req, res) => {
    try {
        const showroomsSnap = await db.collection('showrooms').get();
        const showroomsCount = showroomsSnap.size;
        
        const adminsSnap = await db.collection('users').where('role', '!=', 'super').where('status', '==', 'active').get();
        const activeAdminsCount = adminsSnap.size;
        
        // Oxirgi amallarni yig'ish
        const usersSnap = await db.collection('users').where('role', '!=', 'super').orderBy('createdAt', 'desc').limit(5).get();
        const latestUsers = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const showroomsLatestSnap = await db.collection('showrooms').orderBy('createdAt', 'desc').limit(5).get();
        const latestShowrooms = showroomsLatestSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const recentActivities = [
            ...latestUsers.map(u => ({
                id: u.id,
                type: 'user',
                title: `Yangi xodim: ${u.name} ${u.surname}`,
                time: u.createdAt,
                role: u.role
            })),
            ...latestShowrooms.map(s => ({
                id: s.id,
                type: 'showroom',
                title: `Yangi showroom: ${s.name}`,
                time: s.createdAt,
                address: s.address
            }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

        // TODO: Calculate total sales correctly. Setting to 0 for now to prevent crashes.
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
