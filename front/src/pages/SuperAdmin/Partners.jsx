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
  Filter
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
    firm: '',
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
    if (!formData.firm) {
      alert('Iltimos, firma/brend nomini kiriting!');
      return;
    }

    setIsSaving(true);
    // Prepare data (name is required by backend, so use firm name)
    const dataToSave = {
        ...formData,
        name: formData.firm 
    };

    try {
      if (editingPartner) {
        const res = await api.put(`/partners/${editingPartner._id}`, dataToSave);
        setPartners(partners.map(p => p._id === editingPartner._id ? res.data : p));
      } else {
        const res = await api.post('/partners', dataToSave);
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
    if (window.confirm('Haqiqatdan ham o\'chirmoqchimisiz?')) {
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
        firm: partner.firm || partner.name || '',
        logo: partner.logo || ''
      });
    } else {
      setEditingPartner(null);
      setFormData({ 
        firm: '',
        logo: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPartner(null);
    setFormData({ 
      firm: '',
      logo: ''
    });
  };

  const filteredPartners = partners.filter(p => {
    const nameMatch = (p.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const firmMatch = (p.firm?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return nameMatch || firmMatch;
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
          <p style={{ color: 'var(--text-secondary)' }}>Loyihada ishlatiladigan brendlar va hamkor logotiplari</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="gold-btn"
          style={{ padding: '14px 24px', borderRadius: '12px' }}
        >
          <Plus size={20} />
          Yangi Brend/Hamkor
        </button>
      </div>

      <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Qidirish..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '52px', height: '48px', borderRadius: '12px' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Logotip</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Firma / Brend Nomi</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '100px', color: 'var(--text-secondary)' }}>
                    Ma'lumot topilmadi.
                  </td>
                </tr>
              ) : (
                filteredPartners.map((partner) => (
                  <tr key={partner._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: '0.3s' }}>
                    <td style={{ padding: '20px 24px' }}>
                       <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                          {partner.logo ? <img src={partner.logo} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <ImageIcon size={24} color="#ccc" />}
                       </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                       <span style={{ fontWeight: '800', fontSize: '16px' }}>{partner.firm || partner.name}</span>
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
          <div style={{ background: 'var(--secondary-bg)', width: '100%', maxWidth: '500px', borderRadius: '32px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <div style={{ padding: '32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'white' }}>{editingPartner ? 'Tahrirlash' : 'Yangi ma\'lumot qo\'shish'}</h2>
              <button onClick={closeModal} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '10px', fontSize: '13px', fontWeight: '700' }}>Firma / Brend Nomi</label>
                <input 
                  type="text" 
                  value={formData.firm}
                  onChange={(e) => setFormData({ ...formData, firm: e.target.value })}
                  placeholder="Masalan: HOMAG"
                  style={{ width: '100%', height: '52px', borderRadius: '14px', fontSize: '15px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '10px', fontSize: '13px', fontWeight: '700' }}>Logotip</label>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div 
                    onClick={() => document.getElementById('admin-logo-upload').click()}
                    style={{ 
                        width: '100px', 
                        height: '100px', 
                        border: '2px dashed var(--border-color)', 
                        borderRadius: '20px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer', 
                        background: formData.logo ? 'white' : 'rgba(255,255,255,0.02)', 
                        overflow: 'hidden',
                        transition: '0.3s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                  >
                    {formData.logo ? <img src={formData.logo} alt="Preview" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} /> : <ImageIcon size={32} color="var(--text-secondary)" />}
                  </div>
                  <input id="admin-logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        Tijorat taklifida (PDF) chiroyli ko'rinishi uchun tiniq va orqa foni yo'q (PNG) rasmdan foydalanish tavsiya etiladi.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '32px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.01)' }}>
              <button onClick={closeModal} style={{ flex: 1, height: '56px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white', fontWeight: '700' }}>Bekor qilish</button>
              <button onClick={handleSave} disabled={isSaving} style={{ flex: 2, height: '56px', borderRadius: '16px', border: 'none', background: 'var(--accent-gold)', color: '#000', fontWeight: '900', fontSize: '16px' }}>{isSaving ? 'Saqlanmoqda...' : 'Saqlash'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Partners;
