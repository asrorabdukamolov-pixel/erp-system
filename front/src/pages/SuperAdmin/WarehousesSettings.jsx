import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Database, CheckCircle, XCircle, MapPin, User, Layers, Search, Info } from 'lucide-react';
import api from '../../utils/api';

const WarehousesSettings = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);

    const [costCenters, setCostCenters] = useState([]);
    const [users, setUsers] = useState([]);
    const [warehouseTypes, setWarehouseTypes] = useState([]);

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        type: '',
        responsiblePerson: '',
        costCenter: '',
        address: '',
        status: 'Active',
        description: ''
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [whRes, ccRes, userRes, typeRes] = await Promise.all([
                api.get('/warehouses').catch(() => ({ data: [] })),
                api.get('/cost-centers').catch(() => ({ data: [] })),
                api.get('/users').catch(() => ({ data: [] })),
                api.get('/warehouse-types').catch(() => ({ data: [] }))
            ]);

            setWarehouses(Array.isArray(whRes.data) ? whRes.data : []);
            setCostCenters(Array.isArray(ccRes.data) ? ccRes.data : []);
            setUsers(Array.isArray(userRes.data) ? userRes.data : []);
            setWarehouseTypes(Array.isArray(typeRes.data) ? typeRes.data : []);
        } catch (err) {
            console.error("Warehouses load error:", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleOpenModal = (mode, warehouse = null) => {
        setModalMode(mode);
        if (mode === 'edit' && warehouse) {
            setSelectedWarehouse(warehouse);
            setFormData({
                code: warehouse.code || '',
                name: warehouse.name || '',
                type: warehouse.type || '',
                responsiblePerson: warehouse.responsiblePerson || '',
                costCenter: warehouse.costCenter || '',
                address: warehouse.address || '',
                status: warehouse.status || 'Active',
                description: warehouse.description || ''
            });
        } else {
            setFormData({
                code: '',
                name: '',
                type: warehouseTypes.length > 0 ? warehouseTypes[0].name : '',
                responsiblePerson: '',
                costCenter: '',
                address: '',
                status: 'Active',
                description: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'add') {
                await api.post('/warehouses', formData);
            } else {
                await api.put(`/warehouses/${selectedWarehouse._id}`, formData);
            }
            loadData();
            setIsModalOpen(false);
        } catch (err) {
            alert("Xatolik yuz berdi: " + (err.response?.data?.msg || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Haqiqatan ham ushbu omborni o'chirib yubormoqchisiz?")) {
            try {
                await api.delete(`/warehouses/${id}`);
                loadData();
            } catch (err) {
                alert("O'chirishda xatolik yuz berdi");
            }
        }
    };

    const filteredWarehouses = warehouses.filter(w => 
        w.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.responsiblePerson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.costCenter?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.address?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Omborlar</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Tizimdagi jismoniy va virtual omborlar.</p>
                </div>
                <button className="gold-btn" onClick={() => handleOpenModal('add')}>
                    <Plus size={20} />
                    Yangi qo'shish
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Yuklanmoqda...</div>
            ) : (
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
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                                    <th style={{ padding: '12px 8px' }}>KOD</th>
                                    <th style={{ padding: '12px 8px' }}>OMBOR NOMI</th>
                                    <th style={{ padding: '12px 8px' }}>OMBOR TURI</th>
                                    <th style={{ padding: '12px 8px' }}>MAS'UL SHAXS</th>
                                    <th style={{ padding: '12px 8px' }}>XARAJAT MARKAZI</th>
                                    <th style={{ padding: '12px 8px' }}>MANZIL</th>
                                    <th style={{ padding: '12px 8px' }}>STATUS</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>AMALLAR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredWarehouses.map(w => (
                                    <tr key={w._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'all 0.2s' }}>
                                        <td style={{ padding: '16px 8px', fontSize: '13px', fontWeight: '700', color: 'var(--accent-gold)' }}>
                                            {w.code || '-'}
                                        </td>
                                        <td style={{ padding: '16px 8px', fontSize: '14px', fontWeight: '600' }}>
                                            {w.name}
                                        </td>
                                        <td style={{ padding: '16px 8px', fontSize: '13px' }}>
                                            <span style={{ 
                                                padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                                                background: w.type === 'Brak' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(212, 175, 55, 0.1)',
                                                color: w.type === 'Brak' ? '#ef4444' : 'var(--accent-gold)'
                                            }}>
                                                {w.type || '-'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 8px', fontSize: '13px', color: 'var(--text-primary)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <User size={14} style={{ color: 'var(--text-secondary)' }} />
                                                {w.responsiblePerson || '-'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                            {w.costCenter || '-'}
                                        </td>
                                        <td style={{ padding: '16px 8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <MapPin size={14} style={{ color: 'var(--text-secondary)' }} />
                                                {w.address || '-'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {w.status === 'Active' ? <CheckCircle size={14} color="#10b981" /> : <XCircle size={14} color="#ef4444" />}
                                                <span style={{ fontSize: '12px', fontWeight: '600', color: w.status === 'Active' ? '#10b981' : '#ef4444' }}>
                                                    {w.status || 'Active'}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button onClick={() => handleOpenModal('edit', w)} className="action-btn-small"><Edit2 size={14} /></button>
                                                <button onClick={() => handleDelete(w._id)} className="action-btn-small" style={{ color: '#ef4444' }}><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredWarehouses.length === 0 && (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                <Database size={40} style={{ opacity: 0.1, marginBottom: '12px' }} />
                                <p>Ma'lumotlar topilmadi.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, padding: '20px'
                }}>
                    <div className="premium-card" style={{ width: '550px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '800' }}>{modalMode === 'add' ? 'Yangi ma\'lumot' : 'Tahrirlash'}</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent' }}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Kod</label>
                                    <input 
                                        value={formData.code} 
                                        onChange={e => setFormData({...formData, code: e.target.value})} 
                                        placeholder="Masalan: WH-001" 
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Ombor nomi</label>
                                    <input 
                                        value={formData.name} 
                                        onChange={e => setFormData({...formData, name: e.target.value})} 
                                        placeholder="Masalan: Xomashyo ombori" 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Ombor turi</label>
                                    <select 
                                        value={formData.type} 
                                        onChange={e => setFormData({...formData, type: e.target.value})}
                                        style={{ width: '100%', height: '40px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '8px', padding: '0 10px', outline: 'none' }}
                                    >
                                        {warehouseTypes.length === 0 ? (
                                            <option value="" style={{ background: '#1e293b', color: '#fff' }}>-- Ombor turlari mavjud emas --</option>
                                        ) : (
                                            warehouseTypes.map(t => (
                                                <option key={t._id || t.id} value={t.name} style={{ background: '#1e293b', color: '#fff' }}>{t.name}</option>
                                            ))
                                        )}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Mas’ul shaxs</label>
                                    <select 
                                        value={formData.responsiblePerson} 
                                        onChange={e => setFormData({...formData, responsiblePerson: e.target.value})}
                                        style={{ width: '100%', height: '40px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '8px', padding: '0 10px', outline: 'none' }}
                                    >
                                        <option value="" style={{ background: '#1e293b', color: '#fff' }}>-- Tanlang --</option>
                                        {users.map(u => (
                                            <option key={u._id || u.id} value={`${u.name} ${u.surname || ''}`.trim()} style={{ background: '#1e293b', color: '#fff' }}>
                                                {u.name} {u.surname || ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Xarajat markazi</label>
                                    <select 
                                        value={formData.costCenter} 
                                        onChange={e => setFormData({...formData, costCenter: e.target.value})}
                                        style={{ width: '100%', height: '40px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '8px', padding: '0 10px', outline: 'none' }}
                                    >
                                        <option value="" style={{ background: '#1e293b', color: '#fff' }}>-- Tanlang --</option>
                                        {costCenters.filter(cc => cc.isActive !== false).map(cc => (
                                            <option key={cc._id || cc.id} value={cc.name} style={{ background: '#1e293b', color: '#fff' }}>
                                                {cc.code ? `${cc.code} - ` : ''}{cc.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Manzil</label>
                                    <input 
                                        value={formData.address} 
                                        onChange={e => setFormData({...formData, address: e.target.value})} 
                                        placeholder="Masalan: Toshkent sh., Chilonzor tumani" 
                                    />
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Active / Inactive</label>
                                    <select 
                                        value={formData.status} 
                                        onChange={e => setFormData({...formData, status: e.target.value})}
                                        style={{ width: '100%', height: '40px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '8px', padding: '0 10px', outline: 'none' }}
                                    >
                                        <option value="Active" style={{ background: '#1e293b', color: '#fff' }}>Active</option>
                                        <option value="Inactive" style={{ background: '#1e293b', color: '#fff' }}>Inactive</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Tavsif</label>
                                    <textarea 
                                        value={formData.description} 
                                        onChange={e => setFormData({...formData, description: e.target.value})} 
                                        placeholder="Ombor haqida izoh..." 
                                        rows={3} 
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '13px', resize: 'none' }}
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

export default WarehousesSettings;
