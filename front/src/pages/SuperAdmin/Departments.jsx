import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, X, Users, Loader2, ShieldCheck, Wallet, 
  UserPlus, ShoppingCart, Target, Factory, ClipboardList, Info
} from 'lucide-react';
import api from '../../utils/api';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedDep, setSelectedDep] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const depRes = await api.get('/departments');
      setDepartments(depRes.data);
    } catch (err) {
      console.error("Data loading error", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getDepIcon = (key) => {
    switch (key?.toLowerCase()) {
      case 'management': return <ShieldCheck size={24} />;
      case 'finance': return <Wallet size={24} />;
      case 'hr': return <UserPlus size={24} />;
      case 'sales': return <ShoppingCart size={24} />;
      case 'marketing': return <Target size={24} />;
      case 'production': return <Factory size={24} />;
      case 'project': return <ClipboardList size={24} />;
      default: return <Users size={24} />;
    }
  };

  const handleOpenModal = (mode, dep = null) => {
    setModalMode(mode);
    if (mode === 'edit' && dep) {
      setSelectedDep(dep);
      setFormData({
        name: dep.name || '',
        key: dep.key || '',
        description: dep.description || ''
      });
    } else {
      setFormData({
        name: '',
        key: '',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        await api.post('/departments', formData);
      } else {
        await api.put(`/departments/${selectedDep._id}`, formData);
      }
      loadData();
      setIsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.msg || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Haqiqatdan ham ushbu bo'limni o'chirmoqchimisiz?")) {
      try {
        await api.delete(`/departments/${id}`);
        loadData();
      } catch (err) {
        alert(err.response?.data?.msg || "Xatolik yuz berdi");
      }
    }
  };

  if (loading) {
    return (
      <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={48} color="var(--accent-gold)" />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Tizim Bo'limlari</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Kompaniya strukturasi va bo'limlarni boshqarish.</p>
        </div>
        <button className="gold-btn" onClick={() => handleOpenModal('add')}>
          <Plus size={20} />
          Yangi Bo'lim yaratish
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {departments.map(dep => (
          <div 
            key={dep._id || dep.key}
            className="premium-card" 
            style={{ 
              padding: '24px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '12px', 
                background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)'
              }}>
                {getDepIcon(dep.key)}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => handleOpenModal('edit', dep)}
                  style={{ 
                    width: '32px', height: '32px', borderRadius: '8px', 
                    background: 'rgba(255,255,255,0.05)', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)',
                    border: '1px solid var(--border-color)', cursor: 'pointer'
                  }}
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => handleDelete(dep._id)}
                  style={{ 
                    width: '32px', height: '32px', borderRadius: '8px', 
                    background: 'rgba(239, 68, 68, 0.1)', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>{dep.name}</h3>
              <p style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>ID: {dep.key}</p>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', minHeight: '42px' }}>
              {dep.description || "Bo'lim haqida ma'lumot kiritilmagan."}
            </p>

            <div style={{ 
              marginTop: '8px', padding: '12px', background: 'rgba(255,255,255,0.02)', 
              borderRadius: '8px', border: '1px solid var(--border-color)',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <Info size={16} color="var(--accent-gold)" />
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Ushbu bo'lim tizimda faol holatda.
              </span>
            </div>
          </div>
        ))}
      </div>

      {departments.length === 0 && (
        <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Users size={64} style={{ marginBottom: '20px', opacity: 0.1 }} />
          <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Bo'limlar mavjud emas</h3>
          <p>Hali birorta ham bo'lim yaratilmagan.</p>
        </div>
      )}

      {/* Department Modal */}
      {isModalOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="premium-card" style={{ width: '500px', padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '800' }}>{modalMode === 'add' ? 'Yangi bo\'lim' : 'Bo\'limni tahrirlash'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Bo'lim nomi</label>
                  <input 
                    style={{ width: '100%' }} 
                    placeholder="Masalan: Savdo Bo'limi"
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    required 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Bo'lim kodi (Key)</label>
                  <input 
                    style={{ width: '100%' }} 
                    placeholder="Masalan: sales"
                    value={formData.key} 
                    onChange={e => setFormData({...formData, key: e.target.value})} 
                    required 
                    disabled={modalMode === 'edit'}
                  />
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Bu kod tizimda mantiqiy bog'lanishlar uchun ishlatiladi (kichik harflarda).
                  </p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Tavsif</label>
                  <textarea 
                    style={{ 
                      width: '100%', height: '100px', padding: '12px', 
                      background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)',
                      borderRadius: '8px', color: '#fff', fontSize: '14px', resize: 'none'
                    }} 
                    placeholder="Bo'lim haqida qisqacha ma'lumot..."
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
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

export default Departments;
