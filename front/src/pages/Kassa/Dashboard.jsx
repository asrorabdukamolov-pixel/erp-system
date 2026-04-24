import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, TrendingUp, TrendingDown, Calendar, FileText, Search, 
  CreditCard, Banknote, Landmark, ArrowLeft, Package, Briefcase, 
  Users, ArrowRight, ShoppingCart, Clock, Eye, X, User, ChevronDown, ListFilter, Trash2, RotateCcw, Plus
} from 'lucide-react';

const KassaDashboard = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showTrashModal, setShowTrashModal] = useState(false);
  const [tab, setTab] = useState('income');
  const [transactions, setTransactions] = useState([]);
  const [deletedTransactions, setDeletedTransactions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  
  // Custom Context Menu State
  const [contextMenu, setContextMenu] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTxId, setSelectedTxId] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');

  // Form states
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('UZS'); // 'UZS' | 'USD'
  const [usdRate, setUsdRate] = useState(() => localStorage.getItem('erp_last_usd_rate') || '12600');
  const [personName, setPersonName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Naqd');
  const [category, setCategory] = useState('');
  const [comment, setComment] = useState('');
  
  // Autocomplete states
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [categoryIndex, setCategoryIndex] = useState(0);

  // Refs for keyboard workflow
  const orderIdRef = useRef(null);
  const categoryRef = useRef(null);
  const commentRef = useRef(null);
  const saveBtnRef = useRef(null);
  const paymentAreaRef = useRef(null);

  const paymentMethods = [
    { id: 'Naqd', icon: <Banknote size={16}/>, label: 'Naqd' },
    { id: 'Karta', icon: <CreditCard size={16}/>, label: 'Karta' },
    { id: 'Visa', icon: <CreditCard size={16}/>, label: 'Visa' },
    { id: 'Shartnoma', icon: <Landmark size={16}/>, label: 'Shartnoma' }
  ];

  const incomeCategories = ['Savdodan tushum', 'Debyutor qarzdorlik', 'Invistitsiya/Qarz', 'Boshqa'];
  const expenseCategories = [
    'Maxsulot uchun', 'Ish xaqqi', 'Savdo xodimi bonusi', 'PM bonusi', 
    'ijara', 'Kamunal to\'lovlar', 'Kutilmagan xarajatlar', 
    'Yangi zamer uchun yo\'lkira', 'Ofis Xarajatlari', 
    'Invertar maxsulot', 'Oziq ovqat', 'ustanovshik ish xaqqi'
  ];

  // Add lookup states
  const [purchaseId, setPurchaseId] = useState('');
  const [moneyRequests, setMoneyRequests] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [partners, setPartners] = useState([]);
  const [foundRequest, setFoundRequest] = useState(null);

  useEffect(() => {
    loadTransactions();
    loadOrders();
    loadDeletedTransactions();
    
    // Load lookup data
    setMoneyRequests(JSON.parse(localStorage.getItem('erp_money_requests') || '[]'));
    setPurchases(JSON.parse(localStorage.getItem('erp_showroom_purchases') || '[]'));
    setPartners(JSON.parse(localStorage.getItem('erp_showroom_partners') || '[]'));

    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    window.addEventListener('focus', loadTransactions);
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('focus', loadTransactions);
    };
  }, []);

  // Lookup logic when purchaseId changes
  useEffect(() => {
    if (tab === 'expense' && category === 'Maxsulot uchun' && purchaseId.trim()) {
      const req = moneyRequests.find(r => r.purchaseId === purchaseId.trim() && r.status === 'pending');
      if (req) {
        const purchase = purchases.find(p => p.uniqueXaridId === purchaseId.trim());
        const partner = partners.find(p => p.id === purchase?.partnerId);
        
        setFoundRequest({
          manager: req.managerName,
          partner: partner ? partner.name : 'Noma\'lum hamkor',
          balance: req.amount
        });
        
        // Auto-fill
        setPersonName(req.managerName);
        setAmount(req.amount.toString());
      } else {
        setFoundRequest(null);
      }
    } else {
      setFoundRequest(null);
    }
  }, [purchaseId, category, tab]);

  const loadTransactions = () => {
    try {
      const all = JSON.parse(localStorage.getItem('erp_transactions') || '[]');
      setTransactions(all.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch { setTransactions([]); }
  };

  const loadDeletedTransactions = () => {
    try {
      const all = JSON.parse(localStorage.getItem('erp_trash_transactions') || '[]');
      setDeletedTransactions(all.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt)));
    } catch { setDeletedTransactions([]); }
  };

  const loadOrders = () => {
    try {
      const all = JSON.parse(localStorage.getItem('erp_orders') || '[]');
      setOrders(all);
    } catch { setOrders([]); }
  };

  const getOrderBalance = (oId) => {
    const order = orders.find(o => (o.productionId || o.uniqueId) === oId);
    if (!order) return null;
    const history = transactions.filter(t => t.orderId === oId);
    const paid = history.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amountUzs || 0), 0);
    const total = Number(order.amount || 0);
    return { total, paid, debt: total - paid };
  };

  const handleOrderSelect = (order) => {
    const pId = order.productionId || order.uniqueId;
    setOrderId(pId);
    setSelectedOrderDetails(getOrderBalance(pId));
    setShowSuggestions(false);
  };

  const openNewTransaction = () => {
    setTab('income');
    resetFormFields();
    setIsModalOpen(true);
    setTimeout(() => orderIdRef.current?.focus(), 100);
  };

  const resetFormFields = () => {
    setOrderId(''); setAmount(''); setCurrency('UZS'); setPersonName('');
    setPaymentMethod('Naqd'); setCategory(''); setComment('');
    setPurchaseId(''); setFoundRequest(null);
    setSelectedOrderDetails(null); setSuggestionIndex(0); setCategoryIndex(0);
    orderIdRef.current?.focus();
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    if (!amount || isNaN(amount) || Number(amount) <= 0) { alert("Iltimos, to'g'ri summa kiriting."); return; }
    if (!category) { alert("Iltimos, yo'nalishni tanlang."); return; }
    if (currency === 'USD' && (!usdRate || isNaN(usdRate) || Number(usdRate) <= 0)) { alert("Kursni kiriting."); return; }

    const numericAmount = Number(amount);
    const numericRate = Number(usdRate);
    const amountUzs = currency === 'USD' ? numericAmount * numericRate : numericAmount;

    if (currency === 'USD') localStorage.setItem('erp_last_usd_rate', numericRate.toString());

    const newTx = {
      id: Date.now().toString(),
      type: tab,
      orderId: orderId.trim(),
      purchaseId: purchaseId.trim(),
      amountUzs: amountUzs,
      originalAmount: numericAmount,
      currency: currency,
      usdRate: currency === 'USD' ? numericRate : null,
      personName: personName.trim() || 'Noma\'lum',
      paymentMethod: paymentMethod,
      category: category,
      comment: comment.trim(),
      date: new Date().toISOString()
    };

    const updated = [newTx, ...transactions];
    localStorage.setItem('erp_transactions', JSON.stringify(updated));
    setTransactions(updated);

    // Update Money Requests if linked to a purchase
    if (tab === 'expense' && category === 'Maxsulot uchun' && purchaseId.trim()) {
      const allReqs = JSON.parse(localStorage.getItem('erp_money_requests') || '[]');
      const updatedReqs = allReqs.map(r => {
        if (r.purchaseId === purchaseId.trim() && r.status === 'pending') {
          const isFullPayment = amountUzs >= r.amount;
          if (isFullPayment) {
            return { 
              ...r, 
              status: 'approved', 
              paidTotal: (Number(r.paidTotal) || 0) + amountUzs,
              approvedAt: new Date().toISOString() 
            };
          } else {
            return { 
              ...r, 
              amount: r.amount - amountUzs, 
              paidTotal: (Number(r.paidTotal) || 0) + amountUzs 
            };
          }
        }
        return r;
      });
      localStorage.setItem('erp_money_requests', JSON.stringify(updatedReqs));
      setMoneyRequests(updatedReqs);
    }

    resetFormFields();
  };

  // Context Menu Handlers
  const handleContextMenu = (e, tx) => {
    const txDate = new Date(tx.date).toDateString();
    const today = new Date().toDateString();
    
    if (txDate !== today) return; // Only allow deletion of today's transactions

    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY, txId: tx.id });
  };

  const startDelete = () => {
    setSelectedTxId(contextMenu.txId);
    setIsDeleteModalOpen(true);
    setDeleteReason('');
    setContextMenu(null);
  };

  const confirmDelete = () => {
    if (!deleteReason.trim()) { alert("Sababni yozishingiz shart."); return; }

    const txToDelete = transactions.find(t => t.id === selectedTxId);
    if (!txToDelete) return;

    // 1. Remove from active
    const newActive = transactions.filter(t => t.id !== selectedTxId);
    localStorage.setItem('erp_transactions', JSON.stringify(newActive));
    setTransactions(newActive);

    // 2. Add to trash
    const deletedTx = {
      ...txToDelete,
      deletedAt: new Date().toISOString(),
      deleteReason: deleteReason.trim(),
      deletedBy: 'Kassir'
    };
    const newTrash = [deletedTx, ...deletedTransactions];
    localStorage.setItem('erp_trash_transactions', JSON.stringify(newTrash));
    setDeletedTransactions(newTrash);

    setIsDeleteModalOpen(false);
    setSelectedTxId(null);
  };

  const handleRestore = (txId) => {
    const txToRestore = deletedTransactions.find(t => t.id === txId);
    if (!txToRestore) return;

    // 1. Remove from trash
    const newTrash = deletedTransactions.filter(t => t.id !== txId);
    localStorage.setItem('erp_trash_transactions', JSON.stringify(newTrash));
    setDeletedTransactions(newTrash);

    // 2. Add back to active
    const { deletedAt, deleteReason, deletedBy, ...originalData } = txToRestore;
    const newActive = [originalData, ...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    localStorage.setItem('erp_transactions', JSON.stringify(newActive));
    setTransactions(newActive);
    
    if (newTrash.length === 0) setShowTrashModal(false);
  };

  // Keyboard Navigation logic
  const handleOrderIdKeyDown = (e) => {
    if (!showSuggestions || filteredOrdersForSuggest.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSuggestionIndex(prev => (prev < filteredOrdersForSuggest.length - 1 ? prev + 1 : prev)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSuggestionIndex(prev => (prev > 0 ? prev - 1 : prev)); }
    else if (e.key === 'Enter' && suggestionIndex >= 0) { e.preventDefault(); handleOrderSelect(filteredOrdersForSuggest[suggestionIndex]); }
    else if (e.key === 'Escape') setShowSuggestions(false);
  };

  const handleCategoryKeyDown = (e) => {
    if (showCategorySuggestions && filteredCategoriesForSuggest.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setCategoryIndex(prev => (prev < filteredCategoriesForSuggest.length - 1 ? prev + 1 : prev)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setCategoryIndex(prev => (prev > 0 ? prev - 1 : prev)); }
      else if (e.key === 'Enter' && categoryIndex >= 0) {
        e.preventDefault(); 
        const selectedCat = filteredCategoriesForSuggest[categoryIndex];
        setCategory(selectedCat); 
        setShowCategorySuggestions(false); 
        setTimeout(() => paymentAreaRef.current?.focus(), 50);
      }
      else if (e.key === 'Escape') setShowCategorySuggestions(false);
    } else if (e.key === 'Enter') { e.preventDefault(); paymentAreaRef.current?.focus(); }
  };

  const handlePaymentKeyDown = (e) => {
    const currentIndex = paymentMethods.findIndex(m => m.id === paymentMethod);
    if (e.key === 'ArrowRight') { e.preventDefault(); setPaymentMethod(paymentMethods[(currentIndex + 1) % paymentMethods.length].id); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); setPaymentMethod(paymentMethods[(currentIndex - 1 + paymentMethods.length) % paymentMethods.length].id); }
    else if (e.key === 'Enter') { e.preventDefault(); commentRef.current?.focus(); }
  };

  const handleCommentKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveBtnRef.current?.focus(); }
  };

  const getMethodBalances = () => {
    return paymentMethods.map(method => {
      const inc = transactions.filter(t => t.type === 'income' && t.paymentMethod === method.id).reduce((s,t)=>s+(t.amountUzs||0),0);
      const exp = transactions.filter(t => t.type === 'expense' && t.paymentMethod === method.id).reduce((s,t)=>s+(t.amountUzs||0),0);
      return { ...method, balance: inc - exp };
    });
  };

  const getCancelledOrderExpenses = () => {
    try {
      const trash = JSON.parse(localStorage.getItem('erp_trash') || '[]');
      const trashOrderIds = trash.filter(item => item.type === 'order').map(o => o.productionId || o.uniqueId);
      return transactions
        .filter(t => t.type === 'expense' && t.orderId && trashOrderIds.includes(t.orderId))
        .reduce((sum, t) => sum + (t.amountUzs || 0), 0);
    } catch { return 0; }
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + (curr.amountUzs || 0), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + (curr.amountUzs || 0), 0);
  const currentBalance = totalIncome - totalExpense;
  const cancelledExpenses = getCancelledOrderExpenses();

  const filteredOrdersForSuggest = orders.filter(o => (o.productionId || '').toLowerCase().includes(orderId.toLowerCase()));
  const filteredCategoriesForSuggest = (tab === 'income' ? incomeCategories : expenseCategories).filter(c => c.toLowerCase().includes(category.toLowerCase()));

  const recentTxs = transactions.slice(0, 5);

  return (
    <div style={{ padding: '20px', color: '#fff' }}>
      
      {/* ─── TOP STATS ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div onClick={() => setShowBreakdown(true)} className="premium-card clickable-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: '0.3s', border: '1px solid var(--border-color)' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)' }}><Wallet size={32} /></div>
          <div><p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Jonli Kassa Qoldig'i (Batafsil)</p>
          <h3 style={{ fontSize: '28px', fontWeight: '800', color: currentBalance < 0 ? '#ef4444' : '#fff' }}>{currentBalance.toLocaleString()} <span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>so'm</span></h3></div>
        </div>
        <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}><TrendingUp size={32} /></div>
          <div><p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Jami Kirimlar</p><h3 style={{ fontSize: '28px', fontWeight: '800', color: '#10b981' }}>{totalIncome.toLocaleString()} <span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>so'm</span></h3></div>
        </div>
        <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}><TrendingDown size={32} /></div>
          <div><p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Jami Chiqimlar</p><h3 style={{ fontSize: '28px', fontWeight: '800', color: '#ef4444' }}>{totalExpense.toLocaleString()} <span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>so'm</span></h3></div>
        </div>
      </div>

      {/* ─── QUICK ACTIONS ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
         <h2 style={{ fontSize: '22px', fontWeight: '800' }}>Kassa Operatsiyalari</h2>
         <button onClick={openNewTransaction} className="gold-btn" style={{ height: '48px', padding: '0 32px', borderRadius: '12px', fontSize: '16px' }}>
           <Plus size={20} /> Yangi Tranzaksiya
         </button>
      </div>

      {/* ─── RECENT TRANSACTIONS PREVIEW ─── */}
      <div className="premium-card" style={{ padding: '0px', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Clock size={20} color="var(--accent-gold)" />
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>So'nggi Tranzaksiyalar</h3>
          </div>
          <button onClick={() => navigate('/kassa/transactions')} style={{ background: 'transparent', border: 'none', color: 'var(--accent-gold)', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>Barchasini ko'rish <ArrowRight size={16} /></button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '13px' }}>
                <th style={{ padding: '20px 16px' }}>Sana</th><th style={{ padding: '20px 16px' }}>Turi</th><th style={{ padding: '20px 16px' }}>Mijoz / Buyurtma</th><th style={{ padding: '20px 16px' }}>Kategoriya</th><th style={{ padding: '20px 16px' }}>To'lov Turi</th><th style={{ padding: '20px 16px', textAlign: 'right', fontWeight: '700' }}>Summa (UZS)</th>
              </tr>
            </thead>
            <tbody>
              {recentTxs.length === 0 ? (<tr><td colSpan="6" style={{ padding: '60px', textAlign: 'center' }}>Ma'lumotlar yo'q.</td></tr>) : (
                recentTxs.map(t => (
                  <tr key={t.id} onContextMenu={(e) => handleContextMenu(e, t)} style={{ borderBottom: '1px solid var(--border-color)', cursor: 'context-menu' }}>
                    <td style={{ padding: '16px', fontSize: '13px' }}>{new Date(t.date).toLocaleDateString()}</td>
                    <td style={{ padding: '16px' }}><span style={{ fontSize: '10px', fontWeight: '800', padding: '4px 8px', borderRadius: '4px', background: t.type === 'income' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: t.type === 'income' ? '#10b981' : '#ef4444' }}>{t.type === 'income' ? 'KIRIM' : 'CHIQIM'}</span></td>
                    <td style={{ padding: '16px' }}><div style={{ fontWeight: '700', fontSize: '13px' }}>{t.personName}</div></td>
                    <td style={{ padding: '16px' }}><div style={{ fontSize: '13px', fontWeight: '600' }}>{t.category}</div></td>
                    <td style={{ padding: '16px' }}><div style={{ fontSize: '13px', color: 'var(--accent-gold)', fontWeight: '700' }}>{t.paymentMethod}</div></td>
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: '900', color: t.type === 'income' ? '#10b981' : '#ef4444' }}>{t.amountUzs?.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── CUSTOM CONTEXT MENU ─── */}
      {contextMenu && (
        <div style={{ position: 'absolute', top: contextMenu.y, left: contextMenu.x, zIndex: 4000, minWidth: '160px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
          <button onClick={startDelete} style={{ width: '100%', padding: '12px 16px', textAlign: 'left', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', fontSize: '13px' }}><Trash2 size={16} /> O'chirish</button>
        </div>
      )}

      {/* ─── DELETE REASON MODAL ─── */}
      {isDeleteModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 5000, padding: '20px' }}>
          <div className="premium-card" style={{ width: '450px', padding: '32px', border: '1px solid #ef4444' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px', color: '#ef4444' }}>O'chirish Sababi</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Ushbu tranzaksiyani o'chirish sababini yozing. Bu ma'lumot Karzinka bo'limida saqlanadi.</p>
            <textarea value={deleteReason} onChange={e => setDeleteReason(e.target.value)} required placeholder="Masalan: Xato summa kiritildi..." style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '12px', color: '#fff', minHeight: '100px', marginBottom: '24px' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setIsDeleteModalOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'transparent', color: '#fff' }}>Bekor qilish</button>
              <button onClick={confirmDelete} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: '700' }}>Tasdiqlayman</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── KASSIR TRASH MODAL ─── */}
      {showTrashModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 4000, padding: '20px' }}>
          <div className="premium-card" style={{ width: '900px', maxHeight: '85vh', overflowY: 'auto', padding: '32px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
               <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '12px' }}><Trash2 size={28} /> Karzina</h2>
               <button onClick={() => setShowTrashModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff' }}><X size={24} /></button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px', textAlign: 'left' }}>
                    <th style={{ padding: '14px' }}>O'chirilgan Vaqt</th><th style={{ padding: '14px' }}>Tranzaksiya</th><th style={{ padding: '14px', textAlign: 'right' }}>Summa</th><th style={{ padding: '14px' }}>O'chirish Sababi</th><th style={{ padding: '14px' }}>Amal</th>
                  </tr>
                </thead>
                <tbody>
                  {deletedTransactions.length === 0 ? (<tr><td colSpan="5" style={{ padding: '80px', textAlign: 'center' }}>Karzina bo'sh.</td></tr>) : (
                    deletedTransactions.map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '14px', fontSize: '11px' }}>{new Date(t.deletedAt).toLocaleString()}</td>
                        <td style={{ padding: '14px' }}>
                          <div style={{ fontWeight: '700', fontSize: '13px' }}>{t.category}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t.personName} • {new Date(t.date).toLocaleDateString()}</div>
                        </td>
                        <td style={{ padding: '14px', textAlign: 'right' }}>
                          <div style={{ fontWeight: '900', color: t.type === 'income' ? '#10b981' : '#ef4444' }}>{t.amountUzs?.toLocaleString()}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{t.type?.toUpperCase()}</div>
                        </td>
                        <td style={{ padding: '14px' }}><div style={{ fontSize: '12px', background: 'rgba(239,68,68,0.05)', padding: '8px', borderRadius: '8px', color: '#ef4444' }}>{t.deleteReason}</div></td>
                        <td style={{ padding: '14px' }}><button onClick={() => handleRestore(t.id)} style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', cursor: 'pointer' }}><RotateCcw size={14} /> Tiklash</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── OTHER MODALS ─── */}
      {showBreakdown && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, padding: '20px' }}>
           <div className="premium-card" style={{ width: '450px', padding: '32px', border: '1px solid var(--accent-gold)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}><h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--accent-gold)' }}>Balans Tahlili</h2><button onClick={() => setShowBreakdown(false)} style={{ background: 'transparent', border: 'none', color: '#fff' }}><X size={24} /></button></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>{getMethodBalances().map(m => (<div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{m.icon}</div><div style={{ fontWeight: '700' }}>{m.label}</div></div><div style={{ textAlign: 'right' }}><div style={{ fontSize: '18px', fontWeight: '900', color: m.balance < 0 ? '#ef4444' : '#10b981' }}>{m.balance.toLocaleString()}</div><div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>so'm qoldiq</div></div></div>))}</div>
              <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(239,68,68,0.05)', borderRadius: '16px', border: '1px solid rgba(239,68,68,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}><Trash2 size={20} /></div>
                  <div style={{ fontWeight: '700', fontSize: '13px' }}>Otkaz bo'lgan buyurtmalar xarajati</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: '900', color: '#ef4444' }}>{cancelledExpenses.toLocaleString()}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>so'm sarflangan</div>
                </div>
              </div>
              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontWeight: '700' }}>Jami Kassa:</span><span style={{ fontSize: '20px', fontWeight: '900', color: currentBalance < 0 ? '#ef4444' : '#fff' }}>{currentBalance.toLocaleString()} <span style={{ fontSize: '12px' }}>so'm</span></span></div>
           </div>
        </div>
      )}

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }}>
          <div className="premium-card" style={{ width: '850px', maxHeight: '92vh', overflowY: 'auto', padding: '48px', border: '1px solid rgba(212,175,55,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}><div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px' }}><button type="button" onClick={() => setTab('income')} style={{ padding: '8px 20px', borderRadius: '10px', border: 'none', background: tab === 'income' ? 'var(--accent-gold)' : 'transparent', color: tab === 'income' ? '#000' : '#fff' }}>KIRIM</button><button type="button" onClick={() => setTab('expense')} style={{ padding: '8px 20px', borderRadius: '10px', border: 'none', background: tab === 'expense' ? '#ef4444' : 'transparent', color: '#fff' }}>CHIQIM</button></div><button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff' }}><X size={24} /></button></div>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div style={{ position: 'relative' }}><label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', fontWeight: '700' }}>Buyurtma ID</label><input ref={orderIdRef} type="text" value={orderId} onChange={e => {setOrderId(e.target.value); setShowSuggestions(true); setSuggestionIndex(0);}} onFocus={() => setShowSuggestions(true)} onKeyDown={handleOrderIdKeyDown} placeholder="ORD-XXX" style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '14px', color: '#fff', fontSize: '15px' }} />{showSuggestions && orderId.length > 0 && (<div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1e293b', border: '1px solid var(--border-color)', borderRadius: '14px', zIndex: 100, maxHeight: '200px', overflowY: 'auto', marginTop: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>{filteredOrdersForSuggest.map((o, idx) => (<div key={o.id} onClick={() => handleOrderSelect(o)} style={{ padding: '14px 18px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', background: suggestionIndex === idx ? 'rgba(212,175,55,0.2)' : 'transparent' }} onMouseEnter={() => setSuggestionIndex(idx)}><div style={{ fontWeight: '800', fontSize: '13px', color: suggestionIndex === idx ? 'var(--accent-gold)' : '#fff' }}>{o.productionId}</div><div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{o.selectedCustomer?.firstName}</div></div>))}</div>)}{selectedOrderDetails && (<div style={{ marginTop: '12px', fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}><div style={{ color: 'var(--text-secondary)' }}>Qarzdorlik: <span style={{ color: '#ef4444', fontWeight: '800' }}>{selectedOrderDetails.debt.toLocaleString()} so'm</span></div></div>)}</div>
                <div><label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', fontWeight: '700' }}>Kim olgan/bergan *</label><input type="text" value={personName} onChange={e => setPersonName(e.target.value)} required placeholder="F.I.SH" style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '14px', color: '#fff', fontSize: '15px' }} /></div>
              </div>
              
              {/* PURCHASE ID FIELD FOR EXPENSES */}
              {tab === 'expense' && category === 'Maxsulot uchun' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', fontWeight: '700' }}>Xarid ID (XR-XXXX)</label>
                  <input type="text" value={purchaseId} onChange={e => setPurchaseId(e.target.value)} placeholder="XR-0001" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--accent-gold)', padding: '16px', borderRadius: '14px', color: '#fff', fontSize: '15px' }} />
                  {foundRequest && (
                    <div style={{ marginTop: '12px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', padding: '16px', borderRadius: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div><p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Manager:</p><p style={{ fontSize: '14px', fontWeight: '800', color: 'var(--accent-gold)' }}>{foundRequest.manager}</p></div>
                      <div><p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Hamkor:</p><p style={{ fontSize: '14px', fontWeight: '800', color: 'var(--accent-gold)' }}>{foundRequest.partner}</p></div>
                      <div style={{ gridColumn: 'span 2' }}><p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Qolgan summa:</p><p style={{ fontSize: '18px', fontWeight: '900', color: '#ef4444' }}>{foundRequest.balance?.toLocaleString()} so'm</p></div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', alignItems: 'end' }}>
                 <div><label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', fontWeight: '700' }}>Summa *</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="0.00" style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '14px', color: '#fff', fontSize: '22px', fontWeight: '900' }} /></div>
                 <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '14px', padding: '6px', height: '60px' }}><button type="button" onClick={() => setCurrency('UZS')} style={{ flex: 1, border: 'none', borderRadius: '10px', background: currency === 'UZS' ? '#3b82f6' : 'transparent', color: '#fff', fontWeight: '700', fontSize: '15px' }}>UZS</button><button type="button" onClick={() => setCurrency('USD')} style={{ flex: 1, border: 'none', borderRadius: '10px', background: currency === 'USD' ? '#10b981' : 'transparent', color: '#fff', fontWeight: '700', fontSize: '15px' }}>USD $</button></div>
              </div>
              {currency === 'USD' && (<div style={{ background: 'rgba(16,185,129,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '20px' }}><label style={{ fontSize: '11px', color: '#10b981', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Kurs ($1 = ? so'm) *</label><input type="number" value={usdRate} onChange={e => setUsdRate(e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(16,185,129,0.3)', padding: '10px', borderRadius: '8px', color: '#fff', fontWeight: '700' }} /></div>)}
              <div style={{ marginBottom: '24px', position: 'relative' }}><label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', fontWeight: '700' }}>Yo'nalish *</label><div style={{ position: 'relative' }}><input ref={categoryRef} type="text" value={category} onChange={e => {setCategory(e.target.value); setShowCategorySuggestions(true); setCategoryIndex(0);}} onFocus={() => {setShowCategorySuggestions(true); setCategoryIndex(0);}} onKeyDown={handleCategoryKeyDown} placeholder="Qidirish..." style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '14px', color: '#fff', fontSize: '15px' }} />{showCategorySuggestions && (<div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, background: '#1e293b', border: '1px solid var(--border-color)', borderRadius: '14px', zIndex: 110, maxHeight: '200px', overflowY: 'auto', marginBottom: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>{filteredCategoriesForSuggest.map((c, idx) => (<div key={c} onClick={() => {setCategory(c); setShowCategorySuggestions(false); setTimeout(()=>paymentAreaRef.current?.focus(), 50);}} style={{ padding: '14px 18px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '14px', background: categoryIndex === idx ? 'rgba(212,175,55,0.2)' : 'transparent' }} onMouseEnter={() => setCategoryIndex(idx)}>{c}</div>))}</div>)}</div></div>
              <div style={{ marginBottom: '32px' }}><label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', fontWeight: '700' }}>To'lov Turi</label><div ref={paymentAreaRef} tabIndex="0" onKeyDown={handlePaymentKeyDown} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', outline: 'none' }}>{paymentMethods.map(m => (<div key={m.id} style={{ padding: '14px 8px', borderRadius: '14px', border: '1px solid var(--border-color)', background: paymentMethod === m.id ? 'var(--accent-gold)' : 'rgba(255,255,255,0.03)', color: paymentMethod === m.id ? '#000' : '#fff', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: '0.2s' }} onClick={() => setPaymentMethod(m.id)}>{m.icon} <span style={{ fontSize: '11px', fontWeight: '700' }}>{m.label}</span></div>))}</div></div>
              <div style={{ marginBottom: '32px' }}><label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', fontWeight: '700' }}>Izoh</label><textarea ref={commentRef} value={comment} onChange={e => setComment(e.target.value)} onKeyDown={handleCommentKeyDown} placeholder="Batafsil..." style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '14px', color: '#fff', minHeight: '100px', fontSize: '15px' }} /></div>
              <div style={{ display: 'flex', gap: '20px' }}><button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '18px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'transparent', color: '#fff', fontSize: '16px', fontWeight: '600' }}>Bekor qilish</button><button ref={saveBtnRef} type="submit" style={{ flex: 2, padding: '18px', borderRadius: '14px', border: 'none', background: tab === 'income' ? 'var(--accent-gold)' : '#ef4444', color: tab === 'income' ? '#000' : '#fff', fontWeight: '900', fontSize: '18px' }}>Saqlash (Enter)</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KassaDashboard;
