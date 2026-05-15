import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, X, Check, Info, 
  DollarSign, Briefcase, Factory, Landmark, Tag, Settings, 
  ShoppingBag, Megaphone, Truck, Wrench, Database, ShoppingCart, Users, Layers, User, Power
} from 'lucide-react';
import api from '../../utils/api';

const CostCenters = () => {
  const [centers, setCenters] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedCenter, setSelectedCenter] = useState(null);
  
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    code: '',
    description: '',
    responsiblePerson: '',
    isActive: true,
    parentId: null
  });

  const handleAddDept = async () => {
    if (!newDeptName.trim()) return;
    try {
      await api.post('/cost-centers/categories', { name: newDeptName });
      setNewDeptName('');
      loadData();
    } catch (err) {
      alert("Bo'lim qo'shishda xatolik");
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [centersRes, deptsRes] = await Promise.all([
        api.get('/cost-centers'),
        api.get('/cost-centers/categories')
      ]);
      setCenters(centersRes.data);
      setDepartments(deptsRes.data);
      
      if (deptsRes.data.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: deptsRes.data[0].name }));
      }
    } catch (err) {
      console.error("Data load error", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (mode, center = null) => {
    setModalMode(mode);
    if (mode === 'edit' && center) {
      setSelectedCenter(center);
      setFormData({
        name: center.name || '',
        category: center.category || (departments[0]?.name || ''),
        code: center.code || '',
        description: center.description || '',
        responsiblePerson: center.responsiblePerson || '',
        isActive: center.isActive !== undefined ? center.isActive : true,
        parentId: center.parentId || null
      });
    } else {
      setFormData({
        name: '',
        category: departments[0]?.name || '',
        code: '',
        description: '',
        responsiblePerson: '',
        isActive: true,
        parentId: null
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        await api.post('/cost-centers', formData);
      } else {
        await api.put(`/cost-centers/${selectedCenter.id || selectedCenter._id}`, formData);
      }
      loadData();
      setIsModalOpen(false);
    } catch (err) {
      alert("Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Haqiqatan ham ushbu xarajat markazini o'chirib yubormoqchisiz?")) {
      try {
        await api.delete(`/cost-centers/${id}`);
        loadData();
      } catch (err) {
        alert("O'chirishda xatolik");
      }
    }
  };

  const handleDeleteDept = async (id) => {
    if (window.confirm("Ushbu bo'limni o'chirmoqchimisiz? Undagi markazlar saqlanib qoladi.")) {
      try {
        await api.delete(`/cost-centers/categories/${id}`);
        loadData();
      } catch (err) {
        alert("O'chirishda xatolik");
      }
    }
  };

  const toggleStatus = async (center) => {
    try {
      await api.put(`/cost-centers/${center.id || center._id}`, {
        ...center,
        isActive: !center.isActive
      });
      loadData();
    } catch (err) {
      alert("Statusni o'zgartirishda xatolik");
    }
  };

  const filteredCenters = activeFilter === 'all' 
    ? centers 
    : centers.filter(c => c.category === activeFilter);

  // Helper to build hierarchy
  const buildHierarchy = (flatData) => {
    const result = [];
    const addedIds = new Set();

    // Birinchi darajali (parentId yo'q) markazlarni qo'shamiz
    const roots = flatData.filter(c => !c.parentId);
    roots.forEach(root => {
      result.push(root);
      addedIds.add(root.id || root._id);
      
      // Ularning bolalarini topib qo'shamiz (agar ular ham flatData ichida bo'lsa)
      const children = flatData.filter(c => c.parentId === (root.id || root._id));
      children.forEach(child => {
        result.push({ ...child, isChild: true });
        addedIds.add(child.id || child._id);
      });
    });

    // Filtrlangan lekin iyerarxiya bo'yicha qo'shilmay qolganlarni ham qo'shib qo'yamiz
    flatData.forEach(item => {
      const id = item.id || item._id;
      if (!addedIds.has(id)) {
        result.push(item);
      }
    });

    return result;
  };

  const hierarchicalCenters = buildHierarchy(filteredCenters);

  const getDeptColor = (name) => departments.find(d => d.name === name)?.color || 'var(--text-secondary)';

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Xarajat Markazlari / CFO</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Xarajatlarni guruhlar va mas'ullar bo'yicha professional boshqarish.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="secondary-btn" onClick={() => setIsDeptModalOpen(true)}>
            <Layers size={20} />
            Bo'limlarni boshqarish
          </button>
          <button className="gold-btn" onClick={() => handleOpenModal('add')}>
            <Plus size={20} />
            Yangi Markaz qo'shish
          </button>
        </div>
      </div>

      {/* Category Cards (Top Groups) */}
      <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
          gap: '12px', 
          marginBottom: '32px' 
      }}>
        <div 
          onClick={() => setActiveFilter('all')}
          className="premium-card" 
          style={{ 
            cursor: 'pointer',
            border: activeFilter === 'all' ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)',
            background: activeFilter === 'all' ? 'rgba(251, 191, 36, 0.05)' : 'var(--secondary-bg)',
            padding: '16px',
            minHeight: '100px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: 'var(--text-secondary)' }}><DollarSign size={20} /></div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '18px', fontWeight: '800' }}>{centers.length}</p>
            </div>
          </div>
          <h3 style={{ marginTop: '8px', fontSize: '13px', fontWeight: '700' }}>Barcha markazlar</h3>
        </div>

        {departments.map(dept => (
          <div 
            key={dept.id || dept._id}
            onClick={() => setActiveFilter(dept.name)}
            className="premium-card" 
            style={{ 
              cursor: 'pointer',
              border: activeFilter === dept.name ? `2px solid ${dept.color}` : '1px solid var(--border-color)',
              background: activeFilter === dept.name ? `${dept.color}10` : 'var(--secondary-bg)',
              padding: '16px',
              minHeight: '100px',
              position: 'relative',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {/* Professional Management Controls */}
            <div style={{ 
              position: 'absolute', top: '12px', right: '12px', 
              display: 'flex', gap: '8px', zIndex: 100 
            }}>
              <button 
                title="Tahrirlash"
                onClick={(e) => {
                  e.stopPropagation();
                  const newName = prompt("Bo'lim nomini o'zgartiring:", dept.name);
                  if (newName && newName !== dept.name) {
                    const updateDept = async () => {
                      try {
                        await api.post('/cost-centers/categories', { ...dept, name: newName });
                        loadData();
                      } catch (err) { alert("Xatolik"); }
                    };
                    updateDept();
                  }
                }}
                style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  color: 'white', 
                  width: '32px', height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                <Edit2 size={14} />
              </button>
              
              <button 
                title="O'chirish"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteDept(dept.id || dept._id);
                }}
                style={{ 
                  background: 'rgba(239, 68, 68, 0.15)', 
                  color: '#ef4444', 
                  width: '32px', height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#ef4444';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                  e.currentTarget.style.color = '#ef4444';
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: dept.color }}><Layers size={20} /></div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '18px', fontWeight: '800' }}>
                  {centers.filter(c => c.category === dept.name).length}
                </p>
              </div>
            </div>
            <h3 style={{ marginTop: '8px', fontSize: '13px', fontWeight: '700' }}>{dept.name}</h3>
          </div>
        ))}

        {/* Improved Add New Department Card */}
        <div 
          onClick={() => {
            const name = prompt("Yangi asosiy markaz nomini kiriting:");
            if (name) {
              const saveDept = async () => {
                try {
                  await api.post('/cost-centers/categories', { name });
                  loadData();
                } catch (err) { alert("Xatolik"); }
              };
              saveDept();
            }
          }}
          className="premium-card" 
          style={{ 
            cursor: 'pointer',
            border: '2px dashed var(--border-color)',
            background: 'rgba(255,255,255,0.02)',
            padding: '16px',
            minHeight: '100px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-gold)';
            e.currentTarget.style.background = 'rgba(251, 191, 36, 0.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
          }}
        >
          <Plus size={28} style={{ color: 'var(--accent-gold)' }} />
          <span style={{ fontSize: '12px', color: 'white', fontWeight: '700' }}>Yangi Guruh Qo'shish</span>
        </div>
      </div>

      {/* Main List */}
      <div className="premium-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700' }}>
            {activeFilter === 'all' ? 'Xarajat Markazlari' : `${activeFilter} bo'linmalari`}
          </h3>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input placeholder="Markazlarni qidirish..." style={{ width: '100%', paddingLeft: '40px', fontSize: '14px' }} />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Yuklanmoqda...</div>
        ) : hierarchicalCenters.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'left' }}>
                      <th style={{ padding: '16px 8px' }}>Kod</th>
                      <th style={{ padding: '16px 8px' }}>Markaz Nomi</th>
                      <th style={{ padding: '16px 8px' }}>Bo'lim</th>
                      <th style={{ padding: '16px 8px' }}>Yuqori markaz</th>
                      <th style={{ padding: '16px 8px' }}>Mas'ul shaxs</th>
                      <th style={{ padding: '16px 8px' }}>Status</th>
                      <th style={{ padding: '16px 8px', textAlign: 'right' }}>Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hierarchicalCenters.map(c => (
                      <tr key={c.id || c._id} style={{ 
                        borderBottom: '1px solid var(--border-color)', 
                        background: c.isChild ? 'rgba(255,255,255,0.01)' : 'transparent',
                        opacity: c.isActive ? 1 : 0.5
                      }}>
                        <td style={{ padding: '16px 8px', fontWeight: '700', color: 'var(--accent-gold)', fontSize: '13px' }}>
                          {c.code || 'N/A'}
                        </td>
                        <td style={{ padding: '16px 8px', fontWeight: '600', fontSize: '14px', paddingLeft: c.isChild ? '32px' : '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {c.isChild && <div style={{ width: '12px', height: '1px', background: 'var(--border-color)' }}></div>}
                            {c.name}
                          </div>
                        </td>
                        <td style={{ padding: '16px 8px' }}>
                          <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '12px', background: `${getDeptColor(c.category)}15`, color: getDeptColor(c.category), fontWeight: '700', textTransform: 'uppercase' }}>
                            {c.category}
                          </span>
                        </td>
                        <td style={{ padding: '16px 8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {centers.find(pc => pc.id === c.parentId || pc._id === c.parentId)?.name || '-'}
                        </td>
                        <td style={{ padding: '16px 8px', fontSize: '13px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                            <User size={14} />
                            {c.responsiblePerson || 'Belgilanmagan'}
                          </div>
                        </td>
                    <td style={{ padding: '16px 8px' }}>
                      <button 
                        onClick={() => toggleStatus(c)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '4px 8px', borderRadius: '4px', background: c.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)', color: c.isActive ? '#10b981' : '#64748b' }}
                      >
                        <Power size={12} />
                        {c.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button onClick={() => handleOpenModal('edit', c)} style={{ background: 'transparent', color: 'var(--text-secondary)' }}><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(c.id || c._id)} style={{ background: 'transparent', color: '#ef4444' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>Hali markazlar qo'shilmagan.</div>
        )}
      </div>

      {/* Main Modal */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="premium-card" style={{ width: '550px', padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '800' }}>{modalMode === 'add' ? 'Yangi Markaz' : 'Tahrirlash'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Markaz nomi</label>
                  <input 
                    placeholder="Masalan: Ishlab chiqarish ombori"
                    style={{ width: '100%' }} 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    required 
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Markaz guruhi</label>
                  <select 
                    style={{ width: '100%' }} 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})} 
                    required
                  >
                    {departments.map(dept => <option key={dept.id || dept._id} value={dept.name}>{dept.name}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Yuqori markaz</label>
                  <select 
                    style={{ width: '100%' }} 
                    value={formData.parentId || ''} 
                    onChange={e => setFormData({...formData, parentId: e.target.value || null})}
                  >
                    <option value="">(Hech biri - Asosiy)</option>
                    {centers.filter(c => c.id !== (selectedCenter?.id || selectedCenter?._id)).map(c => (
                      <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Mas’ul shaxs</label>
                  <input 
                    placeholder="F.I.SH (Optional)"
                    style={{ width: '100%' }} 
                    value={formData.responsiblePerson} 
                    onChange={e => setFormData({...formData, responsiblePerson: e.target.value})} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Kod</label>
                  <input 
                    placeholder="CC-FAB-OMB-001"
                    style={{ width: '100%' }} 
                    value={formData.code} 
                    onChange={e => setFormData({...formData, code: e.target.value})} 
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Holati</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <input 
                      type="checkbox" 
                      checked={formData.isActive} 
                      onChange={e => setFormData({...formData, isActive: e.target.checked})} 
                      id="isActive"
                    />
                    <label htmlFor="isActive" style={{ fontSize: '14px', cursor: 'pointer' }}>
                      {formData.isActive ? 'Active (Faol)' : 'Inactive (Faol emas)'}
                    </label>
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Tavsif</label>
                  <textarea 
                    rows="3"
                    placeholder="Markaz haqida qo'shimcha ma'lumot..."
                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', padding: '12px' }} 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                  />
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

      {/* Departments Management Modal */}
      {isDeptModalOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="premium-card" style={{ width: '450px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800' }}>Bo'limlarni boshqarish</h3>
              <button onClick={() => setIsDeptModalOpen(false)} style={{ background: 'transparent' }}><X size={24} /></button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  placeholder="Yangi bo'lim nomi..." 
                  style={{ flex: 1 }}
                  value={newDeptName}
                  onChange={e => setNewDeptName(e.target.value)}
                />
                <button className="gold-btn" onClick={handleAddDept} style={{ padding: '0 16px' }}>
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              {departments.length > 0 ? (
                departments.map(dept => (
                  <div key={dept.id || dept._id} style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                    padding: '12px 16px', borderBottom: '1px solid var(--border-color)' 
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{dept.name}</span>
                    <button onClick={() => handleDeleteDept(dept.id || dept._id)} style={{ background: 'transparent', color: '#ef4444' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  Hali bo'limlar yo'q
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsDeptModalOpen(false)} 
              className="secondary-btn" 
              style={{ width: '100%', marginTop: '24px' }}
            >
              Yopish
            </button>
          </div>
        </div>
      )}
    </div>

  );
};

export default CostCenters;
