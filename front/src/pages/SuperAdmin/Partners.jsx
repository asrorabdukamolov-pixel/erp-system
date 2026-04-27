import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Search, 
  X, 
  Edit2,
  Building2,
  Upload,
  User,
  Phone,
  MapPin,
  Filter,
  Store
} from 'lucide-react';
import api from '../../utils/api';

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [showrooms, setShowrooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShowroom, setFilterShowroom] = useState('all');
  const [editingPartner, setEditingPartner] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    firm: '',
    phone: '',
    address: '',
    logo: ''
  });

  const [companySettings, setCompanySettings] = useState(null);
  const [logoSaving, setLogoSaving] = useState(false);
  const [isLogoLoading, setIsLogoLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [partRes, settRes, showRes] = await Promise.all([
          api.get('/partners'),
          api.get('/settings'),
          api.get('/showrooms')
        ]);
        setPartners(partRes.data);
        setCompanySettings(settRes.data);
        setShowrooms(showRes.data);
      } catch (err) {
        console.error("Data load error", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleCompanyLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        alert('Rasm hajmi juda katta! Maksimal 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        setLogoSaving(true);
        try {
          const updated = { ...companySettings, kpLogo: reader.result };
          await api.put('/settings', updated);
          setCompanySettings(updated);
          alert('Tijorat taklifi (KP) logotipi muvaffaqiyatli yangilandi!');
        } catch (err) {
          const errorMsg = err.response?.data?.message || err.response?.data?.msg || err.message;
          alert('Xatolik: ' + errorMsg);
        } finally {
          setLogoSaving(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        alert('Rasm hajmi juda katta! Maksimal 1MB.');
        return;
      }
      const reader = new FileReader();
      setIsLogoLoading(true);
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo: reader.result }));
        setIsLogoLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.firm) {
      alert('Iltimos, kamida firma nomi va mas\'ul shaxsni kiriting!');
      return;
    }

    setIsSaving(true);
    try {
      if (editingPartner) {
        const res = await api.put(`/partners/${editingPartner._id}`, formData);
        setPartners(partners.map(p => p._id === editingPartner._id ? res.data : p));
      } else {
        const res = await api.post('/partners', formData);
        setPartners([...partners, res.data]);
      }
      closeModal();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.msg || err.message;
      alert('Saqlashda xatolik: ' + errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Haqiqatdan ham ushbu hamkorni o\'chirmoqchimisiz?')) {
      try {
        await api.delete(`/partners/${id}`);
        setPartners(partners.filter(p => p._id !== id));
      } catch (err) {
        alert('O\'chirishda xatolik!');
      }
    }
  };

  const openModal = (partner = null) => {
    if (partner) {
      setEditingPartner(partner);
      setFormData({ 
        name: partner.name, 
        firm: partner.firm || '',
        phone: partner.phone || '',
        address: partner.address || '',
        logo: partner.logo || ''
      });
    } else {
      setEditingPartner(null);
      setFormData({ 
        name: '', 
        firm: '',
        phone: '',
        address: '',
        logo: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPartner(null);
    setFormData({ 
      name: '', 
      firm: '',
      phone: '',
      address: '',
      logo: ''
    });
  };

  const filteredPartners = partners.filter(p => {
    const matchesSearch = 
      (p.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (p.firm?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesShowroom = filterShowroom === 'all' || p.showroom === filterShowroom;
    
    return matchesSearch && matchesShowroom;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '20px' }}>
         <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
         <p style={{ color: 'var(--text-secondary)' }}>Ma'lumotlar yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px' }}>
      {/* Company Logo Section */}
      <div className="premium-card" style={{ 
        background: 'rgba(255,255,255,0.02)', 
        border: '1px dashed var(--border-color)', 
        borderRadius: '24px', 
        padding: '30px', 
        marginBottom: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '30px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ 
            width: '120px', 
            height: '120px', 
            background: 'white', 
            borderRadius: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            flexShrink: 0,
            position: 'relative',
            overflow: 'hidden'
          }}>
          {companySettings?.kpLogo ? (
            <img src={companySettings.kpLogo} alt="KP Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            ) : (
              <Building2 size={40} color="#ccc" />
            )}
            {logoSaving && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px' }}>...</div>
            )}
          </div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'white', marginBottom: '6px' }}>Kompaniya Logotipi</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '400px' }}>
            Ushbu logotip faqat barcha Tijorat Takliflari (KP) va hisobotlarda brend belgisi sifatida ishlatiladi.
            </p>
          </div>
        </div>
        
        <label style={{ 
          background: 'rgba(255,255,255,0.05)', 
          color: 'white', 
          padding: '14px 24px', 
          borderRadius: '12px', 
          border: '1px solid var(--border-color)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: '600',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        >
          <Upload size={20} />
          {companySettings?.kpLogo ? 'Logotipni almashtirish' : 'Logotip yuklash'}
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCompanyLogoUpload} disabled={logoSaving} />
        </label>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: 'white', marginBottom: '8px' }}>Tijorat taklifi identikasi</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Barcha showroomlardan yig'ilgan hamkorlar va brendlar ro'yxati</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="gold-btn"
          style={{ padding: '14px 24px', borderRadius: '12px' }}
        >
          <Plus size={20} />
          Yangi Ma'lumot
        </button>
      </div>

      <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
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
          
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Filter size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <select 
              value={filterShowroom} 
              onChange={(e) => setFilterShowroom(e.target.value)}
              style={{ width: '100%', paddingLeft: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', outline: 'none' }}
            >
              <option value="all">Barcha Showroomlar</option>
              {showrooms.map(s => (
                <option key={s._id} value={s.name} style={{ color: '#000' }}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Firma / Brend</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Mas'ul</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Showroom</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Telefon</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '100px', color: 'var(--text-secondary)' }}>
                    {searchTerm || filterShowroom !== 'all' ? 'Qidiruv bo\'yicha ma\'lumot topilmadi.' : 'Ma\'lumotlar hali qo\'shilmagan.'}
                  </td>
                </tr>
              ) : (
                filteredPartners.map((partner) => (
                  <tr key={partner._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: '0.3s' }}>
                    <td style={{ padding: '20px 24px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', overflow: 'hidden' }}>
                             {partner.logo ? <img src={partner.logo} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <Building2 size={20} color="var(--accent-gold)" />}
                          </div>
                          <span style={{ fontWeight: '800', fontSize: '15px' }}>{partner.firm || partner.name}</span>
                       </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <User size={16} color="var(--text-secondary)" />
                          <span style={{ fontSize: '14px', fontWeight: '600' }}>{partner.name}</span>
                       </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)' }}>
                          <Store size={16} />
                          <span style={{ fontSize: '13px', fontWeight: '800' }}>{partner.showroom || 'Asosiy'}</span>
                       </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Phone size={16} color="#10b981" />
                          <span style={{ fontSize: '14px', fontWeight: '700' }}>{partner.phone || '—'}</span>
                       </div>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                       <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => openModal(partner)}
                            style={{ background: 'rgba(251,191,36,0.1)', color: 'var(--accent-gold)', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer' }}
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(partner._id)}
                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer' }}
                          >
                            <Trash2 size={18} />
                          </button>
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
              <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'white' }}>{editingPartner ? 'Ma\'lumotni tahrirlash' : 'Yangi ma\'lumot qo\'shish'}</h2>
              <button onClick={closeModal} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px', fontWeight: '700' }}>Firma / Brend Nomi</label>
                <input 
                  type="text" 
                  value={formData.firm}
                  onChange={(e) => setFormData({ ...formData, firm: e.target.value })}
                  placeholder="Masalan: HOMAG"
                  style={{ width: '100%', height: '48px', borderRadius: '12px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px', fontWeight: '700' }}>Mas'ul Shaxs</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ism sharifi"
                  style={{ width: '100%', height: '48px', borderRadius: '12px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px', fontWeight: '700' }}>Telefon</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+998..."
                    style={{ width: '100%', height: '48px', borderRadius: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px', fontWeight: '700' }}>Manzil</label>
                  <input 
                    type="text" 
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Shahar, tuman"
                    style={{ width: '100%', height: '48px', borderRadius: '12px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px', fontWeight: '700' }}>Logotip</label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div 
                    onClick={() => document.getElementById('admin-logo-upload').click()}
                    style={{ width: '80px', height: '80px', border: '2px dashed var(--border-color)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: formData.logo ? 'white' : 'transparent', overflow: 'hidden' }}
                  >
                    {formData.logo ? <img src={formData.logo} alt="Preview" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} /> : <ImageIcon size={24} color="var(--text-secondary)" />}
                  </div>
                  <input id="admin-logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Logotip barcha showroomlar uchun ko'rinadi.</p>
                </div>
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

export default Partners;
