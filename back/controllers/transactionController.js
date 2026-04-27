const { db, formatQuery, formatDoc, admin } = require('../config/firebase');

exports.getTransactions = async (req, res) => {
    try {
        let queryRef = db.collection('transactions').where('status', '!=', 'trash');
        if (req.user.role !== 'super') {
            queryRef = queryRef.where('showroom', '==', req.user.showroom || '');
        }

        const snapshot = await queryRef.get();
        const transactions = formatQuery(snapshot);
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json(transactions);
    } catch (err) {
        console.error("GetTransactions Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.createTransaction = async (req, res) => {
    try {
        const { type, amountUzs, category, orderId, description, paymentMethod } = req.body;

        const newTransaction = {
            type,
            amountUzs: Number(amountUzs),
            category,
            orderId,
            description,
            paymentMethod,
            managerName: req.user.name,
            showroom: req.user.showroom || '',
            createdBy: req.user.name,
            date: new Date().toISOString(),
            status: 'active'
        };

        if (type === 'income' && orderId) {
            const ordersRef = db.collection('orders');
            let orderSnapshot = await ordersRef.where('productionId', '==', orderId).get();
            if (orderSnapshot.empty) {
                orderSnapshot = await ordersRef.where('uniqueId', '==', orderId).get();
            }

            if (!orderSnapshot.empty) {
                const orderDoc = orderSnapshot.docs[0];
                const orderData = orderDoc.data();
                
                await orderDoc.ref.update({
                    paidAmount: (orderData.paidAmount || 0) + Number(amountUzs),
                    timeline: [
                        ...(orderData.timeline || []),
                        {
                            type: 'system',
                            text: `To'lov qabul qilindi: ${amountUzs.toLocaleString()} UZS. Kategoriya: ${category}`,
                            user: req.user.name,
                            time: new Date().toISOString()
                        }
                    ]
                });
                newTransaction.orderRef = orderDoc.id;
            }
        }

        const docRef = await db.collection('transactions').add(newTransaction);
        res.json({ _id: docRef.id, ...newTransaction });
    } catch (err) {
        console.error("CreateTransaction Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const { period = '30', manager, showroom, startDate, endDate } = req.query;
        
        let dateStart = new Date();
        dateStart.setDate(dateStart.getDate() - Number(period));
        let dateEnd = new Date();

        if (startDate && endDate) {
            dateStart = new Date(startDate);
            dateEnd = new Date(endDate);
        }

        const isoStart = dateStart.toISOString();
        const isoEnd = dateEnd.toISOString();

        let transQuery = db.collection('transactions').where('date', '>=', isoStart).where('date', '<=', isoEnd);
        if (req.user.role !== 'super') {
            transQuery = transQuery.where('showroom', '==', req.user.showroom || '');
        } else if (showroom && showroom !== 'all') {
            transQuery = transQuery.where('showroom', '==', showroom);
        }
        if (manager && manager !== 'all') {
            transQuery = transQuery.where('managerName', '==', manager);
        }
        const transSnapshot = await transQuery.get();
        const transactions = formatQuery(transSnapshot).filter(t => t.status !== 'trash');

        let ordersQuery = db.collection('orders').where('createdAt', '>=', isoStart).where('createdAt', '<=', isoEnd);
        if (req.user.role !== 'super') {
            ordersQuery = ordersQuery.where('showroom', '==', req.user.showroom || '');
        } else if (showroom && showroom !== 'all') {
            ordersQuery = ordersQuery.where('showroom', '==', showroom);
        }
        const ordersSnapshot = await ordersQuery.get();
        const orders = formatQuery(ordersSnapshot).filter(o => o.status !== 'trash');

        let allOrdersQuery = db.collection('orders');
        if (req.user.role !== 'super') {
            allOrdersQuery = allOrdersQuery.where('showroom', '==', req.user.showroom || '');
        }
        const allOrdersSnapshot = await allOrdersQuery.get();
        const allOrders = formatQuery(allOrdersSnapshot);

        const allPurchasesSnapshot = await db.collection('purchases').get();
        const allPurchases = formatQuery(allPurchasesSnapshot);

        const cashIn = transactions.filter(t => t.type === 'income').reduce((s, t) => s + (t.amountUzs || 0), 0);
        const cashOut = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amountUzs || 0), 0);
        const totalSales = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);

        const expenseCategories = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            expenseCategories[t.category] = (expenseCategories[t.category] || 0) + (t.amountUzs || 0);
        });
        const expenseBreakdown = Object.keys(expenseCategories).map(name => ({ name, value: expenseCategories[name] }));

        const dealStatuses = ['yangi', 'uchrashuv', 'kp_yuborildi', 'prezentatsiya', 'oylayabdi', 'shartnoma'];
        const inProgressCount = orders.filter(o => dealStatuses.includes(o.status)).length;
        const confirmedCount = orders.filter(o => !dealStatuses.includes(o.status)).length;
        const totalOrdersCount = orders.length;

        const orderStats = [
            { name: 'Jarayonda', value: inProgressCount, color: '#fbbf24' },
            { name: 'Tasdiqlangan', value: confirmedCount, color: '#10b981' }
        ].map(item => ({
            ...item,
            percentage: totalOrdersCount > 0 ? ((item.value / totalOrdersCount) * 100).toFixed(1) : 0
        }));

        const debitorList = allOrders
            .filter(o => (o.totalAmount || 0) > (o.paidAmount || 0) && o.status !== 'trash')
            .map(o => ({
                name: `${o.selectedCustomer?.firstName || ''} ${o.selectedCustomer?.lastName || ''}`.trim() || 'Mijoz',
                debt: (o.totalAmount || 0) - (o.paidAmount || 0)
            }))
            .sort((a, b) => b.debt - a.debt)
            .slice(0, 10);
        
        const debitorTotal = allOrders.filter(o => o.status !== 'trash').reduce((s, o) => s + Math.max(0, (o.totalAmount || 0) - (o.paidAmount || 0)), 0);

        const kreditorList = allPurchases
            .filter(p => (p.total_amount || 0) > (p.paid_amount || 0))
            .map(p => ({
                supplier: p.supplier || 'Yetkazib beruvchi',
                debt: (p.total_amount || 0) - (p.paid_amount || 0)
            }))
            .sort((a, b) => b.debt - a.debt)
            .slice(0, 10);
        
        const kreditorTotal = allPurchases.reduce((s, p) => s + Math.max(0, (p.total_amount || 0) - (p.paid_amount || 0)), 0);

        const dailyData = {};
        transactions.forEach(t => {
            const day = t.date.split('T')[0];
            if (!dailyData[day]) dailyData[day] = { date: day, cash_in: 0, cash_out: 0 };
            if (t.type === 'income') dailyData[day].cash_in += (t.amountUzs || 0);
            else dailyData[day].cash_out += (t.amountUzs || 0);
        });
        const cashflowChart = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));

        const managerStats = {};
        orders.forEach(o => {
            const mName = o.managerName || 'Noma\'lum';
            if (!managerStats[mName]) managerStats[mName] = { name: mName, sales: 0, profit: 0 };
            managerStats[mName].sales += (o.totalAmount || 0);
            managerStats[mName].profit += ((o.totalAmount || 0) - (o.totalCost || 0));
        });
        const salesPerformance = Object.values(managerStats).sort((a, b) => b.sales - a.sales);

        res.json({
            overview: {
                totalSales,
                cashIn,
                cashOut,
                netCashflow: cashIn - cashOut,
                grossProfit: totalSales - cashOut,
                totalOrders: totalOrdersCount
            },
            expenseBreakdown,
            orderStats,
            debitor: { total: debitorTotal, list: debitorList },
            kreditor: { total: kreditorTotal, list: kreditorList },
            cashflowChart,
            salesPerformance,
            orderProfits: []
        });
    } catch (err) {
        console.error("DashboardStats Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.removeTransaction = async (req, res) => {
    try {
        const { reason } = req.body;
        const transRef = db.collection('transactions').doc(req.params.id);
        const doc = await transRef.get();
        if (!doc.exists) return res.status(404).json({ msg: 'Tranzaksiya topilmadi' });

        await transRef.update({
            status: 'trash',
            deleteReason: reason || 'Sabab ko\'rsatilmadi',
            deletedAt: new Date().toISOString(),
            deletedBy: req.user.name
        });
        res.json({ msg: 'Tranzaksiya o\'chirildi' });
    } catch (err) {
        console.error("RemoveTransaction Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.getTrashedTransactions = async (req, res) => {
    try {
        let queryRef = db.collection('transactions').where('status', '==', 'trash');
        if (req.user.role !== 'super') {
            queryRef = queryRef.where('showroom', '==', req.user.showroom || '');
        }
        const snapshot = await queryRef.get();
        const transactions = formatQuery(snapshot);
        transactions.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
        res.json(transactions);
    } catch (err) {
        console.error("GetTrashedTransactions Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.restoreTransaction = async (req, res) => {
    try {
        const transRef = db.collection('transactions').doc(req.params.id);
        const doc = await transRef.get();
        if (!doc.exists) return res.status(404).json({ msg: 'Tranzaksiya topilmadi' });

        await transRef.update({
            status: 'active',
            deletedAt: admin.firestore.FieldValue.delete(),
            deleteReason: admin.firestore.FieldValue.delete(),
            deletedBy: admin.firestore.FieldValue.delete()
        });
        const updated = await transRef.get();
        res.json(formatDoc(updated));
    } catch (err) {
        console.error("RestoreTransaction Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};
