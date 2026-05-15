import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, BarChartHorizontal, Database } from 'lucide-react';
import api from '../../utils/api';

const PnLCategoriesSettings = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        type: 'Expense',
        isCalculated: false,
        parentId: ''
    });

    const categoryTypes = [
        'Revenue',
        'Contra Revenue',
        'COGS',
        'Expense',
        'Other Income / Expense',
        'Finance Income / Expense',
        'Tax',
        'Calculated'
    ];

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/pnl-categories');
            setCategories(res.data);
        } catch (err) {
            console.error("P&L categories load error", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleOpenModal = (mode, category = null) => {
        setModalMode(mode);
        if (mode === 'edit' && category) {
            setSelectedCategory(category);
            setFormData({
                code: category.code,
                name: category.name,
                type: category.type,
                isCalculated: category.isCalculated || false,
                parentId: category.parentId || ''
            });
        } else if (mode === 'addSub' && category) {
            setFormData({ 
                code: '', 
                name: '', 
                type: category.type, 
                isCalculated: false,
                parentId: category._id 
            });
        } else {
            setFormData({ code: '', name: '', type: 'Expense', isCalculated: false, parentId: '' });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        try {
            if (modalMode === 'add') {
                await api.post('/pnl-categories', formData);
            } else {
                await api.put(`/pnl-categories/${selectedCategory._id}`, formData);
            }
            loadData();
            setIsModalOpen(false);
        } catch (err) {
            alert("Xatolik yuz berdi");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Ushbu kategoriyani o'chirmoqchimisiz?")) {
            try {
                await api.delete(`/pnl-categories/${id}`);
                loadData();
            } catch (err) {
                alert("O'chirishda xatolik");
            }
        }
    };

    const handleSeed = async () => {
        if (categories.length > 0) {
            if (!window.confirm("Tizimda allaqachon kategoriyalar mavjud. Standart kategoriyalarni qo'shishni davom ettirasizmi? (Takroriy bandlar paydo bo'lishi mumkin)")) {
                return;
            }
        }
        
        try {
            await api.post('/pnl-categories/seed');
            loadData();
            alert("Standart kategoriyalar muvaffaqiyatli qo'shildi!");
        } catch (err) {
            alert("Seed xatoligi: " + err.message);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800' }}>P&L Kategoriyalari</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Foyda va zarar hisoboti (P&L) uchun yuqori darajadagi strukturani boshqarish.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {categories.length === 0 && (
                        <button className="secondary-btn" onClick={handleSeed} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                            <Database size={18} />
                            Standartlarni qo'shish
                        </button>
                    )}
                    <button className="gold-btn" onClick={() => handleOpenModal('add')}>
                        <Plus size={20} />
                        Yangi kategoriya
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Yuklanmoqda...</div>
            ) : categories.length === 0 ? (
                <div className="premium-card" style={{ padding: '60px', textAlign: 'center' }}>
                    <BarChartHorizontal size={48} style={{ color: 'var(--accent-gold)', opacity: 0.5, margin: '0 auto 20px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Kategoriyalar mavjud emas</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>Iltimos, yangi kategoriya qo'shing yoki standartlarni yuklang.</p>
                </div>
            ) : (
                <div className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                            <tr>
                                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-secondary)' }}>KOD</th>
                                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-secondary)' }}>KATEGORIYA NOMI</th>
                                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-secondary)' }}>TURI</th>
                                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-secondary)' }}>HISOB-KITOB?</th>
                                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'right' }}>AMALLAR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories
                                .filter(cat => !cat.parentId) // Top level first
                                .map(parent => (
                                    <React.Fragment key={parent._id}>
                                        <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                                            <td style={{ padding: '12px 24px' }}>
                                                <span style={{ fontWeight: '800', color: 'var(--accent-gold)' }}>{parent.code}</span>
                                            </td>
                                            <td style={{ padding: '12px 24px', fontWeight: '800', fontSize: '15px' }}>
                                                {parent.name}
                                            </td>
                                            <td style={{ padding: '12px 24px' }}>
                                                <span style={{ 
                                                    padding: '4px 10px', 
                                                    borderRadius: '6px', 
                                                    fontSize: '11px', 
                                                    fontWeight: '700',
                                                    background: parent.type === 'Calculated' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                                    color: parent.type === 'Calculated' ? '#3b82f6' : 'white'
                                                }}>
                                                    {parent.type}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 24px' }}>
                                                <span style={{ color: parent.isCalculated ? '#10b981' : 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>
                                                    {parent.isCalculated ? 'Ha' : 'Yo\'q'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 24px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                                    <button onClick={() => handleOpenModal('addSub', parent)} style={{ background: 'transparent', color: 'var(--accent-gold)' }} title="Pod-punkt qo'shish"><Plus size={14} /></button>
                                                    <button onClick={() => handleOpenModal('edit', parent)} style={{ background: 'transparent', color: 'var(--text-secondary)' }} title="Tahrirlash"><Edit2 size={14} /></button>
                                                    <button onClick={() => handleDelete(parent._id)} style={{ background: 'transparent', color: '#ef4444' }} title="O'chirish"><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                        {/* Children */}
                                        {categories
                                            .filter(child => child.parentId === parent._id)
                                            .map(child => (
                                                <tr key={child._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'all 0.2s' }}>
                                                    <td style={{ padding: '10px 24px 10px 48px' }}>
                                                        <span style={{ fontWeight: '600', color: 'rgba(212, 175, 55, 0.7)' }}>{child.code}</span>
                                                    </td>
                                                    <td style={{ padding: '10px 24px', fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>
                                                        <span style={{ color: 'var(--text-secondary)', marginRight: '8px' }}>—</span>
                                                        {child.name}
                                                    </td>
                                                    <td style={{ padding: '10px 24px' }}>
                                                        <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '10px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)' }}>
                                                            {child.type}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '10px 24px' }}>
                                                        <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Yo'q</span>
                                                    </td>
                                                    <td style={{ padding: '10px 24px', textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                                            <button onClick={() => handleOpenModal('edit', child)} style={{ background: 'transparent', color: 'var(--text-secondary)' }} title="Tahrirlash"><Edit2 size={14} /></button>
                                                            <button onClick={() => handleDelete(child._id)} style={{ background: 'transparent', color: '#ef4444' }} title="O'chirish"><Trash2 size={14} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </React.Fragment>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000
                }}>
                    <div className="premium-card" style={{ width: '450px', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '800' }}>{modalMode === 'add' ? 'Yangi P&L Kategoriyasi' : 'Tahrirlash'}</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent' }}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Kod</label>
                                        <input 
                                            placeholder="1000"
                                            style={{ width: '100%' }}
                                            value={formData.code}
                                            onChange={e => setFormData({...formData, code: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Nomi</label>
                                        <input 
                                            placeholder="Kategoriya nomi"
                                            style={{ width: '100%' }}
                                            value={formData.name}
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Turi</label>
                                    <select 
                                        style={{ width: '100%' }}
                                        value={formData.type}
                                        onChange={e => setFormData({...formData, type: e.target.value, isCalculated: e.target.value === 'Calculated'})}
                                    >
                                        {categoryTypes.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Yuqori (Ota) kategoriya</label>
                                    <select 
                                        style={{ width: '100%' }}
                                        value={formData.parentId}
                                        onChange={e => setFormData({...formData, parentId: e.target.value})}
                                    >
                                        <option value="">-- Yuqori darajali --</option>
                                        {categories.filter(c => !c.parentId && c._id !== selectedCategory?._id).map(c => (
                                            <option key={c._id} value={c._id}>{c.code} - {c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                                    <input 
                                        type="checkbox" 
                                        id="isCalculated"
                                        checked={formData.isCalculated}
                                        onChange={e => setFormData({...formData, isCalculated: e.target.checked})}
                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                    />
                                    <label htmlFor="isCalculated" style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                                        Hisob-kitob qatorimi? (Formula)
                                    </label>
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

export default PnLCategoriesSettings;
