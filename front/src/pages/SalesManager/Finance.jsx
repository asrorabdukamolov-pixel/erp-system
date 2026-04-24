import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, Plus, Search, Calendar, DollarSign, Clock, 
  CheckCircle, XCircle, Info, Send, FileText, ArrowRight,
  ShoppingCart, Package, Truck, User, Hash, MessageSquare, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = [
  { id: 'travel', label: 'Yo\'l xarajati uchun', icon: <Truck size={16} /> },
  { id: 'food', label: 'Oziq-ovqat uchun', icon: <ShoppingCart size={16} /> },
  { id: 'bonus', label: 'Ish xaqqi bonusi', icon: <DollarSign size={16} /> },
  { id: 'advance', label: 'ish xaqqi fiksadan avans', icon: <DollarSign size={16} /> },
];

const Finance = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requests, setRequests] = useState(() => JSON.parse(localStorage.getItem('erp_money_requests') || '[]'));
  const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem('erp_orders') || '[]'));
  
  // Form State
  const [category, setCategory] = useState('travel');
  const [neededDate, setNeededDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [comment, setComment] = useState('');
  const [showOrderSuggest, setShowOrderSuggest] = useState(false);

  // Focus management
  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => categoryRefs.current[0]?.focus(), 150);
    }
  }, [isModalOpen]);

  // Suggestion State
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    localStorage.setItem('erp_money_requests', JSON.stringify(requests));
  }, [requests]);

  const myOrders = orders.filter(o => o.managerId === user.id);
  const filteredOrders = myOrders.filter(o => 
    o.uniqueId?.toLowerCase().includes(orderSearch.toLowerCase()) || 
    o.productionId?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.selectedCustomer?.firstName?.toLowerCase().includes(orderSearch.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [orderSearch]);

  const handleKeyDown = (e) => {
    if (!showOrderSuggest || filteredOrders.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredOrders.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredOrders[selectedIndex];
      if (selected) {
        handleSelectOrder(selected);
      }
    } else if (e.key === 'Escape') {
      setShowOrderSuggest(false);
    }
  };

  const handleSelectOrder = (o) => {
    setSelectedOrderId(o.productionId || o.uniqueId);
    setOrderSearch(o.productionId || o.uniqueId);
    setShowOrderSuggest(false);
    setSelectedIndex(0);
  };

  // Refs for keyboard workflow
  const categoryRefs = useRef([]);
  const dateRef = useRef(null);
  const amountRef = useRef(null);
  const searchRef = useRef(null);
  const commentRef = useRef(null);
  const submitRef = useRef(null);
  const cancelRef = useRef(null);

  const handleCommentKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitRef.current?.focus();
    }
  };

  const handleCategoryKeyDown = (e, idx) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      categoryRefs.current[idx + 1]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      categoryRefs.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      categoryRefs.current[idx + 2]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      categoryRefs.current[idx - 2]?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      setCategory(CATEGORIES[idx].id);
      dateRef.current?.focus();
    }
  };

  const handleButtonKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      cancelRef.current?.focus();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      submitRef.current?.focus();
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!amount || Number(amount) <= 0) return alert('Summani kiriting!');
    if (!neededDate) return alert('Sanani tanlang!');
    if ((category === 'travel' || category === 'food') && !selectedOrderId) return alert('Buyurtmani tanlang!');

    const newRequest = {
      id: 'REQ-' + Date.now(),
      managerId: user.id,
      managerName: user.name,
      category: CATEGORIES.find(c => c.id === category).label,
      orderId: (category === 'travel' || category === 'food') ? selectedOrderId : null,
      amount: Number(amount),
      neededDate,
      comment,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setRequests([newRequest, ...requests]);
    setIsModalOpen(false);
    resetForm();
    // Reset to first category for next session
    setTimeout(() => {
      setIsModalOpen(true);
      setTimeout(() => categoryRefs.current[0]?.focus(), 100);
    }, 500); // Small delay to let modal close animation finish if any
  };

  const resetForm = () => {
    setCategory('travel'); setNeededDate(new Date().toISOString().split('T')[0]); setAmount('');
    setOrderSearch(''); setSelectedOrderId(''); setComment('');
    setShowOrderSuggest(false);
  };

  const myRequests = requests.filter(r => r.managerId === user.id);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: '11px', fontWeight: '800' }}>TASDIQLANDI</span>;
      case 'rejected': return <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '11px', fontWeight: '800' }}>RAD ETILDI</span>;
      default: return <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(251,191,36,0.1)', color: '#fbbf24', fontSize: '11px', fontWeight: '800' }}>KUTILMOQDA</span>;
    }
  };

  return (
    <div style={{ flex: 1, padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: '900' }}>Moliya <span style={{ color: 'var(--accent-gold)' }}>Bo'limi</span></h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Xarajatlar uchun pul so'rash va so'rovlar tarixi.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="gold-btn" style={{ height: '48px', padding: '0 24px' }}>
          <Plus size={20} /> Pul buyurtma berish
        </button>
      </div>

      <div className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Clock size={20} color="var(--accent-gold)" />
          <h3 style={{ fontSize: '18px', fontWeight: '800' }}>So'rovlar Arxivi</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                <th style={{ padding: '20px' }}>ID & KATEGORIYA</th>
                <th style={{ padding: '20px' }}>BUYURTMA</th>
                <th style={{ padding: '20px' }}>SUMMA</th>
                <th style={{ padding: '20px' }}>KERAKLI SANA</th>
                <th style={{ padding: '20px' }}>STATUS</th>
                <th style={{ padding: '20px' }}>IZOH / SABAB</th>
              </tr>
            </thead>
            <tbody>
              {myRequests.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '100px', textAlign: 'center', color: 'var(--text-secondary)' }}>Hozircha so'rovlar yo'q.</td></tr>
              ) : (
                myRequests.map(req => (
                  <tr key={req.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '20px' }}>
                      <p style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: '800', marginBottom: '4px' }}>{req.id}</p>
                      <p style={{ fontSize: '14px', fontWeight: '700' }}>{req.category}</p>
                    </td>
                    <td style={{ padding: '20px' }}>
                      {req.orderId ? <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px' }}>{req.orderId}</span> : '—'}
                    </td>
                    <td style={{ padding: '20px', fontWeight: '900', fontSize: '15px' }}>
                      {req.amount?.toLocaleString()} <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>UZS</span>
                    </td>
                    <td style={{ padding: '20px', fontSize: '13px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={14} color="var(--text-secondary)" /> {req.neededDate}</div>
                    </td>
                    <td style={{ padding: '20px' }}>{getStatusBadge(req.status)}</td>
                    <td style={{ padding: '20px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '200px' }}>
                        {req.comment && <div style={{ marginBottom: '4px' }}>📝 {req.comment}</div>}
                        {req.status === 'rejected' && <div style={{ color: '#ef4444', fontWeight: '700' }}>❌ Sabab: {req.rejectReason}</div>}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Request Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, padding: '20px' }}>
          <div className="premium-card" style={{ width: '850px', maxWidth: '95%', padding: '48px', border: '1px solid rgba(212,175,55,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <div>
                <h3 style={{ fontSize: '28px', fontWeight: '900' }}>Pul buyurtma berish</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Xarajat turi va miqdorini ko'rsating.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '50%', color: 'white', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>Kategoriya</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {CATEGORIES.map((cat, idx) => (
                    <button 
                      key={cat.id} 
                      type="button" 
                      className="category-btn"
                      ref={el => categoryRefs.current[idx] = el}
                      onClick={() => {setCategory(cat.id); dateRef.current?.focus();}} 
                      onKeyDown={(e) => handleCategoryKeyDown(e, idx)}
                      style={{ 
                        padding: '18px', 
                        borderRadius: '16px', 
                        background: category === cat.id ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.02)', 
                        border: `1px solid ${category === cat.id ? 'var(--accent-gold)' : 'var(--border-color)'}`, 
                        color: category === cat.id ? 'var(--accent-gold)' : 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '14px', 
                        fontSize: '14px', 
                        fontWeight: '700', 
                        textAlign: 'left', 
                        cursor: 'pointer', 
                        transition: '0.2s',
                        outline: 'none'
                      }}>
                      <span style={{ transform: 'scale(1.2)' }}>{cat.icon}</span> {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>Qaysi kun uchun?</label>
                  <input 
                    type="date" 
                    ref={dateRef}
                    value={neededDate} 
                    onChange={e => setNeededDate(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && amountRef.current?.focus()}
                    onClick={(e) => e.target.showPicker?.()}
                    required 
                    style={{ 
                      width: '100%', 
                      height: '56px', 
                      background: 'var(--secondary-bg)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '14px', 
                      padding: '0 18px', 
                      color: 'white', 
                      fontSize: '16px',
                      cursor: 'pointer',
                      colorScheme: 'dark',
                      outline: 'none'
                    }} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>Summa (UZS)</label>
                  <input 
                    type="number" 
                    ref={amountRef}
                    value={amount} 
                    onChange={e => setAmount(e.target.value)} 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (category === 'travel' || category === 'food') searchRef.current?.focus();
                        else commentRef.current?.focus();
                      }
                    }}
                    required 
                    placeholder="0" 
                    style={{ 
                      width: '100%', 
                      height: '56px', 
                      background: 'var(--secondary-bg)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '14px', 
                      padding: '0 18px', 
                      color: 'white', 
                      fontWeight: '800', 
                      fontSize: '20px',
                      outline: 'none'
                    }} 
                  />
                </div>
              </div>

              {(category === 'travel' || category === 'food') && (
                <div style={{ position: 'relative' }}>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>Buyurtmani tanlang</label>
                  <div style={{ position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input 
                      ref={searchRef}
                      type="text" 
                      value={orderSearch} 
                      onChange={e => {setOrderSearch(e.target.value); setShowOrderSuggest(true);}} 
                      onFocus={() => setShowOrderSuggest(true)} 
                      onBlur={() => setTimeout(() => setShowOrderSuggest(false), 200)}
                      onKeyDown={(e) => {
                        handleKeyDown(e);
                        if (e.key === 'Enter' && selectedOrderId) commentRef.current?.focus();
                      }}
                      placeholder="ID yoki mijoz ismi..." 
                      style={{ width: '100%', height: '56px', paddingLeft: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '14px', color: 'white', fontSize: '16px', outline: 'none' }} 
                    />
                  </div>
                  {showOrderSuggest && filteredOrders.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1e293b', border: '1px solid var(--border-color)', borderRadius: '14px', zIndex: 100, maxHeight: '200px', overflowY: 'auto', marginTop: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                      {filteredOrders.map((o, index) => (
                        <div 
                          key={o.id} 
                          onClick={() => {handleSelectOrder(o); commentRef.current?.focus();}} 
                          onMouseEnter={() => setSelectedIndex(index)}
                          style={{ 
                            padding: '14px 20px', 
                            cursor: 'pointer', 
                            borderBottom: '1px solid rgba(255,255,255,0.05)', 
                            transition: '0.2s',
                            background: selectedIndex === index ? 'rgba(251,191,36,0.15)' : 'transparent'
                          }}
                        >
                           <p style={{ fontWeight: '800', fontSize: '14px', color: selectedIndex === index ? 'var(--accent-gold)' : 'white' }}>{o.productionId || o.uniqueId}</p>
                           <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{o.selectedCustomer?.firstName} {o.selectedCustomer?.lastName}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>Izoh (Manual kiritish)</label>
                <textarea 
                  ref={commentRef}
                  value={comment} 
                  onChange={e => setComment(e.target.value)} 
                  onKeyDown={handleCommentKeyDown}
                  placeholder="Batafsil ma'lumot..." 
                  style={{ width: '100%', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '18px', color: 'white', minHeight: '120px', resize: 'none', fontSize: '15px', outline: 'none' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                <button 
                  type="button" 
                  ref={cancelRef}
                  onKeyDown={handleButtonKeyDown}
                  onClick={() => setIsModalOpen(false)} 
                  className="secondary-btn" 
                  style={{ flex: 1, height: '56px', fontSize: '16px', fontWeight: '600', borderRadius: '14px', transition: '0.3s' }}
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  ref={submitRef}
                  onKeyDown={handleButtonKeyDown}
                  className="gold-btn" 
                  style={{ 
                    flex: 1.5, 
                    height: '56px', 
                    justifyContent: 'center', 
                    fontSize: '18px', 
                    fontWeight: '900', 
                    borderRadius: '14px',
                    boxShadow: '0 0 0 0 rgba(251,191,36,0)',
                    transition: '0.3s'
                  }}
                >
                  <Send size={20} /> Buyurtma berish
                </button>
              </div>
            </form>
            <style>{`
              .category-btn:focus {
                border: 2px solid var(--accent-gold) !important;
                background: rgba(251,191,36,0.05);
                box-shadow: 0 0 15px rgba(251,191,36,0.2);
              }
              .gold-btn:focus {
                box-shadow: 0 0 20px rgba(251,191,36,0.4);
                border: 2px solid var(--accent-gold) !important;
                transform: translateY(-2px);
              }
              .secondary-btn:focus {
                background: rgba(255,255,255,0.1);
                border: 2px solid white !important;
                transform: translateY(-2px);
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
