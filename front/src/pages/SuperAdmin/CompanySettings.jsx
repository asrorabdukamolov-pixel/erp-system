import React, { useState, useEffect } from 'react';
import { Building2, Phone, Globe, MapPin, Save, Upload, Info, CheckCircle2 } from 'lucide-react';
import api from '../../utils/api';

const CompanySettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    companyName: 'EXPRESS MEBEL',
    companyPhone: '+998 88 737 54 43',
    companyLogo: '',
    companyAddress: "Toshkent sh. Jomiy ko'chasi",
    instagram: 'instagram.com/express_mebel__uz',
    telegram: 't.me/expressmebel'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data) {
          setFormData(res.data);
        }
      } catch (err) {
        console.error("Settings fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await api.put('/settings', formData);
      setMessage({ type: 'success', text: 'Ma\'lumotlar muvaffaqiyatli saqlandi!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error("Saqlashda xatolik yuz berdi:", err);
      const errorMsg = err.response?.data?.message || err.response?.data?.msg || (err.message === 'Network Error' ? 'Tarmoq xatosi: Server bilan aloqa o\'rnatib bo\'lmadi' : 'Saqlashda xatolik yuz berdi.');
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Increased to 2MB as some logos can be slightly larger
        setMessage({ type: 'error', text: 'Rasm hajmi juda katta! Maksimal 2MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, [field]: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Yuklanmoqda...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Kompaniya ma'lumotlari</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Ushbu ma'lumotlar barcha Tijorat Takliflari (KP) va hisobotlarda avtomatik ravishda aks etadi.
        </p>
      </div>

      {message.text && (
        <div style={{ 
          padding: '16px 20px', 
          borderRadius: '12px', 
          marginBottom: '24px',
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: message.type === 'success' ? '#10b981' : '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
        }}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <Info size={20} />}
          <span style={{ fontWeight: '600' }}>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="premium-card" style={{ padding: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* Logo Section */}
          <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
              <div style={{ width: '100px', height: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                {formData.companyLogo ? (
                  <img src={formData.companyLogo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <Building2 size={40} color="var(--text-secondary)" style={{ opacity: 0.3 }} />
                )}
              </div>
              <div>
                <h4 style={{ fontSize: '15px', marginBottom: '4px', fontWeight: '700' }}>Tizim Logotipi</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Chap yuqori burchakda ko'rinadi.</p>
                <label className="secondary-btn" style={{ cursor: 'pointer', padding: '8px 16px', fontSize: '12px' }}>
                  <Upload size={14} /> Yuklash
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleLogoUpload(e, 'companyLogo')} />
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
              <div style={{ width: '100px', height: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                {formData.kpLogo ? (
                  <img src={formData.kpLogo} alt="KP Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <FileText size={40} color="var(--text-secondary)" style={{ opacity: 0.3 }} />
                )}
              </div>
              <div>
                <h4 style={{ fontSize: '15px', marginBottom: '4px', fontWeight: '700' }}>KP Logotipi</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Tijorat Takliflarida (PDF) ko'rinadi.</p>
                <label className="secondary-btn" style={{ cursor: 'pointer', padding: '8px 16px', fontSize: '12px' }}>
                  <Upload size={14} /> Yuklash
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleLogoUpload(e, 'kpLogo')} />
                </label>
              </div>
            </div>
          </div>

          {/* Company Name */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Building2 size={14} /> Kompaniya Nomi</div>
            </label>
            <input 
              style={{ width: '100%', fontSize: '16px', fontWeight: '600' }} 
              value={formData.companyName} 
              onChange={e => setFormData({ ...formData, companyName: e.target.value })} 
              required 
            />
          </div>

          {/* Phone */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> Call-Center Telefon</div>
            </label>
            <input 
              style={{ width: '100%' }} 
              value={formData.companyPhone} 
              onChange={e => setFormData({ ...formData, companyPhone: e.target.value })} 
              required 
            />
          </div>

          {/* Address */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> Manzil</div>
            </label>
            <input 
              style={{ width: '100%' }} 
              value={formData.companyAddress} 
              onChange={e => setFormData({ ...formData, companyAddress: e.target.value })} 
              required 
            />
          </div>

          {/* Socials */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Globe size={14} /> Instagram Link</div>
            </label>
            <input 
              style={{ width: '100%' }} 
              value={formData.instagram} 
              onChange={e => setFormData({ ...formData, instagram: e.target.value })} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Globe size={14} /> Telegram Link</div>
            </label>
            <input 
              style={{ width: '100%' }} 
              value={formData.telegram} 
              onChange={e => setFormData({ ...formData, telegram: e.target.value })} 
            />
          </div>

        </div>

        <div style={{ marginTop: '40px', borderTop: '1px solid var(--border-color)', paddingTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="gold-btn" disabled={saving} style={{ minWidth: '200px', justifyContent: 'center' }}>
            <Save size={20} />
            {saving ? 'Saqlanmoqda...' : 'O\'zgarishlarni saqlash'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanySettings;
