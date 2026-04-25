import React, { useState, useEffect } from 'react';
import { Search, Store, Trash2, ShieldAlert, X, Check } from 'lucide-react';
import api from '../../utils/api';

const SOURCE_LABELS = {
  instagram: { label: 'Instagram', icon: '📸', color: '#e1306c' },
  facebook: { label: 'Facebook', icon: '👤', color: '#1877f2' },
  tanish: { label: 'Tanish orqali', icon: '🤝', color: '#10b981' },
  tavsiya: { label: 'Tavsiya orqali', icon: '⭐', color: '#fbbf24' },
  agent: { label: 'Agent', icon: '🏢', color: '#8b5cf6' },
};

const SuperCustomerBase = () => {
  const [tab, setTab] = useState('customers');
  const [customers, setCustomers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [search, setSearch] = useState('');
  const [filterShowroom, setFilterShowroom] = useState('all');
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });

  const loadData = async () => {
    setLoading(true);
    try {
      const [custRes, agentRes] = await Promise.all([
        api.get('/customers', { params: { type: 'customer', showroom: 'all' } }),
        api.get('/customers', { params: { type: 'agent', showroom: 'all' } })
      ]);
      setCustomers(custRes.data);
      setAgents(agentRes.data);
    } catch (err) {
      console.error("Super load data error", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async () => {
    if (!deleteModal.item) return;
    console.log("Deleting item:", deleteModal.item);
    try {
      const res = await api.delete(`/customers/${deleteModal.item._id}`);
      console.log("Delete response:", res.data);
      setDeleteModal({ isOpen: false, item: null });
      loadData();
    } catch (err) {
      console.error("Delete error:", err);
      alert("O'chirishda xatolik: " + (err.response?.data?.message || err.message));
    }
  };

  const uniqueShowrooms = [...new Set(customers.map(c => c.showroom).filter(Boolean))];

  const filteredCustomers = customers.filter(c => {
    const matchSearch = `${c.firstName} ${c.lastName || ''} ${c.phone}`.toLowerCase().includes(search.toLowerCase());
    const matchShowroom = filterShowroom === 'all' || c.showroom === filterShowroom;
    return matchSearch && matchShowroom;
  });

  const filteredAgents = agents.filter(a =>
    `${a.firstName} ${a.lastName || ''} ${a.phone} ${a.firm || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const TabBtn = ({ id, label }) => (
    <button onClick={() => { setTab(id); setSearch(''); }}
      style={{
        padding: '10px 24px', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
        background: tab === id ? 'var(--accent-gold)' : 'transparent',
        color: tab === id ? 'black' : 'var(--text-secondary)',
        border: tab === id ? 'none' : '1px solid var(--border-color)'
      }}>
      {label}
    </button>
  );

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Umumiy Mijozlar va Agentlar</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Global ma'lumotlar bazasi.</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <TabBtn id="customers" label={`👥 Mijozlar (${customers.length})`} />
        <TabBtn id="agents" label={`🏢 Agentlar (${agents.length})`} />
      </div>

      <div className="premium-card">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={tab === 'customers' ? "Mijoz ismi..." : "Agent ismi..."}
              style={{ width: '100%', paddingLeft: '44px' }} />
          </div>
          {tab === 'customers' && (
            <select value={filterShowroom} onChange={e => setFilterShowroom(e.target.value)} style={{ width: '220px' }}>
              <option value="all">Barcha Showroomlar</option>
              {uniqueShowrooms.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </div>

        {tab === 'customers' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '14px 10px' }}>ID va Mijoz</th>
                  <th style={{ padding: '14px 10px' }}>Aloqa</th>
                  <th style={{ padding: '14px 10px' }}>Jinsi</th>
                  <th style={{ padding: '14px 10px' }}>Yoshi</th>
                  <th style={{ padding: '14px 10px' }}>Uy Turi</th>
                  <th style={{ padding: '14px 10px' }}>Manzil</th>
                  <th style={{ padding: '14px 10px' }}>Manba</th>
                  <th style={{ padding: '14px 10px' }}>Showroom</th>
                  <th style={{ padding: '14px 10px' }}>Sana</th>
                  <th style={{ padding: '14px 10px' }}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 && (
                  <tr><td colSpan={10} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>Mijozlar topilmadi</td></tr>
                )}
                {filteredCustomers.map(c => {
                  const src = SOURCE_LABELS[c.source];
                  return (
                    <tr key={c._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} className="table-row-hover">
                      <td style={{ padding: '18px 10px' }}>
                        <p style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: '700' }}>#{c._id?.slice(-6)}</p>
                        <p style={{ fontWeight: '700', fontSize: '14px' }}>{c.firstName} {c.lastName}</p>
                      </td>
                      <td style={{ padding: '18px 10px', fontSize: '13px', fontWeight: '600' }}>{c.phone}</td>
                      <td style={{ padding: '18px 10px', fontSize: '13px', textTransform: 'capitalize' }}>{c.gender || '—'}</td>
                      <td style={{ padding: '18px 10px', fontSize: '13px' }}>{c.age || '—'}</td>
                      <td style={{ padding: '18px 10px', fontSize: '13px' }}>
                        <span style={{ 
                          background: 'rgba(255,255,255,0.05)', 
                          padding: '4px 10px', 
                          borderRadius: '6px',
                          textTransform: 'capitalize'
                        }}>
                          {c.propertyType || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '18px 10px', fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '200px' }}>
                        {c.address || '—'}
                      </td>
                      <td style={{ padding: '18px 10px' }}>
                        {src ? (
                          <span style={{ fontSize: '11px', fontWeight: '700', color: src.color, background: src.color + '15', padding: '4px 12px', borderRadius: '20px', border: `1px solid ${src.color}30` }}>
                            {src.icon} {src.label}
                          </span>
                        ) : <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>—</span>}
                      </td>
                      <td style={{ padding: '18px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                          <Store size={14} color="var(--accent-gold)" />
                          <span style={{ fontWeight: '600' }}>{c.showroom || '—'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '18px 10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                        <p style={{ fontSize: '10px', opacity: 0.5 }}>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                      <td style={{ padding: '18px 10px' }}>
                        <button 
                          onClick={() => setDeleteModal({ isOpen: true, item: c })}
                          style={{ 
                            color: '#ef4444', 
                            background: 'rgba(239,68,68,0.1)', 
                            border: '1px solid rgba(239,68,68,0.2)', 
                            padding: '8px', 
                            borderRadius: '10px', 
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          className="delete-btn-hover"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'agents' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'left' }}>
                  <th style={{ padding: '14px 10px' }}>ID & Agent</th>
                  <th style={{ padding: '14px 10px' }}>Telefon</th>
                  <th style={{ padding: '14px 10px' }}>Firma</th>
                  <th style={{ padding: '14px 10px' }}>Sana</th>
                  <th style={{ padding: '14px 10px' }}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredAgents.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>Agentlar topilmadi</td></tr>
                )}
                {filteredAgents.map(a => (
                  <tr key={a._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '18px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(139,92,246,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Store size={18} color="#8b5cf6" />
                        </div>
                        <div>
                          <p style={{ fontWeight: '600' }}>{a.firstName} {a.lastName}</p>
                          <p style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>#{a._id?.slice(-4)}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '18px 10px', fontSize: '13px' }}>{a.phone}</td>
                    <td style={{ padding: '18px 10px' }}>{a.firm || '—'}</td>
                    <td style={{ padding: '18px 10px', fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '18px 10px' }}>
                      <button 
                        onClick={() => setDeleteModal({ isOpen: true, item: a })}
                        style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div className="premium-card" style={{ width: '400px', padding: '32px', textAlign: 'center', border: '1px solid #ef4444' }}>
            <div style={{ width: '60px', height: '60px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <ShieldAlert size={32} />
            </div>
            <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>O'chirishni tasdiqlaysizmi?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
              <b>{deleteModal.item?.firstName} {deleteModal.item?.lastName}</b> {tab === 'customers' ? 'mijozini' : 'agentini'} bazadan butunlay o'chirib yubormoqchisiz. Bu amalni bekor qilib bo'lmaydi.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setDeleteModal({ isOpen: false, item: null })} className="secondary-btn" style={{ flex: 1 }}>Bekor qilish</button>
              <button onClick={handleDelete} className="gold-btn" style={{ flex: 1, background: '#ef4444', color: 'white', justifyContent: 'center' }}>
                <Check size={18} /> O'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperCustomerBase;
