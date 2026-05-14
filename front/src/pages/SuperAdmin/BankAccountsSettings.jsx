import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Wallet, Database, CheckCircle, XCircle } from 'lucide-react';
import api from '../../utils/api';

const BankAccountsSettings = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedAccount, setSelectedAccount] = useState(null);
    
    // Dropdown data
    const [costCenters, setCostCenters] = useState([]);
    const [staff, setStaff] = useState([]);
    
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        type: 'Bank',
        currency: 'UZS',
        bankName: '',
        accountNumber: '',
        responsiblePerson: '',
        costCenter: '',
        status: 'Active',
        description: ''
    });

    const accountTypes = ['Bank', 'Cash', 'E-Wallet', 'Other'];
    const currencies = ['UZS', 'USD', 'EUR', 'RUB'];

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/bank-accounts');
            setAccounts(res.data);
            
            // Try to load extra data for dropdowns
            try {
                const ccRes = await api.get('/cost-centers');
                setCostCenters(ccRes.data);
                
                const userRes = await api.get('/users');
                setStaff(userRes.data);
            } catch (e) {
                console.log("Dropdown data load error", e);
            }
            
        } catch (err) {
            console.error("Bank accounts load error", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleOpenModal = (mode, account = null) => {
        setModalMode(mode);
        if (mode === 'edit' && account) {
            setSelectedAccount(account);
            setFormData({
                code: account.code || '',
                name: account.name || '',
                type: account.type || 'Bank',
                currency: account.currency || 'UZS',
                bankName: account.bankName || '',
                accountNumber: account.accountNumber || '',
                responsiblePerson: account.responsiblePerson || '',
                costCenter: account.costCenter || '',
                status: account.status || 'Active',
                description: account.description || ''
            });
        } else {
            setFormData({
                code: '',
                name: '',
                type: 'Bank',
                currency: 'UZS',
                bankName: '',
                accountNumber: '',
                responsiblePerson: '',
                costCenter: '',
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
                await api.post('/bank-accounts', formData);
            } else {
                await api.put(`/bank-accounts/${selectedAccount._id}`, formData);
            }
            loadData();
            setIsModalOpen(false);
        } catch (err) {
            alert("Xatolik yuz berdi: " + (err.response?.data?.msg || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Ushbu hisobni o'chirmoqchimisiz?")) {
            try {
                await api.delete(`/bank-accounts/${id}`);
                loadData();
            } catch (err) {
                alert("O'chirishda xatolik");
            }
        }
    };

    const handleSeed = async () => {
        try {
            await api.post('/bank-accounts/seed');
            loadData();
            alert("Namunaviy hisoblar qo'shildi!");
        } catch (err) {
            alert("Seed xatoligi");
        }
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Bank ва кассалар</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Тизимдаги барча пул ҳисоблари ва кассаларни бошқариш.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {accounts.length === 0 && (
                        <button className="secondary-btn" onClick={handleSeed}>
                            <Database size={18} />
                            Намуналарни юклаш
                        </button>
                    )}
                    <button className="gold-btn" onClick={() => handleOpenModal('add')}>
                        <Plus size={20} />
                        Янги ҳисоб қўшиш
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Юкланмоқда...</div>
            ) : accounts.length === 0 ? (
                <div className="premium-card" style={{ padding: '60px', textAlign: 'center' }}>
                    <Wallet size={48} style={{ color: 'var(--accent-gold)', opacity: 0.5, margin: '0 auto 20px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Ҳисоблар мавжуд эмас</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>Илтимос, янги банк ҳисоби ёки касса қўшинг.</p>
                </div>
            ) : (
                <div className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
                            <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                                <tr>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>KOD / NOMI</th>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>TURI</th>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>VALYUTA</th>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>BANK / RAQAM</th>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>MAS'UL / ЦФО</th>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>STATUS</th>
                                    <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'right' }}>AMALLAR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accounts.map(acc => (
                                    <tr key={acc._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'all 0.2s' }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ fontWeight: '800', color: 'var(--accent-gold)', fontSize: '12px' }}>{acc.code}</div>
                                            <div style={{ fontWeight: '700', fontSize: '14px', marginTop: '4px' }}>{acc.name}</div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{ 
                                                padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                                                background: acc.type === 'Cash' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                                color: acc.type === 'Cash' ? '#10b981' : '#3b82f6'
                                            }}>
                                                {acc.type}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px', fontWeight: '700', color: 'var(--accent-gold)' }}>
                                            {acc.currency}
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ fontSize: '13px', fontWeight: '600' }}>{acc.bankName}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{acc.accountNumber}</div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ fontSize: '13px', fontWeight: '600' }}>{acc.responsiblePerson}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{acc.costCenter}</div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {acc.status === 'Active' ? <CheckCircle size={14} color="#10b981" /> : <XCircle size={14} color="#ef4444" />}
                                                <span style={{ fontSize: '12px', fontWeight: '600', color: acc.status === 'Active' ? '#10b981' : '#ef4444' }}>
                                                    {acc.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                                <button onClick={() => handleOpenModal('edit', acc)} style={{ background: 'transparent', color: 'var(--text-secondary)' }}><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(acc._id)} style={{ background: 'transparent', color: '#ef4444' }}><Trash2 size={16} /></button>
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
                    <div className="premium-card" style={{ width: '600px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '800' }}>{modalMode === 'add' ? 'Yangi Hisob Qo\'shish' : 'Tahrirlash'}</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent' }}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label>Kod</label>
                                    <input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="Masalan: 101" required />
                                </div>
                                <div className="form-group">
                                    <label>Hisob nomi</label>
                                    <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Asosiy Kassa" required />
                                </div>
                                <div className="form-group">
                                    <label>Turi</label>
                                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                        {accountTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Valyuta</label>
                                    <select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}>
                                        {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Bank nomi</label>
                                    <input value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} placeholder="Bank nomi (bo'sh бўлиши мумкин)" />
                                </div>
                                <div className="form-group">
                                    <label>Hisob raqami</label>
                                    <input value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} placeholder="202088..." />
                                </div>
                                <div className="form-group">
                                    <label>Mas'ul shaxs</label>
                                    <select value={formData.responsiblePerson} onChange={e => setFormData({...formData, responsiblePerson: e.target.value})}>
                                        <option value="">-- Танланг --</option>
                                        {staff.map(u => <option key={u._id || u.id} value={u.name}>{u.name} {u.surname || ''}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Xarajat markazi / ЦФО</label>
                                    <select value={formData.costCenter} onChange={e => setFormData({...formData, costCenter: e.target.value})}>
                                        <option value="">-- Танланг --</option>
                                        {costCenters.filter(cc => cc.isActive).map(cc => (
                                            <option key={cc._id || cc.id} value={cc.name}>{cc.code ? `${cc.code} - ` : ''}{cc.name}</option>
                                        ))}
                                    </select>
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
                                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Qisqacha izoh..." rows={3} />
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

export default BankAccountsSettings;
