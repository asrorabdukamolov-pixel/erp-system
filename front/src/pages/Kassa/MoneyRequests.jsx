import React, { useState, useEffect } from 'react';
import { Clock, Check, X, Search, Filter, AlertCircle, Package, Calendar } from 'lucide-react';

const MoneyRequests = () => {
  const [moneyRequests, setMoneyRequests] = useState(() => JSON.parse(localStorage.getItem('erp_money_requests') || '[]'));
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [requestToReject, setRequestToReject] = useState(null);
  const [requestToApprove, setRequestToApprove] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Naqd');

  const paymentMethods = [
    { id: 'Naqd', label: 'Naqd' },
    { id: 'Karta', label: 'Karta' },
    { id: 'Visa', label: 'Visa' },
    { id: 'Shartnoma', label: 'Shartnoma' }
  ];

  useEffect(() => {
    localStorage.setItem('erp_money_requests', JSON.stringify(moneyRequests));
  }, [moneyRequests]);

  const [payingAmount, setPayingAmount] = useState('');

  const openApproveModal = (req) => {
    setRequestToApprove(req);
    setPayingAmount(req.amount.toString());
    setApproveModalOpen(true);
  };

  const handleApproveRequest = (req) => {
    const payAmt = Number(payingAmount);
    if (!payAmt || payAmt <= 0) return alert('To\'g\'ri summani kiriting!');
    if (payAmt > req.amount) return alert('Berilayotgan summa so\'rov summasidan ko\'p bo\'lishi mumkin emas!');

    // 1. Create a transaction
    const transactions = JSON.parse(localStorage.getItem('erp_transactions') || '[]');
    const newTx = {
      id: Date.now().toString(),
      type: 'expense',
      orderId: req.orderId || '',
      amountUzs: payAmt,
      originalAmount: payAmt,
      currency: 'UZS',
      usdRate: null,
      personName: req.managerName,
      paymentMethod: selectedPaymentMethod,
      category: req.category,
      comment: `[BERILDI] ${req.comment || ''}`,
      date: new Date().toISOString()
    };

    const updatedTxs = [newTx, ...transactions];
    localStorage.setItem('erp_transactions', JSON.stringify(updatedTxs));

    // 2. Update request status or amount
    const isFullPayment = payAmt >= req.amount;
    const updatedReqs = moneyRequests.map(r => {
      if (r.id === req.id) {
        if (isFullPayment) {
          return { 
            ...r, 
            status: 'approved', 
            paidTotal: (Number(r.paidTotal) || 0) + payAmt,
            approvedAt: new Date().toISOString(), 
            paymentMethod: selectedPaymentMethod 
          };
        } else {
          return { 
            ...r, 
            amount: r.amount - payAmt, 
            paidTotal: (Number(r.paidTotal) || 0) + payAmt 
          };
        }
      }
      return r;
    });

    setMoneyRequests(updatedReqs);
    setApproveModalOpen(false);
    setRequestToApprove(null);
  };

  const handleRejectRequest = () => {
    if (!rejectionReason.trim()) return alert('Rad etish sababini yozing!');
    
    const updatedReqs = moneyRequests.map(r => 
      r.id === requestToReject.id ? { ...r, status: 'rejected', rejectReason: rejectionReason } : r
    );
    setMoneyRequests(updatedReqs);
    setRejectModalOpen(false);
    setRequestToReject(null);
    setRejectionReason('');
  };

  const [selectedManager, setSelectedManager] = useState(null);

  const pendingRequests = moneyRequests.filter(r => r.status === 'pending');

  // Grouping by Manager
  const groupedManagers = pendingRequests.reduce((acc, req) => {
    if (!acc[req.managerName]) {
      acc[req.managerName] = { name: req.managerName, total: 0, count: 0 };
    }
    acc[req.managerName].total += (Number(req.amount) || 0);
    acc[req.managerName].count += 1;
    return acc;
  }, {});

  const managersList = Object.values(groupedManagers);
  const managerRequests = selectedManager ? pendingRequests.filter(r => r.managerName === selectedManager) : [];

  return (
    <div style={{ padding: '20px', color: '#fff' }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '8px' }}>Pul uchun so'rovlar</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Managerlar tomonidan yuborilgan yangi pul buyurtmalari.</p>
        </div>
        {selectedManager && (
          <button 
            onClick={() => setSelectedManager(null)} 
            className="secondary-btn" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px' }}
          >
            <X size={18} /> Orqaga qaytish
          </button>
        )}
      </div>

      {pendingRequests.length === 0 ? (
        <div className="premium-card" style={{ padding: '100px', textAlign: 'center', border: '1px dashed var(--border-color)' }}>
          <div style={{ display: 'inline-flex', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'var(--text-secondary)' }}>
            <Check size={40} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Yangi so'rovlar mavjud emas</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Barcha so'rovlar ko'rib chiqilgan.</p>
        </div>
      ) : !selectedManager ? (
        /* Summary Table (Employees) */
        <div className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--accent-gold)' }}>Xodimlar bo'yicha so'rovlar</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                <th style={{ padding: '20px' }}>XODIM ISMI</th>
                <th style={{ padding: '20px' }}>SO'ROVLAR SONI</th>
                <th style={{ padding: '20px' }}>UMUMIY SUMMA</th>
                <th style={{ padding: '20px', textAlign: 'right' }}>AMALLAR</th>
              </tr>
            </thead>
            <tbody>
              {managersList.map(m => (
                <tr key={m.name} onClick={() => setSelectedManager(m.name)} style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: '0.2s' }} className="hover-row">
                  <td style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(251,191,36,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', fontWeight: '900' }}>{m.name.charAt(0)}</div>
                      <span style={{ fontSize: '15px', fontWeight: '700' }}>{m.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <span style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>{m.count} ta so'rov</span>
                  </td>
                  <td style={{ padding: '20px', fontSize: '18px', fontWeight: '900', color: 'var(--accent-gold)' }}>
                    {m.total.toLocaleString()} <span style={{ fontSize: '12px' }}>UZS</span>
                  </td>
                  <td style={{ padding: '20px', textAlign: 'right' }}>
                    <button className="gold-btn" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '12px' }}>Ko'rish</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <style>{`
            .hover-row:hover { background: rgba(255,255,255,0.03); }
          `}</style>
        </div>
      ) : (
        /* Detailed Table (Manager's Requests) */
        <div className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', background: 'rgba(251,191,36,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800' }}>{selectedManager} <span style={{ color: 'var(--text-secondary)', fontWeight: '400' }}>so'rovlari</span></h3>
            <span style={{ fontSize: '14px', fontWeight: '900', color: 'var(--accent-gold)' }}>Jami: {groupedManagers[selectedManager]?.total.toLocaleString()} UZS</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                <th style={{ padding: '20px' }}>ID & KATEGORIYA</th>
                <th style={{ padding: '20px' }}>BUYURTMA / XARID</th>
                <th style={{ padding: '20px' }}>SUMMA</th>
                <th style={{ padding: '20px' }}>SANA</th>
                <th style={{ padding: '20px' }}>IZOH</th>
                <th style={{ padding: '20px', textAlign: 'right' }}>AMALLAR</th>
              </tr>
            </thead>
            <tbody>
              {managerRequests.map(req => {
                const isProduct = req.category === 'Maxsulot uchun' || req.purchaseId;
                const needsAdminApproval = isProduct && !req.adminApproved;
                
                return (
                  <tr key={req.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '20px' }}>
                      <p style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: '800', marginBottom: '4px' }}>{req.id}</p>
                      <p style={{ fontSize: '14px', fontWeight: '700' }}>{req.category}</p>
                    </td>
                    <td style={{ padding: '20px' }}>
                      {req.orderId && <div style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px', marginBottom: '4px', display: 'inline-block' }}>📦 {req.orderId}</div>}
                      {req.purchaseId && <div style={{ fontSize: '11px', background: 'rgba(251,191,36,0.1)', color: 'var(--accent-gold)', padding: '4px 10px', borderRadius: '6px', display: 'inline-block' }}>🛒 {req.purchaseId}</div>}
                      {needsAdminApproval ? (
                        <div style={{ display: 'block', marginTop: '6px', fontSize: '10px', color: '#ef4444', fontWeight: '800' }}>
                          ⚠️ ADMIN TASDIG'I KUTILMOQDA
                        </div>
                      ) : isProduct ? (
                        <div style={{ display: 'block', marginTop: '6px', fontSize: '10px', color: '#10b981', fontWeight: '800' }}>
                          ✅ ADMIN TASDIQLADI
                        </div>
                      ) : null}
                    </td>
                    <td style={{ padding: '20px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                        So'ralgan: {((Number(req.amount) || 0) + (Number(req.paidTotal) || 0)).toLocaleString()}
                      </div>
                      <div style={{ fontWeight: '900', fontSize: '16px', color: 'var(--accent-gold)', marginBottom: '4px' }}>
                        Qoldi: {req.amount?.toLocaleString()} <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>UZS</span>
                      </div>
                      {req.paidTotal > 0 && (
                        <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '700' }}>
                          Berildi: {req.paidTotal.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '20px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={14} color="var(--text-secondary)" /> {req.neededDate}
                      </div>
                    </td>
                    <td style={{ padding: '20px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '200px' }}>{req.comment || '—'}</div>
                    </td>
                    <td style={{ padding: '20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button onClick={() => { setRequestToReject(req); setRejectModalOpen(true); }} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '8px', padding: '10px 16px', color: '#ef4444', fontWeight: '700', cursor: 'pointer' }}>Rad etish</button>
                        <button 
                          disabled={needsAdminApproval}
                          onClick={() => openApproveModal(req)} 
                          style={{ 
                            background: needsAdminApproval ? 'rgba(255,255,255,0.05)' : 'var(--accent-gold)', 
                            border: 'none', 
                            borderRadius: '8px', 
                            padding: '10px 16px', 
                            color: needsAdminApproval ? 'rgba(255,255,255,0.2)' : '#000', 
                            fontWeight: '800', 
                            cursor: needsAdminApproval ? 'not-allowed' : 'pointer',
                            opacity: needsAdminApproval ? 0.5 : 1
                          }}
                        >
                          Berildi
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── APPROVE MODAL ─── */}
      {approveModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9000 }}>
          <div className="premium-card" style={{ width: '450px', padding: '40px', border: '1px solid var(--accent-gold)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(251,191,36,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', marginBottom: '24px' }}>
              <Check size={32} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '12px' }}>To'lovni tasdiqlash</h2>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>Berilayotgan Summa (UZS)</label>
              <input 
                type="number" 
                value={payingAmount}
                onChange={e => setPayingAmount(e.target.value)}
                style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', fontSize: '18px', fontWeight: '800' }}
              />
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>Maksimal: {requestToApprove?.amount?.toLocaleString()} UZS</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '40px' }}>
              {paymentMethods.map(m => (
                <button 
                  key={m.id}
                  onClick={() => setSelectedPaymentMethod(m.id)}
                  style={{ 
                    padding: '16px', 
                    borderRadius: '12px', 
                    border: `1px solid ${selectedPaymentMethod === m.id ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)'}`,
                    background: selectedPaymentMethod === m.id ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.02)',
                    color: selectedPaymentMethod === m.id ? 'var(--accent-gold)' : '#fff',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: '0.2s'
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button onClick={() => setApproveModalOpen(false)} style={{ flex: 1, height: '52px', borderRadius: '12px', background: 'transparent', border: '1px solid var(--border-color)', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>Bekor qilish</button>
              <button onClick={() => handleApproveRequest(requestToApprove)} style={{ flex: 1, height: '52px', borderRadius: '12px', background: 'var(--accent-gold)', color: '#000', border: 'none', fontWeight: '900', cursor: 'pointer' }}>Berildi</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── REJECT MODAL ─── */}
      {rejectModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9000 }}>
          <div className="premium-card" style={{ width: '450px', padding: '40px', border: '1px solid #ef4444' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '24px' }}>
              <AlertCircle size={32} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#ef4444', marginBottom: '12px' }}>Rad etish sababi</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Managerga nima uchun rad etilganini tushuntirib bering.</p>
            <textarea 
              value={rejectionReason} 
              onChange={e => setRejectionReason(e.target.value)} 
              placeholder="Masalan: Kassa mablag'i yetarli emas yoki ma'lumot noto'g'ri..." 
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '12px', color: '#fff', minHeight: '120px', marginBottom: '32px', resize: 'none', outline: 'none' }} 
            />
            <div style={{ display: 'flex', gap: '16px' }}>
              <button onClick={() => setRejectModalOpen(false)} style={{ flex: 1, height: '48px', borderRadius: '10px', background: 'transparent', border: '1px solid var(--border-color)', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>Bekor qilish</button>
              <button onClick={handleRejectRequest} style={{ flex: 1, height: '48px', borderRadius: '10px', background: '#ef4444', color: '#fff', border: 'none', fontWeight: '800', cursor: 'pointer' }}>Rad etish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoneyRequests;
