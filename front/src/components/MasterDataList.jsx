import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, Search, Info } from 'lucide-react';
import api from '../utils/api';

const MasterDataList = ({ title, description, endpoint, icon: Icon }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const isCustomerType = endpoint === '/customer-types';

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        legalStatus: 'yuridik'
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await api.get(endpoint).catch(() => ({ data: [] }));
            setItems(res.data || []);
        } catch (err) {
            console.error(`${title} load error:`, err);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [endpoint]);

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        if (mode === 'edit' && item) {
            setSelectedItem(item);
            setFormData({
                name: item.name || '',
                code: item.code || '',
                description: item.description || '',
                legalStatus: item.legalStatus || 'yuridik'
            });
        } else {
            setFormData({
                name: '',
                code: '',
                description: '',
                legalStatus: 'yuridik'
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'add') {
                await api.post(endpoint, formData);
            } else {
                await api.put(`${endpoint}/${selectedItem._id}`, formData);
            }
            loadData();
            setIsModalOpen(false);
        } catch (err) {
            alert(err.response?.data?.msg || "Xatolik yuz berdi");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Haqiqatdan ham ushbu ma'lumotni o'chirmoqchimisiz?")) {
            try {
                await api.delete(`${endpoint}/${id}`);
                loadData();
            } catch (err) {
                alert(err.response?.data?.msg || "Xatolik yuz berdi");
            }
        }
    };

    const filteredItems = items
        .filter(i => 
            i.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            i.code?.toLowerCase().includes(searchQuery.toLowerCase())
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
                    <h3 style={{ fontSize: '20px', fontWeight: '700' }}>{title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{description}</p>
                </div>
                <button className="gold-btn" onClick={() => handleOpenModal('add')}>
                    <Plus size={18} />
                    Yangi qo'shish
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
                                <th style={{ padding: '12px 8px' }}>NOMI</th>
                                {isCustomerType && <th style={{ padding: '12px 8px' }}>HUQUQIY MAQOMI</th>}
                                <th style={{ padding: '12px 8px' }}>TAVSIF</th>
                                <th style={{ padding: '12px 8px', textAlign: 'right' }}>AMALLAR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map(item => (
                                <tr key={item._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '16px 8px', fontSize: '13px', fontWeight: '700', color: 'var(--accent-gold)' }}>{item.code || '-'}</td>
                                    <td style={{ padding: '16px 8px', fontSize: '14px', fontWeight: '600' }}>{item.name}</td>
                                    {isCustomerType && (
                                        <td style={{ padding: '16px 8px', fontSize: '13px' }}>
                                            {item.legalStatus === 'jismoniy' ? 'Jismoniy shaxs' : 'Yuridik shaxs'}
                                        </td>
                                    )}
                                    <td style={{ padding: '16px 8px', fontSize: '13px', color: 'var(--text-secondary)' }}>{item.description || '-'}</td>
                                    <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button onClick={() => handleOpenModal('edit', item)} className="action-btn-small"><Edit2 size={14} /></button>
                                            <button onClick={() => handleDelete(item._id)} className="action-btn-small" style={{ color: '#ef4444' }}><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredItems.length === 0 && (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            {Icon ? <Icon size={40} style={{ opacity: 0.1, marginBottom: '12px' }} /> : <Info size={40} style={{ opacity: 0.1, marginBottom: '12px' }} />}
                            <p>Ma'lumotlar topilmadi.</p>
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
                            <h3 style={{ fontSize: '20px', fontWeight: '700' }}>{modalMode === 'add' ? 'Yangi ma\'lumot' : 'Tahrirlash'}</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                        {isCustomerType ? 'Mijoz nomi' : 'Nomi'}
                                    </label>
                                    <input style={{ width: '100%' }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                        {isCustomerType ? 'Mijoz kodi' : 'Kodi (Ixtiyoriy)'}
                                    </label>
                                    <input style={{ width: '100%' }} value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                                </div>
                                {isCustomerType && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Huquqiy maqomi</label>
                                        <select 
                                            style={{ width: '100%', height: '40px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '8px', padding: '0 10px', outline: 'none' }}
                                            value={formData.legalStatus}
                                            onChange={e => setFormData({...formData, legalStatus: e.target.value})}
                                        >
                                            <option value="yuridik">Yuridik shaxs</option>
                                            <option value="jismoniy">Jismoniy shaxs</option>
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                        {isCustomerType ? 'Izoh' : 'Tavsif'}
                                    </label>
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

export default MasterDataList;
