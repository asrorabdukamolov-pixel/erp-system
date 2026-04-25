import React, { useState, useEffect } from 'react';
import { 
  Trash2, Search, RotateCcw, Calendar, User, 
  MessageSquare, ShoppingCart, FileText, Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const Trash = () => {
  const { user } = useAuth();
  const [trashItems, setTrashItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('order'); // 'order' or 'proposal'
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, item: null });
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    loadTrash();
  }, [activeTab]);

  const loadTrash = async () => {
    try {
      const endpoint = activeTab === 'order' ? '/orders/trash/all' : '/proposals/trash';
      const res = await api.get(endpoint);
      const items = res.data.map(item => ({
        ...item,
        type: activeTab
      }));
      setTrashItems(items);
    } catch (err) {
      console.error("Trash load error", err);
      setTrashItems([]);
    }
  };

  const handleRestoreClick = (item) => {
    setConfirmModal({ isOpen: true, item });
  };

  const executeRestore = async () => {
    const item = confirmModal.item;
    if (!item) return;

    try {
      const endpoint = item.type === 'order' ? `/orders/${item._id}/restore` : `/proposals/${item._id}/restore`;
      await api.post(endpoint);
      showToast(item.type === 'order' ? "Buyurtma qayta tiklandi!" : "Taklif qayta tiklandi!");
      loadTrash();
    } catch (err) {
      console.error("Restore error:", err);
      showToast("Xatolik yuz berdi!", true);
    } finally {
      setConfirmModal({ isOpen: false, item: null });
    }
  };

  const showToast = (message, isError = false) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const filtered = trashItems.filter(item => {
    const matchesSearch = (
      (item.kpNumber || item.uniqueId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.selectedCustomer?.firstName || item.customer?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.selectedCustomer?.lastName || item.customer?.lastName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchesSearch;
  });

  const getCustomerName = (item) => {
    const c = item.selectedCustomer || item.customer;
    return c ? `${c.firstName} ${c.lastName}` : '—';
  };

  return (
    <div style={{ padding: '40px', flex: 1, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Trash2 size={32} color="#ef4444" /> Karzina
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>O'chirilgan buyurtmalar va takliflarni boshqarish.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}/>
            <input 
              type="text" 
              placeholder="Qidirish..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '44px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', height: '48px', color: 'white' }} 
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <button 
          onClick={() => setActiveTab('order')}
          style={{ 
            height: '46px', padding: '0 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: '0.2s',
            background: activeTab === 'order' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.03)',
            color: activeTab === 'order' ? 'black' : 'var(--text-secondary)',
            border: activeTab === 'order' ? 'none' : '1px solid var(--border-color)'
          }}
        >
          <ShoppingCart size={18} /> Buyurtmalar
        </button>
        <button 
          onClick={() => setActiveTab('proposal')}
          style={{ 
            height: '46px', padding: '0 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: '0.2s',
            background: activeTab === 'proposal' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.03)',
            color: activeTab === 'proposal' ? 'black' : 'var(--text-secondary)',
            border: activeTab === 'proposal' ? 'none' : '1px solid var(--border-color)'
          }}
        >
          <FileText size={18} /> Tijorat Takliflari
        </button>
      </div>

      <div className="premium-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '20px 24px', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>O'chirilgan Vaqt</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>ID / Raqam</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Mijoz</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>O'chirish Sababi</th>
              <th style={{ padding: '20px 24px', textAlign: 'right', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '80px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <Trash2 size={40} style={{ opacity: 0.2, marginBottom: '16px' }} />
                  <p>Karzinada ma'mulot topilmadi.</p>
                </td>
              </tr>
            ) : (
              filtered.map(item => (
                <tr key={item._id} style={{ borderBottom: '1px solid var(--border-color)', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                      <Calendar size={14} color="var(--text-secondary)" />
                      {new Date(item.deletedAt).toLocaleString()}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '900', color: 'var(--accent-gold)' }}>{item.kpNumber || item.uniqueId}</span>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800' }}>
                        {getCustomerName(item).charAt(0)}
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: '700' }}>{getCustomerName(item)}</span>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(239, 68, 68, 0.05)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '13px' }}>
                      <MessageSquare size={14} />
                      {item.deleteReason}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleRestoreClick(item)}
                      style={{ 
                        height: '40px', padding: '0 18px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '13px', transition: '0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
                    >
                      <RotateCcw size={16} /> Qayta tiklash
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Confirm Modal */}
      {confirmModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
          <div style={{ background: '#1a1a2e', border: '1px solid var(--accent-gold)', borderRadius: '24px', padding: '32px', width: '400px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#10b981' }}>
              <RotateCcw size={32} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>Qayta tiklash</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
              Ushbu {confirmModal.item?.type === 'order' ? 'buyurtmani' : 'taklifni'} haqiqatdan ham Karzinadan qaytarmoqchimisiz?
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setConfirmModal({ isOpen: false, item: null })}
                style={{ flex: 1, padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}
              >
                Yo'q
              </button>
              <button 
                onClick={executeRestore}
                className="gold-btn"
                style={{ flex: 1, height: '48px', justifyContent: 'center', fontWeight: '800' }}
              >
                Ha, Qaytarish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div style={{ position: 'fixed', bottom: '40px', right: '40px', background: '#10b981', color: 'black', padding: '16px 32px', borderRadius: '12px', fontWeight: '800', zIndex: 10000, boxShadow: '0 10px 30px rgba(0,0,0,0.3)', animation: 'slideIn 0.3s ease-out' }}>
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Trash;
