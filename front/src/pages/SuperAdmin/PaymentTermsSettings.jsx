import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, CreditCard, Database, CheckCircle, XCircle, Percent, Clock } from 'lucide-react';
import api from '../../utils/api';

const PaymentTermsSettings = () => {
    const [terms, setTerms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedTerm, setSelectedTerm] = useState(null);
    
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        type: 'Universal',
        model: 'Oldindan to\'lov',
        prepaymentPercent: 0,
        intermediatePercent: 0,
        finalPercent: 0,
        postponementDays: 0,
        trigger: '',
        status: 'Active',
        description: ''
    });

    const types = ['Mijoz', 'Ta\'minotchi', 'Universal'];
    const models = ['Oldindan to\'lov', 'Bosqichma-bosqich', 'Отсрочка', 'Individual'];

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/payment-terms');
            setTerms(res.data);
        } catch (err) {
            console.error("Payment terms load error", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleOpenModal = (mode, term = null) => {
        setModalMode(mode);
        if (mode === 'edit' && term) {
            setSelectedTerm(term);
            setFormData({
                code: term.code || '',
                name: term.name || '',
                type: term.type || 'Universal',
                model: term.model || 'Oldindan to\'lov',
                prepaymentPercent: term.prepaymentPercent || 0,
                intermediatePercent: term.intermediatePercent || 0,
                finalPercent: term.finalPercent || 0,
                postponementDays: term.postponementDays || 0,
                trigger: term.trigger || '',
                status: term.status || 'Active',
                description: term.description || ''
            });
        } else {
            setFormData({
                code: '',
                name: '',
                type: 'Universal',
                model: 'Oldindan to\'lov',
                prepaymentPercent: 0,
                intermediatePercent: 0,
                finalPercent: 0,
                postponementDays: 0,
                trigger: '',
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
                await api.post('/payment-terms', formData);
            } else {
                await api.put(`/payment-terms/${selectedTerm._id}`, formData);
            }
            loadData();
            setIsModalOpen(false);
        } catch (err) {
            alert("Xatolik yuz berdi: " + (err.response?.data?.msg || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Ushbu to'lov shartini o'chirmoqchimisiz?")) {
            try {
                await api.delete(`/payment-terms/${id}`);
                loadData();
            } catch (err) {
                alert("O'chirishda xatolik");
            }
        }
    };

    const handleSeed = async () => {
        try {
            await api.post('/payment-terms/seed');
            loadData();
            alert("Namunaviy to'lov shartlari qo'shildi!");
        } catch (err) {
            alert("Seed xatoligi");
        }
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800' }}>To‘lov shartlari</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Mijozlar va yetkazib beruvchilar билан ҳисоб-китоб қоидалари.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {terms.length === 0 && (
                        <button className="secondary-btn" onClick={handleSeed}>
                            <Database size={18} />
                            Намуналарни юклаш
                        </button>
                    )}
                    <button className="gold-btn" onClick={() => handleOpenModal('add')}>
                        <Plus size={20} />
                        Янги шарт қўшиш
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Юкланмоқда...</div>
            ) : terms.length === 0 ? (
                <div className="premium-card" style={{ padding: '60px', textAlign: 'center' }}>
                    <CreditCard size={48} style={{ color: 'var(--accent-gold)', opacity: 0.5, margin: '0 auto 20px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: '700' }}>To‘lov shartlari мавжуд эмас</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>Илтимос, янги тўлов шартини қўшинг.</p>
                </div>
            ) : (
                <div className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1100px' }}>
                            <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                                <tr>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>KOD / NOMI</th>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>TURI / MODELI</th>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>TO'LOV % (O / O / Y)</th>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>MUDDAT / TRIGGER</th>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>STATUS</th>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'right' }}>AMALLAR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {terms.map(term => (
                                    <tr key={term._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'all 0.2s' }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ fontWeight: '800', color: 'var(--accent-gold)', fontSize: '12px' }}>{term.code}</div>
                                            <div style={{ fontWeight: '700', fontSize: '14px', marginTop: '4px' }}>{term.name}</div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ fontSize: '13px', fontWeight: '600' }}>{term.type}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{term.model}</div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Oldindan</div>
                                                    <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent-gold)' }}>{term.prepaymentPercent}%</div>
                                                </div>
                                                <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }}></div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Oraliq</div>
                                                    <div style={{ fontSize: '13px', fontWeight: '800' }}>{term.intermediatePercent}%</div>
                                                </div>
                                                <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }}></div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Yakuniy</div>
                                                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#10b981' }}>{term.finalPercent}%</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600' }}>
                                                <Clock size={14} /> {term.postponementDays} kun
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{term.trigger}</div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {term.status === 'Active' ? <CheckCircle size={14} color="#10b981" /> : <XCircle size={14} color="#ef4444" />}
                                                <span style={{ fontSize: '12px', fontWeight: '600', color: term.status === 'Active' ? '#10b981' : '#ef4444' }}>
                                                    {term.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                                <button onClick={() => handleOpenModal('edit', term)} style={{ background: 'transparent', color: 'var(--text-secondary)' }}><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(term._id)} style={{ background: 'transparent', color: '#ef4444' }}><Trash2 size={16} /></button>
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
                    <div className="premium-card" style={{ width: '650px', padding: '32px', maxHeight: '95vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '800' }}>{modalMode === 'add' ? 'Yangi To\'lov Sharti Qo\'shish' : 'Tahrirlash'}</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent' }}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label>Kod</label>
                                    <input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="Masalan: PT-001" required />
                                </div>
                                <div className="form-group">
                                    <label>To‘lov sharti nomi</label>
                                    <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Masalan: 50/50 To'lov" required />
                                </div>
                                <div className="form-group">
                                    <label>Turi</label>
                                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                        {types.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>To‘lov modeli</label>
                                    <select value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})}>
                                        {models.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                
                                <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label style={{ fontSize: '11px' }}>Oldindan to‘lov %</label>
                                        <div style={{ position: 'relative' }}>
                                            <input type="number" value={formData.prepaymentPercent} onChange={e => setFormData({...formData, prepaymentPercent: parseInt(e.target.value) || 0})} style={{ paddingRight: '30px' }} />
                                            <Percent size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label style={{ fontSize: '11px' }}>Oraliq to‘lov %</label>
                                        <div style={{ position: 'relative' }}>
                                            <input type="number" value={formData.intermediatePercent} onChange={e => setFormData({...formData, intermediatePercent: parseInt(e.target.value) || 0})} style={{ paddingRight: '30px' }} />
                                            <Percent size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label style={{ fontSize: '11px' }}>Yakuniy to‘lov %</label>
                                        <div style={{ position: 'relative' }}>
                                            <input type="number" value={formData.finalPercent} onChange={e => setFormData({...formData, finalPercent: parseInt(e.target.value) || 0})} style={{ paddingRight: '30px' }} />
                                            <Percent size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Отсрочка kuni</label>
                                    <input type="number" value={formData.postponementDays} onChange={e => setFormData({...formData, postponementDays: parseInt(e.target.value) || 0})} placeholder="0" />
                                </div>
                                <div className="form-group">
                                    <label>Trigger / Shart</label>
                                    <input value={formData.trigger} onChange={e => setFormData({...formData, trigger: e.target.value})} placeholder="Masalan: Yuk kelganda" />
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

export default PaymentTermsSettings;
