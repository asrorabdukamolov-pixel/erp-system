import React, { useState, useEffect } from 'react';
import { Search, Store, Trash2, ShieldAlert, X, Check, User } from 'lucide-react';
import api from '../../utils/api';

const SOURCE_LABELS = {
  instagram: { label: 'Instagram', icon: '📸', color: '#e1306c' },
  facebook: { label: 'Facebook', icon: '👤', color: '#1877f2' },
  tanish: { label: 'Tanish orqali', icon: '🤝', color: '#10b981' },
  tavsiya: { label: 'Tavsiya orqali', icon: '⭐', color: '#fbbf24' },
  agent: { label: 'Agent', icon: '🏢', color: '#8b5cf6' },
};

const getSourceLabel = (sourceStr) => {
  if (!sourceStr) return null;
  const key = Object.keys(SOURCE_LABELS).find(k => sourceStr.toLowerCase().includes(k));
  if (key) return SOURCE_LABELS[key];
  return { label: sourceStr, icon: '🔗', color: '#9ca3af' };
};

const SuperCustomerBase = () => {
  const [tab, setTab] = useState('');
  const [customers, setCustomers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [customerTypes, setCustomerTypes] = useState([]);
  const [search, setSearch] = useState('');
  const [filterShowroom, setFilterShowroom] = useState('all');
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });

  const loadData = async () => {
    setLoading(true);
    try {
      const [custRes, agentRes, typesRes] = await Promise.all([
        api.get('/customers', { params: { type: 'customer', showroom: 'all' } }),
        api.get('/customers', { params: { type: 'agent', showroom: 'all' } }),
        api.get('/customer-types')
      ]);

      const fetchedTypes = typesRes.data.length > 0 ? typesRes.data : [
        { _id: '1', name: 'B2C' },
        { _id: '2', name: 'B2B' },
        { _id: '3', name: 'Agent' }
      ];

      setCustomers(custRes.data);
      setAgents(agentRes.data);
      setCustomerTypes(fetchedTypes);

      // Set default tab if not set or if current tab is not in list
      if (!tab || !fetchedTypes.some(t => t.name === tab)) {
        setTab(fetchedTypes[0].name);
      }
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

  const getResolvedClientType = (c) => {
    if (c.clientType) return c.clientType;
    if (c.type === 'agent') return 'Agent';
    if (c.subType === 'b2b') return 'B2B';
    return 'B2C';
  };

  const allClients = [
    ...customers.map(c => ({ ...c, resolvedClientType: getResolvedClientType(c) })),
    ...agents.map(a => ({ ...a, resolvedClientType: getResolvedClientType(a) }))
  ];

  const uniqueShowrooms = [...new Set(allClients.map(c => c.showroom).filter(Boolean))];
  const isAgentTab = tab?.toLowerCase().includes('agent');

  const getFilteredClients = () => {
    return allClients.filter(c => {
      if (c.resolvedClientType !== tab) return false;
      
      const searchStr = isAgentTab 
        ? `${c.firstName || ''} ${c.lastName || ''} ${c.agentName || ''} ${c.phone || ''} ${c.firm || ''}`.toLowerCase()
        : `${c.firstName || ''} ${c.lastName || ''} ${c.companyName || ''} ${c.contactPerson || ''} ${c.phone || ''}`.toLowerCase();
        
      const matchSearch = searchStr.includes(search.toLowerCase());
      const matchShowroom = filterShowroom === 'all' || c.showroom === filterShowroom;
      
      return matchSearch && matchShowroom;
    });
  };

  const filteredList = getFilteredClients();

  const getCount = (typeName) => {
    return allClients.filter(c => c.resolvedClientType === typeName).length;
  };

  const getClientName = (item) => {
    if (!item) return '';
    if (item.agentName) return item.agentName;
    if (item.companyName) return item.companyName;
    return `${item.firstName || ''} ${item.lastName || ''}`.trim() || '—';
  };

  const TabBtn = ({ id, label }) => (
    <button onClick={() => { setTab(id); setSearch(''); }}
      style={{
        padding: '10px 24px', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
        background: tab === id ? 'var(--accent-gold)' : 'transparent',
        color: tab === id ? 'black' : 'var(--text-secondary)',
        border: tab === id ? 'none' : '1px solid var(--border-color)',
        transition: '0.2s'
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

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {customerTypes.map(t => {
          const icon = t.name?.toLowerCase().includes('agent') ? '🏢' : (t.name === 'B2B' ? '🏢' : '👥');
          return (
            <TabBtn 
              key={t._id || t.name} 
              id={t.name} 
              label={`${icon} ${t.name} (${getCount(t.name)})`} 
            />
          );
        })}
      </div>

      <div className="premium-card">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={isAgentTab ? "Agent nomi..." : "Mijoz nomi..."}
              style={{ width: '100%', paddingLeft: '44px' }} />
          </div>
          {!isAgentTab && (
            <select value={filterShowroom} onChange={e => setFilterShowroom(e.target.value)} style={{ width: '220px' }}>
              <option value="all">Barcha Showroomlar</option>
              {uniqueShowrooms.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>Yuklanmoqda...</div>
        ) : isAgentTab ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'left' }}>
                  <th style={{ padding: '14px 10px' }}>ID & Agent</th>
                  <th style={{ padding: '14px 10px' }}>Telefon</th>
                  <th style={{ padding: '14px 10px' }}>Firma / Agent turi</th>
                  <th style={{ padding: '14px 10px' }}>Showroom</th>
                  <th style={{ padding: '14px 10px' }}>Sana</th>
                  <th style={{ padding: '14px 10px' }}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>Agentlar topilmadi</td></tr>
                )}
                {filteredList.map(a => (
                  <tr key={a._id} style={{ borderBottom: '1px solid var(--border-color)' }} className="table-row-hover">
                    <td style={{ padding: '18px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(139,92,246,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Store size={18} color="#8b5cf6" />
                        </div>
                        <div>
                          <p style={{ fontWeight: '600' }}>{getClientName(a)}</p>
                          <p style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>#{a._id?.slice(-4)}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '18px 10px', fontSize: '13px', fontWeight: '600' }}>{a.phone}</td>
                    <td style={{ padding: '18px 10px', fontSize: '13px' }}>{a.firm || a.agentType || '—'}</td>
                    <td style={{ padding: '18px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                        <Store size={14} color="var(--accent-gold)" />
                        <span style={{ fontWeight: '600' }}>{a.showroom || '—'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '18px 10px', fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '18px 10px' }}>
                      <button 
                        onClick={() => setDeleteModal({ isOpen: true, item: a })}
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
                ))}
              </tbody>
            </table>
          </div>
        ) : (
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
                  <th style={{ padding: '14px 10px' }}>Menejer</th>
                  <th style={{ padding: '14px 10px' }}>Showroom</th>
                  <th style={{ padding: '14px 10px' }}>Sana</th>
                  <th style={{ padding: '14px 10px' }}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length === 0 && (
                  <tr><td colSpan={11} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>Mijozlar topilmadi</td></tr>
                )}
                {filteredList.map(c => {
                  const src = getSourceLabel(c.source);
                  return (
                    <tr key={c._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} className="table-row-hover">
                      <td style={{ padding: '18px 10px' }}>
                        <p style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: '700' }}>#{c._id?.slice(-6)}</p>
                        <p style={{ fontWeight: '700', fontSize: '14px' }}>{getClientName(c)}</p>
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
                        {c.address || c.legalAddress || '—'}
                      </td>
                      <td style={{ padding: '18px 10px' }}>
                        {src ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ display: 'inline-flex', width: 'fit-content', fontSize: '11px', fontWeight: '700', color: src.color, background: src.color + '15', padding: '4px 12px', borderRadius: '20px', border: `1px solid ${src.color}30` }}>
                              {src.icon} {src.label}
                            </span>
                            {c.source?.toLowerCase().includes('agent') && c.selectedAgent && (
                              <span style={{ fontSize: '11px', color: '#a78bfa', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                👤 {c.selectedAgent.agentName || `${c.selectedAgent.firstName || ''} ${c.selectedAgent.lastName || ''}`.trim()}
                              </span>
                            )}
                          </div>
                        ) : <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>—</span>}
                      </td>
                      <td style={{ padding: '18px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                          <User size={14} color="#3b82f6" />
                          <span style={{ fontWeight: '600' }}>{c.managerName || '—'}</span>
                        </div>
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
              <b>{getClientName(deleteModal.item)}</b> {isAgentTab ? 'agentini' : 'mijozini'} bazadan butunlay o'chirib yubormoqchisiz. Bu amalni bekor qilib bo'lmaydi.
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
