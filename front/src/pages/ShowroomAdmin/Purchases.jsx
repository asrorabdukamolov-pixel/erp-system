import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  X, 
  Edit2,
  Package,
  ShoppingCart,
  Calendar,
  Users,
  User,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ShowroomPurchases = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [partners, setPartners] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPurchase, setEditingPurchase] = useState(null);
  
  // Autocomplete states
  const [orderSearch, setOrderSearch] = useState('');
  const [filteredOrderResults, setFilteredOrderResults] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [showOrderResults, setShowOrderResults] = useState(false);

  const [formData, setFormData] = useState({
    itemName: '',
    orderId: '',
    customerName: '',
    customerPhone: '',
    partnerId: '',
    quantity: '',
    pricePerUnit: '',
    totalAmount: '',
    date: new Date().toISOString().split('T')[0],
    comment: ''
  });

  useEffect(() => {
    const savedPurchases = JSON.parse(localStorage.getItem('erp_showroom_purchases') || '[]');
    const savedPartners = JSON.parse(localStorage.getItem('erp_showroom_partners') || '[]');
    const savedOrders = JSON.parse(localStorage.getItem('erp_orders') || '[]');
    
    setPurchases(savedPurchases);
    setPartners(savedPartners);
    
    // Confirmed orders filter
    const ORDER_STAGES = ['tasdiqlandi', 'pm', 'ishlab_chiqarishda', 'ombor', 'ornatish', 'bajarildi', 'yopildi'];
    let filtered = savedOrders.filter(o => ORDER_STAGES.includes(o.status));

    // IF PM, filter only their own orders
    if (user?.role === 'proekt_manager') {
      filtered = filtered.filter(o => o.assignedPmName === user.name);
    }
    
    setOrders(filtered);
  }, [user]);

  // Auto-calculate total
  useEffect(() => {
    const total = (Number(formData.quantity) || 0) * (Number(formData.pricePerUnit) || 0);
    setFormData(prev => ({ ...prev, totalAmount: total }));
  }, [formData.quantity, formData.pricePerUnit]);

  const handleOrderSearchChange = (val) => {
    setOrderSearch(val);
    if (val.trim()) {
      const results = orders.filter(o => 
        (o.productionId || '').toLowerCase().includes(val.toLowerCase()) ||
        (o.selectedCustomer?.firstName || '').toLowerCase().includes(val.toLowerCase()) ||
        (o.selectedCustomer?.lastName || '').toLowerCase().includes(val.toLowerCase())
      ).slice(0, 5);
      setFilteredOrderResults(results);
      setShowOrderResults(true);
      setSelectedIdx(0);
    } else {
      setFilteredOrderResults([]);
      setShowOrderResults(false);
    }
  };

  const selectOrder = (order) => {
    setFormData(prev => ({
      ...prev,
      orderId: order.productionId || order.uniqueId,
      customerName: `${order.selectedCustomer?.firstName || ''} ${order.selectedCustomer?.lastName || ''}`,
      customerPhone: order.selectedCustomer?.phone || ''
    }));
    setOrderSearch(order.productionId || order.uniqueId);
    setShowOrderResults(false);
  };

  const handleKeyDown = (e) => {
    if (!showOrderResults) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(prev => (prev < filteredOrderResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      if (filteredOrderResults[selectedIdx]) {
        selectOrder(filteredOrderResults[selectedIdx]);
        e.preventDefault();
      }
    }
  };

  const handleSave = () => {
    if (!formData.itemName || !formData.partnerId || !formData.quantity || !formData.pricePerUnit) {
      alert('Iltimos, barcha asosiy maydonlarni to\'ldiring!');
      return;
    }

    let updatedPurchases;
    if (editingPurchase) {
      updatedPurchases = purchases.map(p => p.id === editingPurchase.id ? { ...p, ...formData } : p);
    } else {
      // Generate Unique Xarid ID
      const lastXR = purchases.length > 0 ? purchases[0].uniqueXaridId : null;
      let nextNum = 1;
      if (lastXR && lastXR.startsWith('XR-')) {
        nextNum = parseInt(lastXR.split('-')[1]) + 1;
      }
      const uniqueXaridId = `XR-${String(nextNum).padStart(4, '0')}`;

      const newPurchase = {
        id: Date.now(),
        uniqueXaridId,
        createdBy: user.name,
        creatorRole: user.role,
        ...formData
      };
      updatedPurchases = [newPurchase, ...purchases];
    }

    setPurchases(updatedPurchases);
    localStorage.setItem('erp_showroom_purchases', JSON.stringify(updatedPurchases));
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Ushbu xaridni o\'chirmoqchimisiz?')) {
      const updated = purchases.filter(p => p.id !== id);
      setPurchases(updated);
      localStorage.setItem('erp_showroom_purchases', JSON.stringify(updated));
    }
  };

  const openModal = (purchase = null) => {
    if (purchase) {
      setEditingPurchase(purchase);
      setFormData({ ...purchase });
      setOrderSearch(purchase.orderId || '');
    } else {
      setEditingPurchase(null);
      setFormData({
        itemName: '',
        orderId: '',
        customerName: '',
        customerPhone: '',
        partnerId: '',
        quantity: '',
        pricePerUnit: '',
        totalAmount: 0,
        date: new Date().toISOString().split('T')[0],
        comment: ''
      });
      setOrderSearch('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPurchase(null);
    setShowOrderResults(false);
  };

  const getPartnerName = (id) => {
    const partner = partners.find(p => p.id === Number(id));
    return partner ? partner.companyName : 'Noma\'lum hamkor';
  };

  const filteredPurchases = purchases.filter(p => {
    const matchesSearch = (
      p.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getPartnerName(p.partnerId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.orderId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.uniqueXaridId || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!matchesSearch) return false;

    // Visibility: PM sees only their own, Admin sees all
    if (user?.role === 'proekt_manager') {
      return p.createdBy === user.name;
    }
    return true;
  });

  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'requests'
  const [moneyRequests, setMoneyRequests] = useState([]);

  useEffect(() => {
    const savedRequests = JSON.parse(localStorage.getItem('erp_money_requests') || '[]');
    setMoneyRequests(savedRequests);
  }, []);

  const pendingPurchaseRequests = moneyRequests.filter(r => 
    (r.category === 'Maxsulot uchun' || r.purchaseId) && 
    r.status === 'pending' && 
    r.adminApproved !== true
  );

  const handleAdminApprove = (reqId) => {
    const updated = moneyRequests.map(r => r.id === reqId ? { ...r, adminApproved: true } : r);
    setMoneyRequests(updated);
    localStorage.setItem('erp_money_requests', JSON.stringify(updated));
  };

  return (
    <div style={{ padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'white', marginBottom: '8px' }}>Xarid Bo'limi</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Xom-ashyo va materiallar xaridi monitoringi</p>
        </div>
        {activeTab === 'all' && (
          <button 
            onClick={() => openModal()}
            style={{ 
              background: 'var(--accent-gold)', 
              color: '#0f172a', 
              padding: '16px 32px', 
              borderRadius: '16px', 
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Plus size={22} />
            Yangi Xarid
          </button>
        )}
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
        <button 
          onClick={() => setActiveTab('all')}
          style={{ 
            background: activeTab === 'all' ? 'rgba(251,191,36,0.1)' : 'transparent',
            border: activeTab === 'all' ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)',
            color: activeTab === 'all' ? 'var(--accent-gold)' : 'var(--text-secondary)',
            padding: '12px 24px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer'
          }}
        >
          Barcha Xaridlar
        </button>
        <button 
          onClick={() => setActiveTab('requests')}
          style={{ 
            background: activeTab === 'requests' ? 'rgba(251,191,36,0.1)' : 'transparent',
            border: activeTab === 'requests' ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)',
            color: activeTab === 'requests' ? 'var(--accent-gold)' : 'var(--text-secondary)',
            padding: '12px 24px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          Yangi Xarid So'rovlari
          {pendingPurchaseRequests.length > 0 && (
            <span style={{ background: '#ef4444', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '10px' }}>
              {pendingPurchaseRequests.length}
            </span>
          )}
        </button>
      </div>

      <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
        {activeTab === 'requests' ? (
          /* Showroom Admin Approval View */
          <div style={{ overflowX: 'auto' }}>
             <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>SO'ROV ID</th>
                    <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>MANAGER</th>
                    <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>XARID RAQAMI</th>
                    <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>SUMMA</th>
                    <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>IZOH</th>
                    <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>AMALLAR</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPurchaseRequests.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '80px', color: 'var(--text-secondary)' }}>Yangi so'rovlar yo'q.</td></tr>
                  ) : (
                    pendingPurchaseRequests.map(req => (
                      <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '800', color: 'var(--accent-gold)' }}>{req.id}</td>
                        <td style={{ padding: '20px 24px', fontSize: '14px', fontWeight: '600' }}>{req.managerName}</td>
                        <td style={{ padding: '20px 24px', fontSize: '14px', fontWeight: '800', color: '#10b981' }}>{req.purchaseId}</td>
                        <td style={{ padding: '20px 24px', fontSize: '15px', fontWeight: '900' }}>{req.amount?.toLocaleString()} UZS</td>
                        <td style={{ padding: '20px 24px', fontSize: '13px', color: 'var(--text-secondary)' }}>{req.comment || '—'}</td>
                        <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                          <button 
                            onClick={() => handleAdminApprove(req.id)}
                            style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '10px 24px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
                          >
                            Tasdiqlash
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
             </table>
          </div>
        ) : (
          /* Normal Purchase View */
          <>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Mahsulot, hamkor yoki buyurtma ID bo'yicha qidirish..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%', 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '14px', 
                padding: '14px 16px 14px 48px',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>XARID ID</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>MAS'UL</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Sana</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Mahsulot / Buyurtma</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Hamkor</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Miqdor</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>Narxi</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>Jami Summa</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '80px', color: 'var(--text-secondary)' }}>Xaridlar topilmadi.</td></tr>
              ) : (
                filteredPurchases.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '20px 24px', fontSize: '13px', fontWeight: '800', color: 'var(--accent-gold)' }}>{p.uniqueXaridId}</td>
                    <td style={{ padding: '20px 24px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <User size={14} color="var(--text-secondary)" />
                          <span style={{ fontSize: '13px', fontWeight: '600' }}>{p.createdBy || 'Showroom'}</span>
                       </div>
                    </td>
                    <td style={{ padding: '20px 24px', fontSize: '13px', color: 'var(--text-secondary)' }}>{p.date}</td>
                    <td style={{ padding: '20px 24px' }}>
                       <div style={{ fontWeight: '800' }}>{p.itemName}</div>
                       {p.orderId && <div style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>ID: {p.orderId}</div>}
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Users size={16} color="var(--accent-gold)" />
                          <span style={{ fontSize: '14px', fontWeight: '600' }}>{getPartnerName(p.partnerId)}</span>
                       </div>
                    </td>
                    <td style={{ padding: '20px 24px', fontSize: '14px' }}>{p.quantity}</td>
                    <td style={{ padding: '20px 24px', textAlign: 'right', fontSize: '14px' }}>{Number(p.pricePerUnit).toLocaleString()}</td>
                    <td style={{ padding: '20px 24px', textAlign: 'right', fontWeight: '900', color: '#10b981' }}>{Number(p.totalAmount).toLocaleString()}</td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                       <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => openModal(p)} style={{ background: 'rgba(251,191,36,0.1)', color: 'var(--accent-gold)', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}><Edit2 size={18} /></button>
                          <button onClick={() => handleDelete(p.id)} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}><Trash2 size={18} /></button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
          </>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: 'var(--secondary-bg)', width: '100%', maxWidth: '650px', borderRadius: '32px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <div style={{ padding: '32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '900' }}>{editingPurchase ? 'Xaridni Tahrirlash' : 'Yangi Xarid'}</h2>
              <button onClick={closeModal} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>Mahsulot/Material Nomi</label>
                  <input type="text" value={formData.itemName} onChange={e => setFormData({...formData, itemName: e.target.value})} placeholder="Masalan: DSP Laminat" style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'white' }} />
                </div>
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>Buyurtma ID</label>
                  <input 
                    type="text" 
                    value={orderSearch} 
                    onChange={e => handleOrderSearchChange(e.target.value)} 
                    onKeyDown={handleKeyDown}
                    placeholder="ID qidiring..." 
                    style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'white' }} 
                  />
                  {showOrderResults && filteredOrderResults.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1e293b', border: '1px solid var(--border-color)', borderRadius: '12px', marginTop: '8px', zIndex: 10, overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                      {filteredOrderResults.map((order, idx) => (
                        <div 
                          key={order.id} 
                          onClick={() => selectOrder(order)}
                          style={{ 
                            padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)',
                            background: selectedIdx === idx ? 'rgba(251,191,36,0.1)' : 'transparent',
                            color: selectedIdx === idx ? 'var(--accent-gold)' : 'white'
                          }}
                        >
                          <div style={{ fontWeight: '700', fontSize: '14px' }}>{order.productionId || order.uniqueId}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{order.selectedCustomer?.firstName} {order.selectedCustomer?.lastName}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {formData.customerName && (
                <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                      <p style={{ fontSize: '11px', color: 'var(--accent-gold)', textTransform: 'uppercase', fontWeight: '800' }}>Mijoz Ma'lumotlari</p>
                      <h4 style={{ fontSize: '14px', fontWeight: '700' }}>{formData.customerName}</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{formData.customerPhone}</p>
                   </div>
                   <button onClick={() => setFormData(prev => ({...prev, orderId: '', customerName: '', customerPhone: ''})) || setOrderSearch('')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}><X size={16}/></button>
                </div>
              )}

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>Hamkor (Yetkazib beruvchi)</label>
                <select 
                  value={formData.partnerId} 
                  onChange={e => setFormData({...formData, partnerId: e.target.value})} 
                  style={{ 
                    width: '100%', 
                    padding: '14px', 
                    borderRadius: '14px', 
                    background: '#1e293b', 
                    border: '1px solid var(--border-color)', 
                    color: 'white',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="" style={{ background: '#1e293b', color: 'white' }}>Tanlang...</option>
                  {partners.length === 0 ? (
                    <option disabled style={{ background: '#1e293b', color: 'rgba(255,255,255,0.5)' }}>Hamkorlar hali qo'shilmagan</option>
                  ) : (
                    partners.map(p => (
                      <option key={p.id} value={p.id} style={{ background: '#1e293b', color: 'white' }}>{p.companyName}</option>
                    ))
                  )}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>Miqdor</label>
                  <input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>Birlik narxi (UZS)</label>
                  <input type="number" value={formData.pricePerUnit} onChange={e => setFormData({...formData, pricePerUnit: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'white' }} />
                </div>
              </div>

              <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)' }}>
                <p style={{ fontSize: '12px', color: '#10b981', textTransform: 'uppercase', fontWeight: '800', marginBottom: '4px' }}>Jami Summa</p>
                <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#10b981' }}>{formData.totalAmount.toLocaleString()} <span style={{ fontSize: '14px' }}>so'm</span></h3>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>Sana</label>
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'white' }} />
              </div>
            </div>

            <div style={{ padding: '32px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
              <button onClick={closeModal} style={{ flex: 1, padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white', fontWeight: '700', cursor: 'pointer' }}>Bekor qilish</button>
              <button onClick={handleSave} style={{ flex: 2, padding: '16px', borderRadius: '16px', border: 'none', background: 'var(--accent-gold)', color: '#0f172a', fontWeight: '900', cursor: 'pointer' }}>Saqlash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowroomPurchases;
