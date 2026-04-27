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
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import api from '../../utils/api';

const ShowroomPartners = () => {
  const [partners, setPartners] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPartner, setEditingPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    firm: '',
    phone: '',
    address: '',
    logo: ''
  });

  const loadPartners = async () => {
    try {
      setLoading(true);
      const res = await api.get('/partners');
      setPartners(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Partners fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, []);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        alert('Rasm hajmi juda katta! Maksimal 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo: reader.result }));
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
        await api.put(`/partners/${editingPartner._id}`, formData);
      } else {
        await api.post('/partners', formData);
      }
      loadPartners();
      closeModal();
    } catch (err) {
      console.error("Save error", err);
      alert("Saqlashda xatolik yuz berdi");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Haqiqatdan ham ushbu hamkorni o\'chirmoqchimisiz?')) {
      try {
        await api.delete(`/partners/${id}`);
        loadPartners();
      } catch (err) {
        console.error("Delete error", err);
        alert("O\'chirishda xatolik yuz berdi");
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

  const filteredPartners = (Array.isArray(partners) ? partners : []).filter(p => 
    (p.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (p.firm?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '20px' }}>
         <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
         <p style={{ color: 'var(--text-secondary)' }}>Hamkorlar yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'white', marginBottom: '8px' }}>Hamkorlar</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Loyihada ishlatiladigan tashqi hamkorlar va yetkazib beruvchilar ro'yxati</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="gold-btn"
          style={{ padding: '14px 28px', borderRadius: '16px', fontSize: '15px' }}
        >
          <Plus size={20} />
          Yangi Hamkor Qo'shish
        </button>
      </div>

      <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Firma yoki mas'ul shaxs bo'yicha qidirish..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '52px', height: '52px', borderRadius: '16px' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Firma / Hamkor</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Mas'ul</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Telefon</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Manzil</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '100px', color: 'var(--text-secondary)' }}>
                    {searchTerm ? 'Qidiruv bo\'yicha hamkor topilmadi.' : 'Hamkorlar hali qo\'shilmagan.'}
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
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Phone size={16} color="#10b981" />
                          <span style={{ fontSize: '14px', fontWeight: '700' }}>{partner.phone || '—'}</span>
                       </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MapPin size={16} color="#3b82f6" />
                          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{partner.address || '—'}</span>
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
          <div style={{ background: 'var(--secondary-bg)', width: '100%', maxWidth: '700px', borderRadius: '32px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <div style={{ padding: '32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
              <div>
                <h2 style={{ fontSize: '26px', fontWeight: '900', color: 'white', marginBottom: '4px' }}>{editingPartner ? 'Hamkorni Tahrirlash' : 'Yangi Hamkor Qo\'shish'}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Hamkor haqidagi to'liq ma'lumotlarni kiriting.</p>
              </div>
              <button onClick={closeModal} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '12px', borderRadius: '50%', cursor: 'pointer', transition: '0.2s' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '10px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Firma Nomi</label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} />
                    <input 
                      type="text" 
                      value={formData.firm}
                      onChange={(e) => setFormData({ ...formData, firm: e.target.value })}
                      placeholder="Masalan: Artel Mebel"
                      style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '16px 16px 16px 48px', color: 'white', outline: 'none', fontSize: '15px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '10px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mas'ul Xodim Ismi</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} />
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Masalan: Alisher Vohidov"
                      style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '16px 16px 16px 48px', color: 'white', outline: 'none', fontSize: '15px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '10px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Telefon Raqami</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} />
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+998 90 123 45 67"
                      style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '16px 16px 16px 48px', color: 'white', outline: 'none', fontSize: '15px' }}
                    />
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '10px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Manzil</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} />
                    <input 
                      type="text" 
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Shahar, Tuman, Ko'cha, Uy raqami"
                      style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '16px 16px 16px 48px', color: 'white', outline: 'none', fontSize: '15px' }}
                    />
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '10px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Logotip</label>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div 
                      onClick={() => document.getElementById('logo-upload').click()}
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
                        overflow: 'hidden'
                      }}
                    >
                      {formData.logo ? (
                        <img src={formData.logo} alt="Preview" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
                      ) : <ImageIcon size={30} color="var(--text-secondary)" />}
                    </div>
                    <div style={{ flex: 1 }}>
                       <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>PNG yoki JPG formatdagi logotip (Maks 1MB)</p>
                       <button 
                        onClick={() => document.getElementById('logo-upload').click()}
                        style={{ padding: '8px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', fontSize: '13px', cursor: 'pointer' }}
                       >
                         Rasmni Tanlash
                       </button>
                    </div>
                  </div>
                  <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                </div>
              </div>
            </div>

            <div style={{ padding: '32px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.02)' }}>
              <button 
                onClick={closeModal}
                style={{ flex: 1, padding: '18px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white', fontWeight: '700', cursor: 'pointer' }}
              >
                Bekor qilish
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                style={{ 
                  flex: 2, 
                  padding: '18px', 
                  borderRadius: '16px', 
                  border: 'none', 
                  background: isSaving ? 'rgba(255,255,255,0.1)' : 'var(--accent-gold)', 
                  color: isSaving ? 'var(--text-secondary)' : '#0f172a', 
                  fontWeight: '900', 
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  fontSize: '16px'
                }}
              >
                {isSaving ? 'Saqlanmoqda...' : (editingPartner ? 'O\'zgarishlarni Saqlash' : 'Hamkorni Qo\'shish')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowroomPartners;
