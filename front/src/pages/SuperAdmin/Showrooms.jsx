import React, { useState, useEffect } from 'react';
import { Store, Plus, Search, Edit2, Trash2, MapPin, User, ShieldAlert, X, Check, ArrowRight, ShieldCheck, Clock, Ban, Eye, EyeOff } from 'lucide-react';

const Showrooms = () => {
  // Load initial showrooms from localStorage
  const [showrooms, setShowrooms] = useState(() => {
    const saved = localStorage.getItem('erp_showrooms');
    if (saved) return JSON.parse(saved);
    
    // Default data if empty
    return [
      {
        id: 1,
        name: 'Olmazor',
        address: 'Toshkent sh., Olmazor tumani, Kichik xalqa yo\'li, 12-uy',
        adminName: 'Aziz',
        adminSurname: 'Rahimov',
        login: 'olmazor',
        password: '123',
        status: 'Faol'
      },
      {
        id: 2,
        name: 'Shayxontohur',
        address: 'Toshkent sh., Shayxontohur tumani, Labzak ko\'chasi, 45-uy',
        adminName: 'Malika',
        adminSurname: 'Karimova',
        login: 'shayxon',
        password: '123',
        status: 'Faol'
      }
    ];
  });

  // Save to localStorage whenever showrooms list changes
  useEffect(() => {
    localStorage.setItem('erp_showrooms', JSON.stringify(showrooms));
  }, [showrooms]);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentShowroom, setCurrentShowroom] = useState(null);

  // Delete States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [showroomToDelete, setShowroomToDelete] = useState(null);
  const [deleteCode, setDeleteCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isActiveDelete, setIsActiveDelete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    adminName: '',
    adminSurname: '',
    login: '',
    password: ''
  });

  // Countdown Timer logic
  useEffect(() => {
    let timer;
    if (isActiveDelete && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && isActiveDelete) {
      // Finalize Deletion
      setShowrooms(showrooms.filter(s => s.id !== showroomToDelete.id));
      setIsActiveDelete(false);
      setDeleteModalOpen(false);
      setShowroomToDelete(null);
    }
    return () => clearInterval(timer);
  }, [isActiveDelete, countdown, showrooms, showroomToDelete]);

  const handleOpenModal = (mode, showroom = null) => {
    setModalMode(mode);
    if (mode === 'edit' && showroom) {
      setCurrentShowroom(showroom);
      setFormData({
        name: showroom.name,
        address: showroom.address,
        adminName: showroom.adminName,
        adminSurname: showroom.adminSurname,
        login: showroom.login,
        password: '' 
      });
    } else {
      setFormData({ name: '', address: '', adminName: '', adminSurname: '', login: '', password: '' });
    }
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (modalMode === 'add') {
      const newShowroom = {
        id: Date.now(),
        ...formData,
        status: 'Faol'
      };
      setShowrooms([...showrooms, newShowroom]);
    } else {
      setShowrooms(showrooms.map(s => s.id === currentShowroom.id ? { ...s, ...formData } : s));
    }
    setIsModalOpen(false);
  };

  const startDeleteProcess = (showroom) => {
    setShowroomToDelete(showroom);
    setDeleteModalOpen(true);
    setDeleteCode('');
    setCountdown(0);
    setIsActiveDelete(false);
  };

  const confirmDeleteCode = () => {
    if (deleteCode === 'EXPRESS-DELETE') {
      setIsActiveDelete(true);
      setCountdown(60);
    } else {
      alert('Tasdiqlash kodi noto\'g\'ri!');
    }
  };

  const cancelDeletion = () => {
    setIsActiveDelete(false);
    setCountdown(0);
    setDeleteModalOpen(false);
    setShowroomToDelete(null);
  };

  const toggleStatus = (id) => {
    setShowrooms(showrooms.map(s => 
      s.id === id ? { ...s, status: s.status === 'Faol' ? 'Bloklangan' : 'Faol' } : s
    ));
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Showroomlar Boshqaruvi</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Hozircha tizimda showroomlar mavjud emas. Yangisini qo'shishingiz mumkin.</p>
        </div>
        <button className="gold-btn" onClick={() => handleOpenModal('add')}>
          <Plus size={20} />
          Yangi Showroom qo'shish
        </button>
      </div>

      {/* Main Table or Empty State */}
      <div className="premium-card">
        {showrooms.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  <th style={{ padding: '16px 8px' }}>Showroom va Manzil</th>
                  <th style={{ padding: '16px 8px' }}>Admin Ma'lumotlari</th>
                  <th style={{ padding: '16px 8px' }}>Login</th>
                  <th style={{ padding: '16px 8px' }}>Holati</th>
                  <th style={{ padding: '16px 8px', textAlign: 'right' }}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {showrooms.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '20px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'rgba(251, 191, 36, 0.1)', color: 'var(--accent-gold)', padding: '10px', borderRadius: '10px' }}>
                          <Store size={20} />
                        </div>
                        <div>
                          <p style={{ fontWeight: '600' }}>{s.name}</p>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} /> {s.address}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                        <User size={14} color="var(--text-secondary)" />
                        {s.adminName} {s.adminSurname}
                      </div>
                    </td>
                    <td style={{ padding: '20px 8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      {s.login}
                    </td>
                    <td style={{ padding: '20px 8px' }}>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        background: s.status === 'Faol' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: s.status === 'Faol' ? '#10b981' : '#ef4444',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        border: `1px solid ${s.status === 'Faol' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                      }}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ padding: '20px 8px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button onClick={() => toggleStatus(s.id)} style={{ padding: '8px', color: 'var(--text-secondary)', background: 'transparent' }} title="Bloklash/Aktivlashtirish">
                          <Ban size={18} />
                        </button>
                        <button onClick={() => handleOpenModal('edit', s)} style={{ padding: '8px', color: 'var(--text-secondary)', background: 'transparent' }} title="Tahrirlash">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => startDeleteProcess(s)} style={{ padding: '8px', color: '#ef4444', background: 'transparent' }} title="O'chirish">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ 
              width: '80px', height: '80px', background: 'rgba(251, 191, 36, 0.05)', 
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', border: '1px dashed var(--accent-gold)'
            }}>
              <Store size={40} color="var(--accent-gold)" style={{ opacity: 0.5 }} />
            </div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Showroomlar topilmadi</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
              Hozircha tizim toza holatda. "Yangi Showroom qo'shish" tugmasini bosib ishni boshlashingiz mumkin.
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="premium-card" style={{ width: '500px', maxWidth: '90%', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px' }}>{modalMode === 'add' ? 'Yangi Showroom qo\'shish' : 'Ma\'lumotlarni tahrirlash'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', color: 'var(--text-secondary)' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Showroom Nomi</label>
                  <input style={{ width: '100%' }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Manzil</label>
                  <input style={{ width: '100%' }} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Admin Ismi</label>
                  <input style={{ width: '100%' }} value={formData.adminName} onChange={e => setFormData({...formData, adminName: e.target.value})} required />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Admin Familiyasi</label>
                  <input style={{ width: '100%' }} value={formData.adminSurname} onChange={e => setFormData({...formData, adminSurname: e.target.value})} required />
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
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '28px',
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="secondary-btn" style={{ flex: 1 }}>Bekor qilish</button>
                <button type="submit" className="gold-btn" style={{ flex: 1, justifyContent: 'center' }}>
                  <Check size={18} /> Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(239, 68, 68, 0.1)', backdropFilter: 'blur(10px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100
        }}>
          <div className="premium-card" style={{ width: '450px', maxWidth: '90%', border: '1px solid #ef4444', padding: '32px', textAlign: 'center' }}>
            <div style={{ 
              width: '64px', height: '64px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <ShieldAlert size={32} />
            </div>
            
            {!isActiveDelete ? (
              <>
                <h3 style={{ fontSize: '22px', marginBottom: '12px' }}>Showroomni o'chirish</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
                  Diqqat! <b>"{showroomToDelete?.name}"</b> showroomini o'chirib yubormoqchisiz. 
                  Bu amalni bekor qilib bo'lmaydi. Davom etish uchun maxsus kodni kiriting.
                </p>
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '12px', color: '#ef4444', marginBottom: '8px', fontWeight: '600' }}>KOD: EXPRESS-DELETE</p>
                  <input 
                    style={{ width: '100%', textAlign: 'center', letterSpacing: '2px', border: '1px solid #ef4444' }} 
                    placeholder="Kod kiritish..."
                    value={deleteCode}
                    onChange={(e) => setDeleteCode(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setDeleteModalOpen(false)} className="secondary-btn" style={{ flex: 1 }}>Orqaga</button>
                  <button onClick={confirmDeleteCode} className="gold-btn" style={{ flex: 1, background: '#ef4444', color: 'white', justifyContent: 'center' }}>
                    Keyingi <ArrowRight size={18} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ fontSize: '22px', marginBottom: '12px' }}>O'chirish jarayoni boshlandi</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>
                  Tizim showroomni o'chirib yuborishga tayyorlanmoqda. Sizda 1 daqiqa vaqt bor.
                </p>
                
                <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 32px' }}>
                  <div style={{ 
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    borderRadius: '50%', border: '4px solid rgba(239, 68, 68, 0.2)'
                  }}></div>
                  <div style={{ 
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    borderRadius: '50%', border: '4px solid #ef4444', borderTopColor: 'transparent',
                    animation: 'spin 2s linear infinite'
                  }}></div>
                  <div style={{ 
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444' }}>{countdown}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>soniya</span>
                  </div>
                </div>

                <button 
                  onClick={cancelDeletion} 
                  className="secondary-btn" 
                  style={{ width: '100%', padding: '16px', border: '1px solid #ef4444', color: '#ef4444', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                >
                  <Ban size={20} /> O'CHIRISHNI BEKOR QILISH
                </button>
                
                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                  <Clock size={14} />
                  <span>Avtomatik o'chirish 1 daqiqa ichida amalga oshadi</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* CSS Animation for the spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Showrooms;
