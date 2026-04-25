import React, { useState, useEffect } from 'react';
import { 
  Trash2, Search, Info, User, Calendar, MessageSquare, 
  MapPin, Phone, RotateCcw, CreditCard, Banknote, Landmark, FileText, X
} from 'lucide-react';
import api from '../../utils/api';

const Trash = () => {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'transactions'
  const [deletedOrders, setDeletedOrders] = useState([]);
  const [deletedTransactions, setDeletedTransactions] = useState([]);
  const [search, setSearch] = useState('');

  const loadTrash = async () => {
    try {
      const [ordersRes, txsRes] = await Promise.all([
        api.get('/orders/trash/all'),
        api.get('/transactions/trash/all')
      ]);
      setDeletedOrders(ordersRes.data);
      setDeletedTransactions(txsRes.data);
    } catch (err) {
      console.error("Trash loading error", err);
    }
  };

  useEffect(() => {
    loadTrash();
  }, []);

  const handleRestoreOrder = async (orderId) => {
    if (!window.confirm("Ushbu buyurtmani tiklashni xohlaysizmi?")) return;
    
    try {
      await api.post(`/orders/${orderId}/restore`);
      loadTrash();
    } catch (err) {
      console.error("Restore order error", err);
      alert("Xatolik yuz berdi");
    }
  };

  const handleRestoreTransaction = async (txId) => {
    if (!window.confirm("Ushbu tranzaksiyani tiklashni xohlaysizmi?")) return;

    try {
      await api.post(`/transactions/${txId}/restore`);
      loadTrash();
    } catch (err) {
      console.error("Restore tx error", err);
      alert("Xatolik yuz berdi");
    }
  };

  const filteredOrders = deletedOrders.filter(o => 
    `${o.uniqueId} ${o.selectedCustomer?.firstName} ${o.selectedCustomer?.lastName} ${o.managerName}`.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTxs = deletedTransactions.filter(t => 
    `${t.category} ${t.personName} ${t.deleteReason}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '0 10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Trash2 size={32} /> Karzina
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>O'chirilgan ma'lumotlarni nazorat qilish va tiklash bo'limi.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button 
          onClick={() => {setActiveTab('orders'); setSearch('');}}
          style={{ 
            padding: '12px 24px', 
            borderRadius: '12px', 
            border: 'none', 
            cursor: 'pointer', 
            fontWeight: '800',
            fontSize: '14px',
            background: activeTab === 'orders' ? '#ef4444' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: '0.3s'
          }}
        >
          <FileText size={18} /> Buyurtmalar ({deletedOrders.length})
        </button>
        <button 
          onClick={() => {setActiveTab('transactions'); setSearch('');}}
          style={{ 
            padding: '12px 24px', 
            borderRadius: '12px', 
            border: 'none', 
            cursor: 'pointer', 
            fontWeight: '800',
            fontSize: '14px',
            background: activeTab === 'transactions' ? '#ef4444' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: '0.3s'
          }}
        >
          <CreditCard size={18} /> Tranzaksiyalar ({deletedTransactions.length})
        </button>
      </div>

      <div className="premium-card">
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder={activeTab === 'orders' ? "ID yoki mijoz ismi..." : "Kategoriya yoki sabab..."} 
            style={{ width: '100%', paddingLeft: '50px', height: '48px', fontSize: '15px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          {activeTab === 'orders' ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'left' }}>
                  <th style={{ padding: '16px' }}>O'chirilgan sana</th>
                  <th style={{ padding: '16px' }}>ID / Mijoz</th>
                  <th style={{ padding: '16px' }}>O'chirish sababi</th>
                  <th style={{ padding: '16px', textAlign: 'right' }}>Amal</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr><td colSpan="4" style={{ padding: '80px', textAlign: 'center', color: 'var(--text-secondary)' }}>Karzina bo'sh.</td></tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '16px', fontSize: '13px' }}>
                        <div style={{ color: '#fff', fontWeight: '600' }}>{new Date(o.deletedAt).toLocaleDateString()}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{new Date(o.deletedAt).toLocaleTimeString()}</div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ color: 'var(--accent-gold)', fontWeight: '800', mb: '4px' }}>{o.uniqueId}</div>
                        <div style={{ fontWeight: '600', fontSize: '13px' }}>{o.selectedCustomer?.firstName} {o.selectedCustomer?.lastName}</div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.1)', fontSize: '13px', color: '#ef4444', display: 'flex', gap: '10px' }}>
                          <MessageSquare size={16} /> {o.deleteReason}
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <button onClick={() => handleRestoreOrder(o._id)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.1)', color: '#22c55e', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', float: 'right' }}>
                          <RotateCcw size={14} /> Tiklash
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'left' }}>
                  <th style={{ padding: '16px' }}>O'chirilgan sana</th>
                  <th style={{ padding: '16px' }}>Tranzaksiya / Mijoz</th>
                  <th style={{ padding: '16px', textAlign: 'right' }}>Summa (UZS)</th>
                  <th style={{ padding: '16px' }}>O'chirish sababi</th>
                  <th style={{ padding: '16px', textAlign: 'right' }}>Amal</th>
                </tr>
              </thead>
              <tbody>
                {filteredTxs.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '80px', textAlign: 'center', color: 'var(--text-secondary)' }}>O'chirilgan tranzaksiyalar yo'q.</td></tr>
                ) : (
                  filteredTxs.map((t) => (
                    <tr key={t._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '16px', fontSize: '13px' }}>
                         <div style={{ color: '#fff', fontWeight: '600' }}>{new Date(t.deletedAt).toLocaleDateString()}</div>
                         <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{new Date(t.deletedAt).toLocaleTimeString()}</div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: '800' }}>{t.category}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t.personName} • {new Date(t.date).toLocaleDateString()}</div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ fontWeight: '900', color: t.type === 'income' ? '#10b981' : '#ef4444' }}>{t.amountUzs?.toLocaleString()}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{t.type?.toUpperCase()}</div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.1)', fontSize: '13px', color: '#ef4444', display: 'flex', gap: '10px' }}>
                          <MessageSquare size={16} /> {t.deleteReason}
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <button onClick={() => handleRestoreTransaction(t._id)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.1)', color: '#22c55e', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', float: 'right' }}>
                          <RotateCcw size={14} /> Tiklash
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Trash;
