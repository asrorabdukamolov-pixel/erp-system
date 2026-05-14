import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Coins, Database, CheckCircle, XCircle, Star, Hash, Activity } from 'lucide-react';
import api from '../../utils/api';

const CurrenciesSettings = () => {
    const [currencies, setCurrencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedCurrency, setSelectedCurrency] = useState(null);
    
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        symbol: '',
        isBase: false,
        decimalPlaces: 0,
        needsRate: true,
        status: 'Active',
        description: ''
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/currencies');
            setCurrencies(res.data);
        } catch (err) {
            console.error("Currencies load error", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleOpenModal = (mode, curr = null) => {
        setModalMode(mode);
        if (mode === 'edit' && curr) {
            setSelectedCurrency(curr);
            setFormData({
                code: curr.code || '',
                name: curr.name || '',
                symbol: curr.symbol || '',
                isBase: curr.isBase || false,
                decimalPlaces: curr.decimalPlaces || 0,
                needsRate: curr.needsRate !== undefined ? curr.needsRate : true,
                status: curr.status || 'Active',
                description: curr.description || ''
            });
        } else {
            setFormData({
                code: '',
                name: '',
                symbol: '',
                isBase: false,
                decimalPlaces: 0,
                needsRate: true,
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
                await api.post('/currencies', formData);
            } else {
                await api.put(`/currencies/${selectedCurrency._id}`, formData);
            }
            loadData();
            setIsModalOpen(false);
        } catch (err) {
            alert("Xatolik yuz berdi: " + (err.response?.data?.msg || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Ushbu valyutani o'chirmoqchimisiz?")) {
            try {
                await api.delete(`/currencies/${id}`);
                loadData();
            } catch (err) {
                alert("O'chirishda xatolik");
            }
        }
    };

    const handleSeed = async () => {
        try {
            await api.post('/currencies/seed');
            loadData();
            alert("Namunaviy valyutalar qo'shildi!");
        } catch (err) {
            alert("Seed xatoligi");
        }
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Valyutalar</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Тизимда ишлатиладиган пул бирликлари ва уларнинг созламалари.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {currencies.length === 0 && (
                        <button className="secondary-btn" onClick={handleSeed}>
                            <Database size={18} />
                            Намуналарни юклаш
                        </button>
                    )}
                    <button className="gold-btn" onClick={() => handleOpenModal('add')}>
                        <Plus size={20} />
                        Янги валята қўшиш
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Юкланмоқда...</div>
            ) : currencies.length === 0 ? (
                <div className="premium-card" style={{ padding: '60px', textAlign: 'center' }}>
                    <Coins size={48} style={{ color: 'var(--accent-gold)', opacity: 0.5, margin: '0 auto 20px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Valyutalar мавжуд эмас</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>Илтимос, янги валята қўшинг.</p>
                </div>
            ) : (
                <div className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                                <tr>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>KOD / NOMI</th>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>BELGI</th>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>ASOSIY</th>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>DECIMAL / KURS</th>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>STATUS</th>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'right' }}>AMALLAR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currencies.map(curr => (
                                    <tr key={curr._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'all 0.2s' }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ fontWeight: '800', color: 'var(--accent-gold)', fontSize: '12px' }}>{curr.code}</div>
                                            <div style={{ fontWeight: '700', fontSize: '14px', marginTop: '4px' }}>{curr.name}</div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ 
                                                width: '32px', height: '32px', borderRadius: '8px', 
                                                background: 'rgba(212,175,55,0.1)', color: 'var(--accent-gold)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '16px', fontWeight: '800'
                                            }}>
                                                {curr.symbol}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            {curr.isBase ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-gold)' }}>
                                                    <Star size={16} fill="var(--accent-gold)" />
                                                    <span style={{ fontSize: '12px', fontWeight: '800' }}>ASOSIY</span>
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>-</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', gap: '15px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Hash size={14} style={{ opacity: 0.5 }} />
                                                    <span style={{ fontSize: '13px', fontWeight: '700' }}>{curr.decimalPlaces}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Activity size={14} style={{ opacity: 0.5 }} />
                                                    <span style={{ fontSize: '11px', fontWeight: '700', color: curr.needsRate ? 'var(--accent-gold)' : 'var(--text-secondary)' }}>
                                                        {curr.needsRate ? 'KURS KERAK' : 'DOIMIY'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {curr.status === 'Active' ? <CheckCircle size={14} color="#10b981" /> : <XCircle size={14} color="#ef4444" />}
                                                <span style={{ fontSize: '12px', fontWeight: '600', color: curr.status === 'Active' ? '#10b981' : '#ef4444' }}>
                                                    {curr.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                                <button onClick={() => handleOpenModal('edit', curr)} style={{ background: 'transparent', color: 'var(--text-secondary)' }}><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(curr._id)} style={{ background: 'transparent', color: '#ef4444' }}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                    <div className="premium-card" style={{ width: '500px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '800' }}>{modalMode === 'add' ? 'Yangi Valyuta Qo\'shish' : 'Tahrirlash'}</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent' }}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label>Valyuta kodi</label>
                                    <input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="Masalan: UZS" required />
                                </div>
                                <div className="form-group">
                                    <label>Valyuta nomi</label>
                                    <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Masalan: O'zbek so'mi" required />
                                </div>
                                <div className="form-group">
                                    <label>Belgi (Symbol)</label>
                                    <input value={formData.symbol} onChange={e => setFormData({...formData, symbol: e.target.value})} placeholder="Masalan: so'm" required />
                                </div>
                                <div className="form-group">
                                    <label>Decimal (nuqtadan keyin)</label>
                                    <input type="number" value={formData.decimalPlaces} onChange={e => setFormData({...formData, decimalPlaces: parseInt(e.target.value) || 0})} />
                                </div>
                                
                                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '20px', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input type="checkbox" id="isBase" checked={formData.isBase} onChange={e => setFormData({...formData, isBase: e.target.checked})} />
                                        <label htmlFor="isBase" style={{ cursor: 'pointer', fontSize: '13px' }}>Asosiy valyutami?</label>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input type="checkbox" id="needsRate" checked={formData.needsRate} onChange={e => setFormData({...formData, needsRate: e.target.checked})} />
                                        <label htmlFor="needsRate" style={{ cursor: 'pointer', fontSize: '13px' }}>Kurs керакми?</label>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Status</label>
                                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label>Tavsif</label>
                                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Qisqacha izoh..." rows={2} />
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

export default CurrenciesSettings;
