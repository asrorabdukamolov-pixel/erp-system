import React, { useState } from 'react';
import { UserPlus, Check, X, Phone, MapPin, Home, FileText, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const NewCustomer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clientType, setClientType] = useState('B2C'); // B2C, B2B, Agent
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '+998 ',
    address: '',
    propertyType: 'hovli',
    source: '',
    companyName: '',
    inn: '',
    contactPerson: '',
    legalAddress: '',
    agentName: '',
    agentType: '',
    commissionTerms: '',
    status: 'faol',
    managerId: user?.id || user?._id || '',
    managerName: user?.name || '',
    selectedAgent: null,
    age: '',
    gender: 'Erkak'
  });

  const [leadSources, setLeadSources] = useState([]);
  const [managers, setManagers] = useState([]);
  const [customerTypes, setCustomerTypes] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState([]);
  const [agentSearch, setAgentSearch] = useState('');
  const [agentSuggestions, setAgentSuggestions] = useState([]);

  // Fetch all agents when source becomes an agent-based source
  useEffect(() => {
    const isAgentSource = formData.source?.toLowerCase().includes('agent');
    if (isAgentSource && agents.length === 0) {
      const fetchAgents = async () => {
        try {
          const res = await api.get('/customers', { params: { type: 'agent' } });
          setAgents(res.data);
        } catch (err) {
          console.error("Failed to fetch agents", err);
        }
      };
      fetchAgents();
    }
  }, [formData.source]);

  // Filter agents client-side based on search term
  useEffect(() => {
    if (agentSearch.trim().length > 0) {
      const term = agentSearch.toLowerCase();
      const filtered = agents.filter(a => {
        const fullName = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
        const agentName = (a.agentName || '').toLowerCase();
        return fullName.includes(term) || agentName.includes(term);
      });
      setAgentSuggestions(filtered);
    } else {
      setAgentSuggestions([]);
    }
  }, [agentSearch, agents]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sourcesRes, usersRes, typesRes] = await Promise.all([
          api.get('/lead-sources'),
          api.get('/users'),
          api.get('/customer-types')
        ]);
        setLeadSources(sourcesRes.data);
        setManagers(usersRes.data);
        setCustomerTypes(typesRes.data);
      } catch (err) {
        console.error("Fetch data error", err);
      }
    };
    fetchData();
  }, []);

  const formatPhone = (val) => {
    if (!val) return "+998 ";
    let v = val.replace(/\D/g, "");
    if (!v.startsWith("998")) v = "998" + v;
    v = v.substring(0, 12);
    let res = "+";
    if (v.length > 0) res += v.substring(0, 3);
    if (v.length > 3) res += " " + v.substring(3, 5);
    if (v.length > 5) res += " " + v.substring(5, 8);
    if (v.length > 8) res += " " + v.substring(8, 10);
    if (v.length > 10) res += " " + v.substring(10, 12);
    return res;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'phone' ? formatPhone(value) : value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let payload = { clientType };
      const finalManagerId = user?.role === 'super' ? formData.managerId : (user?.id || user?._id || formData.managerId);
      const selectedManager = managers.find(m => m._id === finalManagerId);
      const managerName = selectedManager ? `${selectedManager.name} ${selectedManager.surname}` : (user?.role === 'super' ? formData.managerName : (user?.name || formData.managerName));

      const selectedTypeObj = customerTypes.find(t => t.name === clientType);
      const isB2B = selectedTypeObj?.legalStatus?.toLowerCase().includes('yuridik');
      const isAgent = clientType === 'Agent';

      if (isAgent) {
        payload = { ...payload, type: 'agent', agentName: formData.agentName, phone: formData.phone, agentType: formData.agentType, commissionTerms: formData.commissionTerms, status: formData.status };
      } else if (isB2B) {
        payload = { ...payload, type: 'customer', subType: 'b2b', companyName: formData.companyName, inn: formData.inn, contactPerson: formData.contactPerson, phone: formData.phone, legalAddress: formData.legalAddress, source: formData.source, managerId: finalManagerId, managerName, selectedAgent: formData.selectedAgent };
      } else {
        payload = { ...payload, type: 'customer', firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone, address: formData.address, propertyType: formData.propertyType, source: formData.source, managerId: finalManagerId, managerName, selectedAgent: formData.selectedAgent, age: formData.age, gender: formData.gender };
      }

      await api.post('/customers', payload);
      
      setMessage('Mijoz muvaffaqiyatli saqlandi!');
      setTimeout(() => navigate('/sotuv-manager/orders'), 2000);
    } catch (err) {
      console.error("Customer save error", err);
      alert("Mijozni saqlashda xatolik: " + (err.response?.data?.message || err.message));
    }
    setLoading(false);
  };

  const PROPERTY_TYPES = [
    { label: 'Hovli', value: 'hovli' },
    { label: 'Dom', value: 'dom' },
    { label: 'Ofis', value: 'ofis' }
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Yangi Mijoz Qo'shish</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Mijoz ma'lumotlarini kiriting va saqlash tugmasini bosing.</p>
      </div>

      {message && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <Check size={20} />
          {message}
        </div>
      )}

      <div className="premium-card" style={{ padding: '40px' }}>
        {/* Type Selector */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Mijoz Turi</label>
          <select 
            value={clientType} 
            onChange={(e) => setClientType(e.target.value)}
            style={{ 
              width: '100%', 
              height: '54px', 
              background: 'var(--secondary-bg)', 
              border: '1px solid var(--border-color)', 
              color: 'white', 
              borderRadius: '12px', 
              padding: '0 15px',
              fontSize: '15px',
              fontWeight: '600',
              outline: 'none'
            }}
          >
            {customerTypes.length > 0 ? (
              customerTypes.map(t => <option key={t._id} value={t.name}>{t.name}</option>)
            ) : (
              <>
                <option value="B2C">B2C</option>
                <option value="B2B">B2B</option>
                <option value="Agent">Agent</option>
              </>
            )}
          </select>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {(() => {
              const selectedTypeObj = customerTypes.find(t => t.name === clientType);
              const isB2B = selectedTypeObj?.legalStatus?.toLowerCase().includes('yuridik');
              const isAgent = clientType === 'Agent';

              if (isAgent) {
                return (
                  <>
                    <div><label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Agent nomi</label><input name="agentName" value={formData.agentName} onChange={handleChange} required style={{ width: '100%' }} /></div>
                    <div><label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Telefon</label><input name="phone" value={formData.phone} onChange={handleChange} required style={{ width: '100%' }} /></div>
                    <div><label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Agent turi</label><input name="agentType" value={formData.agentType} onChange={handleChange} required placeholder="Masalan: Dizayner" style={{ width: '100%' }} /></div>
                    <div><label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Komissiya sharti</label><input name="commissionTerms" value={formData.commissionTerms} onChange={handleChange} required placeholder="Masalan: 5%" style={{ width: '100%' }} /></div>
                    <div>
                       <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Status</label>
                       <select name="status" value={formData.status} onChange={handleChange} style={{ width: '100%', height: '48px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '10px', padding: '0 12px' }}>
                         <option value="faol">Faol</option>
                         <option value="bloklangan">Bloklangan</option>
                       </select>
                    </div>
                  </>
                );
              }

              if (isB2B) {
                return (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      <div><label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Kompaniya nomi</label><input name="companyName" value={formData.companyName} onChange={handleChange} required style={{ width: '100%' }} /></div>
                      <div><label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>INN / STIR</label><input name="inn" value={formData.inn} onChange={handleChange} required style={{ width: '100%' }} /></div>
                    </div>
                    <div><label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Kontakt shaxs</label><input name="contactPerson" value={formData.contactPerson} onChange={handleChange} required style={{ width: '100%' }} /></div>
                    <div><label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Telefon</label><input name="phone" value={formData.phone} onChange={handleChange} required style={{ width: '100%' }} /></div>
                    <div><label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Yuridik manzil</label><input name="legalAddress" value={formData.legalAddress} onChange={handleChange} required style={{ width: '100%' }} /></div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Mijoz manbasi</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        {leadSources.map(s => (
                          <button 
                            key={s._id} 
                            type="button" 
                            onClick={() => setFormData({...formData, source: s.name})} 
                            style={{ 
                              height: '48px', 
                              borderRadius: '10px', 
                              background: formData.source === s.name ? 'var(--accent-gold)' : 'rgba(255,255,255,0.03)', 
                              color: s.name === formData.source ? 'black' : 'white', 
                              border: '1px solid var(--border-color)', 
                              fontWeight: '700',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            {s.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    {formData.source?.toLowerCase().includes('agent') && (
                      <div style={{ position: 'relative' }}>
                        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Agentni tanlang</label>
                        <input 
                          type="text" 
                          value={agentSearch} 
                          onChange={(e) => {
                            setAgentSearch(e.target.value);
                            if (formData.selectedAgent) {
                              setFormData(prev => ({ ...prev, selectedAgent: null }));
                            }
                          }} 
                          placeholder="Agent ismini kiriting..." 
                          autoComplete="off" 
                          style={{ width: '100%', height: '48px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '10px', padding: '0 12px' }} 
                          required={!formData.selectedAgent}
                        />
                        {agentSuggestions.length > 0 && (
                          <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', zIndex: 10, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', marginTop: '4px' }}>
                            {agentSuggestions.map(a => {
                              const name = a.agentName || `${a.firstName || ''} ${a.lastName || ''}`.trim() || 'Noma\'lum';
                              return (
                                <div 
                                  key={a._id} 
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, selectedAgent: a }));
                                    setAgentSearch(name);
                                    setAgentSuggestions([]);
                                  }} 
                                  style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'white', transition: 'background 0.2s' }}
                                  onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                >
                                  {name} ({a.phone})
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                    {user?.role === 'super' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Mas’ul savdo menejeri</label>
                        <select name="managerId" value={formData.managerId} onChange={handleChange} required style={{ width: '100%', height: '48px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '10px', padding: '0 12px' }}>
                          {managers.map(m => <option key={m._id} value={m._id}>{m.name} {m.surname}</option>)}
                        </select>
                      </div>
                    )}
                  </>
                );
              }

              return (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div><label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Ism</label><input name="firstName" value={formData.firstName} onChange={handleChange} required style={{ width: '100%' }} /></div>
                    <div><label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Familiya</label><input name="lastName" value={formData.lastName} onChange={handleChange} required style={{ width: '100%' }} /></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Yoshi</label>
                      <input 
                        type="number" 
                        name="age" 
                        value={formData.age} 
                        onChange={handleChange} 
                        required 
                        placeholder="Masalan: 35" 
                        style={{ width: '100%' }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Jinsi</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {['Erkak', 'Ayol'].map(g => (
                          <button 
                            key={g} 
                            type="button" 
                            onClick={() => setFormData({...formData, gender: g})} 
                            style={{ 
                              height: '48px', 
                              borderRadius: '10px', 
                              background: formData.gender === g ? 'var(--accent-gold)' : 'rgba(255,255,255,0.03)', 
                              color: g === formData.gender ? 'black' : 'white', 
                              border: '1px solid var(--border-color)', 
                              fontWeight: '700',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div><label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Telefon</label><input name="phone" value={formData.phone} onChange={handleChange} required style={{ width: '100%' }} /></div>
                  <div><label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Manzil</label><input name="address" value={formData.address} onChange={handleChange} required style={{ width: '100%' }} /></div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Uy Turi</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      {PROPERTY_TYPES.map(pt => (
                        <button key={pt.value} type="button" onClick={() => setFormData({...formData, propertyType: pt.value})} style={{ height: '48px', borderRadius: '10px', background: formData.propertyType === pt.value ? 'var(--accent-gold)' : 'rgba(255,255,255,0.03)', color: pt.value === formData.propertyType ? 'black' : 'white', border: '1px solid var(--border-color)', fontWeight: '700' }}>{pt.label}</button>
                      ))}
                    </div>
                  </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Mijoz manbasi</label>
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                       {leadSources.map(s => (
                         <button 
                           key={s._id} 
                           type="button" 
                           onClick={() => setFormData({...formData, source: s.name})} 
                           style={{ 
                             height: '48px', 
                             borderRadius: '10px', 
                             background: formData.source === s.name ? 'var(--accent-gold)' : 'rgba(255,255,255,0.03)', 
                             color: s.name === formData.source ? 'black' : 'white', 
                             border: '1px solid var(--border-color)', 
                             fontWeight: '700',
                             cursor: 'pointer',
                             transition: 'all 0.2s'
                           }}
                         >
                           {s.name}
                         </button>
                       ))}
                     </div>
                   </div>
                  {formData.source?.toLowerCase().includes('agent') && (
                    <div style={{ position: 'relative' }}>
                      <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Agentni tanlang</label>
                      <input 
                        type="text" 
                        value={agentSearch} 
                        onChange={(e) => {
                          setAgentSearch(e.target.value);
                          if (formData.selectedAgent) {
                            setFormData(prev => ({ ...prev, selectedAgent: null }));
                          }
                        }} 
                        placeholder="Agent ismini kiriting..." 
                        autoComplete="off" 
                        style={{ width: '100%', height: '48px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '10px', padding: '0 12px' }} 
                        required={!formData.selectedAgent}
                      />
                      {agentSuggestions.length > 0 && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', zIndex: 10, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', marginTop: '4px' }}>
                          {agentSuggestions.map(a => {
                            const name = a.agentName || `${a.firstName || ''} ${a.lastName || ''}`.trim() || 'Noma\'lum';
                            return (
                              <div 
                                key={a._id} 
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, selectedAgent: a }));
                                  setAgentSearch(name);
                                  setAgentSuggestions([]);
                                }} 
                                style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'white', transition: 'background 0.2s' }}
                                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                              >
                                {name} ({a.phone})
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                    {user?.role === 'super' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Mas’ul savdo menejeri</label>
                        <select name="managerId" value={formData.managerId} onChange={handleChange} required style={{ width: '100%', height: '48px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '10px', padding: '0 12px' }}>
                          {managers.map(m => <option key={m._id} value={m._id}>{m.name} {m.surname}</option>)}
                        </select>
                      </div>
                    )}
                </>
              );
            })()}
          </div>

          <div style={{ marginTop: '40px', display: 'flex', gap: '16px' }}>
            <button type="button" onClick={() => navigate(-1)} className="secondary-btn" style={{ flex: 1 }}>Bekor Qilish</button>
            <button type="submit" className="gold-btn" style={{ flex: 1, justifyContent: 'center', padding: '16px' }} disabled={loading}>
              <UserPlus size={20} />
              {loading ? 'Saqlanmoqda...' : 'Mijozni Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default NewCustomer;
