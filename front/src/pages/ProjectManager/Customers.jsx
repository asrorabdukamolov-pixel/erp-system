import React, { useState } from 'react';
import { UserPlus, Check, X, Phone, MapPin, Home, FileText, Smartphone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NewCustomer = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '+998 ',
    address: '',
    houseNumber: '',
    apartmentNumber: '',
    extraInfo: ''
  });

  const [message, setMessage] = useState('');

  const formatPhone = (val) => {
    // Keep '+998 ' prefix
    if (!val.startsWith('+998 ')) val = '+998 ';
    
    // Remove all non-digits except the +
    const digits = val.slice(5).replace(/\D/g, '');
    
    // Limit to 9 digits (standard UZ phone length after +998)
    const limited = digits.substring(0, 9);
    
    // Format: XX XXX XX XX
    let formatted = '+998 ';
    if (limited.length > 0) formatted += limited.substring(0, 2);
    if (limited.length > 2) formatted += ' ' + limited.substring(2, 5);
    if (limited.length > 5) formatted += ' ' + limited.substring(5, 7);
    if (limited.length > 7) formatted += ' ' + limited.substring(7, 9);
    
    return formatted;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      setFormData({ ...formData, [name]: formatPhone(value) });
    } else if (name === 'houseNumber' || name === 'apartmentNumber') {
      // Numbers only
      setFormData({ ...formData, [name]: value.replace(/\D/g, '') });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    // Get existing customers
    const customers = JSON.parse(localStorage.getItem('erp_customers') || '[]');
    
    // Generate Sequential ID
    const lastId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) : 0;
    
    const newCustomer = {
      id: lastId + 1,
      ...formData,
      managerId: user.id,
      managerName: user.name,
      showroom: user.showroom || 'Toshkent Central', // Mock showroom
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('erp_customers', JSON.stringify([...customers, newCustomer]));
    
    setMessage('Mijoz muvaffaqiyatli saqlandi!');
    setFormData({
      firstName: '',
      lastName: '',
      phone: '+998 ',
      address: '',
      houseNumber: '',
      apartmentNumber: '',
      extraInfo: ''
    });

    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Yangi Mijoz Qo'shish</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Mijoz ma'lumotlarini bazaga kiriting. Tel raqam formatiga e'tibor bering.</p>
      </div>

      {message && (
        <div style={{ 
          background: 'rgba(16, 185, 129, 0.1)', 
          color: '#10b981', 
          padding: '16px', 
          borderRadius: '12px', 
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <Check size={20} />
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="premium-card" style={{ padding: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Ism</label>
            <input name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="Masalan: Ali" style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Familiya</label>
            <input name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Masalan: Valiyev" style={{ width: '100%' }} />
          </div>
          
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Telefon Raqami</label>
            <div style={{ position: 'relative' }}>
              <Smartphone size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input name="phone" value={formData.phone} onChange={handleChange} required style={{ width: '100%', paddingLeft: '48px', letterSpacing: '1px' }} placeholder="+998 90 123 45 67" />
            </div>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Yashash Manzili</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input name="address" value={formData.address} onChange={handleChange} required placeholder="Shahar, Tuman, Ko'cha" style={{ width: '100%', paddingLeft: '48px' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Uy Raqami</label>
            <div style={{ position: 'relative' }}>
              <Home size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input name="houseNumber" value={formData.houseNumber} onChange={handleChange} placeholder="Masalan: 45" style={{ width: '100%', paddingLeft: '48px' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Kvartira Nomeri</label>
            <input name="apartmentNumber" value={formData.apartmentNumber} onChange={handleChange} placeholder="Masalan: 12" style={{ width: '100%' }} />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Qo'shimcha Ma'lumot</label>
            <div style={{ position: 'relative' }}>
              <FileText size={18} style={{ position: 'absolute', left: '16px', top: '20px', color: 'var(--text-secondary)' }} />
              <textarea 
                name="extraInfo" 
                value={formData.extraInfo} 
                onChange={handleChange} 
                placeholder="Mijoz haqida qo'shimcha eslatmalar..." 
                style={{ width: '100%', paddingLeft: '48px', minHeight: '120px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', padding: '16px 16px 16px 48px', fontFamily: 'inherit' }} 
              />
            </div>
          </div>
        </div>

        <div style={{ marginTop: '40px', display: 'flex', gap: '16px' }}>
          <button type="button" onClick={() => navigate(-1)} className="secondary-btn" style={{ flex: 1 }}>Bekor Qilish</button>
          <button type="submit" className="gold-btn" style={{ flex: 1, justifyContent: 'center', padding: '16px' }}>
            <UserPlus size={20} />
            Mijozni Saqlash
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewCustomer;
