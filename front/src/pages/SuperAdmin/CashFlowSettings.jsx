import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, ArrowUpCircle, ArrowDownCircle, Briefcase, Landmark, Factory } from 'lucide-react';
import api from '../../utils/api';

const CashFlowSettings = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: 'operating',
        type: 'inflow',
        code: ''
    });

    const categories = [
        { value: 'operating', label: 'Operatsion faoliyat', icon: <Briefcase size={18} />, color: '#3b82f6' },
        { value: 'investing', label: 'Investitsiya faoliyati', icon: <Factory size={18} />, color: '#10b981' },
        { value: 'financing', label: 'Moliyaviy faoliyat', icon: <Landmark size={18} />, color: '#8b5cf6' }
    ];

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/cash-flow');
            setItems(res.data);
        } catch (err) {
            console.error("Cash flow items load error", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        if (mode === 'edit' && item) {
            setSelectedItem(item);
            setFormData({
                name: item.name,
                category: item.category,
                type: item.type,
                code: item.code || ''
            });
        } else {
            setFormData({ name: '', category: 'operating', type: 'inflow', code: '' });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'add') {
                await api.post('/cash-flow', formData);
            } else {
                await api.put(`/cash-flow/${selectedItem.id}`, formData);
            }
            loadData();
            setIsModalOpen(false);
        } catch (err) {
            alert("Xatolik yuz berdi");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Ushbu bandni o'chirmoqchimisiz?")) {
            try {
                await api.delete(`/cash-flow/${id}`);
                loadData();
            } catch (err) {
                alert("O'chirishda xatolik");
            }
        }
    };

    const renderCategoryGroup = (catValue) => {
        const catItems = items.filter(i => i.category === catValue);
        const cat = categories.find(c => c.value === catValue);

        return (
            <div key={catValue} className="premium-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    <div style={{ color: cat.color }}>{cat.icon}</div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{cat.label}</h3>
                    <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px' }}>
                        {catItems.length} ta band
                    </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {catItems.length > 0 ? catItems.map(item => (
                        <div key={item.id} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '15px', 
                            padding: '12px 16px', 
                            background: 'rgba(255,255,255,0.02)', 
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div style={{ color: item.type === 'inflow' ? '#10b981' : '#ef4444' }}>
                                {item.type === 'inflow' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{item.name}</span>
                                    {item.code && <span style={{ fontSize: '10px', color: 'var(--accent-gold)', fontWeight: '700' }}>{item.code}</span>}
                                </div>
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                                    {item.type === 'inflow' ? 'Kirim' : 'Chiqim'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => handleOpenModal('edit', item)} style={{ background: 'transparent', color: 'var(--text-secondary)' }}><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(item.id)} style={{ background: 'transparent', color: '#ef4444' }}><Trash2 size={16} /></button>
                            </div>
                        </div>
                    )) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                            Ushbu toifada hali bandlar yo'q.
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Pul Oqimlari Strukturasi</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Hisobotlar uchun pul harakati turlarini boshqarish.</p>
                </div>
                <button className="gold-btn" onClick={() => handleOpenModal('add')}>
                    <Plus size={20} />
                    Yangi band qo'shish
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Yuklanmoqda...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
                    {categories.map(cat => renderCategoryGroup(cat.value))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100
                }}>
                    <div className="premium-card" style={{ width: '450px', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '800' }}>{modalMode === 'add' ? 'Yangi Pul Oqimi Bandi' : 'Tahrirlash'}</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent' }}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Nomi</label>
                                    <input 
                                        placeholder="Masalan: Mahsulot sotishdan tushum"
                                        style={{ width: '100%' }}
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        required
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Faoliyat turi</label>
                                        <select 
                                            style={{ width: '100%' }}
                                            value={formData.category}
                                            onChange={e => setFormData({...formData, category: e.target.value})}
                                        >
                                            {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Pul oqimi yo'nalishi</label>
                                        <select 
                                            style={{ width: '100%' }}
                                            value={formData.type}
                                            onChange={e => setFormData({...formData, type: e.target.value})}
                                        >
                                            <option value="inflow">Kirim (+)</option>
                                            <option value="outflow">Chiqim (-)</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Kod (Accounting)</label>
                                    <input 
                                        placeholder="CF-001"
                                        style={{ width: '100%' }}
                                        value={formData.code}
                                        onChange={e => setFormData({...formData, code: e.target.value})}
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

export default CashFlowSettings;
