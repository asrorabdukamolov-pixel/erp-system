import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Clock, Trash2, X, RotateCcw, FileText, 
  Wallet, TrendingUp, TrendingDown, Calendar, CreditCard, Banknote, Landmark, ArrowLeft, Package, Briefcase, Users, ArrowRight, ShoppingCart, Eye, User, ChevronDown, ListFilter
} from 'lucide-react';

const KassaTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [deletedTransactions, setDeletedTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [showTrashModal, setShowTrashModal] = useState(false);
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTxId, setSelectedTxId] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');

  useEffect(() => {
    loadTransactions();
    loadDeletedTransactions();

    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

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

  const handleContextMenu = (e, tx) => {
    const txDate = new Date(tx.date).toDateString();
    const today = new Date().toDateString();
    if (txDate !== today) return; 
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
    const newActive = transactions.filter(t => t.id !== selectedTxId);
    localStorage.setItem('erp_transactions', JSON.stringify(newActive));
    setTransactions(newActive);
    const deletedTx = { ...txToDelete, deletedAt: new Date().toISOString(), deleteReason: deleteReason.trim(), deletedBy: 'Kassir' };
    const newTrash = [deletedTx, ...deletedTransactions];
    localStorage.setItem('erp_trash_transactions', JSON.stringify(newTrash));
    setDeletedTransactions(newTrash);
    setIsDeleteModalOpen(false);
    setSelectedTxId(null);
  };

  const handleRestore = (txId) => {
    const txToRestore = deletedTransactions.find(t => t.id === txId);
    if (!txToRestore) return;
    const newTrash = deletedTransactions.filter(t => t.id !== txId);
    localStorage.setItem('erp_trash_transactions', JSON.stringify(newTrash));
    setDeletedTransactions(newTrash);
    const { deletedAt, deleteReason, deletedBy, ...originalData } = txToRestore;
    const newActive = [originalData, ...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    localStorage.setItem('erp_transactions', JSON.stringify(newActive));
    setTransactions(newActive);
    if (newTrash.length === 0) setShowTrashModal(false);
  };

  const [activeTab, setActiveTab] = useState('manual'); // 'all' | 'manual' | 'requests'

  const filteredTxs = transactions.filter(t => {
    const matchesSearch = (t.comment || '').toLowerCase().includes(search.toLowerCase()) || 
                          (t.category || '').toLowerCase().includes(search.toLowerCase()) ||
                          (t.orderId || '').toLowerCase().includes(search.toLowerCase()) ||
                          (t.personName || '').toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;

    const isRequest = (t.comment || '').includes('[TASDIQLANDI]');
    if (activeTab === 'manual') return !isRequest;
    if (activeTab === 'requests') return isRequest;
    return true;
  });

  return (
    <div style={{ padding: '20px', color: '#fff' }}>
      
      {/* ─── ACTION BAR ─── */}
      <div className="premium-card" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Tranzaksiyalar</h2>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '4px' }}>
            <button 
              onClick={() => setActiveTab('manual')} 
              style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'manual' ? 'var(--accent-gold)' : 'transparent', color: activeTab === 'manual' ? '#000' : '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
            >
              Asosiy Tarix
            </button>
            <button 
              onClick={() => setActiveTab('requests')} 
              style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'requests' ? 'var(--accent-gold)' : 'transparent', color: activeTab === 'requests' ? '#000' : '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
            >
              So'rovlar Tarixi
            </button>
            <button 
              onClick={() => setActiveTab('all')} 
              style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'all' ? 'var(--accent-gold)' : 'transparent', color: activeTab === 'all' ? '#000' : '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
            >
              Barchasi
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input type="text" placeholder="Qidirish..." style={{ width: '100%', paddingLeft: '48px', height: '40px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', color: '#fff' }} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button onClick={() => setShowTrashModal(true)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0 16px', height: '40px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}><Trash2 size={18} /> Karzina ({deletedTransactions.length})</button>
        </div>
      </div>

      <div className="premium-card" style={{ padding: '0px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '13px' }}>
                <th style={{ padding: '20px 16px' }}>Sana</th><th style={{ padding: '20px 16px' }}>Turi</th><th style={{ padding: '20px 16px' }}>Mijoz / Buyurtma</th><th style={{ padding: '20px 16px' }}>Kategoriya</th><th style={{ padding: '20px 16px' }}>To'lov Turi</th><th style={{ padding: '20px 16px', textAlign: 'right' }}>Asl Valyuta</th><th style={{ padding: '20px 16px', textAlign: 'right', fontWeight: '700' }}>Summa (UZS)</th>
              </tr>
            </thead>
            <tbody>
              {filteredTxs.length === 0 ? (<tr><td colSpan="7" style={{ padding: '100px', textAlign: 'center' }}>Ma'lumotlar yo'q.</td></tr>) : (
                filteredTxs.map(t => (
                  <tr key={t.id} onContextMenu={(e) => handleContextMenu(e, t)} style={{ borderBottom: '1px solid var(--border-color)', cursor: 'context-menu' }}>
                    <td style={{ padding: '16px', fontSize: '13px' }}>{new Date(t.date).toLocaleDateString()} {new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                    <td style={{ padding: '16px' }}><span style={{ fontSize: '10px', fontWeight: '800', padding: '4px 8px', borderRadius: '4px', background: t.type === 'income' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: t.type === 'income' ? '#10b981' : '#ef4444' }}>{t.type === 'income' ? 'KIRIM' : 'CHIQIM'}</span></td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: '700', fontSize: '13px' }}>{t.personName}</div>
                      {t.orderId && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>{t.orderId}</span>
                          {JSON.parse(localStorage.getItem('erp_trash') || '[]').some(x => x.type === 'order' && (x.productionId === t.orderId || x.uniqueId === t.orderId)) && (
                            <span style={{ fontSize: '9px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '1px 6px', borderRadius: '4px', fontWeight: '900' }}>OTKAZ</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}><div style={{ fontSize: '13px', fontWeight: '600' }}>{t.category}</div></td>
                    <td style={{ padding: '16px' }}><div style={{ fontSize: '13px', color: 'var(--accent-gold)', fontWeight: '700' }}>{t.paymentMethod}</div><div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{t.comment}</div></td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>{t.currency === 'USD' ? (<div style={{ fontSize: '11px' }}><div style={{ fontWeight: '800' }}>${t.originalAmount}</div><div>kurs: {t.usdRate}</div></div>) : '-'}</td>
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
            <textarea value={deleteReason} onChange={e => setDeleteReason(e.target.value)} required placeholder="Masalan: Xato summa kiritildi..." style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '12px', color: '#fff', minHeight: '100px', marginBottom: '24px' }} />
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
    </div>
  );
};

export default KassaTransactions;
