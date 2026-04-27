import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Search, 
  X, 
  Edit2,
  Check,
  Building2,
  Upload,
  Info
} from 'lucide-react';
import api from '../../utils/api';

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPartner, setEditingPartner] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    logo: ''
  });

  const [companySettings, setCompanySettings] = useState(null);
  const [logoSaving, setLogoSaving] = useState(false);
  const [isLogoLoading, setIsLogoLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [partRes, settRes] = await Promise.all([
          api.get('/partners'),
          api.get('/settings')
        ]);
        setPartners(partRes.data);
        setCompanySettings(settRes.data);
      } catch (err) {
        console.error("Data load error", err);
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
          const errorMsg = err.response?.data?.message || err.response?.data?.msg || (err.message === 'Network Error' ? 'Tarmoq xatosi: Server bilan aloqa o\'rnatib bo\'lmadi' : err.message);
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
      reader.onerror = () => {
        alert('Rasm o\'qishda xatolik yuz berdi!');
        setIsLogoLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.logo) {
      alert('Iltimos, barcha maydonlarni to\'ldiring!');
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
      const errorMsg = err.response?.data?.message || err.response?.data?.msg || (err.message === 'Network Error' ? 'Tarmoq xatosi: Server bilan aloqa o\'rnatib bo\'lmadi' : err.message);
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
      setFormData({ name: partner.name, logo: partner.logo });
    } else {
      setEditingPartner(null);
      setFormData({ name: '', logo: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPartner(null);
    setFormData({ name: '', logo: '' });
  };

  const filteredPartners = partners.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '30px' }}>
      {/* Company Logo Section */}
      <div style={{ 
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
          <p style={{ color: 'var(--text-secondary)' }}>Tijorat taklifida ishlatiladigan brend va hamkorlar ro'yxatini boshqarish</p>
        </div>
        <button 
          onClick={() => openModal()}
          style={{ 
            background: 'var(--accent-gold)', 
            color: '#0f172a', 
            padding: '14px 24px', 
            borderRadius: '12px', 
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: 'none',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Plus size={20} />
          Yangi Hamkor
        </button>
      </div>

      <div style={{ background: 'var(--secondary-bg)', borderRadius: '24px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Nomi bo'yicha qidirish..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%', 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '14px', 
                padding: '12px 16px 12px 48px',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {filteredPartners.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                {searchTerm ? 'Qidiruv bo\'yicha ma\'lumot topilmadi.' : 'Ma\'lumotlar hali qo\'shilmagan.'}
              </div>
            ) : (
              filteredPartners.map((partner) => (
                <div 
                  key={partner._id} 
                  style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '20px', 
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ 
                    height: '100px', 
                    background: 'white', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    padding: '15px'
                  }}>
                    <img src={partner.logo} alt={partner.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white' }}>{partner.name}</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => openModal(partner)}
                        style={{ background: 'rgba(251,191,36,0.1)', color: 'var(--accent-gold)', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(partner._id)}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modern Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'var(--secondary-bg)', width: '100%', maxWidth: '500px', borderRadius: '28px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <div style={{ padding: '30px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'white' }}>{editingPartner ? 'Ma\'lumotni tahrirlash' : 'Yangi ma\'lumot qo\'shish'}</h2>
              <button onClick={closeModal} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '10px', fontSize: '14px' }}>Hamkor nomi (Firma nomi)</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masalan: HOMAG"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '14px', color: 'white', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '10px', fontSize: '14px' }}>Logotip (PNG, JPG tavsiya etiladi)</label>
                <div 
                  onClick={() => document.getElementById('logo-upload').click()}
                  style={{ 
                    height: '160px', 
                    border: '2px dashed var(--border-color)', 
                    borderRadius: '20px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '12px',
                    cursor: 'pointer',
                    background: formData.logo ? 'white' : 'transparent',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {formData.logo ? (
                    <img src={formData.logo} alt="Logo preview" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
                  ) : isLogoLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Rasm yuklanmoqda...</span>
                    </div>
                  ) : (
                    <>
                      <ImageIcon size={40} color="var(--text-secondary)" />
                      <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Rasm yuklash uchun bosing</span>
                    </>
                  )}
                </div>
                <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
              </div>
            </div>

            <div style={{ padding: '30px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
              <button 
                onClick={closeModal}
                style={{ flex: 1, padding: '14px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white', fontWeight: '700', cursor: 'pointer' }}
              >
                Bekor qilish
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving || isLogoLoading}
                style={{ 
                  flex: 2, 
                  padding: '14px', 
                  borderRadius: '14px', 
                  border: 'none', 
                  background: isSaving || isLogoLoading ? 'rgba(255,255,255,0.1)' : 'var(--accent-gold)', 
                  color: isSaving || isLogoLoading ? 'var(--text-secondary)' : '#0f172a', 
                  fontWeight: '900', 
                  cursor: isSaving || isLogoLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Partners;
