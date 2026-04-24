import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Ban, X, Check, Search, ShieldCheck, CreditCard, Briefcase, BadgeInfo, User, ShieldAlert, Clock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Staff = () => {
  const { user } = useAuth();
  // Load initial staff from localStorage to keep it persistent across the mock system
  const [staffList, setStaffList] = useState(() => {
    const saved = localStorage.getItem('erp_staff_list');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever staffList changes
  useEffect(() => {
    localStorage.setItem('erp_staff_list', JSON.stringify(staffList));
  }, [staffList]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    login: '',
    phone: '', // Added phone field
    role: 'Kassa',
    password: ''
  });

  // Safe Delete States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [isActiveDelete, setIsActiveDelete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Timer logic
  useEffect(() => {
    let timer;
    if (isActiveDelete && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && isActiveDelete) {
      setStaffList(staffList.filter(s => s.id !== staffToDelete.id));
      setIsActiveDelete(false);
      setDeleteModalOpen(false);
      setStaffToDelete(null);
    }
    return () => clearInterval(timer);
  }, [isActiveDelete, countdown, staffList, staffToDelete]);

  const roles = [
    { label: 'Kassa', value: 'kassa' },
    { label: 'Sotuv manageri', value: 'sotuv_manager' },
    { label: 'Proekt manager', value: 'proekt_manager' },
    { label: 'Ofiss manager', value: 'ofiss_manager' }
  ];

  const getRoleIcon = (role) => {
    switch (role) {
      case 'kassa': return <CreditCard size={16} />;
      case 'sotuv_manager': return <Briefcase size={16} />;
      case 'proekt_manager': return <BadgeInfo size={16} />;
      case 'ofiss_manager': return <ShieldCheck size={16} />;
      default: return <Users size={16} />;
    }
  };

  const getRoleLabel = (roleValue) => roles.find(r => r.value === roleValue)?.label || roleValue;

  const getRoleColor = (role) => {
    switch (role) {
      case 'kassa': return '#10b981';
      case 'sotuv_manager': return '#fbbf24';
      case 'proekt_manager': return '#3b82f6';
      case 'ofiss_manager': return '#8b5cf6';
      default: return 'var(--text-secondary)';
    }
  };

  const handleOpenModal = (mode, staff = null) => {
    setModalMode(mode);
    if (mode === 'edit' && staff) {
      setSelectedStaff(staff);
      setFormData({
        firstName: staff.firstName,
        lastName: staff.lastName,
        login: staff.login,
        phone: staff.phone || '', // Added phone
        role: staff.role,
        password: staff.password || ''
      });
    } else {
      setFormData({ firstName: '', lastName: '', login: '', phone: '', role: 'kassa', password: '' });
    }
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handlePhoneChange = (e) => {
    let input = e.target.value.replace(/\D/g, ''); // Faqat raqamlarni qoldirish
    
    if (input.length === 0) {
      setFormData({...formData, phone: ''});
      return;
    }

    // Har doim 998 dan boshlanadi deb faraz qilamiz agar foydalanuvchi to'g'ridan to'g'ri kodni yozsa
    if (!input.startsWith('998') && input.length <= 12) {
        input = '998' + input;
    }

    let formatted = '+';
    if (input.length > 0) formatted += input.substring(0, 3);
    if (input.length > 3) formatted += ' ' + input.substring(3, 5);
    if (input.length > 5) formatted += ' ' + input.substring(5, 8);
    if (input.length > 8) formatted += ' ' + input.substring(8, 10);
    if (input.length > 10) formatted += ' ' + input.substring(10, 12);

    setFormData({...formData, phone: formatted});
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (modalMode === 'add') {
      const newMember = {
        id: Date.now(),
        ...formData,
        showroom: user?.showroom, // Filialni biriktirish
        status: 'Active'
      };
      setStaffList([...staffList, newMember]);
    } else {
      setStaffList(staffList.map(s => s.id === selectedStaff.id ? { ...s, ...formData } : s));
    }
    setIsModalOpen(false);
  };

  const toggleStatus = (id) => {
    setStaffList(staffList.map(s => 
      s.id === id ? { ...s, status: s.status === 'Active' ? 'Blocked' : 'Active' } : s
    ));
  };

  const startDeleteProcess = (staff) => {
    setStaffToDelete(staff);
    setDeleteModalOpen(true);
    setCountdown(60);
    setIsActiveDelete(true);
  };

  const cancelDeletion = () => {
    setIsActiveDelete(false);
    setCountdown(0);
    setDeleteModalOpen(false);
    setStaffToDelete(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Xodimlar Boshqaruvi</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Xodimlar uchun login va parollarni bering.</p>
        </div>
        <button className="gold-btn" onClick={() => handleOpenModal('add')}>
          <Plus size={20} />
          Yangi Xodim qo'shish
        </button>
      </div>

      <div className="premium-card">
        {staffList.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  <th style={{ padding: '16px 8px' }}>Xodim</th>
                  <th style={{ padding: '16px 8px' }}>Login</th>
                  <th style={{ padding: '16px 8px' }}>Telefon</th>
                  <th style={{ padding: '16px 8px' }}>Lavozimi</th>
                  <th style={{ padding: '16px 8px' }}>Holati</th>
                  <th style={{ padding: '16px 8px', textAlign: 'right' }}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff) => (
                  <tr key={staff.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '20px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          width: '40px', height: '40px', borderRadius: '10px', 
                          background: 'var(--secondary-bg)', display: 'flex', 
                          alignItems: 'center', justifyContent: 'center',
                          border: '1px solid var(--border-color)',
                          color: getRoleColor(staff.role)
                        }}>
                          <User size={20} />
                        </div>
                        <div>
                          <p style={{ fontWeight: '600' }}>{staff.firstName} {staff.lastName}</p>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>ID: #{staff.id.toString().slice(-4)}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px 8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      {staff.login}
                    </td>
                    <td style={{ padding: '20px 8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      {staff.phone || '—'}
                    </td>
                    <td style={{ padding: '20px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: getRoleColor(staff.role), fontWeight: '500', fontSize: '14px' }}>
                        {getRoleIcon(staff.role)}
                        {getRoleLabel(staff.role)}
                      </div>
                    </td>
                    <td style={{ padding: '20px 8px' }}>
                      <span style={{ 
                        fontSize: '11px', 
                        background: staff.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: staff.status === 'Active' ? '#10b981' : '#ef4444',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontWeight: '600'
                      }}>
                        {staff.status === 'Active' ? 'FAOL' : 'BLOKLANGAN'}
                      </span>
                    </td>
                    <td style={{ padding: '20px 8px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button onClick={() => toggleStatus(staff.id)} style={{ padding: '8px', color: 'var(--text-secondary)', background: 'transparent' }} title={staff.status === 'Active' ? 'Bloklash' : 'Aktivlashtirish'}>
                          <Ban size={18} />
                        </button>
                        <button onClick={() => handleOpenModal('edit', staff)} style={{ padding: '8px', color: 'var(--text-secondary)', background: 'transparent' }} title="Tahrirlash">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => startDeleteProcess(staff)} style={{ padding: '8px', color: '#ef4444', background: 'transparent' }} title="O'chirish">
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
              <Users size={40} color="var(--accent-gold)" style={{ opacity: 0.5 }} />
            </div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Xodimlar topilmadi</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
              Xodimlar qo'shishda ularga tizimga kirish uchun login va parol berishni unutmang.
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
          <div className="premium-card" style={{ width: '650px', maxWidth: '95%', padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '28px', fontWeight: '800' }}>{modalMode === 'add' ? 'Yangi Xodim qo\'shish' : 'Xodimni tahrirlash'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}><X size={28} /></button>
            </div>
            
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Ism</label>
                    <input style={{ width: '100%', padding: '14px', fontSize: '16px' }} value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Familiya</label>
                    <input style={{ width: '100%', padding: '14px', fontSize: '16px' }} value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Login</label>
                    <input style={{ width: '100%', padding: '14px', fontSize: '16px' }} value={formData.login} onChange={e => setFormData({...formData, login: e.target.value})} required placeholder="admin_77" />
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Telefon raqami</label>
                    <input 
                      style={{ width: '100%', padding: '14px', fontSize: '16px' }} 
                      value={formData.phone} 
                      onChange={handlePhoneChange} 
                      required 
                      placeholder="+998 90 123 45 67" 
                      maxLength="17" 
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Lavozim</label>
                  <select style={{ width: '100%', padding: '14px', fontSize: '16px' }} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div style={{ position: 'relative' }}>
                  <label style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Parol</label>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    style={{ width: '100%', padding: '14px', paddingRight: '50px', fontSize: '16px' }} 
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                    placeholder="••••••••" 
                    required={modalMode === 'add'} 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ 
                      position: 'absolute', 
                      right: '16px', 
                      top: '36px', 
                      background: 'transparent', 
                      color: 'var(--text-secondary)',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="secondary-btn" style={{ flex: 1, padding: '16px', fontSize: '16px' }}>Bekor qilish</button>
                <button type="submit" className="gold-btn" style={{ flex: 1, justifyContent: 'center', padding: '16px', fontSize: '16px' }}>
                  <Check size={20} /> Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Safe Delete Modal */}
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
            
            <h3 style={{ fontSize: '22px', marginBottom: '12px' }}>Xodimni o'chirish</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>
              Diqqat! <b>"{staffToDelete?.firstName} {staffToDelete?.lastName}"</b> xodimini o'chirib yubormoqchisiz. 
              Sizda 1 daqiqa vaqt bor.
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
          </div>
        </div>
      )}

      {/* Spinner Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Staff;
