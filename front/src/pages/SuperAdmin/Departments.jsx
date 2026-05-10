import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Wallet, UserPlus, ShoppingCart, Target, Factory, ClipboardList, 
  Plus, Users, Search, Edit2, Trash2, Ban, X, Check, Eye, EyeOff, User, Phone,
  Info, ArrowRight, ShieldAlert, Clock, Store
} from 'lucide-react';
import api from '../../utils/api';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or specific department key
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    login: '',
    phone: '+998 ',
    role: 'sales_manager',
    department: '',
    password: '',
    showroom: ''
  });

  const [showrooms, setShowrooms] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [depRes, userRes, showroomRes] = await Promise.all([
        api.get('/departments'),
        api.get('/users'),
        api.get('/showrooms')
      ]);
      setDepartments(depRes.data);
      setUsers(userRes.data);
      setShowrooms(showroomRes.data);
    } catch (err) {
      console.error("Data loading error", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getDepIcon = (key) => {
    switch (key) {
      case 'management': return <ShieldCheck size={24} />;
      case 'finance': return <Wallet size={24} />;
      case 'hr': return <UserPlus size={24} />;
      case 'sales': return <ShoppingCart size={24} />;
      case 'marketing': return <Target size={24} />;
      case 'production': return <Factory size={24} />;
      case 'project': return <ClipboardList size={24} />;
      default: return <Users size={24} />;
    }
  };

  const handleOpenModal = (mode, user = null) => {
    setModalMode(mode);
    if (mode === 'edit' && user) {
      setSelectedUser(user);
      setFormData({
        name: user.name || '',
        surname: user.surname || '',
        login: user.login || '',
        phone: user.phone || '+998 ',
        role: user.role || 'sales_manager',
        department: user.department || '',
        password: '',
        showroom: user.showroom || ''
      });
    } else {
      setFormData({
        name: '',
        surname: '',
        login: '',
        phone: '+998 ',
        role: 'sales_manager',
        department: activeTab === 'all' ? '' : activeTab,
        password: '',
        showroom: ''
      });
    }
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        await api.post('/users', formData);
      } else {
        await api.put(`/users/${selectedUser._id}`, formData);
      }
      loadData();
      setIsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.msg || "Xatolik yuz berdi");
    }
  };

  const filteredUsers = activeTab === 'all' 
    ? users 
    : users.filter(u => u.department === activeTab);

  const getDepStats = (key) => {
    return users.filter(u => u.department === key).length;
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Tizim Bo'limlari</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Kompaniya strukturasi va xodimlarni boshqarish.</p>
        </div>
        <button className="gold-btn" onClick={() => handleOpenModal('add')}>
          <Plus size={20} />
          Yangi Xodim qo'shish
        </button>
      </div>

      {/* Department Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div 
          onClick={() => setActiveTab('all')}
          className="premium-card" 
          style={{ 
            cursor: 'pointer',
            border: activeTab === 'all' ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)',
            background: activeTab === 'all' ? 'rgba(251, 191, 36, 0.05)' : 'var(--secondary-bg)',
            transition: 'all 0.3s ease',
            padding: '24px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ 
              width: '48px', height: '48px', borderRadius: '12px', 
              background: 'rgba(255,255,255,0.05)', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', color: activeTab === 'all' ? 'var(--accent-gold)' : 'var(--text-secondary)'
            }}>
              <Users size={24} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '24px', fontWeight: '800' }}>{users.length}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Jami xodimlar</p>
            </div>
          </div>
          <h3 style={{ marginTop: '16px', fontSize: '18px', fontWeight: '700' }}>Barcha bo'limlar</h3>
        </div>

        {departments.map(dep => (
          <div 
            key={dep.key}
            onClick={() => setActiveTab(dep.key)}
            className="premium-card" 
            style={{ 
              cursor: 'pointer',
              border: activeTab === dep.key ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)',
              background: activeTab === dep.key ? 'rgba(251, 191, 36, 0.05)' : 'var(--secondary-bg)',
              transition: 'all 0.3s ease',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '12px', 
                background: 'rgba(255,255,255,0.05)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', color: activeTab === dep.key ? 'var(--accent-gold)' : 'var(--text-secondary)'
              }}>
                {getDepIcon(dep.key)}
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '24px', fontWeight: '800' }}>{getDepStats(dep.key)}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>xodimlar</p>
              </div>
            </div>
            <h3 style={{ marginTop: '16px', fontSize: '18px', fontWeight: '700' }}>{dep.name}</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{dep.description}</p>
          </div>
        ))}
      </div>

      {/* Users List for Active Tab */}
      <div className="premium-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700' }}>
            {activeTab === 'all' ? 'Barcha xodimlar' : departments.find(d => d.key === activeTab)?.name}
          </h3>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              placeholder="Xodimlarni qidirish..." 
              style={{ width: '100%', paddingLeft: '40px', fontSize: '14px' }}
            />
          </div>
        </div>

        {filteredUsers.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'left' }}>
                  <th style={{ padding: '16px 8px' }}>Xodim</th>
                  <th style={{ padding: '16px 8px' }}>Bo'lim</th>
                  <th style={{ padding: '16px 8px' }}>Lavozim</th>
                  <th style={{ padding: '16px 8px' }}>Showroom</th>
                  <th style={{ padding: '16px 8px' }}>Login</th>
                  <th style={{ padding: '16px 8px', textAlign: 'right' }}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '16px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                          {u.name?.charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontWeight: '600', fontSize: '14px' }}>{u.name} {u.surname}</p>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{u.phone || 'Telefon kiritilmagan'}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 8px' }}>
                      <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                        {departments.find(d => d.key === u.department)?.name || 'Biriktirilmagan'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 8px', textTransform: 'capitalize', fontSize: '14px' }}>
                      {u.role?.replace('_', ' ')}
                    </td>
                    <td style={{ padding: '16px 8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                      {showrooms.find(s => s._id === u.showroom)?.name || 'Global'}
                    </td>
                    <td style={{ padding: '16px 8px', fontSize: '14px' }}>{u.login}</td>
                    <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button onClick={() => handleOpenModal('edit', u)} style={{ background: 'transparent', color: 'var(--text-secondary)' }}><Edit2 size={16} /></button>
                        <button style={{ background: 'transparent', color: '#ef4444' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Ushbu bo'limda hali xodimlar mavjud emas.
          </div>
        )}
      </div>

      {/* User Modal */}
      {isModalOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="premium-card" style={{ width: '600px', padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '800' }}>{modalMode === 'add' ? 'Yangi xodim' : 'Xodim ma\'lumotlari'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Ism</label>
                  <input style={{ width: '100%' }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Familiya</label>
                  <input style={{ width: '100%' }} value={formData.surname} onChange={e => setFormData({...formData, surname: e.target.value})} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Bo'lim</label>
                  <select style={{ width: '100%' }} value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} required>
                    <option value="">Bo'limni tanlang</option>
                    {departments.map(d => <option key={d.key} value={d.key}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Lavozim (Role)</label>
                  <select style={{ width: '100%' }} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} required>
                    <option value="super">Super Admin</option>
                    <option value="showroom">Showroom Admin</option>
                    <option value="sales_manager">Savdo Menejeri</option>
                    <option value="proekt_manager">Proekt Menejer (PM)</option>
                    <option value="kassa">Kassa / Hisobchi</option>
                    <option value="fabrika">Fabrika Menejeri</option>
                    <option value="distributor">Taqsimlovchi</option>
                    <option value="fabrika_worker">Fabrika Ishchisi (Umumiy)</option>
                    <option value="constructor">Konstruktor</option>
                    <option value="warehouse">Xoma-ashyo ombori</option>
                    <option value="cutting">Raspil (Kesish)</option>
                    <option value="edging">Kromka</option>
                    <option value="drilling">Teshish (Pristritka)</option>
                    <option value="carpentry">Stolyarka</option>
                    <option value="painting">Malyarka</option>
                    <option value="qc">O'TK (Sifat nazorati)</option>
                    <option value="packaging">Upakovka</option>
                    <option value="finished_warehouse">Tayyor mahsulot ombori</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Showroom (Ixtiyoriy)</label>
                  <select style={{ width: '100%' }} value={formData.showroom} onChange={e => setFormData({...formData, showroom: e.target.value})}>
                    <option value="">Global / Fabrika</option>
                    {showrooms.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Login</label>
                  <input style={{ width: '100%' }} value={formData.login} onChange={e => setFormData({...formData, login: e.target.value})} required />
                </div>
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Parol</label>
                  <input 
                    type={showPassword ? "text" : "password"}
                    style={{ width: '100%' }} 
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                    required={modalMode === 'add'}
                    placeholder={modalMode === 'edit' ? "O'zgartirmaslik uchun bo'sh qoldiring" : "••••••••"}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '32px', background: 'transparent' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Telefon</label>
                  <input style={{ width: '100%' }} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="secondary-btn" style={{ flex: 1 }}>Bekor qilish</button>
                <button type="submit" className="gold-btn" style={{ flex: 1, justifyContent: 'center' }}>Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
