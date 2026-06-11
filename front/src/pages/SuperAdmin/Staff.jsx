import React, { useState, useEffect } from 'react';
import { 
  Plus, Users, Search, Edit2, Trash2, X, Eye, EyeOff, User, Phone,
  Mail, Shield, MapPin, Loader2
} from 'lucide-react';
import api from '../../utils/api';

const mapPositionCodeToRole = (code) => {
  if (!code) return '';
  const num = parseInt(code, 10);
  if (isNaN(num)) return '';

  if (num >= 1 && num <= 4) return 'super';
  if (num === 101) return 'showroom';
  if (num >= 102 && num <= 106) return 'sales_manager';
  if (num >= 201 && num <= 205) return 'proekt_manager';
  if (num === 301) return 'fabrika';
  if (num === 302 || num === 303) return 'fabrika';
  if (num === 306) return 'cutting';
  if (num === 307) return 'edging';
  if (num === 308) return 'drilling';
  if (num === 309) return 'carpentry';
  if (num === 310) return 'painting';
  if (num === 311) return 'packaging';
  if (num === 312) return 'qc';
  if (num >= 304 && num <= 313) return 'fabrika_worker';
  if (num === 401 || num === 402 || num === 403 || num === 404 || num === 406) return 'warehouse';
  if (num === 405) return 'finished_warehouse';
  if (num >= 501 && num <= 503) return 'warehouse';
  if (num === 601) return 'distributor';
  if (num >= 602 && num <= 604) return 'distributor';
  if (num >= 701 && num <= 705) return 'kassa';
  if (num >= 801 && num <= 803) return 'super';
  if (num >= 901 && num <= 905) return 'super';
  if (num >= 1001 && num <= 1003) return 'super';

  return '';
};

const SuperAdminStaff = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showrooms, setShowrooms] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
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
    showroom: '',
    positionId: '',
    positionName: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [userRes, depRes, showroomRes, posRes] = await Promise.all([
        api.get('/users'),
        api.get('/departments'),
        api.get('/showrooms'),
        api.get('/positions').catch(() => ({ data: [] }))
      ]);
      setUsers(userRes.data);
      setDepartments(depRes.data);
      setShowrooms(showroomRes.data);
      setPositions(posRes.data || []);
    } catch (err) {
      console.error("Data loading error", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

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
        showroom: user.showroom || '',
        positionId: user.positionId || '',
        positionName: user.positionName || ''
      });
    } else {
      setFormData({
        name: '',
        surname: '',
        login: '',
        phone: '+998 ',
        role: 'sales_manager',
        department: '',
        password: '',
        showroom: '',
        positionId: '',
        positionName: ''
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

  const handleDeleteUser = async (id) => {
    if (window.confirm("Haqiqatdan ham ushbu xodimni o'chirmoqchimisiz?")) {
      try {
        await api.delete(`/users/${id}`);
        loadData();
      } catch (err) {
        alert(err.response?.data?.msg || "Xatolik yuz berdi");
      }
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.name + ' ' + u.surname + ' ' + u.login).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDep = activeTab === 'all' || u.department === activeTab;
    return matchesSearch && matchesDep;
  });

  if (loading) {
    return (
      <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={48} color="var(--accent-gold)" />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Xodimlar Boshqaruvi</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Tizim xodimlarini boshqarish va yangilarini qo'shish.</p>
        </div>
        <button className="gold-btn" onClick={() => handleOpenModal('add')}>
          <Plus size={20} />
          Yangi Xodim qo'shish
        </button>
      </div>

      <div className="premium-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => setActiveTab('all')}
              style={{ 
                padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
                background: activeTab === 'all' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                color: activeTab === 'all' ? '#000' : 'var(--text-secondary)',
                border: 'none', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              Hammasi
            </button>
            {departments.map(dep => (
              <button 
                key={dep.key}
                onClick={() => setActiveTab(dep.key)}
                style={{ 
                  padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
                  background: activeTab === dep.key ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                  color: activeTab === dep.key ? '#000' : 'var(--text-secondary)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {dep.name}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              placeholder="Xodimlarni qidirish..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '40px', fontSize: '14px' }}
            />
          </div>
        </div>

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
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                        {u.name?.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontWeight: '600', fontSize: '14px' }}>{u.name} {u.surname}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={10} /> {u.phone || 'Noma\'lum'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 8px' }}>
                    <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                      {departments.find(d => d.key === u.department)?.name || 'Biriktirilmagan'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 8px', fontSize: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Shield size={14} style={{ color: 'var(--accent-gold)' }} />
                      {u.positionName || u.role?.replace('_', ' ')}
                    </div>
                  </td>
                  <td style={{ padding: '16px 8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} />
                      {showrooms.find(s => s._id === u.showroom)?.name || 'Global / Fabrika'}
                    </div>
                  </td>
                  <td style={{ padding: '16px 8px', fontSize: '14px' }}>{u.login}</td>
                  <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button onClick={() => handleOpenModal('edit', u)} className="action-btn" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteUser(u._id)} className="action-btn" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Users size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
              <p>Xodimlar topilmadi.</p>
            </div>
          )}
        </div>
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
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Lavozim (Boshqaruv Sozlamalaridan)</label>
                  <select 
                    style={{ width: '100%', height: '44px', background: '#1e293b', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', padding: '0 12px', fontSize: '13px', outline: 'none', cursor: 'pointer' }} 
                    value={formData.positionId} 
                    onChange={e => {
                      const posId = e.target.value;
                      const pos = positions.find(p => (p._id || p.id) === posId);
                      if (pos) {
                        const determinedRole = mapPositionCodeToRole(pos.code);
                        const dep = departments.find(d => d.name === pos.departmentName || d.id === pos.departmentId || d._id === pos.departmentId);
                        const determinedDept = dep ? dep.key : '';

                        setFormData({
                          ...formData,
                          positionId: posId,
                          positionName: pos.name,
                          role: determinedRole || formData.role,
                          department: determinedDept || formData.department
                        });
                      } else {
                        setFormData({
                          ...formData,
                          positionId: '',
                          positionName: ''
                        });
                      }
                    }} 
                    required
                  >
                    <option value="" style={{ background: '#1e293b', color: '#fff' }}>Lavozimni tanlang...</option>
                    {positions.map(p => (
                      <option key={p._id || p.id} value={p._id || p.id} style={{ background: '#1e293b', color: '#fff' }}>
                        [{p.code}] {p.name} ({p.departmentName})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Bo'lim (Avtomatik tanlanadi)</label>
                  <select style={{ width: '100%' }} value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} required>
                    <option value="">Bo'limni tanlang</option>
                    {departments.map(d => <option key={d.key} value={d.key}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Tizim Roli (Ruxsat darajasi)</label>
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

export default SuperAdminStaff;
