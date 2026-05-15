import React, { useState, useEffect } from 'react';
import { Factory, Plus, Search, Edit2, Trash2, MapPin, Phone, ShieldAlert, X, Check, ArrowRight, Clock, Ban, Eye, EyeOff } from 'lucide-react';
import api from '../../utils/api';

const FactoryAccounts = () => {
  const [factories, setFactories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFactories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/factories');
      setFactories(res.data);
    } catch (err) {
      console.error("Factory loading error", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFactories();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentFactory, setCurrentFactory] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    login: '',
    password: ''
  });

  const handleOpenModal = (mode, factory = null) => {
    setModalMode(mode);
    if (mode === 'edit' && factory) {
      setCurrentFactory(factory);
      setFormData({
        name: factory.name,
        address: factory.address,
        phone: factory.phone || '',
        login: factory.login,
        password: '' 
      });
    } else {
      setFormData({ name: '', address: '', phone: '', login: '', password: '' });
    }
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        await api.post('/factories', formData);
      } else {
        await api.put(`/factories/${currentFactory._id}`, formData);
      }
      loadFactories();
      setIsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.msg || "Saqlashda xatolik yuz berdi");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Haqiqatdan ham ushbu fabrikani o\'chirmoqchimisiz?')) {
      try {
        await api.delete(`/factories/${id}`);
        loadFactories();
      } catch (err) {
        alert("O'chirishda xatolik yuz berdi");
      }
    }
  };

  const toggleStatus = async (factory) => {
    try {
        const newStatus = factory.status === 'Faol' ? 'Bloklangan' : 'Faol';
        await api.put(`/factories/${factory._id}`, { ...factory, status: newStatus });
        loadFactories();
    } catch (err) {
        alert("Statusni o'zgartirishda xatolik");
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Yuklanmoqda...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Fabrika Akkauntlari</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Tizimdagi fabrika akkauntlarini boshqarish.</p>
        </div>
        <button className="gold-btn" onClick={() => handleOpenModal('add')}>
          <Plus size={20} />
          Yangi Fabrika qo'shish
        </button>
      </div>

      <div className="premium-card" style={{ padding: '0px', overflow: 'hidden' }}>
        {factories.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '14px' }}>
                <th style={{ padding: '16px' }}>Fabrika va Manzil</th>
                <th style={{ padding: '16px' }}>Login</th>
                <th style={{ padding: '16px' }}>Telefon</th>
                <th style={{ padding: '16px' }}>Holati</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {factories.map((f) => (
                <tr key={f._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '20px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ background: 'rgba(251, 191, 36, 0.1)', color: 'var(--accent-gold)', padding: '10px', borderRadius: '10px' }}>
                        <Factory size={20} />
                      </div>
                      <div>
                        <p style={{ fontWeight: '600' }}>{f.name}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} /> {f.address}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 16px', color: 'var(--text-secondary)' }}>{f.login}</td>
                  <td style={{ padding: '20px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                      <Phone size={14} color="var(--accent-gold)" />
                      {f.phone}
                    </div>
                  </td>
                  <td style={{ padding: '20px 16px' }}>
                    <span style={{ 
                      fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '4px',
                      background: f.status === 'Faol' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: f.status === 'Faol' ? '#10b981' : '#ef4444'
                    }}>{f.status}</span>
                  </td>
                  <td style={{ padding: '20px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button onClick={() => toggleStatus(f)} style={{ padding: '8px', color: 'var(--text-secondary)', background: 'transparent' }}><Ban size={18} /></button>
                      <button onClick={() => handleOpenModal('edit', f)} style={{ padding: '8px', color: 'var(--text-secondary)', background: 'transparent' }}><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(f._id)} style={{ padding: '8px', color: '#ef4444', background: 'transparent' }}><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Factory size={48} color="var(--accent-gold)" style={{ opacity: 0.2, marginBottom: '16px' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Fabrika akkauntlari mavjud emas.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="premium-card" style={{ width: '500px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px' }}>{modalMode === 'add' ? 'Yangi Fabrika qo\'shish' : 'Tahrirlash'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', color: 'var(--text-secondary)' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Fabrika Nomi</label>
                  <input style={{ width: '100%' }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Manzil</label>
                  <input style={{ width: '100%' }} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Telefon raqami</label>
                  <input style={{ width: '100%' }} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Login</label>
                  <input style={{ width: '100%' }} value={formData.login} onChange={e => setFormData({...formData, login: e.target.value})} required />
                </div>
                <div style={{ position: 'relative' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Parol</label>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    style={{ width: '100%', paddingRight: '40px' }} 
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                    placeholder={modalMode === 'edit' ? 'O\'zgartirmaslik uchun bo\'sh qoldiring' : '••••••••'} 
                    required={modalMode === 'add'} 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '28px', background: 'transparent', color: 'var(--text-secondary)' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="secondary-btn" style={{ flex: 1 }}>Bekor qilish</button>
                <button type="submit" className="gold-btn" style={{ flex: 1, justifyContent: 'center' }}>Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FactoryAccounts;
