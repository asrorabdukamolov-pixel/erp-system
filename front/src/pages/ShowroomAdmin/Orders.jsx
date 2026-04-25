import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, Check, X, Search, Phone, User, Clock, Package, MoreVertical, 
  Send, ArrowRight, Calendar, MapPin, ArrowLeft, Users, Briefcase, 
  FileText, Smartphone, Edit, FileUp, FileCheck, File as FileIcon, 
  Trash2, Trash, History, Activity, MessageSquare, CheckSquare, Building, Info, ShoppingBag, Eye, Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Proposals from './Proposals';

// --- Constants ---
const DEAL_STAGES = [
  { id: 'yangi', title: 'Yangi mijoz ✨', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  { id: 'uchrashuv', title: 'Uchrashuv 🤝', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  { id: 'kp_yuborildi', title: 'KP yuborildi 📩', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  { id: 'prezentatsiya', title: 'Prezentatsiya 📽️', color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
  { id: 'oylayabdi', title: 'O\'ylayabdi 🤔', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
  { id: 'shartnoma', title: 'Shartnoma ✍️', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
];

const ORDER_STAGES = [
  { id: 'tasdiqlandi', title: 'Tasdiqlandi ✅', color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
  { id: 'pm', title: 'PM ga o\'tkazildi ⚙️', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { id: 'kontrol_zamer', title: 'O\'lchov jarayonida 📏', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  { id: 'chizma_chizish', title: 'Chizma chizish ✏️', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  { id: 'chizma_tasdiqlash', title: 'Chizma tasdiqlash 📋', color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
  { id: 'ishlab_chiqarishda', title: 'Ishlab chiqarishda 🏗️', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  { id: 'ombor', title: 'Omborda 📦', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  { id: 'ornatish', title: 'O\'rnatishda 🚚', color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
  { id: 'tayyor', title: 'Mijozga topshirishga tayyor 🎁', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { id: 'bajarildi', title: 'Bajarildi 🎉', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
];

const STAGES = [...DEAL_STAGES, ...ORDER_STAGES];

const CHECKLIST_LABELS = {
  design3d: '3D Dizayn',
  construction: 'Konstruksiya',
  color: 'Rang',
  handle: 'Ruchka',
  materials: 'Materiallar'
};

const PROPERTY_TYPES = [
  { value: 'uchastka', label: 'Uchastka', icon: '🏡' },
  { value: 'kvartira', label: 'Kvartira', icon: '🏢' },
  { value: 'dacha', label: 'Dacha', icon: '🌳' },
];

const getDeliveryStatus = (deliveryDate) => {
  if (!deliveryDate) return { color: 'var(--text-secondary)', text: 'Belgilanmagan', bg: 'rgba(255,255,255,0.05)', label: 'Sana yo\'q' };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(deliveryDate);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { color: '#ef4444', text: deliveryDate, bg: 'rgba(239,68,68,0.1)', label: 'Muddati o\'tgan' };
  if (diffDays <= 3) return { color: '#f59e0b', text: deliveryDate, bg: 'rgba(245,158,11,0.1)', label: 'Yaqin qoldi' };
  return { color: '#10b981', text: deliveryDate, bg: 'rgba(16,185,129,0.1)', label: 'Vaqt bor' };
};

// --- AdminOrders Component ---
const AdminOrders = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedManager, setSelectedManager] = useState('all');
  const [currentView, setCurrentView] = useState('hub'); 
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'day', 'month', 'year'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (location.pathname.includes('archive')) {
      setCurrentView('archive');
    }
  }, [location.pathname]);

  // Modal states
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [fileManager, setFileManager] = useState({ isOpen: false, type: 'kp', files: [], orderId: null });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, orderId: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, orderId: null, reason: '' });
  const [contextMenu, setContextMenu] = useState({ isOpen: false, x: 0, y: 0, orderId: null });
  const [pmList, setPmList] = useState([]);
  const [commentText, setCommentText] = useState('');
  
  const timelineEndRef = useRef(null);

  const loadOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (e) {
      console.error("Order loading error:", e);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000); // 10s refresh
    return () => clearInterval(interval);
  }, []);

  // Load PM list from API
  useEffect(() => {
     const loadPMs = async () => {
        try {
          const res = await api.get('/users', { params: { role: 'proekt_manager' } });
          setPmList(res.data);
        } catch (e) {
          console.error("PM loading error:", e);
        }
     };
     loadPMs();
  }, []);

  const showroomOrders = orders.filter(o => 
    `${o.uniqueId || ''} ${o.selectedCustomer?.firstName || ''} ${o.selectedCustomer?.lastName || ''}`.toLowerCase().includes((searchTerm || '').toLowerCase())
  ).filter(o => {
    if (selectedManager === 'all') return true;
    return o.managerName === selectedManager;
  }).filter(o => {
    const isArchived = o.status === 'yopildi';
    if (currentView === 'archive') {
      if (!isArchived) return false;
      return true; // Simplified for now
    }
    return !isArchived && o.status !== 'trash';
  });

  const managersList = [...new Set(orders.map(o => o.managerName).filter(Boolean))];

  const handleAssignPM = async (pmId, pmName) => {
    try {
        await api.put(`/orders/${contextMenu.orderId}`, {
            status: 'pm',
            assignedPmId: pmId,
            assignedPmName: pmName,
            pmStatus: 'yangi_buyurtma',
            assignedAt: new Date().toISOString()
        });
        loadOrders();
        setContextMenu({ isOpen: false, x: 0, y: 0, orderId: null });
    } catch (err) {
        alert("Xatolik yuz berdi");
    }
  };

  const handleResetPM = async (orderId) => {
    try {
        await api.put(`/orders/${orderId}`, {
            status: 'tasdiqlandi',
            assignedPmId: null,
            assignedPmName: null,
            pmStatus: null,
            assignedAt: null
        });
        loadOrders();
        setContextMenu({ isOpen: false, x: 0, y: 0, orderId: null });
    } catch (err) {
        alert("Xatolik yuz berdi");
    }
  };

  const handleConfirmOrder = async () => {
    try {
        const orderId = confirmModal.orderId;
        // In backend, productionId and seq should be handled automatically
        // But for compatibility with existing UI expectation:
        await api.put(`/orders/${orderId}`, {
            status: 'tasdiqlandi',
            confirmedAt: new Date().toISOString()
        });
        loadOrders();
        setConfirmModal({ isOpen: false, orderId: null });
    } catch (err) {
        alert("Xatolik yuz berdi");
    }
  };

  const handleDeleteOrder = async () => {
    if (!deleteModal.reason.trim()) return alert("O'chirish sababini yozing!");
    try {
        await api.delete(`/orders/${deleteModal.orderId}`, { data: { reason: deleteModal.reason } });
        loadOrders();
        setDeleteModal({ isOpen: false, orderId: null, reason: '' });
        setContextMenu({ isOpen: false, x: 0, y: 0, orderId: null });
        setIsOrderModalOpen(false);
    } catch (err) {
        alert("Xatolik yuz berdi");
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedOrder) return;
    try {
        const res = await api.post(`/orders/${selectedOrder._id}/log`, { text: commentText, type: 'comment' });
        
        // Update local state
        const updatedOrders = orders.map(o => o._id === selectedOrder._id ? res.data : o);
        setOrders(updatedOrders);
        setSelectedOrder(res.data);
        setCommentText('');
    } catch (err) {
        alert("Izoh qo'shishda xatolik yuz berdi");
    }
  };

  const scrollToBottom = () => { timelineEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(() => { if (isOrderModalOpen) setTimeout(scrollToBottom, 100); }, [isOrderModalOpen, selectedOrder?.timeline]);

  if (currentView === 'hub') {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-1px', marginBottom: '8px' }}>Savdo <span style={{ color: 'var(--accent-gold)' }}>Bo'limi</span></h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>{user.showroom} filiali boshqaruv markazi.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          <div onClick={() => setCurrentView('deals')} className="premium-card clickable-card" style={{ padding: '40px 32px', cursor: 'pointer', textAlign: 'center', transition: '0.3s', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={40} /></div>
            <div><h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>Jarayondagi Kelishuvlar</h3><p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Menejerlar bo'yicha mijozlar varonkasi</p></div>
            <div style={{ marginTop: 'auto', color: 'var(--accent-gold)', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>Kirish <ArrowRight size={16} /></div>
          </div>
          <div onClick={() => setCurrentView('production')} className="premium-card clickable-card" style={{ padding: '40px 32px', cursor: 'pointer', textAlign: 'center', transition: '0.3s', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Briefcase size={40} /></div>
            <div><h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>Olingan Buyurtmalar</h3><p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Ishlab chiqarish va texnik jarayon</p></div>
            <div style={{ marginTop: 'auto', color: 'var(--accent-gold)', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>Kirish <ArrowRight size={16} /></div>
          </div>
          <div onClick={() => setCurrentView('proposals')} className="premium-card clickable-card" style={{ padding: '40px 32px', cursor: 'pointer', textAlign: 'center', transition: '0.3s', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(251,191,36,0.1)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={40} /></div>
            <div><h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>Tijorat Takliflari</h3><p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Barcha yaratilgan KPlar arxivi</p></div>
            <div style={{ marginTop: 'auto', color: 'var(--accent-gold)', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>Kirish <ArrowRight size={16} /></div>
          </div>
          <div onClick={() => setCurrentView('archive')} className="premium-card clickable-card" style={{ padding: '40px 32px', cursor: 'pointer', textAlign: 'center', transition: '0.3s', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(148,163,184,0.1)', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><History size={40} /></div>
            <div><h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>Buyurtmalar Arxivi</h3><p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Yopilgan buyurtmalar tarixi</p></div>
            <div style={{ marginTop: 'auto', color: 'var(--accent-gold)', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>Kirish <ArrowRight size={16} /></div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'proposals') return <Proposals onBack={() => setCurrentView('hub')} />;

  return (
    <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* List Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => setCurrentView('hub')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '10px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><ArrowLeft size={20} /></button>
          <div><h2 style={{ fontSize: '28px', fontWeight: '900' }}>{currentView === 'deals' ? 'Jarayondagi Kelishuvlar' : currentView === 'archive' ? 'Buyurtmalar Arxivi' : 'Olingan Buyurtmalar'}</h2><p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{user.showroom} filiali savdo oqimi.</p></div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {currentView === 'archive' && (
              <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                {['all', 'day', 'month', 'year'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setDateFilter(f)}
                    style={{ 
                      padding: '8px 16px', 
                      borderRadius: '10px', 
                      fontSize: '12px', 
                      fontWeight: '800',
                      background: dateFilter === f ? 'var(--accent-gold)' : 'transparent',
                      color: dateFilter === f ? 'black' : 'var(--text-secondary)',
                      border: 'none',
                      transition: '0.2s'
                    }}
                  >
                    {f === 'all' ? 'Barchasi' : f === 'day' ? 'Kunlik' : f === 'month' ? 'Oylik' : 'Yillik'}
                  </button>
                ))}
                {dateFilter !== 'all' && (
                  <input 
                    type={dateFilter === 'year' ? 'number' : dateFilter === 'month' ? 'month' : 'date'}
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0 12px', color: 'white', fontSize: '12px', outline: 'none' }}
                  />
                )}
              </div>
            )}
            <div style={{ position: 'relative' }}><Users size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} /><select value={selectedManager} onChange={e => setSelectedManager(e.target.value)} style={{ height: '44px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0 15px 0 44px', color: 'white', cursor: 'pointer', fontWeight: '700' }}><option value="all">Barcha Menejerlar</option>{managersList.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
            <div style={{ position: 'relative', width: '280px' }}><Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} /><input type="text" placeholder="Mijoz yoki ID qidirish..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%', paddingLeft: '44px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', height: '44px', fontSize: '14px' }} /></div>
        </div>
      </div>

      {/* Kanban Board */}
      {/* Kanban Board / Archive View */}
      <div className="no-scrollbar" style={{ flex: 1, overflowX: 'auto', paddingBottom: '30px' }}>
        {currentView === 'archive' ? (
          <div style={{ padding: '0 8px' }}>
            <div className="premium-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                    <th style={{ padding: '15px' }}>ID</th>
                    <th style={{ padding: '15px' }}>Mijoz</th>
                    <th style={{ padding: '15px' }}>Menejer</th>
                    <th style={{ padding: '15px' }}>Summa</th>
                    <th style={{ padding: '15px' }}>Yopilgan Sana</th>
                    <th style={{ padding: '15px' }}>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {showroomOrders.length === 0 ? (
                    <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Arxivda buyurtmalar yo'q.</td></tr>
                  ) : (
                    showroomOrders.map(o => (
                      <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '15px', color: 'var(--accent-gold)', fontWeight: '800' }}>{o.uniqueId}</td>
                        <td style={{ padding: '15px' }}>{o.selectedCustomer?.firstName} {o.selectedCustomer?.lastName}</td>
                        <td style={{ padding: '15px' }}>{o.managerName}</td>
                        <td style={{ padding: '15px', fontWeight: '800' }}>{Number(o.amount).toLocaleString()} UZS</td>
                        <td style={{ padding: '15px', color: 'var(--text-secondary)' }}>
                          {(() => {
                            const archLog = o.timeline?.find(l => l?.text?.includes("Arxivlandi"));
                            return archLog?.time ? archLog.time.split('T')[0] : '—';
                          })()}
                        </td>
                        <td style={{ padding: '15px' }}>
                          <button onClick={() => { setSelectedOrder(o); setIsOrderModalOpen(true); }} className="secondary-btn" style={{ padding: '6px 12px', fontSize: '12px' }}><Eye size={14} /> Ko'rish</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '24px', minWidth: 'fit-content' }}>
            {(currentView === 'deals' ? DEAL_STAGES : ORDER_STAGES).map(stage => {
              const stageOrders = showroomOrders.filter(o => {
                  let currentStatus = o.status;
                  if (o.status === 'pm' && o.pmStatus && o.pmStatus !== 'yangi_buyurtma') {
                      currentStatus = o.pmStatus;
                  } else if (o.status === 'ishlab_chiqarishda' && o.pmStatus === 'topshirildi') {
                      currentStatus = 'ishlab_chiqarishda';
                  } else if (o.status === 'ornatish' && o.pmStatus === 'ustanovka') {
                      currentStatus = 'ornatish';
                  } else if (o.status === 'pm' && o.pmStatus === 'tayyor') {
                      currentStatus = 'tayyor';
                  }
                  return currentStatus === stage.id;
              }); 
              const totalAmount = stageOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
              return (
                <div key={stage.id} style={{ minWidth: '320px', width: '320px' }}>
                  <div style={{ marginBottom: '20px', padding: '0 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: stage.color }} /><h3 style={{ fontSize: '15px', fontWeight: '800' }}>{stage.title}</h3><span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px' }}>{stageOrders.length}</span></div>
                    <div style={{ background: stage.bg, border: `1px solid ${stage.color}44`, borderRadius: '14px', padding: '12px 16px' }}><p style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Jami qiymat</p><p style={{ fontSize: '18px', fontWeight: '900', color: stage.color }}>{totalAmount.toLocaleString()} <span style={{ fontSize: '12px' }}>UZS</span></p></div>
                  </div>
                  <div className="no-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: 'calc(100vh - 350px)', overflowY: 'auto', paddingRight: '4px' }}>
                    {stageOrders.map(order => (
                      <div key={order.id} onClick={() => { setSelectedOrder(order); setIsOrderModalOpen(true); }} onContextMenu={(e) => { e.preventDefault(); setContextMenu({ isOpen: true, x: e.pageX, y: e.pageY, orderId: order.id, status: order.status }); }} style={{ background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '20px', position: 'relative', cursor: 'pointer', transition: '0.2s' }}>
                          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: stage.color, borderRadius: '4px 0 0 4px' }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                              <div><h4 style={{ fontSize: '16px', fontWeight: '900', letterSpacing: '-0.3px' }}>{order.selectedCustomer?.firstName} {order.selectedCustomer?.lastName}</h4><span style={{ fontSize: '10px', color: 'var(--accent-gold)', fontWeight: '900' }}>#{order.uniqueId}</span></div>
                          </div>

                          {stage.id === 'bajarildi' && !order.adminCompletionApproved && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const isFinal = order.smCompletionApproved;
                                const updated = orders.map(o => {
                                  if (o.id === order.id) {
                                    const log = { type: 'system', text: isFinal ? "Buyurtma Admin va SM tomonidan tasdiqlandi. Arxivlandi." : "Buyurtma Admin tomonidan tasdiqlandi (yakunlash)", time: new Date().toISOString(), user: user.name };
                                    return { 
                                      ...o, 
                                      adminCompletionApproved: true, 
                                      status: isFinal ? 'yopildi' : o.status,
                                      timeline: [...(o.timeline || []), log]
                                    };
                                  }
                                  return o;
                                });
                                setOrders(updated);
                                localStorage.setItem('erp_orders', JSON.stringify(updated));
                                alert(isFinal ? "Buyurtma to'liq yopildi va arxivga o'tkazildi!" : "Sizning tasdig'ingiz qabul qilindi. Sotuv menejeri tasdig'i kutilmoqda.");
                              }}
                              style={{ width: '100%', marginBottom: '12px', background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', color: '#10b981', padding: '10px', borderRadius: '12px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                              <CheckSquare size={14} /> Yakunlashni Tasdiqlash
                            </button>
                          )}

                          {stage.id === 'bajarildi' && order.adminCompletionApproved && !order.smCompletionApproved && (
                            <div style={{ marginBottom: '12px', background: 'rgba(16,185,129,0.05)', color: '#10b981', padding: '8px', borderRadius: '10px', fontSize: '11px', textAlign: 'center', border: '1px dashed #10b981' }}>
                              Siz tasdiqladingiz. Sotuv menejeri kutilmoqda...
                            </div>
                          )}

                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><Smartphone size={14} /> {order.selectedCustomer?.phone}</p>
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 15px', borderRadius: '14px', marginBottom: '15px', border: '1px solid rgba(255,255,255,0.03)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Summa</span><span style={{ fontSize: '16px', fontWeight: '900', color: 'var(--accent-gold)' }}>{Number(order.amount).toLocaleString()} UZS</span></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '8px' }}>
                                <div><p style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Olingan</p><p style={{ fontSize: '11px', fontWeight: '700' }}>{order.orderDate}</p></div>
                                <div style={{ textAlign: 'right' }}>
                                   {(() => {
                                     const status = getDeliveryStatus(order.deliveryDate);
                                     return (
                                       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                         <p style={{ fontSize: '9px', color: status.color, fontWeight: '900', textTransform: 'uppercase' }}>{status.label}</p>
                                         <p style={{ fontSize: '14px', fontWeight: '900', color: status.color }}>{status.text}</p>
                                       </div>
                                     );
                                   })()}
                                 </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent-gold)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '900' }}>{order.managerName?.charAt(0)}</div>
                                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>{order.managerName}</span>
                                </div>
                                {order.assignedPmName && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', padding: '3px 8px', borderRadius: '6px', width: 'fit-content' }}>
                                        <Briefcase size={10} />
                                        <span style={{ fontSize: '10px', fontWeight: '800' }}>PM: {order.assignedPmName}</span>
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                {order.status === 'shartnoma' && <button onClick={(e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, orderId: order.id }); }} style={{ padding: '6px 12px', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid #10b981', borderRadius: '8px', fontSize: '10px', fontWeight: '800' }}>Tasdiqlash</button>}
                            </div>
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Full-Screen Detail Modal (AmoCRM Style) */}
      {isOrderModalOpen && selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(20px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div className="premium-card" style={{ width: '96vw', height: '94vh', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '24px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--accent-gold)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingBag size={28} /></div>
                <div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><h3 style={{ fontSize: '24px', fontWeight: '900' }}>Buyurtma: {selectedOrder.uniqueId}</h3><span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>{STAGES.find(s => s.id === selectedOrder.status)?.title}</span></div>
                   <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                     Menejer: {selectedOrder.managerName} • Showroom: {selectedOrder.showroom}
                     {selectedOrder.assignedPmName && <span style={{ color: '#3b82f6' }}> • PM: {selectedOrder.assignedPmName}</span>}
                   </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                {selectedOrder.status === 'shartnoma' && <button onClick={() => setConfirmModal({ isOpen: true, orderId: selectedOrder.id })} className="gold-btn" style={{ height: '48px', padding: '0 32px' }}><Check size={20} /> Tasdiqlash</button>}
                {selectedOrder.status !== 'yopildi' ? (
                  <button onClick={() => setDeleteModal({ isOpen: true, orderId: selectedOrder.id, reason: '' })} style={{ height: '48px', padding: '0 24px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', fontWeight: '800' }}><Trash2 size={20} /> O'chirish</button>
                ) : (
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0 24px', borderRadius: '12px', color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}><Lock size={14} /> Arxivlangan</div>
                )}
                <button onClick={() => setIsOrderModalOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}><X size={24} /></button>
              </div>
            </div>

            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '550px 1fr', overflow: 'hidden' }}>
              <div style={{ borderRight: '1px solid rgba(255,255,255,0.05)', padding: '40px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  <div><div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}><User size={18} color="var(--accent-gold)" /><h4 style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase' }}>Mijoz Ma'lumotlari</h4></div><div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}><div><label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Ism</label><p style={{ fontWeight: '700' }}>{selectedOrder.selectedCustomer?.firstName} {selectedOrder.selectedCustomer?.lastName}</p></div><div><label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Telefon</label><p style={{ fontWeight: '700' }}>{selectedOrder.selectedCustomer?.phone}</p></div><div style={{ gridColumn: 'span 2' }}><label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Manzil</label><p style={{ fontWeight: '700' }}>{selectedOrder.selectedCustomer?.address}</p></div></div></div>
                  <div><div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}><Building size={18} color="var(--accent-gold)" /><h4 style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase' }}>Moliyaviy va Obyekt</h4></div><div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}><div><label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Summa</label><p style={{ fontSize: '18px', fontWeight: '900', color: 'var(--accent-gold)' }}>{Number(selectedOrder.amount).toLocaleString()} UZS</p></div><div><label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Obyekt Turi</label><p style={{ fontWeight: '700' }}>{selectedOrder.propertyType}</p></div><div><label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Olingan Sana</label><p style={{ fontWeight: '700' }}>{selectedOrder.orderDate}</p></div><div><label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Topshirish Sana</label><p style={{ fontWeight: '700', color: '#ef4444' }}>{selectedOrder.deliveryDate}</p></div></div></div>
                  <div><div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}><CheckSquare size={18} color="var(--accent-gold)" /><h4 style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase' }}>Texnik Tayyorgarlik</h4></div><div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>{Object.entries(selectedOrder.checklist || {}).map(([k,v]) => v && (<span key={k} style={{ padding: '10px 15px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', fontSize: '13px', fontWeight: '700' }}>{CHECKLIST_LABELS[k]}</span>))}</div></div>
                  <div><div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}><FileIcon size={18} color="var(--accent-gold)" /><h4 style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase' }}>Fayllar</h4></div><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}><button onClick={() => setFileManager({isOpen: true, type: 'kp', files: selectedOrder.kpFiles || [], orderId: selectedOrder.id})} style={{ padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px', color: 'white' }}><FileText size={18} /> KP Fayllar ({selectedOrder.kpFiles?.length || 0})</button><button onClick={() => setFileManager({isOpen: true, type: 'design', files: selectedOrder.designFiles || [], orderId: selectedOrder.id})} style={{ padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px', color: 'white' }}><FileIcon size={18} /> Dizayn ({selectedOrder.designFiles?.length || 0})</button></div></div>
                </div>
              </div>
              <div style={{ background: '#0f0f1b', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '24px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}><History size={20} color="var(--accent-gold)" /><h4 style={{ fontSize: '15px', fontWeight: '900' }}>XARAKATLAR TARIXI</h4></div>
                <div style={{ flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {(selectedOrder.timeline || []).map((item, idx) => (
                    <div key={idx} style={{ position: 'relative', paddingLeft: '40px' }}>
                       {idx !== selectedOrder.timeline.length - 1 && <div style={{ position: 'absolute', left: '10px', top: '24px', bottom: '-24px', width: '1px', background: 'rgba(255,255,255,0.05)' }} />}
                       <div style={{ position: 'absolute', left: '0', top: '4px', width: '21px', height: '21px', borderRadius: '50%', background: item.type === 'comment' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.type === 'comment' ? 'black' : 'var(--text-secondary)' }}>{item.type === 'comment' ? <MessageSquare size={10} /> : <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'currentColor' }} />}</div>
                       {item.type === 'comment' ? (
                          <div style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.1)', borderRadius: '16px', padding: '16px 20px' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ fontSize: '13px', fontWeight: '900', color: 'var(--accent-gold)' }}>{item.user}</span><span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{new Date(item.time).toLocaleTimeString()}</span></div><p style={{ fontSize: '15px', color: '#fff', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{item.text}</p></div>
                       ) : (
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'baseline' }}><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(item.time).toLocaleTimeString()}</span><p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}><span style={{ fontWeight: '700' }}>{item.user}</span>: {item.text}</p></div>
                       )}
                    </div>
                  ))}
                  <div ref={timelineEndRef} />
                </div>
                <div style={{ padding: '32px 40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ position: 'relative' }}>
                    <textarea 
                      value={commentText} 
                      onChange={e => selectedOrder.status !== 'yopildi' && setCommentText(e.target.value)} 
                      onKeyDown={e => selectedOrder.status !== 'yopildi' && e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddComment())} 
                      placeholder={selectedOrder.status === 'yopildi' ? "Arxivlangan buyurtmaga izoh yozib bo'lmaydi" : "Izoh qoldiring..."} 
                      style={{ width: '100%', height: '80px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '15px', color: 'white', resize: 'none', opacity: selectedOrder.status === 'yopildi' ? 0.5 : 1 }} 
                      readOnly={selectedOrder.status === 'yopildi'}
                    />
                    {selectedOrder.status !== 'yopildi' && (
                      <button onClick={handleAddComment} style={{ position: 'absolute', right: '10px', bottom: '10px', padding: '8px 20px', borderRadius: '8px', background: 'var(--accent-gold)', color: 'black', fontWeight: '900', border: 'none' }}>Yuborish</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal with Reason */}
      {deleteModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(15px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 4000 }}>
           <div className="premium-card" style={{ width: '450px', padding: '40px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}><Trash2 size={32} /></div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', textAlign: 'center', marginBottom: '12px' }}>Buyurtmani o'chirish</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center', marginBottom: '24px' }}>O'chirish sababini ko'rsating. Ushbu ma'lumot arxivga saqlanadi.</p>
              <textarea value={deleteModal.reason} onChange={e => setDeleteModal({...deleteModal, reason: e.target.value})} placeholder="Sababini yozing..." style={{ width: '100%', height: '100px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '15px', color: 'white', marginBottom: '24px', resize: 'none' }} />
              <div style={{ display: 'flex', gap: '12px' }}>
                 <button onClick={() => setDeleteModal({ isOpen: false, orderId: null, reason: '' })} style={{ flex: 1, height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border-color)', fontWeight: '700' }}>Bekor qilish</button>
                 <button onClick={handleDeleteOrder} style={{ flex: 1, height: '48px', borderRadius: '12px', background: '#ef4444', color: 'white', border: 'none', fontWeight: '700' }}>O'chirish</button>
              </div>
           </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu.isOpen && (
        <div style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, background: '#1a1a2e', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 5000, minWidth: '220px', overflow: 'hidden' }} onMouseLeave={() => setContextMenu({ isOpen: false, x: 0, y: 0, orderId: null })}>
          {(contextMenu.status === 'tasdiqlandi' || contextMenu.status === 'pm') && (
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>
                 {contextMenu.status === 'pm' ? "PM ni o'zgartirish" : "PM ga biriktirish"}
               </div>
               {pmList.map(pm => (<button key={pm.id} onClick={() => handleAssignPM(pm.id, `${pm.firstName} ${pm.lastName}`)} style={{ width: '100%', padding: '12px 16px', textAlign: 'left', background: 'transparent', border: 'none', color: 'white', fontSize: '13px', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '10px' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(251,191,36,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><Briefcase size={14} color="var(--accent-gold)" />{pm.firstName} {pm.lastName}</button>))}
            </div>
          )}
          {contextMenu.status === 'pm' && (
            <button onClick={() => handleResetPM(contextMenu.orderId)} style={{ width: '100%', padding: '12px 16px', textAlign: 'left', background: 'transparent', border: 'none', color: '#f59e0b', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><ArrowLeft size={14} /> PM dan qaytarish</button>
          )}
          <button onClick={() => setDeleteModal({ isOpen: true, orderId: contextMenu.orderId, reason: '' })} style={{ width: '100%', padding: '12px 16px', textAlign: 'left', background: 'transparent', border: 'none', color: '#ef4444', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><Trash2 size={14} /> O'chirish</button>
        </div>
      )}

      {/* Confirmation Modals */}
      {confirmModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 4000 }}>
           <div className="premium-card" style={{ width: '400px', padding: '40px', textAlign: 'center' }}><div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}><Check size={32} /></div><h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>Tasdiqlaysizmi?</h3><p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>Ishlab chiqarishga yuboriladi.</p><div style={{ display: 'flex', gap: '12px' }}><button onClick={() => setConfirmModal({ isOpen: false, orderId: null })} style={{ flex: 1, height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border-color)', fontWeight: '700' }}>Yo'q</button><button onClick={handleConfirmOrder} style={{ flex: 1, height: '48px', borderRadius: '12px', background: '#10b981', color: 'white', border: 'none', fontWeight: '700' }}>Tasdiqlayman</button></div></div>
        </div>
      )}

      {/* Basic File Manager (Simplified for Admin view) */}
      {fileManager.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(15px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 4500 }}>
           <div className="premium-card" style={{ width: '500px', padding: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}><h3>Fayllar</h3><button onClick={() => setFileManager({isOpen:false, files:[], orderId:null})} style={{ background:'transparent', border:'none', color:'white' }}><X /></button></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                 {fileManager.files.map((f, i) => (<div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}><FileIcon size={24} color="var(--accent-gold)" style={{ marginBottom: '8px' }} /><p style={{ fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</p><button onClick={() => window.open(f.url, '_blank')} style={{ marginTop: '8px', fontSize: '10px', color: 'var(--accent-gold)', background: 'transparent', border: 'none', cursor: 'pointer' }}>Ko'rish</button></div>))}
              </div>
              <button onClick={() => setFileManager({isOpen:false, files:[], orderId:null})} className="secondary-btn" style={{ width: '100%', marginTop: '32px', justifyContent: 'center' }}>Yopish</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
