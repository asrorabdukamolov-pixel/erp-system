import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Tag } from 'lucide-react';
import api from '../../utils/api';

const ExpenseItemsSettings = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedItem, setSelectedItem] = useState(null);
    const [expandedGroups, setExpandedGroups] = useState({});
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        parentId: '',
        description: ''
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/expense-items');
            setItems(res.data);
        } catch (err) {
            console.error("Expense items load error", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const toggleGroup = (id) => {
        setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        if (mode === 'edit' && item) {
            setSelectedItem(item);
            setFormData({
                code: item.code,
                name: item.name,
                parentId: item.parentId || '',
                description: item.description || ''
            });
        } else {
            setFormData({ code: '', name: '', parentId: '', description: '' });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        // Check for duplicate code
        const isDuplicate = items.some(item => 
            item.code === formData.code && item.id !== selectedItem?.id
        );

        if (isDuplicate) {
            alert(`Xatolik: "${formData.code}" kodli modda allaqachon mavjud. Iltimos, boshqa koddan foydalaning.`);
            return;
        }

        try {
            // Ensure parentId is null if empty string
            const dataToSave = {
                ...formData,
                parentId: formData.parentId || null
            };

            if (modalMode === 'add') {
                await api.post('/expense-items', dataToSave);
            } else {
                await api.put(`/expense-items/${selectedItem.id}`, dataToSave);
            }
            loadData();
            setIsModalOpen(false);
        } catch (err) {
            alert("Xatolik yuz berdi");
        }
    };

    const handleDelete = async (id) => {
        const hasChildren = items.some(i => i.parentId === id);
        const msg = hasChildren 
            ? "Ushbu asosiy modda ichida qism-moddalar bor. Agar o'chirsangiz, ular egasiz bo'lib qoladi. Baribir o'chirmoqchimisiz?"
            : "Ushbu xarajat moddasini o'chirmoqchimisiz?";

        if (window.confirm(msg)) {
            try {
                await api.delete(`/expense-items/${id}`);
                loadData();
            } catch (err) {
                alert("O'chirishda xatolik");
            }
        }
    };

    const mainItems = items.filter(i => !i.parentId).sort((a, b) => parseInt(a.code) - parseInt(b.code));
    const getSubItems = (parentId) => items.filter(i => i.parentId === parentId).sort((a, b) => parseInt(a.code) - parseInt(b.code));
    // Items that have a parentId that no longer exists in items list
    const orphanedItems = items.filter(i => i.parentId && !items.find(m => m.id === i.parentId));

    const renderItemRow = (item, level = 0, isOrphan = false) => {
        const subItems = getSubItems(item.id);
        const hasSubItems = subItems.length > 0;
        const isExpanded = expandedGroups[item.id];

        return (
            <React.Fragment key={item.id}>
                <tr style={{ 
                    borderBottom: '1px solid var(--border-color)', 
                    background: level === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                    transition: 'all 0.2s',
                    opacity: isOrphan ? 0.6 : 1
                }}>
                    <td style={{ padding: '12px 24px', paddingLeft: level === 0 ? '24px' : '60px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {level === 0 && hasSubItems && (
                                <button onClick={() => toggleGroup(item.id)} style={{ background: 'transparent', padding: '0', display: 'flex' }}>
                                    <span style={{ transition: '0.2s', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', fontSize: '10px' }}>▶</span>
                                </button>
                            )}
                            <span style={{ fontWeight: level === 0 ? '800' : '500', color: level === 0 ? 'var(--accent-gold)' : (isOrphan ? '#ef4444' : 'white') }}>
                                {item.code} {isOrphan && '(Egasiz)'}
                            </span>
                        </div>
                    </td>
                    <td style={{ padding: '12px 24px', fontWeight: level === 0 ? '700' : '400', fontSize: level === 0 ? '14px' : '13px' }}>
                        {item.name}
                    </td>
                    <td style={{ padding: '12px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button onClick={() => handleOpenModal('edit', item)} style={{ background: 'transparent', color: 'var(--text-secondary)' }} title="Tahrirlash"><Edit2 size={14} /></button>
                            <button onClick={() => handleDelete(item.id)} style={{ background: 'transparent', color: '#ef4444' }} title="O'chirish"><Trash2 size={14} /></button>
                        </div>
                    </td>
                </tr>
                {level === 0 && isExpanded && subItems.map(sub => renderItemRow(sub, 1))}
            </React.Fragment>
        );
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Xarajat Moddalari</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Tizimdagi barcha xarajat turlarini boshqarish.</p>
                </div>
                <button className="gold-btn" onClick={() => handleOpenModal('add')}>
                    <Plus size={20} />
                    Yangi modda qo'shish
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Yuklanmoqda...</div>
            ) : (
                <div className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                            <tr>
                                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-secondary)' }}>KOD</th>
                                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-secondary)' }}>NOMI</th>
                                <th style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'right' }}>AMALLAR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mainItems.map(item => renderItemRow(item))}
                            {orphanedItems.length > 0 && (
                                <>
                                    <tr style={{ background: 'rgba(239, 68, 68, 0.05)' }}>
                                        <td colSpan="3" style={{ padding: '8px 24px', fontSize: '12px', color: '#ef4444', fontWeight: '700' }}>EGASIZ QOLGAN BANDLAR (Asosiy moddasi o'chirilgan)</td>
                                    </tr>
                                    {orphanedItems.map(item => renderItemRow(item, 0, true))}
                                </>
                            )}
                        </tbody>
                    </table>
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
                            <h3 style={{ fontSize: '20px', fontWeight: '800' }}>{modalMode === 'add' ? 'Yangi Xarajat Moddasi' : 'Tahrirlash'}</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent' }}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Kod</label>
                                        <input 
                                            placeholder="1010"
                                            style={{ width: '100%' }}
                                            value={formData.code}
                                            onChange={e => setFormData({...formData, code: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Nomi</label>
                                        <input 
                                            placeholder="Xarajat nomi"
                                            style={{ width: '100%' }}
                                            value={formData.name}
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Asosiy modda (Parent)</label>
                                    <select 
                                        style={{ width: '100%' }}
                                        value={formData.parentId}
                                        onChange={e => setFormData({...formData, parentId: e.target.value})}
                                    >
                                        <option value="">-- Asosiy modda (Hech biri) --</option>
                                        {mainItems.filter(i => i.id !== selectedItem?.id).map(i => (
                                            <option key={i.id} value={i.id}>{i.code} - {i.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Tavsif</label>
                                    <textarea 
                                        placeholder="..."
                                        style={{ width: '100%', minHeight: '80px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px', color: 'white' }}
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

export default ExpenseItemsSettings;
