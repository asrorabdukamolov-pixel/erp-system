const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const Purchase = require('../models/Purchase');

// @desc    Get all transactions
// @access  Private
exports.getTransactions = async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== 'super') {
            query.showroom = req.user.showroom;
        }

        const transactions = await Transaction.find(query).sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};

// @desc    Create a transaction
// @access  Private
exports.createTransaction = async (req, res) => {
    try {
        const { type, amountUzs, category, orderId, description, paymentMethod } = req.body;

        const newTransaction = new Transaction({
            type,
            amountUzs,
            category,
            orderId,
            description,
            paymentMethod,
            managerName: req.user.name,
            showroom: req.user.showroom,
            createdBy: req.user.name,
            date: new Date()
        });

        if (type === 'income' && orderId) {
            const order = await Order.findOne({ $or: [{ productionId: orderId }, { uniqueId: orderId }] });
            if (order) {
                order.paidAmount = (order.paidAmount || 0) + Number(amountUzs);
                order.timeline.push({
                    type: 'system',
                    text: `To'lov qabul qilindi: ${amountUzs.toLocaleString()} UZS. Kategoriya: ${category}`,
                    user: req.user.name,
                    time: new Date()
                });
                await order.save();
                newTransaction.orderRef = order._id;
            }
        }

        const transaction = await newTransaction.save();
        res.json(transaction);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};

// @desc    Get dashboard stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
    try {
        const { period = '30', manager, showroom, startDate, endDate } = req.query;
        
        let query = {};
        if (req.user.role !== 'super') {
            query.showroom = req.user.showroom;
        } else if (showroom && showroom !== 'all') {
            query.showroom = showroom;
        }

        if (manager && manager !== 'all') {
            query.managerName = manager;
        }

        // Date Filter
        let dateStart = new Date();
        dateStart.setDate(dateStart.getDate() - Number(period));
        let dateEnd = new Date();

        if (startDate && endDate) {
            dateStart = new Date(startDate);
            dateEnd = new Date(endDate);
        }

        const dateQuery = { date: { $gte: dateStart, $lte: dateEnd } };
        const orderDateQuery = { createdAt: { $gte: dateStart, $lte: dateEnd } };

        const transactions = await Transaction.find({ ...query, ...dateQuery });
        const orders = await Order.find({ ...query, ...orderDateQuery });
        const allOrdersForDebt = await Order.find(query); // For debitor list (all time)
        const allPurchasesForDebt = await Purchase.find({}); // For kreditor list

        const cashIn = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amountUzs, 0);
        const cashOut = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amountUzs, 0);
        
        const totalSales = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);

        // Expense Breakdown
        const expenseCategories = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            expenseCategories[t.category] = (expenseCategories[t.category] || 0) + t.amountUzs;
        });
        const expenseBreakdown = Object.keys(expenseCategories).map(name => ({ name, value: expenseCategories[name] }));

        // Order Stats
        const dealStatuses = ['yangi', 'uchrashuv', 'kp_yuborildi', 'prezentatsiya', 'oylayabdi', 'shartnoma'];
        const inProgressCount = orders.filter(o => dealStatuses.includes(o.status)).length;
        const confirmedCount = orders.filter(o => !dealStatuses.includes(o.status) && o.status !== 'trash').length;
        const cancelledCount = orders.filter(o => o.status === 'trash').length;
        const totalOrdersCount = orders.length;

        const orderStats = [
            { name: 'Jarayonda', value: inProgressCount, color: '#fbbf24' },
            { name: 'Tasdiqlangan', value: confirmedCount, color: '#10b981' },
            { name: 'Otkaz', value: cancelledCount, color: '#ef4444' }
        ].map(item => ({
            ...item,
            percentage: totalOrdersCount > 0 ? ((item.value / totalOrdersCount) * 100).toFixed(1) : 0
        }));

        // Debitor & Kreditor
        const debitorList = allOrdersForDebt
            .filter(o => (o.totalAmount || 0) > (o.paidAmount || 0))
            .map(o => ({
                name: `${o.selectedCustomer?.firstName} ${o.selectedCustomer?.lastName || ''}`.trim(),
                debt: (o.totalAmount || 0) - (o.paidAmount || 0)
            }))
            .sort((a, b) => b.debt - a.debt)
            .slice(0, 10);
        
        const debitorTotal = allOrdersForDebt.reduce((s, o) => s + Math.max(0, (o.totalAmount || 0) - (o.paidAmount || 0)), 0);

        const kreditorList = allPurchasesForDebt
            .filter(p => (p.total_amount || 0) > (p.paid_amount || 0))
            .map(p => ({
                supplier: p.supplier,
                debt: (p.total_amount || 0) - (p.paid_amount || 0)
            }))
            .sort((a, b) => b.debt - a.debt)
            .slice(0, 10);
        
        const kreditorTotal = allPurchasesForDebt.reduce((s, p) => s + Math.max(0, (p.total_amount || 0) - (p.paid_amount || 0)), 0);

        // Cashflow Chart (Simplified: grouped by day)
        const dailyData = {};
        transactions.forEach(t => {
            const day = t.date.toISOString().split('T')[0];
            if (!dailyData[day]) dailyData[day] = { date: day, cash_in: 0, cash_out: 0 };
            if (t.type === 'income') dailyData[day].cash_in += t.amountUzs;
            else dailyData[day].cash_out += t.amountUzs;
        });
        const cashflowChart = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));

        // Manager Sales Performance
        const managerStats = {};
        orders.forEach(o => {
            const mName = o.managerName || 'Noma\'lum';
            if (!managerStats[mName]) managerStats[mName] = { name: mName, sales: 0, profit: 0 };
            managerStats[mName].sales += (o.totalAmount || 0);
            managerStats[mName].profit += ((o.totalAmount || 0) - (o.totalCost || 0));
        });
        const salesPerformance = Object.values(managerStats).sort((a, b) => b.sales - a.sales);

        // Recent Order Profits (latest 10)
        const orderProfits = orders
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 10)
            .map(o => {
                const totalAmount = o.totalAmount || 0;
                const totalCost = o.totalCost || 0;
                const profit = totalAmount - totalCost;
                const margin = totalAmount > 0 ? (profit / totalAmount) * 100 : 0;
                return {
                    id: o._id,
                    order_number: o.uniqueId || o.productionId || 'ORD-000',
                    date: o.createdAt,
                    customer: `${o.selectedCustomer?.firstName || ''} ${o.selectedCustomer?.lastName || ''}`.trim() || 'Mijoz',
                    manager: o.managerName || '-',
                    total_amount: totalAmount,
                    total_cost: totalCost,
                    profit,
                    margin
                };
            });

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
            orderProfits
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};
