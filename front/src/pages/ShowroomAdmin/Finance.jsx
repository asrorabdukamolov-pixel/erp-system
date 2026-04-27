import React, { useState, useEffect } from 'react';
import { 
  Wallet, TrendingUp, TrendingDown, Calendar, FileText, Search, 
  CreditCard, Banknote, Landmark, ArrowLeft, Package, Briefcase, 
  Users, ArrowRight, ShoppingCart, Clock, Eye, X, Filter, RotateCcw,
  Handshake, Hash
} from 'lucide-react';
import api from '../../utils/api';


const ORDER_STAGES = [
  { id: 'tasdiqlandi', title: 'Tasdiqlandi ✅', color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
  { id: 'pm', title: 'PM ga o\'tkazildi ⚙️', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { id: 'ishlab_chiqarishda', title: 'Ishlab chiqarishda 🏗️', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  { id: 'ombor', title: 'Omborda 📦', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  { id: 'ornatish', title: 'O\'rnatishda 🚚', color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
  { id: 'bajarildi', title: 'Bajarildi 🎉', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
];

const MONTHS = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", 
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
];

const Finance = () => {
  const [currentView, setCurrentView] = useState('hub'); // 'hub' | 'transactions' | 'orders'
  const [transactions, setTransactions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedOrderHistory, setSelectedOrderHistory] = useState(null);
  const [partners, setPartners] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [selectedPartnerDetails, setSelectedPartnerDetails] = useState(null);

  // Filter States (Orders view only)
  const [filterManager, setFilterManager] = useState('all');
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth().toString()); // Default: current month
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString()); // Default: current year
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState(null);
  const [debitorSubView, setDebitorSubView] = useState('active'); // 'active' | 'closed'

  const paymentMethodsList = [
    { id: 'Naqd', icon: <Banknote size={16}/>, label: 'Naqd' },
    { id: 'Karta', icon: <CreditCard size={16}/>, label: 'Karta' },
    { id: 'Visa', icon: <CreditCard size={16}/>, label: 'Visa' },
    { id: 'Shartnoma', icon: <Landmark size={16}/>, label: 'Shartnoma' }
  ];

  useEffect(() => {
    loadTransactions();
    loadOrders();
    loadPartnersAndPurchases();
  }, []);

  const loadPartnersAndPurchases = async () => {
    try {
      const [pRes, purRes] = await Promise.all([
        api.get('/suppliers'),
        api.get('/purchases')
      ]);
      setPartners(pRes.data);
      setPurchases(purRes.data);
    } catch (err) {
      console.error("Partner loading error", err);
    }
  };

  const loadTransactions = async () => {
    try {
      const res = await api.get('/transactions');
      setTransactions(res.data);
    } catch (err) {
      console.error("Transaction loading error", err);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err) {
      console.error("Order loading error", err);
    }
  };

  // Helper: Get transaction stats for a specific order
  const getOrderStats = (oId) => {
    const history = transactions.filter(t => t.orderId === oId);
    const income = history.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amountUzs || 0), 0);
    const expense = history.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amountUzs || 0), 0);
    return { income, expense };
  };

  // Managers list for dropdown
  const managersList = Array.from(new Set(orders.map(o => o.managerName))).filter(Boolean);
  
  const allYears = new Set([
    ...orders.map(o => o.confirmedAt ? new Date(o.confirmedAt).getFullYear() : null),
    ...transactions.map(t => t.date ? new Date(t.date).getFullYear() : null),
    new Date().getFullYear()
  ]);
  const yearsList = Array.from(allYears).filter(Boolean).sort((a,b) => b-a);

  // Filter Logic (Confirmed Orders)
  const filteredOrders = orders.filter(o => {
    const isConfirmed = ORDER_STAGES.some(s => s.id === o.status) || o.status === 'yopildi';
    if (!isConfirmed) return false;

    const matchesSearch = `${o.productionId} ${o.selectedCustomer?.firstName} ${o.selectedCustomer?.lastName} ${o.managerName}`.toLowerCase().includes(search.toLowerCase());
    const matchesManager = filterManager === 'all' || o.managerName === filterManager;
    
    // Date Filtering
    const orderDate = o.confirmedAt ? new Date(o.confirmedAt) : null;
    const matchesMonth = filterMonth === 'all' || (orderDate && orderDate.getMonth().toString() === filterMonth);
    const matchesYear = filterYear === 'all' || (orderDate && orderDate.getFullYear().toString() === filterYear);

    return matchesSearch && matchesManager && matchesMonth && matchesYear;
  });

  // Aggregate Totals for Summary Cards
  const stats = filteredOrders.reduce((acc, order) => {
    const orderId = order.productionId || order.uniqueId;
    const { income, expense } = getOrderStats(orderId);
    acc.totalSum += Number(order.amount || 0);
    acc.totalIncome += income;
    acc.totalExpense += expense;
    return acc;
  }, { totalSum: 0, totalIncome: 0, totalExpense: 0 });

  const totalProfit = stats.totalSum - stats.totalExpense;

  const totalIncomeAll = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + (curr.amountUzs || 0), 0);
  const totalExpenseAll = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + (curr.amountUzs || 0), 0);
  const currentBalance = totalIncomeAll - totalExpenseAll;

  const getMethodBalances = () => {
    return paymentMethodsList.map(method => {
      const inc = transactions.filter(t => t.type === 'income' && t.paymentMethod === method.id).reduce((s,t)=>s+(t.amountUzs||0),0);
      const exp = transactions.filter(t => t.type === 'expense' && t.paymentMethod === method.id).reduce((s,t)=>s+(t.amountUzs||0),0);
      return { ...method, balance: inc - exp };
    });
  };

  const filteredTxs = transactions.filter(t => 
    (t.comment || '').toLowerCase().includes(search.toLowerCase()) || 
    (t.category || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.orderId || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.personName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ position: 'relative', minHeight: '80vh' }}>
      
      {/* ─── HUB VIEW ──────────────────────────────────────── */}
      {currentView === 'hub' && (
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-1px', marginBottom: '8px' }}>
              Moliya <span style={{ color: 'var(--accent-gold)' }}>Boshqaruvi</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>Kassa holati va tasdiqlangan buyurtmalar nazorati.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            <div onClick={() => setCurrentView('transactions')} className="premium-card clickable-card" style={{ padding: '40px 32px', cursor: 'pointer', textAlign: 'center', transition: '0.3s', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(212,175,55,0.1)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Wallet size={40} /></div>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Kirim-Chiqim Tarixi</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Barcha tranzaksiyalar</p>
              </div>
              <div style={{ marginTop: 'auto', color: 'var(--accent-gold)', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>Kirish <ArrowRight size={16} /></div>
            </div>

            <div onClick={() => setCurrentView('expenses')} className="premium-card clickable-card" style={{ padding: '40px 32px', cursor: 'pointer', textAlign: 'center', transition: '0.3s', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingDown size={40} /></div>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Xarajatlar Tahlili</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Chiqimlar monitoringi</p>
              </div>
              <div style={{ marginTop: 'auto', color: 'var(--accent-gold)', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>Kirish <ArrowRight size={16} /></div>
            </div>

            <div onClick={() => setCurrentView('orders')} className="premium-card clickable-card" style={{ padding: '40px 32px', cursor: 'pointer', textAlign: 'center', transition: '0.3s', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(99,102,241,0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={40} /></div>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Buyurtmalar</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Barcha buyurtmalar</p>
              </div>
              <div style={{ marginTop: 'auto', color: 'var(--accent-gold)', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>Kirish <ArrowRight size={16} /></div>
            </div>

            <div onClick={() => setCurrentView('debitor')} className="premium-card clickable-card" style={{ padding: '40px 32px', cursor: 'pointer', textAlign: 'center', transition: '0.3s', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Briefcase size={40} /></div>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Debitorlar</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Qarzdorlik tahlili</p>
              </div>
              <div style={{ marginTop: 'auto', color: 'var(--accent-gold)', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>Kirish <ArrowRight size={16} /></div>
            </div>

            <div onClick={() => setCurrentView('creditor')} className="premium-card clickable-card" style={{ padding: '40px 32px', cursor: 'pointer', textAlign: 'center', transition: '0.3s', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Handshake size={40} /></div>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Kreditorlar</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Yetkazib beruvchilar oldidagi qarz</p>
              </div>
              <div style={{ marginTop: 'auto', color: 'var(--accent-gold)', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>Kirish <ArrowRight size={16} /></div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TRANSACTIONS VIEW ──────────────────────────────── */}
      {currentView === 'transactions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button onClick={() => setCurrentView('hub')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '10px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><ArrowLeft size={20} /></button>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px' }}>Kirim-Chiqim Tarixi</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Barcha kassa tranzaksiyalari to'plami.</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
            <div 
              onClick={() => setShowBreakdown(true)}
              className="premium-card clickable-card" 
              style={{ display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: '0.3s', border: '1px solid var(--border-color)' }}
            >
              <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)' }}><Wallet size={32} /></div>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Jonli Kassa Qoldig'i (Batafsil)</p>
                <h3 style={{ fontSize: '28px', fontWeight: '800', color: currentBalance < 0 ? '#ef4444' : '#fff' }}>{currentBalance.toLocaleString()} <span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>so'm</span></h3>
              </div>
            </div>
            <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}><TrendingUp size={32} /></div>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Jami Kirimlar</p>
                <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#10b981' }}>{totalIncomeAll.toLocaleString()} <span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>so'm</span></h3>
              </div>
            </div>
            <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}><TrendingDown size={32} /></div>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Jami Chiqimlar</p>
                <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#ef4444' }}>{totalExpenseAll.toLocaleString()} <span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>so'm</span></h3>
              </div>
            </div>
          </div>

          <div className="premium-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>To'liq Tranzaksiyalar Tarixi</h3>
              <div style={{ position: 'relative', width: '300px' }}>
                <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input type="text" placeholder="Qidirish..." style={{ width: '100%', paddingLeft: '48px', height: '40px' }} value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    <th style={{ padding: '16px 8px' }}>Sana</th>
                    <th style={{ padding: '16px 8px' }}>Yo'nalish</th>
                    <th style={{ padding: '16px 8px' }}>Shaxsiy Info</th>
                    <th style={{ padding: '16px 8px' }}>To'lov Turi</th>
                    <th style={{ padding: '16px 8px' }}>Kategoriya / Izoh</th>
                    <th style={{ padding: '16px 8px', textAlign: 'right' }}>Valyuta</th>
                    <th style={{ padding: '16px 8px', textAlign: 'right' }}>Yakuniy Summa (UZS)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTxs.length === 0 ? (
                    <tr><td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>Hech qanday tranzaksiya topilmadi.</td></tr>
                  ) : (
                    filteredTxs.map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '16px 8px', fontSize: '13px', color: 'var(--text-secondary)' }}>{new Date(t.date).toLocaleDateString()}</td>
                        <td style={{ padding: '16px 8px' }}><span style={{ fontSize: '10px', fontWeight: '800', padding: '4px 8px', borderRadius: '4px', background: t.type === 'income' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: t.type === 'income' ? '#10b981' : '#ef4444' }}>{t.type === 'income' ? 'KIRIM' : 'CHIQIM'}</span></td>
                        <td style={{ padding: '16px 8px' }}><div style={{ fontWeight: '600' }}>{t.personName}</div><div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Buyurtma: {t.orderId || '—'}</div></td>
                        <td style={{ padding: '16px 8px', fontSize: '13px' }}>{t.paymentMethod}</td>
                        <td style={{ padding: '16px 8px', fontSize: '13px' }}><div style={{ fontWeight: '600' }}>{t.category}</div><div style={{ color: 'var(--text-secondary)' }}>{t.comment}</div></td>
                        <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                          {t.currency === 'USD' ? (
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              <div style={{ fontWeight: '800' }}>${t.originalAmount.toLocaleString()}</div>
                              <div>kurs: {t.usdRate}</div>
                            </div>
                          ) : <span style={{ color: 'rgba(255,255,255,0.1)' }}>—</span>}
                        </td>
                        <td style={{ padding: '16px 8px', textAlign: 'right', fontWeight: '900', color: t.type === 'income' ? '#10b981' : '#ef4444' }}>{t.amountUzs?.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── EXPENSES VIEW ──────────────────────────────────── */}
      {currentView === 'expenses' && (
        <div style={{ paddingBottom: '40px' }}>
          {/* HEADER & SEARCH */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button onClick={() => setCurrentView('hub')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '10px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><ArrowLeft size={20} /></button>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: '900' }}>Xarajatlar Tahlili</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Kategoriyalar va davr bo'yicha xarajatlar monitoringi</p>
              </div>
            </div>
            <div style={{ position: 'relative', width: '300px' }}>
               <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
               <input type="text" placeholder="Qidirish (Kategoriya, Izoh)..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', paddingLeft: '44px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', height: '44px' }} />
            </div>
          </div>

          {/* FILTER BAR */}
          <div className="premium-card" style={{ marginBottom: '32px', display: 'flex', gap: '20px', alignItems: 'center', padding: '16px 24px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                <Filter size={18} /> <strong>Saralash (Davr):</strong>
             </div>
             
             {/* Year Filter */}
             <select 
               value={filterYear} 
               onChange={e => setFilterYear(e.target.value)}
               style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none' }}
             >
                <option value="all" style={{ background: '#1e293b', color: '#fff' }}>Barcha Yillar</option>
                {yearsList.map(y => <option key={y} value={y} style={{ background: '#1e293b', color: '#fff' }}>{y}</option>)}
             </select>

             {/* Month Filter */}
             <select 
               value={filterMonth} 
               onChange={e => setFilterMonth(e.target.value)}
               style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none' }}
             >
                <option value="all" style={{ background: '#1e293b', color: '#fff' }}>Barcha Oylar</option>
                {MONTHS.map((m, idx) => <option key={m} value={idx.toString()} style={{ background: '#1e293b', color: '#fff' }}>{m}</option>)}
             </select>

             {(filterMonth !== 'all' || filterYear !== 'all') && (
               <button 
                 onClick={() => { setFilterMonth('all'); setFilterYear('all'); }}
                 style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}
               >
                 <RotateCcw size={14} /> Tozalash
               </button>
             )}
          </div>

          {(() => {
             // Expenses logic
             const expenseTxs = transactions.filter(t => t.type === 'expense');
             
             // Apply date/search filters
             const baseFiltered = expenseTxs.filter(t => {
                const matchesSearch = (t.comment || '').toLowerCase().includes(search.toLowerCase()) || (t.category || '').toLowerCase().includes(search.toLowerCase());
                const tDate = new Date(t.date);
                const matchesMonth = filterMonth === 'all' || tDate.getMonth().toString() === filterMonth;
                const matchesYear = filterYear === 'all' || tDate.getFullYear().toString() === filterYear;
                return matchesSearch && matchesMonth && matchesYear;
             });

             // Category groupings (from baseFiltered)
             const categories = {};
             baseFiltered.forEach(t => {
                const cat = t.category || 'Boshqa';
                if (!categories[cat]) categories[cat] = 0;
                categories[cat] += (t.amountUzs || 0);
             });
             
             const totalExpenseFiltered = baseFiltered.reduce((sum, t) => sum + (t.amountUzs || 0), 0);
             const maxCatValue = Math.max(...Object.values(categories), 0);

             // Final filtering for the table
             const tableData = selectedExpenseCategory 
                ? baseFiltered.filter(t => (t.category || 'Boshqa') === selectedExpenseCategory)
                : baseFiltered;

             return (
               <>
                 {/* DYNAMIC DASHBOARD (SIDEWAYS BARS) */}
                 <div className="premium-card" style={{ marginBottom: '32px', padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                       <div>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '800', marginBottom: '4px' }}>Tanlangan Davr uchun Jami</p>
                          <h3 style={{ fontSize: '32px', fontWeight: '900', color: '#ef4444' }}>{totalExpenseFiltered.toLocaleString()} <span style={{ fontSize: '16px' }}>so'm</span></h3>
                       </div>
                       {selectedExpenseCategory && (
                          <button onClick={() => setSelectedExpenseCategory(null)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Barchasini ko'rash</button>
                       )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                       {Object.entries(categories).sort((a,b) => b[1] - a[1]).map(([cat, sum], idx) => {
                          const percentage = totalExpenseFiltered > 0 ? (sum / totalExpenseFiltered) * 100 : 0;
                          const barWidth = maxCatValue > 0 ? (sum / maxCatValue) * 100 : 0;
                          const isActive = selectedExpenseCategory === cat;

                          return (
                            <div key={idx} onClick={() => setSelectedExpenseCategory(cat)} style={{ cursor: 'pointer', opacity: selectedExpenseCategory && !isActive ? 0.4 : 1, transition: '0.3s' }}>
                               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                                  <span style={{ fontWeight: '800', color: isActive ? 'var(--accent-gold)' : '#fff' }}>{cat} {isActive && '•'}</span>
                                  <span style={{ fontWeight: '900' }}>{sum.toLocaleString()} so'm ({percentage.toFixed(1)}%)</span>
                               </div>
                               <div style={{ height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.02)' }}>
                                  <div style={{ width: `${barWidth}%`, height: '100%', background: isActive ? 'var(--accent-gold)' : 'linear-gradient(90deg, #ef4444, #f59e0b)', borderRadius: '6px', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                               </div>
                            </div>
                          );
                       })}
                    </div>
                 </div>

                 {/* EXPENSES TABLE */}
                 <div className="premium-card">
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700' }}>
                         {selectedExpenseCategory ? `${selectedExpenseCategory} - Tafsilotlar` : 'Xarajatlar Ro\'yxati'}
                      </h3>
                   </div>
                   <div style={{ overflowX: 'auto' }}>
                     <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                       <thead>
                         <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '13px' }}>
                           <th style={{ padding: '16px 8px' }}>Sana</th>
                           <th style={{ padding: '16px 8px' }}>Kategoriya</th>
                           <th style={{ padding: '16px 8px' }}>To'lov Turi</th>
                           <th style={{ padding: '16px 8px' }}>Izoh</th>
                           <th style={{ padding: '16px 8px', textAlign: 'right' }}>Summa (UZS)</th>
                         </tr>
                       </thead>
                       <tbody>
                         {tableData.length === 0 ? (
                           <tr><td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>Ma'lumot topilmadi.</td></tr>
                         ) : (
                           tableData.map(t => (
                             <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                               <td style={{ padding: '16px 8px', fontSize: '13px', color: 'var(--text-secondary)' }}>{new Date(t.date).toLocaleDateString()}</td>
                               <td style={{ padding: '16px 8px', fontWeight: '600' }}>{t.category || 'Boshqa'}</td>
                               <td style={{ padding: '16px 8px', fontSize: '13px' }}>{t.paymentMethod}</td>
                               <td style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>{t.comment || '—'}</td>
                               <td style={{ padding: '16px 8px', textAlign: 'right', fontWeight: '900', color: '#ef4444' }}>-{t.amountUzs?.toLocaleString()}</td>
                             </tr>
                           ))
                         )}
                       </tbody>
                     </table>
                   </div>
                 </div>
               </>
             );
          })()}
        </div>
      )}

      {/* ─── DEBITOR VIEW ───────────────────────────────────── */}
      {currentView === 'debitor' && (
        <div style={{ paddingBottom: '40px' }}>
          {/* HEADER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button onClick={() => setCurrentView('hub')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '10px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><ArrowLeft size={20} /></button>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: '900' }}>Debitorlar Bo'limi</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Mijozlarning qarzdorlik tahlili va nazorati</p>
              </div>
            </div>
            <div style={{ position: 'relative', width: '300px' }}>
               <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
               <input type="text" placeholder="Qidirish (ID, Ism)..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', paddingLeft: '44px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', height: '44px' }} />
            </div>
          </div>

          {/* TABS */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
             <button 
               onClick={() => setDebitorSubView('active')}
               style={{ 
                 padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: '0.3s',
                 background: debitorSubView === 'active' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                 color: debitorSubView === 'active' ? '#000' : '#fff',
                 border: '1px solid' + (debitorSubView === 'active' ? 'var(--accent-gold)' : 'var(--border-color)')
               }}
             >
                Faol Buyurtmalar (Hali yopilmagan)
             </button>
             <button 
               onClick={() => setDebitorSubView('closed')}
               style={{ 
                 padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: '0.3s',
                 background: debitorSubView === 'closed' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                 color: debitorSubView === 'closed' ? '#000' : '#fff',
                 border: '1px solid' + (debitorSubView === 'closed' ? 'var(--accent-gold)' : 'var(--border-color)')
               }}
             >
                Yopilgan Buyurtmalar
             </button>
          </div>

          {(() => {
             // Logic for debtors
             const baseOrders = orders.filter(o => {
                const isConfirmed = ORDER_STAGES.some(s => s.id === o.status) || o.status === 'yopildi';
                if (!isConfirmed) return false;

                const isClosed = o.status === 'yopildi';
                if (debitorSubView === 'closed' && !isClosed) return false;
                if (debitorSubView === 'active' && isClosed) return false;

                const matchesSearch = `${o.productionId} ${o.selectedCustomer?.firstName} ${o.selectedCustomer?.lastName}`.toLowerCase().includes(search.toLowerCase());
                return matchesSearch;
             });

             const debtors = baseOrders.map(o => {
                const oId = o.productionId || o.uniqueId;
                const { income } = getOrderStats(oId);
                const debt = Number(o.amount || 0) - income;
                return { ...o, paid: income, debt };
             }).filter(o => o.debt > 0); // Only show those with actual debt

             const totalDebt = debtors.reduce((sum, o) => sum + o.debt, 0);

             return (
               <>
                 <div className="premium-card" style={{ borderLeft: '4px solid #3b82f6', marginBottom: '32px', background: 'rgba(59,130,246,0.05)' }}>
                    <p style={{ fontSize: '12px', color: '#3b82f6', textTransform: 'uppercase', fontWeight: '800', marginBottom: '4px' }}>
                       {debitorSubView === 'active' ? 'Faol' : 'Yopilgan'} Buyurtmalar bo'yicha Jami Qarz
                    </p>
                    <h3 style={{ fontSize: '32px', fontWeight: '900', color: '#fff' }}>{totalDebt.toLocaleString()} <span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>so'm</span></h3>
                 </div>

                 <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                       <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                             <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>#ID</th>
                                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Mijoz</th>
                                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Sotuv Menejeri (SM)</th>
                                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Project Manager (PM)</th>
                                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>Jami Summa</th>
                                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>To'landi</th>
                                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>Qarz (Debet)</th>
                             </tr>
                          </thead>
                          <tbody>
                             {debtors.length === 0 ? (
                               <tr><td colSpan="7" style={{ textAlign: 'center', padding: '80px', color: 'var(--text-secondary)' }}>Qarzdorlik topilmadi.</td></tr>
                             ) : (
                               debtors.map(o => (
                                 <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '20px 24px' }}><span style={{ color: 'var(--accent-gold)', fontWeight: '900' }}>{o.productionId || o.uniqueId}</span></td>
                                    <td style={{ padding: '20px 24px' }}>
                                       <div style={{ fontWeight: '800', fontSize: '13px' }}>{o.selectedCustomer?.firstName} {o.selectedCustomer?.lastName}</div>
                                       <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{o.selectedCustomer?.phone}</div>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>SM</div>
                                          <span style={{ fontSize: '13px', fontWeight: '600' }}>{o.managerName || '—'}</span>
                                       </div>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#a855f7' }}>PM</div>
                                          <span style={{ fontSize: '13px', fontWeight: '600' }}>{o.pmName || 'Tayinlanmagan'}</span>
                                       </div>
                                    </td>
                                    <td style={{ padding: '20px 24px', textAlign: 'right', fontSize: '13px', fontWeight: '700' }}>{Number(o.amount || 0).toLocaleString()}</td>
                                    <td style={{ padding: '20px 24px', textAlign: 'right', fontSize: '13px', fontWeight: '700', color: '#10b981' }}>{o.paid.toLocaleString()}</td>
                                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                       <div style={{ fontSize: '15px', fontWeight: '900', color: '#ef4444' }}>{o.debt.toLocaleString()}</div>
                                       <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{( (o.debt / Number(o.amount||1)) * 100 ).toFixed(1)}% qolgan</div>
                                    </td>
                                 </tr>
                               ))
                             )}
                          </tbody>
                       </table>
                    </div>
                 </div>
               </>
             );
          })()}
        </div>
      )}

      {/* ─── ORDERS VIEW ──────────────────────────────────── */}
      {currentView === 'orders' && (
        <div style={{ paddingBottom: '40px' }}>
          
          {/* HEADER & SEARCH */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button onClick={() => setCurrentView('hub')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '10px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><ArrowLeft size={20} /></button>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: '900' }}>Tasdiqlangan Buyurtmalar</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Moliya nazoratidagi barcha buyurtmalar ro'yxati</p>
              </div>
            </div>
            <div style={{ position: 'relative', width: '300px' }}>
               <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
               <input type="text" placeholder="Qidirish (ID, Ism, Menejer)..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', paddingLeft: '44px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', height: '44px' }} />
            </div>
          </div>

          {/* ANALYSIS CARDS (ITOG) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
             <div className="premium-card" style={{ borderLeft: '4px solid var(--accent-gold)' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '700' }}>Jami Buyurtma Summasi</p>
                <h3 style={{ fontSize: '24px', fontWeight: '900' }}>{stats.totalSum.toLocaleString()} <span style={{ fontSize: '12px' }}>so'm</span></h3>
             </div>
             <div className="premium-card" style={{ borderLeft: '4px solid #10b981' }}>
                <p style={{ fontSize: '12px', color: '#10b981', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '700' }}>Jami Tushum (Kirim)</p>
                <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#10b981' }}>{stats.totalIncome.toLocaleString()} <span style={{ fontSize: '12px' }}>so'm</span></h3>
             </div>
             <div className="premium-card" style={{ borderLeft: '4px solid #ef4444' }}>
                <p style={{ fontSize: '12px', color: '#ef4444', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '700' }}>Jami Xarajat (Chiqim)</p>
                <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#ef4444' }}>{stats.totalExpense.toLocaleString()} <span style={{ fontSize: '12px' }}>so'm</span></h3>
             </div>
             <div className="premium-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                <p style={{ fontSize: '12px', color: '#3b82f6', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '700' }}>Tahliliy Foyda</p>
                <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#3b82f6' }}>{totalProfit.toLocaleString()} <span style={{ fontSize: '12px' }}>so'm</span></h3>
             </div>
          </div>

          {/* FILTER BAR */}
          <div className="premium-card" style={{ marginBottom: '32px', display: 'flex', gap: '20px', alignItems: 'center', padding: '16px 24px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                <Filter size={18} /> <strong>Saralash:</strong>
             </div>
             
             {/* Manager Filter */}
             <select 
               value={filterManager} 
               onChange={e => setFilterManager(e.target.value)}
               style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none' }}
             >
                <option value="all" style={{ background: '#1e293b', color: '#fff' }}>Barcha Menejerlar</option>
                {managersList.map(m => <option key={m} value={m} style={{ background: '#1e293b', color: '#fff' }}>{m}</option>)}
             </select>

             {/* Year Filter */}
             <select 
               value={filterYear} 
               onChange={e => setFilterYear(e.target.value)}
               style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none' }}
             >
                <option value="all" style={{ background: '#1e293b', color: '#fff' }}>Barcha Yillar</option>
                {yearsList.map(y => <option key={y} value={y} style={{ background: '#1e293b', color: '#fff' }}>{y}</option>)}
             </select>

             {/* Month Filter */}
             <select 
               value={filterMonth} 
               onChange={e => setFilterMonth(e.target.value)}
               style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', padding: '10px 16px', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none' }}
             >
                <option value="all" style={{ background: '#1e293b', color: '#fff' }}>Barcha Oylar</option>
                {MONTHS.map((m, idx) => <option key={m} value={idx.toString()} style={{ background: '#1e293b', color: '#fff' }}>{m}</option>)}
             </select>

             {(filterManager !== 'all' || filterMonth !== 'all' || filterYear !== 'all') && (
               <button 
                 onClick={() => { setFilterManager('all'); setFilterMonth('all'); setFilterYear('all'); }}
                 style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}
               >
                 <RotateCcw size={14} /> Tozalash
               </button>
             )}
          </div>

          <div style={{ background: 'var(--secondary-bg)', borderRadius: '24px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
             <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                   <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                         <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>#ID</th>
                         <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Mijoz</th>
                         <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Buyurtma</th>
                         <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Kirim</th>
                         <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Chiqim</th>
                         <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Foyda</th>
                         <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Holat</th>
                         <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Sana</th>
                         <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Amallar</th>
                      </tr>
                   </thead>
                   <tbody>
                      {filteredOrders.length === 0 ? (
                        <tr><td colSpan="9" style={{ textAlign: 'center', padding: '100px', color: 'var(--text-secondary)' }}>Filtr bo'yicha buyurtmalar topilmadi.</td></tr>
                      ) : (
                        filteredOrders.map((order) => {
                          const stage = ORDER_STAGES.find(s => s.id === order.status) || { title: 'Noma\'lum', color: '#fff' };
                          const oId = order.productionId || order.uniqueId;
                          const { income, expense } = getOrderStats(oId);
                          const rowProfit = Number(order.amount || 0) - expense;

                          return (
                            <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                               <td style={{ padding: '20px 24px' }}><span style={{ color: 'var(--accent-gold)', fontWeight: '900' }}>{oId}</span></td>
                               <td style={{ padding: '20px 24px' }}>
                                  <div style={{ fontWeight: '800', fontSize: '13px' }}>{order.selectedCustomer?.firstName} {order.selectedCustomer?.lastName}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{order.selectedCustomer?.phone}</div>
                               </td>
                               <td style={{ padding: '20px 24px', fontWeight: '700', fontSize: '13px' }}>{Number(order.amount).toLocaleString()}</td>
                               <td style={{ padding: '20px 24px', color: '#10b981', fontWeight: '700', fontSize: '13px' }}>{income.toLocaleString()}</td>
                               <td style={{ padding: '20px 24px', color: '#ef4444', fontWeight: '700', fontSize: '13px' }}>{expense.toLocaleString()}</td>
                               <td style={{ padding: '20px 24px' }}>
                                  <div style={{ fontWeight: '900', fontSize: '14px', color: rowProfit >= 0 ? '#10b981' : '#ef4444' }}>{rowProfit.toLocaleString()}</div>
                               </td>
                               <td style={{ padding: '20px 24px' }}><span style={{ color: stage.color, fontWeight: '800', fontSize: '11px' }}>{stage.title}</span></td>
                               <td style={{ padding: '20px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                  {order.confirmedAt ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} />{new Date(order.confirmedAt).toLocaleDateString()}</div>
                                  ) : '—'}
                               </td>
                               <td style={{ padding: '20px 24px' }}>
                                  <button onClick={() => setSelectedOrderHistory(order)} className="secondary-btn" style={{ padding: '6px 10px', borderRadius: '8px', fontSize: '11px', gap: '4px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff', display: 'flex', alignItems: 'center' }}>
                                    <Eye size={14} /> Tarix
                                  </button>
                               </td>
                            </tr>
                          );
                        })
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      )}

      {/* ─── ORDER FINANCIAL HISTORY MODAL ────────────────── */}
      {selectedOrderHistory && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, padding: '20px' }}>
          <div className="premium-card" style={{ width: '900px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}>
             <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                <div>
                   <h2 style={{ fontSize: '22px', fontWeight: '900' }}>#{selectedOrderHistory.productionId || selectedOrderHistory.uniqueId} - Moliyaviy Tarix</h2>
                   <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Mijoz: {selectedOrderHistory.selectedCustomer?.firstName} {selectedOrderHistory.selectedCustomer?.lastName}</p>
                </div>
                <button onClick={() => setSelectedOrderHistory(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><X size={20} /></button>
             </div>
             <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                   <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Buyurtma Narxi</p>
                      <h4 style={{ fontSize: '18px', fontWeight: '900' }}>{Number(selectedOrderHistory.amount || 0).toLocaleString()} <span style={{ fontSize: '12px' }}>so'm</span></h4>
                   </div>
                   <div style={{ background: 'rgba(16,185,129,0.05)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <p style={{ fontSize: '11px', color: '#10b981', textTransform: 'uppercase', marginBottom: '4px' }}>Jami Tushum</p>
                      <h4 style={{ fontSize: '18px', fontWeight: '900', color: '#10b981' }}>{getOrderStats(selectedOrderHistory.productionId || selectedOrderHistory.uniqueId).income.toLocaleString()} <span style={{ fontSize: '12px' }}>so'm</span></h4>
                   </div>
                   <div style={{ background: 'rgba(239,68,68,0.05)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <p style={{ fontSize: '11px', color: '#ef4444', textTransform: 'uppercase', marginBottom: '4px' }}>Jami Xarajat</p>
                      <h4 style={{ fontSize: '18px', fontWeight: '900', color: '#ef4444' }}>{getOrderStats(selectedOrderHistory.productionId || selectedOrderHistory.uniqueId).expense.toLocaleString()} <span style={{ fontSize: '12px' }}>so'm</span></h4>
                   </div>
                   <div style={{ background: (Number(selectedOrderHistory.amount || 0) - getOrderStats(selectedOrderHistory.productionId || selectedOrderHistory.uniqueId).expense) >= 0 ? 'rgba(59,130,246,0.05)' : 'rgba(239,68,68,0.05)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <p style={{ fontSize: '11px', color: '#fff', textTransform: 'uppercase', marginBottom: '4px' }}>Bashoratli Foyda</p>
                      <h4 style={{ fontSize: '18px', fontWeight: '900' }}>{(Number(selectedOrderHistory.amount || 0) - getOrderStats(selectedOrderHistory.productionId || selectedOrderHistory.uniqueId).expense).toLocaleString()} <span style={{ fontSize: '12px' }}>so'm</span></h4>
                   </div>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>Bog'langan Tranzaksiyalar</h3>
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                   <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                         <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '14px 20px', fontSize: '11px', color: 'var(--text-secondary)' }}>SANA</th>
                            <th style={{ padding: '14px 20px', fontSize: '11px', color: 'var(--text-secondary)' }}>TUR</th>
                            <th style={{ padding: '14px 20px', fontSize: '11px', color: 'var(--text-secondary)' }}>KATEGORIYA</th>
                            <th style={{ padding: '14px 20px', fontSize: '11px', color: 'var(--text-secondary)' }}>TO'LOV TURI / IZOH</th>
                            <th style={{ padding: '14px 20px', fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'right' }}>VALYUTA</th>
                            <th style={{ padding: '14px 20px', fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'right' }}>SUMMA (UZS)</th>
                         </tr>
                      </thead>
                      <tbody>
                         {transactions.filter(t => t.orderId === (selectedOrderHistory.productionId || selectedOrderHistory.uniqueId)).length === 0 ? (
                           <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Bog'langan tranzaksiyalar yo'q.</td></tr>
                         ) : (
                           transactions.filter(t => t.orderId === (selectedOrderHistory.productionId || selectedOrderHistory.uniqueId)).map(t => (
                             <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '14px 20px', fontSize: '13px' }}>{new Date(t.date).toLocaleDateString()}</td>
                                <td style={{ padding: '14px 20px' }}><span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', background: t.type === 'income' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: t.type === 'income' ? '#10b981' : '#ef4444' }}>{t.type === 'income' ? 'KIRIM' : 'CHIQIM'}</span></td>
                                 <td style={{ padding: '14px 20px' }}><div style={{ fontSize: '13px', fontWeight: '600' }}>{t.category}</div></td>
                                 <td style={{ padding: '14px 20px' }}><div style={{ fontSize: '13px', color: 'var(--accent-gold)', fontWeight: '700' }}>{t.paymentMethod}</div><div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t.comment}</div></td>
                                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                                  {t.currency === 'USD' ? (
                                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                                      <div style={{ fontWeight: '800' }}>${t.originalAmount.toLocaleString()}</div>
                                      <div>kurs: {t.usdRate}</div>
                                    </div>
                                  ) : <span style={{ color: 'rgba(255,255,255,0.05)' }}>—</span>}
                                </td>
                                <td style={{ padding: '14px 20px', textAlign: 'right', fontWeight: '800', color: t.type === 'income' ? '#10b981' : '#ef4444' }}>{t.type === 'income' ? '+' : '-'}{t.amountUzs?.toLocaleString()}</td>
                             </tr>
                           ))
                         )}
                      </tbody>
                   </table>
                </div>
             </div>
             <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(255,255,255,0.01)' }}>
                <button onClick={() => setSelectedOrderHistory(null)} className="gold-btn" style={{ padding: '12px 32px' }}>Tushunarli</button>
             </div>
          </div>
        </div>
      )}

      {/* ─── BREAKDOWN MODAL ─── */}
      {showBreakdown && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, padding: '20px' }}>
           <div className="premium-card" style={{ width: '450px', padding: '32px', border: '1px solid var(--accent-gold)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                 <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--accent-gold)' }}>Balans Tahlili</h2>
                 <button onClick={() => setShowBreakdown(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 {getMethodBalances().map(m => (
                   <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                         <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{m.icon}</div>
                         <div style={{ fontWeight: '700', color: '#fff' }}>{m.label}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                         <div style={{ fontSize: '18px', fontWeight: '900', color: m.balance < 0 ? '#ef4444' : '#10b981' }}>{m.balance.toLocaleString()}</div>
                         <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>so'm qoldiq</div>
                      </div>
                   </div>
                 ))}
              </div>
              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>Jami Kassa:</span>
                 <span style={{ fontSize: '20px', fontWeight: '900', color: currentBalance < 0 ? '#ef4444' : '#fff' }}>{currentBalance.toLocaleString()} <span style={{ fontSize: '12px' }}>so'm</span></span>
              </div>
           </div>
        </div>
      )}
      {/* ─── CREDITOR VIEW ─────────────────────────────────── */}
      {currentView === 'creditor' && (
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            <button onClick={() => { setCurrentView('hub'); setSelectedPartnerDetails(null); }} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '12px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}><ArrowLeft size={24} /></button>
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: '900' }}>Kreditorlar <span style={{ color: '#10b981' }}>Nazorati</span></h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>Yetkazib beruvchilar oldidagi qarzdorliklar tahlili.</p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="premium-card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Filter size={18} color="var(--text-secondary)" />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>Saralash (Davr):</span>
            </div>
            <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 12px', color: 'white', fontSize: '14px', outline: 'none' }}>
              {[2024, 2025, 2026].map(y => <option key={y} value={y.toString()} style={{ background: '#0f172a' }}>{y}</option>)}
            </select>
            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 12px', color: 'white', fontSize: '14px', outline: 'none' }}>
              {MONTHS.map((m, idx) => <option key={idx} value={idx.toString()} style={{ background: '#0f172a' }}>{m}</option>)}
            </select>
            <button 
              onClick={() => { setFilterMonth(new Date().getMonth().toString()); setFilterYear(new Date().getFullYear().toString()); }}
              style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RotateCcw size={14} /> Tozalash
            </button>
          </div>

          {/* Summary and Bars */}
          <div className="premium-card" style={{ padding: '32px', marginBottom: '24px' }}>
            {(() => {
              const filteredPurchasesForPeriod = purchases.filter(p => {
                const pDate = new Date(p.date);
                return pDate.getMonth().toString() === filterMonth && pDate.getFullYear().toString() === filterYear;
              });
              const totalDebtAll = filteredPurchasesForPeriod.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);

              return (
                <>
                  <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Tanlangan davr uchun jami</p>
                      <h3 style={{ fontSize: '36px', fontWeight: '900', color: '#ef4444' }}>{totalDebtAll.toLocaleString()} <span style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>so'm</span></h3>
                    </div>
                    <button 
                      onClick={() => setSelectedPartnerDetails({ id: 'all', companyName: 'Barchasi' })}
                      className="secondary-btn"
                      style={{ height: '40px', padding: '0 20px', fontSize: '13px', borderRadius: '10px' }}
                    >
                      Barchasini ko'rash
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {partners.map(partner => {
                      const partnerPurchases = filteredPurchasesForPeriod.filter(p => Number(p.partnerId) === partner.id);
                      const totalDebt = partnerPurchases.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);
                      const percentage = totalDebtAll > 0 ? (totalDebt / totalDebtAll) * 100 : 0;

                      if (totalDebt === 0) return null;

                      return (
                        <div key={partner.id} onClick={() => setSelectedPartnerDetails(partner)} style={{ cursor: 'pointer' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'flex-end' }}>
                            <span style={{ fontWeight: '700', fontSize: '14px', color: selectedPartnerDetails?.id === partner.id ? 'var(--accent-gold)' : 'var(--text-secondary)' }}>{partner.companyName} {selectedPartnerDetails?.id === partner.id && '•'}</span>
                            <span style={{ fontSize: '13px', fontWeight: '800' }}>{totalDebt.toLocaleString()} so'm ({percentage.toFixed(1)}%)</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${percentage}%`, height: '100%', background: selectedPartnerDetails?.id === partner.id ? 'var(--accent-gold)' : 'linear-gradient(90deg, #3b82f6, #ef4444)', borderRadius: '3px', transition: 'width 1s ease' }} />
                          </div>
                        </div>
                      );
                    })}
                    {filteredPurchasesForPeriod.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>Ushbu davrda xaridlar topilmadi.</p>}
                  </div>
                </>
              );
            })()}
          </div>

          {/* Detail Table */}
          {selectedPartnerDetails && (
            <div className="premium-card" style={{ padding: '32px', animation: 'fadeInUp 0.4s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: '900' }}>{selectedPartnerDetails.companyName} - <span style={{ color: 'var(--text-secondary)' }}>Tafsilotlar</span></h3>
                <button onClick={() => setSelectedPartnerDetails(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer', color: 'white' }}><X size={20} /></button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                      <th style={{ padding: '16px 8px' }}>Sana</th>
                      <th style={{ padding: '16px 8px' }}>Xarid ID</th>
                      <th style={{ padding: '16px 8px' }}>Mahsulot</th>
                      <th style={{ padding: '16px 8px' }}>Buyurtma ID</th>
                      <th style={{ padding: '16px 8px' }}>Mas'ul</th>
                      <th style={{ padding: '16px 8px', textAlign: 'right' }}>Summa (UZS)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.filter(p => {
                      const pDate = new Date(p.date);
                      const matchesPeriod = pDate.getMonth().toString() === filterMonth && pDate.getFullYear().toString() === filterYear;
                      if (!matchesPeriod) return false;
                      if (selectedPartnerDetails.id === 'all') return true;
                      return Number(p.partnerId) === selectedPartnerDetails.id;
                    }).map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '16px 8px', fontSize: '13px', color: 'var(--text-secondary)' }}>{p.date}</td>
                        <td style={{ padding: '16px 8px' }}><span style={{ fontSize: '11px', background: 'rgba(251,191,36,0.1)', color: 'var(--accent-gold)', padding: '4px 8px', borderRadius: '6px', fontWeight: '800' }}>{p.uniqueXaridId || 'XR-????'}</span></td>
                        <td style={{ padding: '16px 8px' }}>
                          <div style={{ fontWeight: '700' }}>{p.itemName}</div>
                          {p.comment && <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{p.comment}</div>}
                        </td>
                        <td style={{ padding: '16px 8px', fontSize: '13px' }}>
                          {p.orderId ? <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>{p.orderId}</span> : '—'}
                        </td>
                        <td style={{ padding: '16px 8px', fontSize: '13px' }}>{p.createdBy || 'Showroom'}</td>
                        <td style={{ padding: '16px 8px', textAlign: 'right', fontWeight: '900', color: '#ef4444' }}>-{Number(p.totalAmount).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .clickable-card:hover {
          transform: translateY(-8px);
          border-color: var(--accent-gold) !important;
          box-shadow: 0 15px 40px rgba(251,191,36,0.15);
        }
      `}</style>
    </div>
  );
};

export default Finance;
