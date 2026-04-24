/**
 * Financial Dashboard uchun hisob-kitob va mock ma'lumotlar utilitasi.
 */

export const generateMockFinanceData = () => {
    // Mock ma'lumotlar generatsiyasi o'chirildi (Clean state uchun)
    /*
    if (!localStorage.getItem('erp_transactions') || JSON.parse(localStorage.getItem('erp_transactions')).length < 5) {
        ...
    }
    */
};

export const getFinancialDashboardData = (filters = {}) => {
    const orders = JSON.parse(localStorage.getItem('erp_orders') || '[]');
    const transactions = JSON.parse(localStorage.getItem('erp_transactions') || '[]');
    const purchases = JSON.parse(localStorage.getItem('erp_purchases') || '[]');
    const supplierPayments = JSON.parse(localStorage.getItem('erp_supplier_payments') || '[]');
    const trash = JSON.parse(localStorage.getItem('erp_trash') || '[]');

    const { period = '30', manager, status, month = 'all', year = 'all', startDate, endDate } = filters;

    // 1. Sana oralig'ini aniqlash
    let dateStart, dateEnd;
    
    if (startDate && endDate) {
        // Aniq sana oralig'i (Dasturlangan Start/End)
        dateStart = new Date(startDate);
        dateStart.setHours(0, 0, 0, 0);
        dateEnd = new Date(endDate);
        dateEnd.setHours(23, 59, 59, 999);
    } else if (year !== 'all') {
        if (month !== 'all') {
            // Ma'lum bir yil va oy
            dateStart = new Date(Number(year), Number(month), 1);
            dateEnd = new Date(Number(year), Number(month) + 1, 0, 23, 59, 59);
        } else {
            // Butun yil
            dateStart = new Date(Number(year), 0, 1);
            dateEnd = new Date(Number(year), 11, 31, 23, 59, 59);
        }
    } else {
        // Standart period (oxirgi N kun)
        dateEnd = new Date();
        dateStart = new Date();
        dateStart.setDate(dateStart.getDate() - Number(period));
    }

    // 1. Filtrlar qo'llash
    const filteredOrders = orders.filter(o => {
        let match = true;
        if (manager && manager !== 'all') match = match && o.managerName === manager;
        if (status && status !== 'all') match = match && o.status === status;
        
        const date = new Date(o.createdAt || o.date);
        match = match && date >= dateStart && date <= dateEnd;
        
        return match;
    });

    const filteredTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date >= dateStart && date <= dateEnd;
    });

    const filteredPurchases = purchases.filter(p => {
        const date = new Date(p.date);
        return date >= dateStart && date <= dateEnd;
    });

    const filteredSupplierPayments = supplierPayments.filter(p => {
        const date = new Date(p.date);
        return date >= dateStart && date <= dateEnd;
    });

    // 2. Finance Overview (Top KPI)
    const totalSales = filteredOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
    
    const cashIn = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + (t.amountUzs || 0), 0);

    const supplierPaid = filteredSupplierPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const otherExpenses = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + (t.amountUzs || 0), 0);
    const cashOut = supplierPaid + otherExpenses;

    const netCashflow = cashIn - cashOut;

    // 3. Gross Profit per Order
    const ordersProfitData = filteredOrders.map(o => {
        const oId = o.productionId || o.uniqueId;
        const orderPurchases = purchases.filter(p => p.orderId === oId).reduce((sum, p) => sum + p.total_amount, 0);
        const orderExpenses = transactions.filter(t => t.orderId === oId && t.type === 'expense').reduce((sum, t) => sum + (t.amountUzs || 0), 0);
        
        const total_amount = Number(o.amount || 0);
        const total_cost = orderPurchases + orderExpenses;
        const profit = total_amount - total_cost;
        const margin = total_amount > 0 ? (profit / total_amount) * 100 : 0;

        return {
            id: o.id,
            order_number: oId,
            customer: o.selectedCustomer?.firstName + ' ' + (o.selectedCustomer?.lastName || ''),
            total_amount,
            total_cost,
            profit,
            margin,
            manager: o.managerName,
            status: o.status,
            date: o.createdAt || o.date
        };
    });

    const grossProfit = ordersProfitData.reduce((sum, d) => sum + d.profit, 0);

    // 4. Debitor (Client Debt) - Qarzni butun tarix bo'yicha hisoblash kerak, lekin faqat tanlangan orderlar uchun (yoki hammasi?)
    // Odatda Debitor faqat tanlangan davrdagi orderlar emas, balki qachon yaratilishidan qat'iy nazar joriy qarzlarni anglatadi.
    // Lekin biz foydalanuvchi so'ragan davrdagi orderlarni ko'rsatamiz.
    const clientDebtData = filteredOrders.map(o => {
        const oId = o.productionId || o.uniqueId;
        const paid = transactions
            .filter(t => t.orderId === oId && t.type === 'income')
            .reduce((sum, t) => sum + (t.amountUzs || 0), 0);
        const debt = Number(o.amount || 0) - paid;
        
        let daysOverdue = 0;
        if (debt > 0) {
            const createdDate = new Date(o.createdAt || o.date);
            const diffTime = Math.abs(new Date() - createdDate);
            daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        return {
            name: o.selectedCustomer?.firstName + ' ' + (o.selectedCustomer?.lastName || ''),
            orderId: oId,
            debt,
            daysOverdue
        };
    }).filter(d => d.debt > 0).sort((a,b) => b.debt - a.debt);

    const totalDebitor = clientDebtData.reduce((sum, d) => sum + d.debt, 0);

    // 5. Kreditor (Supplier Debt)
    const supplierDebtData = filteredPurchases.map(p => {
        const paid = supplierPayments.filter(sp => sp.purchaseId === p.id).reduce((sum, sp) => sum + sp.amount, 0);
        const debt = p.total_amount - paid;
        return {
            supplier: p.supplierName,
            purchaseId: p.id,
            debt
        };
    }).filter(d => d.debt > 0).sort((a,b) => b.debt - a.debt);

    const totalKreditor = supplierDebtData.reduce((sum, d) => sum + d.debt, 0);

    // 6. Expense Breakdown
    const expenseCategories = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + (t.amountUzs || 0);
            return acc;
        }, {});
    
    if (supplierPaid > 0) {
        expenseCategories['Materiallar'] = (expenseCategories['Materiallar'] || 0) + supplierPaid;
    }

    const expenseBreakdown = Object.entries(expenseCategories).map(([name, value]) => ({ name, value }));

    // 7. Sales Performance
    const managerPerformance = filteredOrders.reduce((acc, o) => {
        const profData = ordersProfitData.find(pd => pd.id === o.id);
        if (!acc[o.managerName]) {
            acc[o.managerName] = { name: o.managerName, sales: 0, profit: 0, count: 0 };
        }
        acc[o.managerName].sales += Number(o.amount || 0);
        acc[o.managerName].profit += profData ? profData.profit : 0;
        acc[o.managerName].count += 1;
        return acc;
    }, {});

    const salesPerformance = Object.values(managerPerformance).map(m => ({
        ...m,
        avgMargin: m.sales > 0 ? (m.profit / m.sales) * 100 : 0
    }));

    // 8. Cashflow Chart Data (Dinamik davr)
    const chartDays = [];
    let current = new Date(dateStart);
    while (current <= dateEnd) {
        chartDays.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
        if (chartDays.length > 90) break; // Xasfsizlik uchun cheklov
    }

    const cashflowChart = chartDays.map(date => {
        const dayIncome = filteredTransactions
            .filter(t => t.type === 'income' && (t.date || '').split('T')[0] === date)
            .reduce((sum, t) => sum + (t.amountUzs || 0), 0);
        
        const dayExpense = filteredTransactions
            .filter(t => t.type === 'expense' && (t.date || '').split('T')[0] === date)
            .reduce((sum, t) => sum + (t.amountUzs || 0), 0);
            
        const daySupplierPay = filteredSupplierPayments
            .filter(p => (p.date || '').split('T')[0] === date)
            .reduce((sum, p) => sum + p.amount, 0);

        return {
            date,
            cash_in: dayIncome,
            cash_out: dayExpense + daySupplierPay
        };
    });

    // 9. Order Stats for Pie Chart
    const dealStatuses = ['yangi', 'uchrashuv', 'kp_yuborildi', 'prezentatsiya', 'oylayabdi', 'shartnoma'];
    
    const inProgressCount = filteredOrders.filter(o => dealStatuses.includes(o.status)).length;
    const confirmedCount = filteredOrders.filter(o => !dealStatuses.includes(o.status)).length;
    
    // Trash filter by date
    const filteredTrash = trash.filter(t => {
        const date = new Date(t.deletedAt || t.date);
        return date >= dateStart && date <= dateEnd;
    });
    const cancelledCount = filteredTrash.length;
    const totalCount = inProgressCount + confirmedCount + cancelledCount;

    const orderStats = [
        { name: 'Jarayonda', value: inProgressCount, color: '#fbbf24' },
        { name: 'Tasdiqlangan', value: confirmedCount, color: '#10b981' },
        { name: 'Otkaz', value: cancelledCount, color: '#ef4444' }
    ].map(item => ({
        ...item,
        percentage: totalCount > 0 ? ((item.value / totalCount) * 100).toFixed(1) : 0
    }));

    return {
        overview: { totalSales, cashIn, cashOut, netCashflow, grossProfit, totalOrders: totalCount },
        debitor: { total: totalDebitor, list: clientDebtData.slice(0, 10) },
        kreditor: { total: totalKreditor, list: supplierDebtData.slice(0, 10) },
        orderProfits: ordersProfitData,
        expenseBreakdown,
        salesPerformance,
        cashflowChart,
        orderStats
    };
};
