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
  MapPin
} from 'lucide-react';
import api from '../../utils/api';

const ShowroomPartners = () => {
  const [partners, setPartners] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPartner, setEditingPartner] = useState(null);
  
  const [formData, setFormData] = useState({
    companyName: '',
    responsiblePerson: '',
    phone: '',
    address: ''
  });

  const loadPartners = async () => {
    try {
      const res = await api.get('/partners');
      setPartners(res.data);
    } catch (err) {
      console.error("Partners fetch error", err);
    }
  };

  useEffect(() => {
    loadPartners();
  }, []);

  const handleSave = async () => {
    if (!formData.companyName || !formData.responsiblePerson || !formData.phone || !formData.address) {
      alert('Iltimos, barcha maydonlarni to\'ldiring!');
      return;
    }

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
      alert("Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Haqiqatdan ham ushbu hamkorni o\'chirmoqchimisiz?')) {
      try {
        await api.delete(`/partners/${id}`);
        loadPartners();
      } catch (err) {
        console.error("Delete error", err);
        alert("Xatolik yuz berdi");
      }
    }
  };

  const openModal = (partner = null) => {
    if (partner) {
      setEditingPartner(partner);
      setFormData({ 
        companyName: partner.companyName, 
        responsiblePerson: partner.responsiblePerson,
        phone: partner.phone,
        address: partner.address
      });
    } else {
      setEditingPartner(null);
      setFormData({ 
        companyName: '', 
        responsiblePerson: '',
        phone: '',
        address: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPartner(null);
    setFormData({ 
      companyName: '', 
      responsiblePerson: '',
      phone: '',
      address: ''
    });
  };

  const filteredPartners = partners.filter(p => 
    p.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.responsiblePerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'white', marginBottom: '8px' }}>Hamkorlar</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Tashqi hamkorlar va yetkazib beruvchilar ro'yxati</p>
        </div>
        <button 
          onClick={() => openModal()}
          style={{ 
            background: 'var(--accent-gold)', 
            color: '#0f172a', 
            padding: '16px 32px', 
            borderRadius: '16px', 
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 20px rgba(212,175,55,0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(212,175,55,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(212,175,55,0.3)';
          }}
        >
          <Plus size={22} />
          Yangi Hamkor
        </button>
      </div>

      <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Firma nomi yoki mas'ul shaxs bo'yicha qidirish..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%', 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '14px', 
                padding: '14px 16px 14px 48px',
                color: 'white',
                outline: 'none',
                fontSize: '15px'
              }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Firma Nomi</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Mas'ul Xodim</th>
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
                          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)' }}>
                             <Building2 size={20} />
                          </div>
                          <span style={{ fontWeight: '800', fontSize: '15px' }}>{partner.companyName}</span>
                       </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <User size={16} color="var(--text-secondary)" />
                          <span style={{ fontSize: '14px', fontWeight: '600' }}>{partner.responsiblePerson}</span>
                       </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Phone size={16} color="#10b981" />
                          <span style={{ fontSize: '14px', fontWeight: '700' }}>{partner.phone}</span>
                       </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MapPin size={16} color="#3b82f6" />
                          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{partner.address}</span>
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

      {/* Large Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: 'var(--secondary-bg)', width: '100%', maxWidth: '700px', borderRadius: '32px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <div style={{ padding: '32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
              <div>
                <h2 style={{ fontSize: '26px', fontWeight: '900', color: 'white', marginBottom: '4px' }}>{editingPartner ? 'Hamkorni Tahrirlash' : 'Yangi Hamkor Qo\'shish'}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Iltimos, hamkor haqidagi barcha ma'lumotlarni to'ldiring.</p>
              </div>
              <button onClick={closeModal} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '10px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Firma Nomi</label>
                <div style={{ position: 'relative' }}>
                   <Building2 size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} />
                   <input 
                    type="text" 
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Masalan: Artel Mebel"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '16px 16px 16px 48px', color: 'white', outline: 'none', fontSize: '15px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '10px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mas'ul Xodim Ism-Familiyasi</label>
                <div style={{ position: 'relative' }}>
                   <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} />
                   <input 
                    type="text" 
                    value={formData.responsiblePerson}
                    onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
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
            </div>

            <div style={{ padding: '32px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.02)' }}>
              <button 
                onClick={closeModal}
                style={{ flex: 1, padding: '18px', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'transparent', color: 'white', fontWeight: '700', cursor: 'pointer', transition: '0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Bekor Qilish
              </button>
              <button 
                onClick={handleSave}
                style={{ flex: 2, padding: '18px', borderRadius: '16px', border: 'none', background: 'var(--accent-gold)', color: '#0f172a', fontWeight: '900', cursor: 'pointer', fontSize: '16px', transition: '0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {editingPartner ? 'O\'zgarishlarni Saqlash' : 'Hamkorni Ro\'yxatga Qo\'shish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowroomPartners;
