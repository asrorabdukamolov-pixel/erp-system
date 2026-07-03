import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Briefcase, Loader2, Search } from 'lucide-react';
import api from '../../utils/api';

const PositionsSettings = () => {
    const [positions, setPositions] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedPos, setSelectedPos] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        departmentId: '',
        departmentName: ''
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [positionsRes, deptsRes] = await Promise.all([
                api.get('/positions').catch(() => ({ data: [] })),
                api.get('/departments').catch(() => ({ data: [] }))
            ]);
            setPositions(positionsRes.data || []);
            setDepartments(deptsRes.data || []);
        } catch (err) {
            console.error("Positions load error:", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleOpenModal = (mode, pos = null) => {
        setModalMode(mode);
        if (mode === 'edit' && pos) {
            setSelectedPos(pos);
            setFormData({
                name: pos.name || '',
                code: pos.code || '',
                description: pos.description || '',
                departmentId: pos.departmentId || '',
                departmentName: pos.departmentName || ''
            });
        } else {
            setFormData({
                name: '',
                code: '',
                description: '',
                departmentId: '',
                departmentName: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'add') {
                await api.post('/positions', formData);
            } else {
                await api.put(`/positions/${selectedPos._id}`, formData);
            }
            loadData();
            setIsModalOpen(false);
        } catch (err) {
            alert(err.response?.data?.msg || "Xatolik yuz berdi");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Haqiqatdan ham ushbu lavozimni o'chirmoqchimisiz?")) {
            try {
                await api.delete(`/positions/${id}`);
                loadData();
            } catch (err) {
                alert(err.response?.data?.msg || "Xatolik yuz berdi");
            }
        }
    };

    const filteredPositions = positions
        .filter(p => 
            p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.code?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            const codeA = String(a.code || '');
            const codeB = String(b.code || '');
            return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
        });

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <Loader2 className="animate-spin" size={32} color="var(--accent-gold)" />
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Lavozimlar</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Tizimdagi barcha rasmiy lavozimlar ro'yxati.</p>
                </div>
                <button className="gold-btn" onClick={() => handleOpenModal('add')}>
                    <Plus size={18} />
                    Yangi lavozim
                </button>
            </div>

            <div className="premium-card" style={{ padding: '24px' }}>
                <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '300px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input 
                        placeholder="Qidirish..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', paddingLeft: '36px', fontSize: '13px' }}
                    />
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px', textAlign: 'left' }}>
                                <th style={{ padding: '12px 8px' }}>KOD</th>
                                <th style={{ padding: '12px 8px' }}>LAVOZIM NOMI</th>
                                <th style={{ padding: '12px 8px' }}>BO'LIM</th>
                                <th style={{ padding: '12px 8px' }}>TAVSIF</th>
                                <th style={{ padding: '12px 8px', textAlign: 'right' }}>AMALLAR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPositions.map(p => (
                                <tr key={p._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '16px 8px', fontSize: '13px', fontWeight: '700', color: 'var(--accent-gold)' }}>{p.code}</td>
                                    <td style={{ padding: '16px 8px', fontSize: '14px', fontWeight: '600' }}>{p.name}</td>
                                    <td style={{ padding: '16px 8px', fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{p.departmentName || '-'}</td>
                                    <td style={{ padding: '16px 8px', fontSize: '13px', color: 'var(--text-secondary)' }}>{p.description || '-'}</td>
                                    <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button onClick={() => handleOpenModal('edit', p)} className="action-btn-small"><Edit2 size={14} /></button>
                                            <button onClick={() => handleDelete(p._id)} className="action-btn-small" style={{ color: '#ef4444' }}><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredPositions.length === 0 && (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <Briefcase size={40} style={{ opacity: 0.1, marginBottom: '12px' }} />
                            <p>Lavozimlar topilmadi.</p>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="premium-card" style={{ width: '450px', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '700' }}>{modalMode === 'add' ? 'Yangi lavozim' : 'Tahrirlash'}</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Lavozim nomi</label>
                                    <input style={{ width: '100%' }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Bo'lim (Tashkiliy tuzilma)</label>
                                    <select 
                                        style={{ 
                                            width: '100%', 
                                            height: '44px', 
                                            background: '#1e293b', 
                                            border: '1px solid var(--border-color)', 
                                            borderRadius: '8px', 
                                            color: '#fff', 
                                            padding: '0 12px', 
                                            fontSize: '13px', 
                                            outline: 'none',
                                            cursor: 'pointer' 
                                        }}
                                        value={formData.departmentId} 
                                        onChange={e => {
                                            const depId = e.target.value;
                                            const dep = departments.find(d => (d._id || d.id) === depId);
                                            setFormData({
                                                ...formData,
                                                departmentId: depId,
                                                departmentName: dep ? dep.name : ''
                                            });
                                        }}
                                        required
                                    >
                                        <option value="" style={{ background: '#1e293b', color: '#fff' }}>Bo'limni tanlang...</option>
                                        {departments.map(d => (
                                            <option key={d._id || d.id} value={d._id || d.id} style={{ background: '#1e293b', color: '#fff' }}>
                                                {d.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Kodi (ID)</label>
                                    <input style={{ width: '100%' }} value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="Masalan: SM-01" required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Tavsif</label>
                                    <textarea 
                                        style={{ width: '100%', height: '80px', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '13px', resize: 'none' }} 
                                        value={formData.description} 
                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
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

export default PositionsSettings;
