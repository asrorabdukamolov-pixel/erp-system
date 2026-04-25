import React, { useState, useEffect } from 'react';
import { ClipboardList, Search, Store, LayoutGrid, CheckCircle, Clock } from 'lucide-react';
import api from '../../utils/api';

const SuperOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data);
      } catch (err) {
        console.error("Orders fetch error", err);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const getDeliveryStatus = (deliveryDate) => {
    if (!deliveryDate) return { color: 'var(--text-secondary)', text: 'Belgilanmagan', label: '—' };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(deliveryDate);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { color: '#ef4444', text: deliveryDate, label: 'Muddati o\'tgan' };
    if (diffDays <= 3) return { color: '#f59e0b', text: deliveryDate, label: 'Yaqin qoldi' };
    return { color: '#10b981', text: deliveryDate, label: 'Vaqt bor' };
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Barcha Buyurtmalar (Global)</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Barcha filiallarning umumiy buyurtmalar ro'yxati.</p>
      </div>

      <div className="premium-card">
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input type="text" placeholder="Buyurtma ID yoki mijoz bo'yicha qidirish..." style={{ width: '100%', paddingLeft: '44px' }} />
          </div>
          <select style={{ width: '200px' }}>
            <option value="all">Barcha holatlar</option>
            <option value="yangi">Yangi</option>
            <option value="qabul-qilingan">Qabul qilingan</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '14px' }}>
                <th style={{ padding: '16px 8px' }}>Global ID</th>
                <th style={{ padding: '16px 8px' }}>Mijoz</th>
                <th style={{ padding: '16px 8px' }}>Filial</th>
                <th style={{ padding: '16px 8px' }}>Menejer</th>
                <th style={{ padding: '16px 8px' }}>Summa</th>
                <th style={{ padding: '16px 8px' }}>Topshirish</th>
                <th style={{ padding: '16px 8px' }}>Holat</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '20px 8px' }}>
                    <p style={{ fontWeight: '700', color: 'var(--accent-gold)' }}>{o.uniqueId}</p>
                  </td>
                  <td style={{ padding: '20px 8px' }}>
                    <p style={{ fontWeight: '600' }}>{o.selectedCustomer?.firstName} {o.selectedCustomer?.lastName}</p>
                  </td>
                  <td style={{ padding: '20px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      <Store size={14} color="var(--text-secondary)" />
                      {o.selectedCustomer?.showroom || o.showroom || 'Toshkent Central'}
                    </div>
                  </td>
                  <td style={{ padding: '20px 8px' }}>
                    <p style={{ fontSize: '13px' }}>{o.managerName}</p>
                  </td>
                  <td style={{ padding: '20px 8px' }}>
                    <p style={{ fontWeight: '600' }}>{Number(o.amount).toLocaleString()} {o.currency}</p>
                  </td>
                  <td style={{ padding: '20px 8px' }}>
                     {(() => {
                       const status = getDeliveryStatus(o.deliveryDate);
                       return (
                         <div>
                           <p style={{ fontSize: '14px', fontWeight: '900', color: status.color }}>{status.text}</p>
                           <p style={{ fontSize: '10px', color: status.color, opacity: 0.8 }}>{status.label}</p>
                         </div>
                       );
                     })()}
                   </td>
                  <td style={{ padding: '20px 8px' }}>
                    <span style={{ 
                      fontSize: '11px', fontWeight: '800', padding: '6px 12px', borderRadius: '10px',
                      textTransform: 'uppercase',
                      background: 'rgba(251, 191, 36, 0.05)',
                      color: 'var(--accent-gold)',
                      border: '1px solid rgba(251, 191, 36, 0.15)',
                      whiteSpace: 'nowrap'
                    }}>{o.status.replace(/_/g, ' ')}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperOrders;
