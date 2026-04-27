import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  X, 
  Edit2,
  Building2,
  User,
  Phone,
  MapPin,
  Filter,
  Store
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const Suppliers = () => {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [showrooms, setShowrooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShowroom, setFilterShowroom] = useState('all');
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    firm: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [supRes, showRes] = await Promise.all([
          api.get('/suppliers'),
          user?.role === 'super' ? api.get('/showrooms') : Promise.resolve({ data: [] })
        ]);
        setSuppliers(supRes.data);
        setShowrooms(showRes.data);
      } catch (err) {
        console.error("Suppliers load error", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const handleSave = async () => {
    if (!formData.name || !formData.firm) {
      alert('Iltimos, kamida firma nomi va mas\'ul shaxsni kiriting!');
      return;
    }

    setIsSaving(true);
    try {
      if (editingSupplier) {
        const res = await api.put(`/suppliers/${editingSupplier._id}`, formData);
        setSuppliers(suppliers.map(s => s._id === editingSupplier._id ? res.data : s));
      } else {
        const res = await api.post('/suppliers', formData);
        setSuppliers([...suppliers, res.data]);
      }
      closeModal();
    } catch (err) {
      alert('Xatolik: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Haqiqatdan ham ushbu yetkazib beruvchini o\'chirmoqchimisiz?')) {
      try {
        await api.delete(`/suppliers/${id}`);
        setSuppliers(suppliers.filter(s => s._id !== id));
      } catch (err) {
        alert('O\'chirishda xatolik!');
      }
    }
  };

  const openModal = (supplier = null) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({ 
        name: supplier.name, 
        firm: supplier.firm || '',
        phone: supplier.phone || '',
        address: supplier.address || ''
      });
    } else {
      setEditingSupplier(null);
      setFormData({ name: '', firm: '', phone: '', address: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
    setFormData({ name: '', firm: '', phone: '', address: '' });
  };

  const filteredSuppliers = (Array.isArray(suppliers) ? suppliers : []).filter(s => {
    const matchesSearch = 
      (s.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (s.firm?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesShowroom = filterShowroom === 'all' || s.showroom === filterShowroom;
    
    return matchesSearch && matchesShowroom;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '20px' }}>
         <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
         <p style={{ color: 'var(--text-secondary)' }}>Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'white', marginBottom: '8px' }}>Yetkazib beruvchilar</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Moliya va xaridlar uchun yetkazib beruvchilar ro'yxati</p>
        </div>
        <button onClick={() => openModal()} className="gold-btn" style={{ padding: '14px 28px', borderRadius: '16px' }}>
          <Plus size={20} /> Yangi Yetkazib beruvchi
        </button>
      </div>

      <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '16px', flexWrap: 'wrap', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ position: 'relative', flex: 2, minWidth: '300px' }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Firma yoki shaxs nomi bo'yicha qidirish..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '52px', height: '48px', borderRadius: '12px' }}
            />
          </div>
          
          {user?.role === 'super' && (
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Filter size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <select 
                value={filterShowroom} 
                onChange={(e) => setFilterShowroom(e.target.value)}
                style={{ width: '100%', paddingLeft: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }}
              >
                <option value="all">Barcha Showroomlar</option>
                <option value="Global">Global (Super Admin)</option>
                {showrooms.map(s => <option key={s._id} value={s.name} style={{ color: '#000' }}>{s.name}</option>)}
              </select>
            </div>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Firma</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Mas'ul</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Telefon</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Showroom</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '100px', color: 'var(--text-secondary)' }}>Topilmadi.</td>
                </tr>
              ) : (
                filteredSuppliers.map((s) => (
                  <tr key={s._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Building2 size={18} color="var(--accent-gold)" />
                        </div>
                        <span style={{ fontWeight: '800' }}>{s.firm}</span>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={16} color="var(--text-secondary)" />
                        <span style={{ fontSize: '14px' }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Phone size={16} color="#10b981" />
                        <span style={{ fontSize: '14px', fontWeight: '700' }}>{s.phone || '—'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Store size={16} color={s.isGlobal ? "var(--accent-gold)" : "var(--text-secondary)"} />
                        <span style={{ fontSize: '13px', fontWeight: '800' }}>{s.isGlobal ? 'Global' : s.showroom}</span>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {(user?.role === 'super' || !s.isGlobal) && (
                          <>
                            <button onClick={() => openModal(s)} style={{ background: 'rgba(251,191,36,0.1)', color: 'var(--accent-gold)', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}><Edit2 size={18} /></button>
                            <button onClick={() => handleDelete(s._id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}><Trash2 size={18} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: 'var(--secondary-bg)', width: '100%', maxWidth: '600px', borderRadius: '32px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <div style={{ padding: '32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'white' }}>{editingSupplier ? 'Tahrirlash' : 'Yangi Yetkazib beruvchi'}</h2>
              <button onClick={closeModal} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px', fontWeight: '700' }}>Firma Nomi</label>
                <input type="text" value={formData.firm} onChange={(e) => setFormData({ ...formData, firm: e.target.value })} placeholder="Firma nomi" style={{ width: '100%', height: '48px', borderRadius: '12px' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px', fontWeight: '700' }}>Mas'ul Shaxs</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ism sharifi" style={{ width: '100%', height: '48px', borderRadius: '12px' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px', fontWeight: '700' }}>Telefon</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+998..." style={{ width: '100%', height: '48px', borderRadius: '12px' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px', fontWeight: '700' }}>Manzil</label>
                <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Shahar, tuman" style={{ width: '100%', height: '48px', borderRadius: '12px' }} />
              </div>
            </div>

            <div style={{ padding: '32px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.01)' }}>
              <button onClick={closeModal} style={{ flex: 1, height: '52px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white', fontWeight: '700' }}>Bekor qilish</button>
              <button onClick={handleSave} disabled={isSaving} style={{ flex: 2, height: '52px', borderRadius: '14px', border: 'none', background: 'var(--accent-gold)', color: '#000', fontWeight: '900' }}>{isSaving ? 'Saqlanmoqda...' : 'Saqlash'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
