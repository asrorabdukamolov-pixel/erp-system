import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Landmark, Database, CheckCircle, XCircle, Percent, List, Calendar, Tag } from 'lucide-react';
import api from '../../utils/api';

const TaxesSettings = () => {
    const [taxTypes, setTaxTypes] = useState([]);
    const [taxRates, setTaxRates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('types'); // 'types' or 'rates'

    // Dropdown data
    const [pnlCategories, setPnlCategories] = useState([]);
    const [cfArticles, setCfArticles] = useState([]);

    // Modals
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
    const [isRateModalOpen, setIsRateModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedItem, setSelectedItem] = useState(null);

    const [typeFormData, setTypeFormData] = useState({
        code: '',
        name: '',
        group: 'QQS / VAT',
        accountingType: 'Invoice-based',
        accountingImpact: '',
        recoverable: false,
        pnlCategoryId: '',
        cashflowArticleId: '',
        active: true,
        description: ''
    });

    const [rateFormData, setRateFormData] = useState({
        taxTypeId: '',
        rate: 0,
        baseType: 'Amount',
        validFrom: '',
        validTo: '',
        active: true,
        description: ''
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [typesRes, ratesRes, pnlRes, cfRes] = await Promise.all([
                api.get('/taxes/types'),
                api.get('/taxes/rates'),
                api.get('/pnl-categories').catch(() => ({ data: [] })),
                api.get('/cash-flow').catch(() => ({ data: [] }))
            ]);
            setTaxTypes(typesRes.data);
            setTaxRates(ratesRes.data);
            setPnlCategories(pnlRes.data);
            setCfArticles(cfRes.data);
        } catch (err) {
            console.error("Taxes load error", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleOpenTypeModal = (mode, type = null) => {
        setModalMode(mode);
        if (mode === 'edit' && type) {
            setSelectedItem(type);
            setTypeFormData({ ...type });
        } else {
            setTypeFormData({
                code: '',
                name: '',
                group: 'QQS / VAT',
                accountingType: 'Invoice-based',
                accountingImpact: '',
                recoverable: false,
                pnlCategoryId: '',
                cashflowArticleId: '',
                active: true,
                description: ''
            });
        }
        setIsTypeModalOpen(true);
    };

    const handleOpenRateModal = (mode, rate = null) => {
        setModalMode(mode);
        if (mode === 'edit' && rate) {
            setSelectedItem(rate);
            setRateFormData({ ...rate });
        } else {
            setRateFormData({
                taxTypeId: taxTypes[0]?._id || '',
                rate: 0,
                baseType: 'Amount',
                validFrom: '',
                validTo: '',
                active: true,
                description: ''
            });
        }
        setIsRateModalOpen(true);
    };

    const handleSaveType = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'add') {
                await api.post('/taxes/types', typeFormData);
            } else {
                await api.put(`/taxes/types/${selectedItem._id}`, typeFormData);
            }
            loadData();
            setIsTypeModalOpen(false);
        } catch (err) {
            alert("Xatolik");
        }
    };

    const handleSaveRate = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'add') {
                await api.post('/taxes/rates', rateFormData);
            } else {
                await api.put(`/taxes/rates/${selectedItem._id}`, rateFormData);
            }
            loadData();
            setIsRateModalOpen(false);
        } catch (err) {
            alert("Xatolik");
        }
    };

    const handleDelete = async (target, id) => {
        if (window.confirm("O'chirmoqchimisiz?")) {
            try {
                await api.delete(`/taxes/${target}/${id}`);
                loadData();
            } catch (err) {
                alert("Xatolik");
            }
        }
    };

    const getTaxName = (id) => taxTypes.find(t => t._id === id)?.name || 'Noma\'lum';

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Soliq turlari va stavkalari</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Tizimdagi barcha soliqlarni boshqarish.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="gold-btn" onClick={() => activeTab === 'types' ? handleOpenTypeModal('add') : handleOpenRateModal('add')}>
                        <Plus size={20} />
                        {activeTab === 'types' ? 'Yangi soliq qo\'shish' : 'Yangi stavka qo\'shish'}
                    </button>
                </div>
            </div>

            {/* Sub Tabs */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
                <button 
                    onClick={() => setActiveTab('types')}
                    style={{
                        padding: '12px 20px', fontSize: '14px', fontWeight: '700', background: 'transparent',
                        color: activeTab === 'types' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                        borderBottom: activeTab === 'types' ? '3px solid var(--accent-gold)' : '3px solid transparent'
                    }}
                >
                    <List size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Soliq turlari
                </button>
                <button 
                    onClick={() => setActiveTab('rates')}
                    style={{
                        padding: '12px 20px', fontSize: '14px', fontWeight: '700', background: 'transparent',
                        color: activeTab === 'rates' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                        borderBottom: activeTab === 'rates' ? '3px solid var(--accent-gold)' : '3px solid transparent'
                    }}
                >
                    <Percent size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Soliq stavkalari
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Yuklanmoqda...</div>
            ) : (
                <div className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
                    {activeTab === 'types' ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1100px' }}>
                                <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                                    <tr>
                                        <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>KOD / NOMI</th>
                                        <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>GURUH / BAZA</th>
                                        <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>BUX. TA'SIRI</th>
                                        <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>RECOVERABLE</th>
                                        <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>P&L / CF</th>
                                        <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>STATUS</th>
                                        <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'right' }}>AMALLAR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {taxTypes.map(type => (
                                        <tr key={type._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ fontWeight: '800', color: 'var(--accent-gold)', fontSize: '12px' }}>{type.code}</div>
                                                <div style={{ fontWeight: '700', fontSize: '14px', marginTop: '4px' }}>{type.name}</div>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ fontSize: '13px', fontWeight: '600' }}>{type.group}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Baza: {type.accountingType}</div>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ fontSize: '12px', fontWeight: '600' }}>{type.accountingImpact || '-'}</div>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                {type.recoverable ? <Tag size={16} color="#10b981" /> : '-'}
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>P&L: {type.pnlCategoryId || 'N/A'}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>CF: {type.cashflowArticleId || 'N/A'}</div>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <span style={{ fontSize: '12px', color: type.active ? '#10b981' : '#ef4444', fontWeight: '700' }}>{type.active ? 'ACTIVE' : 'INACTIVE'}</span>
                                            </td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                                    <button onClick={() => handleOpenTypeModal('edit', type)} style={{ background: 'transparent' }}><Edit2 size={16} /></button>
                                                    <button onClick={() => handleDelete('types', type._id)} style={{ background: 'transparent', color: '#ef4444' }}><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                                    <tr>
                                        <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>SOLIQ TURI</th>
                                        <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>STAVKA (%)</th>
                                        <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>ASOS</th>
                                        <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>MUDDAT</th>
                                        <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>STATUS</th>
                                        <th style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'right' }}>AMALLAR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {taxRates.map(rate => (
                                        <tr key={rate._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '16px 24px', fontWeight: '700' }}>{getTaxName(rate.taxTypeId)}</td>
                                            <td style={{ padding: '16px 24px', fontWeight: '800', color: 'var(--accent-gold)', fontSize: '16px' }}>{rate.rate}%</td>
                                            <td style={{ padding: '16px 24px' }}>{rate.baseType}</td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {rate.validFrom} - {rate.validTo || '...'}</div>
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <span style={{ fontSize: '12px', color: rate.active ? '#10b981' : '#ef4444', fontWeight: '700' }}>{rate.active ? 'ACTIVE' : 'INACTIVE'}</span>
                                            </td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                                    <button onClick={() => handleOpenRateModal('edit', rate)} style={{ background: 'transparent' }}><Edit2 size={16} /></button>
                                                    <button onClick={() => handleDelete('rates', rate._id)} style={{ background: 'transparent', color: '#ef4444' }}><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Type Modal */}
            {isTypeModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
                    <div className="premium-card" style={{ width: '600px', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '800' }}>Soliq Turi Qo'shish</h3>
                            <button onClick={() => setIsTypeModalOpen(false)} style={{ background: 'transparent' }}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSaveType}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label>Kod</label>
                                    <input value={typeFormData.code} onChange={e => setTypeFormData({...typeFormData, code: e.target.value.toUpperCase()})} required />
                                </div>
                                <div className="form-group">
                                    <label>Soliq nomi</label>
                                    <input value={typeFormData.name} onChange={e => setTypeFormData({...typeFormData, name: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>Soliq guruhi</label>
                                    <select value={typeFormData.group} onChange={e => setTypeFormData({...typeFormData, group: e.target.value})}>
                                        <option value="QQS / VAT">QQS / VAT</option>
                                        <option value="Foyda solig'i">Foyda solig'i</option>
                                        <option value="Ish haqi soliqlari">Ish haqi soliqlari</option>
                                        <option value="Mol-mulk va yer soliqlari">Mol-mulk va yer soliqlari</option>
                                        <option value="Bojxona va import soliqlari">Bojxona va import soliqlari</option>
                                        <option value="Jarima va penya">Jarima va penya</option>
                                        <option value="Boshqa soliqlar">Boshqa soliqlar</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Hisoblash bazasi</label>
                                    <select value={typeFormData.accountingType} onChange={e => setTypeFormData({...typeFormData, accountingType: e.target.value})}>
                                        <option value="Invoice-based">Invoice-based</option>
                                        <option value="Payroll-based">Payroll-based</option>
                                        <option value="Profit-based">Profit-based</option>
                                        <option value="Asset-based">Asset-based</option>
                                        <option value="Import-based">Import-based</option>
                                        <option value="Manual / Other">Manual / Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Buxgalteriya ta’siri</label>
                                    <input value={typeFormData.accountingImpact} onChange={e => setTypeFormData({...typeFormData, accountingImpact: e.target.value})} placeholder="Masalan: P&L Expense" />
                                </div>
                                <div className="form-group">
                                    <label>P&L Kategoriyasi</label>
                                    <select value={typeFormData.pnlCategoryId} onChange={e => setTypeFormData({...typeFormData, pnlCategoryId: e.target.value})}>
                                        <option value="">-- Tanlang --</option>
                                        {pnlCategories.map(c => <option key={c._id || c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>CF Moddasi</label>
                                    <select value={typeFormData.cashflowArticleId} onChange={e => setTypeFormData({...typeFormData, cashflowArticleId: e.target.value})}>
                                        <option value="">-- Tanlang --</option>
                                        {cfArticles.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input type="checkbox" checked={typeFormData.recoverable} onChange={e => setTypeFormData({...typeFormData, recoverable: e.target.checked})} id="rec" />
                                        <label htmlFor="rec" style={{ fontSize: '13px' }}>Recoverable?</label>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input type="checkbox" checked={typeFormData.active} onChange={e => setTypeFormData({...typeFormData, active: e.target.checked})} id="act" />
                                        <label htmlFor="act" style={{ fontSize: '13px' }}>Active?</label>
                                    </div>
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label>Tavsif</label>
                                    <textarea value={typeFormData.description} onChange={e => setTypeFormData({...typeFormData, description: e.target.value})} rows={2} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                                <button type="button" onClick={() => setIsTypeModalOpen(false)} className="secondary-btn" style={{ flex: 1 }}>Bekor qilish</button>
                                <button type="submit" className="gold-btn" style={{ flex: 1, justifyContent: 'center' }}>Saqlash</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Rate Modal */}
            {isRateModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
                    <div className="premium-card" style={{ width: '500px', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '800' }}>Soliq Stavkasi Qo'shish</h3>
                            <button onClick={() => setIsRateModalOpen(false)} style={{ background: 'transparent' }}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSaveRate}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label>Soliq turi</label>
                                    <select value={rateFormData.taxTypeId} onChange={e => setRateFormData({...rateFormData, taxTypeId: e.target.value})} required>
                                        <option value="">-- Tanlang --</option>
                                        {taxTypes.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Stavka (%)</label>
                                    <input type="number" value={rateFormData.rate} onChange={e => setRateFormData({...rateFormData, rate: parseFloat(e.target.value) || 0})} required />
                                </div>
                                <div className="form-group">
                                    <label>Hisob asosi</label>
                                    <select value={rateFormData.baseType} onChange={e => setRateFormData({...rateFormData, baseType: e.target.value})}>
                                        <option value="Amount">Amount</option>
                                        <option value="Quantity">Quantity</option>
                                        <option value="Flat">Flat</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Amal qilish boshlanishi</label>
                                    <input type="date" value={rateFormData.validFrom} onChange={e => setRateFormData({...rateFormData, validFrom: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>Amal qilish tugashi</label>
                                    <input type="date" value={rateFormData.validTo} onChange={e => setRateFormData({...rateFormData, validTo: e.target.value})} />
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label>Tavsif</label>
                                    <textarea value={rateFormData.description} onChange={e => setRateFormData({...rateFormData, description: e.target.value})} rows={2} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                                <button type="button" onClick={() => setIsRateModalOpen(false)} className="secondary-btn" style={{ flex: 1 }}>Bekor qilish</button>
                                <button type="submit" className="gold-btn" style={{ flex: 1, justifyContent: 'center' }}>Saqlash</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaxesSettings;
