import React, { useState, useEffect } from 'react';
import { Users, Search, MapPin, Phone, Store, User, Calendar, Share2 } from 'lucide-react';
import api from '../../utils/api';

const SOURCE_LABELS = {
  instagram: { label: 'Instagram', icon: '📸', color: '#e1306c' },
  facebook: { label: 'Facebook', icon: '👤', color: '#1877f2' },
  tanish: { label: 'Tanish orqali', icon: '🤝', color: '#10b981' },
  tavsiya: { label: 'Tavsiya orqali', icon: '⭐', color: '#fbbf24' },
  agent: { label: 'Agent', icon: '🏢', color: '#8b5cf6' },
};

const ShowroomCustomersPage = () => {
  const [tab, setTab] = useState('customers');
  const [customers, setCustomers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [custRes, agentRes] = await Promise.all([
        api.get('/customers', { params: { type: 'customer' } }),
        api.get('/customers', { params: { type: 'agent' } })
      ]);
      setCustomers(custRes.data);
      setAgents(agentRes.data);
    } catch (err) {
      console.error("Data loading error", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCustomers = customers.filter(c =>
    `${c.firstName} ${c.lastName || ''} ${c.phone}`.toLowerCase().includes(search.toLowerCase())
  );
  const filteredAgents = agents.filter(a =>
    `${a.firstName} ${a.lastName || ''} ${a.phone} ${a.firm || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const TabBtn = ({ id, label }) => (
    <button onClick={() => { setTab(id); setSearch(''); }}
      style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
        background: tab === id ? 'var(--accent-gold)' : 'transparent',
        color: tab === id ? 'black' : 'var(--text-secondary)',
        border: tab === id ? 'none' : '1px solid var(--border-color)' }}>
      {label}
    </button>
  );

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Mijozlar & Agentlar</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Filial menejerlar tomonidan kiritilgan ma'lumotlar bazasi.</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <TabBtn id="customers" label={`👥 Mijozlar (${customers.length})`} />
        <TabBtn id="agents" label={`🏢 Agentlar (${agents.length})`} />
      </div>

      <div className="premium-card">
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={tab === 'customers' ? "Ism, telefon bo'yicha..." : "Agent ismi, firma..."}
            style={{ width: '100%', paddingLeft: '44px' }} />
        </div>

        {tab === 'customers' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'left' }}>
                  <th style={{ padding: '14px 10px' }}>ID & Mijoz</th>
                  <th style={{ padding: '14px 10px' }}>Aloqa</th>
                  <th style={{ padding: '14px 10px' }}>Manba</th>
                  <th style={{ padding: '14px 10px' }}>Kiritdi</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>Mijozlar topilmadi</td></tr>
                )}
                {filteredCustomers.map(c => {
                  const src = SOURCE_LABELS[c.source];
                  return (
                    <tr key={c._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '18px 10px' }}>
                        <p style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: '700' }}>#{c._id?.slice(-4)}</p>
                        <p style={{ fontWeight: '600' }}>{c.firstName} {c.lastName}</p>
                      </td>
                      <td style={{ padding: '18px 10px', fontSize: '13px' }}>{c.phone}</td>
                      <td style={{ padding: '18px 10px' }}>
                        {src ? (
                          <span style={{ fontSize: '12px', fontWeight: '600', color: src.color, background: src.color + '18', padding: '3px 10px', borderRadius: '20px' }}>
                            {src.icon} {src.label}
                          </span>
                        ) : <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>—</span>}
                        {c.selectedAgent && (
                          <p style={{ fontSize: '11px', color: '#8b5cf6', marginTop: '4px' }}>🏢 {c.selectedAgent.firstName} {c.selectedAgent.lastName}</p>
                        )}
                      </td>
                      <td style={{ padding: '18px 10px', fontSize: '13px' }}>{c.managerName}</td>
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
                </tr>
              </thead>
              <tbody>
                {filteredAgents.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>Agentlar topilmadi</td></tr>
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
                    <td style={{ padding: '18px 10px' }}>
                      {a.firm ? <span style={{ fontSize: '13px', color: '#8b5cf6' }}>{a.firm}</span> : <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>—</span>}
                    </td>
                    <td style={{ padding: '18px 10px', fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowroomCustomersPage;
