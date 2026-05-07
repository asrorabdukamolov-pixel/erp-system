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
        const { type, amountUzs, category, orderId, purchaseId, description, comment, paymentMethod, personName } = req.body;
        const finalAmount = Number(amountUzs) || 0;
        const finalDescription = (description || comment || '').trim();

        const newTransaction = {
            type,
            amountUzs: finalAmount,
            category,
            orderId: orderId || '',
            description: finalDescription,
            paymentMethod,
            personName: personName || req.body.userName || req.body.managerName || req.user.name,
            managerName: personName || req.body.userName || req.body.managerName || req.user.name,
            showroom: req.user.showroom || '',
            createdBy: req.user.name,
            date: new Date().toISOString(),
            status: 'active',
            purchaseId: purchaseId || ''
        };

        if (orderId) {
            const ordersRef = db.collection('orders');
            let orderSnapshot = await ordersRef.where('productionId', '==', orderId).get();
            if (orderSnapshot.empty) {
                orderSnapshot = await ordersRef.where('uniqueId', '==', orderId).get();
            }

            if (!orderSnapshot.empty) {
                const orderDoc = orderSnapshot.docs[0];
                const orderData = orderDoc.data();
                
                if (type === 'income') {
                    await orderDoc.ref.update({
                        paidAmount: (orderData.paidAmount || 0) + finalAmount,
                        timeline: [
                            ...(orderData.timeline || []),
                            {
                                type: 'system',
                                text: `To'lov qabul qilindi: ${finalAmount.toLocaleString()} UZS. Kategoriya: ${category}`,
                                user: req.user.name,
                                time: new Date().toISOString()
                            }
                        ]
                    });
                } else if (type === 'expense') {
                    await orderDoc.ref.update({
                        totalCost: (orderData.totalCost || 0) + finalAmount,
                        timeline: [
                            ...(orderData.timeline || []),
                            {
                                type: 'system',
                                text: `Xarajat qo'shildi: ${finalAmount.toLocaleString()} UZS. Kategoriya: ${category}`,
                                user: req.user.name,
                                time: new Date().toISOString()
                            }
                        ]
                    });
                }
                newTransaction.orderRef = orderDoc.id;
            }
        }

        if (purchaseId) {
            const purchasesRef = db.collection('purchases');
            const purchaseSnapshot = await purchasesRef.where('uniqueXaridId', '==', purchaseId).get();
            
            if (!purchaseSnapshot.empty) {
                const purchaseDoc = purchaseSnapshot.docs[0];
                const purchaseData = purchaseDoc.data();
                
                await purchaseDoc.ref.update({
                    paid_amount: (Number(purchaseData.paid_amount) || Number(purchaseData.paidAmount) || 0) + finalAmount
                });
                newTransaction.purchaseRef = purchaseDoc.id;
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

        let allOrdersQuery = db.collection('orders');
        if (req.user.role !== 'super') {
            allOrdersQuery = allOrdersQuery.where('showroom', '==', req.user.showroom || '');
        } else if (showroom && showroom !== 'all') {
            allOrdersQuery = allOrdersQuery.where('showroom', '==', showroom);
        }
        const allOrdersSnapshot = await allOrdersQuery.get();
        const allOrders = formatQuery(allOrdersSnapshot);

        const allPurchasesSnapshot = await db.collection('purchases').get();
        const allPurchases = formatQuery(allPurchasesSnapshot);

        const dealStatuses = ['yangi', 'uchrashuv', 'kp_yuborildi', 'prezentatsiya', 'oylayabdi', 'shartnoma'];

        // Orders created in the period (for New Leads stats)
        const orders = allOrders.filter(o => {
            if (o.status === 'trash') return false;
            return o.createdAt >= isoStart && o.createdAt <= isoEnd;
        });

        // Orders confirmed in the period (for Sales/Revenue stats)
        const salesInPeriod = allOrders.filter(o => {
            if (o.status === 'trash') return false;
            if (dealStatuses.includes(o.status)) return false; // Only passed confirmation
            const date = o.confirmedAt || o.createdAt;
            return date >= isoStart && date <= isoEnd;
        });

        const cashIn = transactions.filter(t => t.type === 'income').reduce((s, t) => s + (t.amountUzs || 0), 0);
        const cashOut = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amountUzs || 0), 0);
        
        // totalSales should be the sum of orders that became "Sales" in this period
        const totalSales = salesInPeriod.reduce((s, o) => s + (Number(o.amount) || Number(o.totalAmount) || 0), 0);

        const expenseCategories = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            expenseCategories[t.category] = (expenseCategories[t.category] || 0) + (t.amountUzs || 0);
        });
        const expenseBreakdown = Object.keys(expenseCategories).map(name => ({ name, value: expenseCategories[name] }));

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
            .filter(o => {
                if (o.status === 'trash') return false;
                if (dealStatuses.includes(o.status)) return false;
                if (o.status === 'yopildi') return false;
                const amount = Number(o.amount) || Number(o.totalAmount) || 0;
                const paid = Number(o.paidAmount) || 0;
                return amount > paid;
            })
            .map(o => {
                const amount = Number(o.amount) || Number(o.totalAmount) || 0;
                const paid = Number(o.paidAmount) || 0;
                return {
                    name: `${o.selectedCustomer?.firstName || ''} ${o.selectedCustomer?.lastName || ''}`.trim() || 'Mijoz',
                    debt: amount - paid
                };
            })
            .sort((a, b) => b.debt - a.debt)
            .slice(0, 10);
        
        const debitorTotal = allOrders
            .filter(o => o.status !== 'trash' && !dealStatuses.includes(o.status) && o.status !== 'yopildi')
            .reduce((s, o) => {
                const amount = Number(o.amount) || Number(o.totalAmount) || 0;
                const paid = Number(o.paidAmount) || 0;
                return s + Math.max(0, amount - paid);
            }, 0);

        const kreditorList = allPurchases
            .filter(p => p.adminApproved === true && (Number(p.total_amount) || Number(p.totalAmount) || 0) > (Number(p.paid_amount) || Number(p.paidAmount) || 0))
            .map(p => ({
                supplier: p.supplier || 'Yetkazib beruvchi',
                debt: (p.total_amount || 0) - (p.paid_amount || 0)
            }))
            .sort((a, b) => b.debt - a.debt)
            .slice(0, 10);
        
        const kreditorTotal = allPurchases
            .filter(p => p.adminApproved === true)
            .reduce((s, p) => s + Math.max(0, (Number(p.total_amount) || Number(p.totalAmount) || 0) - (Number(p.paid_amount) || Number(p.paidAmount) || 0)), 0);

        const dailyData = {};
        transactions.forEach(t => {
            const day = t.date.split('T')[0];
            if (!dailyData[day]) dailyData[day] = { date: day, cash_in: 0, cash_out: 0 };
            if (t.type === 'income') dailyData[day].cash_in += (t.amountUzs || 0);
            else dailyData[day].cash_out += (t.amountUzs || 0);
        });
        const cashflowChart = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));

        const managerStats = {};
        const pmStats = {};

        salesInPeriod.forEach(o => {
            const mName = o.managerName || 'Noma\'lum';
            if (!managerStats[mName]) managerStats[mName] = { name: mName, sales: 0, cost: 0, profit: 0 };
            const amt = (Number(o.amount) || Number(o.totalAmount) || 0);
            const cost = (Number(o.totalCost) || 0);
            managerStats[mName].sales += amt;
            managerStats[mName].cost += cost;
            managerStats[mName].profit += (amt - cost);

            if (o.assignedPmName) {
                const pName = o.assignedPmName;
                if (!pmStats[pName]) pmStats[pName] = { name: pName, sales: 0, cost: 0, profit: 0 };
                pmStats[pName].sales += amt;
                pmStats[pName].cost += cost;
                pmStats[pName].profit += (amt - cost);
            }
        });

        const salesPerformance = Object.values(managerStats).sort((a, b) => b.sales - a.sales);
        const pmPerformance = Object.values(pmStats).sort((a, b) => b.sales - a.sales);

        // Calculate detailed order profits
        const orderProfits = salesInPeriod.map(o => {
            const oId = o.productionId || o.uniqueId;
            // Get all transactions for this order using both string ID and doc ref
            const orderTxs = transactions.filter(t => t.orderId === oId || t.orderRef === o.id);
            const totalOut = orderTxs.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amountUzs || 0), 0);
            
            const amt = (Number(o.amount) || Number(o.totalAmount) || 0);
            const profit = amt - totalOut;
            const margin = amt > 0 ? (profit / amt) * 100 : 0;
            
            return {
                id: o.id || o._id,
                order_number: oId,
                customer: `${o.selectedCustomer?.firstName || ''} ${o.selectedCustomer?.lastName || ''}`.trim() || 'Mijoz',
                manager: o.managerName || 'Noma\'lum',
                total_amount: amt,
                total_cost: totalOut,
                profit: profit,
                margin: margin,
                date: o.confirmedAt || o.createdAt
            };
        }).sort((a, b) => new Date(b.date) - new Date(a.date));

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
            pmPerformance,
            orderProfits
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

        const t = doc.data();
        if (t.orderId && t.type) {
            const ordersRef = db.collection('orders');
            let orderSnapshot = await ordersRef.where('productionId', '==', t.orderId).get();
            if (orderSnapshot.empty) {
                orderSnapshot = await ordersRef.where('uniqueId', '==', t.orderId).get();
            }

            if (!orderSnapshot.empty) {
                const orderDoc = orderSnapshot.docs[0];
                const orderData = orderDoc.data();
                const amount = Number(t.amountUzs) || 0;

                if (t.type === 'income') {
                    await orderDoc.ref.update({
                        paidAmount: Math.max(0, (orderData.paidAmount || 0) - amount)
                    });
                } else if (t.type === 'expense') {
                    await orderDoc.ref.update({
                        totalCost: Math.max(0, (orderData.totalCost || 0) - amount)
                    });
                }
            }
        }

        // Update Purchase if linked
        if (t.purchaseId) {
            const pSnap = await db.collection('purchases').where('uniqueXaridId', '==', t.purchaseId).get();
            if (!pSnap.empty) {
                const pDoc = pSnap.docs[0];
                const pData = pDoc.data();
                await pDoc.ref.update({
                    paid_amount: Math.max(0, (Number(pData.paid_amount) || Number(pData.paidAmount) || 0) - (Number(t.amountUzs) || 0))
                });
            }
        }

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

        const t = doc.data();
        if (t.orderId && t.type) {
            const ordersRef = db.collection('orders');
            let orderSnapshot = await ordersRef.where('productionId', '==', t.orderId).get();
            if (orderSnapshot.empty) {
                orderSnapshot = await ordersRef.where('uniqueId', '==', t.orderId).get();
            }

            if (!orderSnapshot.empty) {
                const orderDoc = orderSnapshot.docs[0];
                const orderData = orderDoc.data();
                const amount = Number(t.amountUzs) || 0;

                if (t.type === 'income') {
                    await orderDoc.ref.update({
                        paidAmount: (orderData.paidAmount || 0) + amount
                    });
                } else if (t.type === 'expense') {
                    await orderDoc.ref.update({
                        totalCost: (orderData.totalCost || 0) + amount
                    });
                }
            }
        }

        // Update Purchase if linked
        if (t.purchaseId) {
            const pSnap = await db.collection('purchases').where('uniqueXaridId', '==', t.purchaseId).get();
            if (!pSnap.empty) {
                const pDoc = pSnap.docs[0];
                const pData = pDoc.data();
                await pDoc.ref.update({
                    paid_amount: (Number(pData.paid_amount) || Number(pData.paidAmount) || 0) + (Number(t.amountUzs) || 0)
                });
            }
        }

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
