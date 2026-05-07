const { db, formatQuery } = require('../config/firebase');

async function recalculateOrderCosts() {
    console.log("Starting order cost recalculation...");
    try {
        const transactionsSnapshot = await db.collection('transactions').where('status', '!=', 'trash').get();
        const transactions = formatQuery(transactionsSnapshot);
        
        const ordersSnapshot = await db.collection('orders').get();
        const orders = formatQuery(ordersSnapshot);

        console.log(`Found ${orders.length} orders and ${transactions.length} transactions.`);

        for (const order of orders) {
            const orderId = order.productionId || order.uniqueId;
            if (!orderId) continue;

            const orderTransactions = transactions.filter(t => t.orderId === orderId);
            const totalIncome = orderTransactions.filter(t => t.type === 'income').reduce((s, t) => s + (Number(t.amountUzs) || 0), 0);
            const totalCost = orderTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amountUzs) || 0), 0);

            console.log(`Order ${orderId}: Income=${totalIncome}, Cost=${totalCost}`);

            await db.collection('orders').doc(order._id || order.id).update({
                paidAmount: totalIncome,
                totalCost: totalCost
            });
        }
        console.log("Recalculation complete!");
    } catch (err) {
        console.error("Recalculation error:", err);
    }
}

recalculateOrderCosts().then(() => process.exit(0));
