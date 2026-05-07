import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Plus, Search, Edit2, Trash2, X, Check, Info, 
  DollarSign, Briefcase, Factory, Landmark, Tag
} from 'lucide-react';
import api from '../../utils/api';

const CostCenters = () => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedCenter, setSelectedCenter] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'admin',
    code: '',
    description: ''
  });

  const categories = [
    { value: 'production', label: 'Tannarx (COGS)', icon: <Factory size={20} />, color: '#ef4444' },
    { value: 'selling', label: 'Sotish xarajatlari', icon: <Tag size={20} />, color: '#fbbf24' },
    { value: 'admin', label: 'Ma\'muriy xarajatlar', icon: <Briefcase size={20} />, color: '#3b82f6' },
    { value: 'financial', label: 'Moliyaviy xarajatlar', icon: <Landmark size={20} />, color: '#10b981' }
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/cost-centers');
      setCenters(res.data);
    } catch (err) {
      console.error("Cost centers load error", err);
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
        category: center.category || 'admin',
        code: center.code || '',
        description: center.description || ''
      });
    } else {
      setFormData({
        name: '',
        category: 'admin',
        code: '',
        description: ''
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
        await api.put(`/cost-centers/${selectedCenter._id}`, formData);
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

  const filteredCenters = activeFilter === 'all' 
    ? centers 
    : centers.filter(c => c.category === activeFilter);

  const getCategoryLabel = (val) => categories.find(c => c.value === val)?.label || val;
  const getCategoryColor = (val) => categories.find(c => c.value === val)?.color || 'var(--text-secondary)';

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Xarajat Markazlari</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Xarajatlarni 4 ta asosiy toifa bo'yicha tahlil qilish va boshqarish.</p>
        </div>
        <button className="gold-btn" onClick={() => handleOpenModal('add')}>
          <Plus size={20} />
          Yangi Markaz qo'shish
        </button>
      </div>

      {/* Category Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div 
          onClick={() => setActiveFilter('all')}
          className="premium-card" 
          style={{ 
            cursor: 'pointer',
            border: activeFilter === 'all' ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)',
            background: activeFilter === 'all' ? 'rgba(251, 191, 36, 0.05)' : 'var(--secondary-bg)',
            padding: '20px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: 'var(--text-secondary)' }}><DollarSign size={24} /></div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '20px', fontWeight: '800' }}>{centers.length}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Jami markazlar</p>
            </div>
          </div>
          <h3 style={{ marginTop: '12px', fontSize: '16px', fontWeight: '700' }}>Barcha toifalar</h3>
        </div>

        {categories.map(cat => (
          <div 
            key={cat.value}
            onClick={() => setActiveFilter(cat.value)}
            className="premium-card" 
            style={{ 
              cursor: 'pointer',
              border: activeFilter === cat.value ? `2px solid ${cat.color}` : '1px solid var(--border-color)',
              background: activeFilter === cat.value ? `${cat.color}10` : 'var(--secondary-bg)',
              padding: '20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: cat.color }}>{cat.icon}</div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '20px', fontWeight: '800' }}>{centers.filter(c => c.category === cat.value).length}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>markazlar</p>
              </div>
            </div>
            <h3 style={{ marginTop: '12px', fontSize: '16px', fontWeight: '700' }}>{cat.label}</h3>
          </div>
        ))}
      </div>

      {/* Main List */}
      <div className="premium-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700' }}>
            {activeFilter === 'all' ? 'Barcha harajat markazlari' : getCategoryLabel(activeFilter)}
          </h3>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              placeholder="Markazlarni qidirish..." 
              style={{ width: '100%', paddingLeft: '40px', fontSize: '14px' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Yuklanmoqda...</div>
        ) : filteredCenters.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'left' }}>
                  <th style={{ padding: '16px 8px' }}>Kod</th>
                  <th style={{ padding: '16px 8px' }}>Markaz Nomi</th>
                  <th style={{ padding: '16px 8px' }}>Toifa</th>
                  <th style={{ padding: '16px 8px' }}>Tavsif</th>
                  <th style={{ padding: '16px 8px', textAlign: 'right' }}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filteredCenters.map(c => (
                  <tr key={c._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '16px 8px', fontWeight: '700', color: 'var(--accent-gold)', fontSize: '14px' }}>
                      {c.code || 'N/A'}
                    </td>
                    <td style={{ padding: '16px 8px', fontWeight: '600', fontSize: '14px' }}>{c.name}</td>
                    <td style={{ padding: '16px 8px' }}>
                      <span style={{ 
                        fontSize: '11px', padding: '4px 10px', borderRadius: '20px', 
                        background: `${getCategoryColor(c.category)}15`, 
                        color: getCategoryColor(c.category),
                        fontWeight: '700',
                        textTransform: 'uppercase'
                      }}>
                        {getCategoryLabel(c.category)}
                      </span>
                    </td>
                    <td style={{ padding: '16px 8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {c.description || '—'}
                    </td>
                    <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button onClick={() => handleOpenModal('edit', c)} style={{ background: 'transparent', color: 'var(--text-secondary)' }}><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(c._id)} style={{ background: 'transparent', color: '#ef4444' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Hali hech qanday harajat markazi qo'shilmagan.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="premium-card" style={{ width: '500px', padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '800' }}>{modalMode === 'add' ? 'Yangi Markaz' : 'Tahrirlash'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Markaz Nomi</label>
                  <input 
                    placeholder="Masalan: Logistika xarajatlari"
                    style={{ width: '100%' }} 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    required 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Toifa</label>
                  <select 
                    style={{ width: '100%' }} 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})} 
                    required
                  >
                    {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Kod (Ixtiyoriy)</label>
                  <input 
                    placeholder="CC-101"
                    style={{ width: '100%' }} 
                    value={formData.code} 
                    onChange={e => setFormData({...formData, code: e.target.value})} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Tavsif</label>
                  <textarea 
                    rows="3"
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
    </div>
  );
};

export default CostCenters;
