import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Trash2, Clock, Loader2, Save, ArrowRight, Check, AlertCircle, Shield } from 'lucide-react';
import api from '../../utils/api';

const ApprovalMatrixSettings = () => {
    const [approvalChains, setApprovalChains] = useState([]);
    const [selectedChain, setSelectedChain] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Dropdown options
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);

    const fetchChains = async () => {
        setLoading(true);
        try {
            const [chainRes, userRes, roleRes] = await Promise.all([
                api.get('/approval-matrix'),
                api.get('/users').catch(() => ({ data: [] })),
                api.get('/roles').catch(() => ({ data: [] }))
            ]);
            
            setUsers(userRes.data || []);
            setRoles(roleRes.data || []);

            if (chainRes.data && chainRes.data.length > 0) {
                setApprovalChains(chainRes.data);
                setSelectedChain(chainRes.data[0]);
            }
        } catch (err) {
            console.error("Failed to load approval matrix settings:", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchChains();
    }, []);

    const handleAddStep = () => {
        const nextOrder = selectedChain.steps.length + 1;
        const newStep = {
            step_order: nextOrder,
            label: `Bosqich ${nextOrder}`,
            approver_type: 'role',
            role_id: 'sales_head',
            user_id: '',
            scope: 'all_company',
            condition: '',
            required: true,
            active: true
        };
        const updatedChain = {
            ...selectedChain,
            steps: [...selectedChain.steps, newStep]
        };
        setSelectedChain(updatedChain);
        setApprovalChains(approvalChains.map(c => (c._id || c.id) === (selectedChain._id || selectedChain.id) ? updatedChain : c));
    };

    const handleDeleteStep = (stepOrder) => {
        const updatedSteps = selectedChain.steps
            .filter(s => s.step_order !== stepOrder)
            .map((s, idx) => ({ ...s, step_order: idx + 1 }));
        const updatedChain = {
            ...selectedChain,
            steps: updatedSteps
        };
        setSelectedChain(updatedChain);
        setApprovalChains(approvalChains.map(c => (c._id || c.id) === (selectedChain._id || selectedChain.id) ? updatedChain : c));
    };

    const handleStepFieldChange = (stepOrder, fieldName, value) => {
        const updatedSteps = selectedChain.steps.map(s => {
            if (s.step_order === stepOrder) {
                const updated = { ...s, [fieldName]: value };
                // Reset role/user if changing type
                if (fieldName === 'approver_type') {
                    updated.role_id = '';
                    updated.user_id = '';
                }
                return updated;
            }
            return s;
        });
        const updatedChain = {
            ...selectedChain,
            steps: updatedSteps
        };
        setSelectedChain(updatedChain);
        setApprovalChains(approvalChains.map(c => (c._id || c.id) === (selectedChain._id || selectedChain.id) ? updatedChain : c));
    };

    const handleToggleEdit = async () => {
        if (isEditing) {
            setSaving(true);
            try {
                const docId = selectedChain._id || selectedChain.id;
                const payload = {
                    key: selectedChain.key,
                    name: selectedChain.name,
                    description: selectedChain.description,
                    steps: selectedChain.steps
                };
                const res = await api.put(`/approval-matrix/${docId}`, payload);
                
                // Refresh list since a new version document ID might be returned
                const freshRes = await api.get('/approval-matrix');
                setApprovalChains(freshRes.data);
                const updatedSelected = freshRes.data.find(c => c.key === selectedChain.key) || res.data;
                setSelectedChain(updatedSelected);
                alert("Workflow o'zgarishlari muvaffaqiyatli saqlandi! Yangi versiya yaratildi.");
            } catch (err) {
                console.error("Failed to save approval matrix:", err);
                alert("Workflow saqlashda xatolik yuz berdi");
            }
            setSaving(false);
        }
        setIsEditing(!isEditing);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '10px', color: 'var(--text-secondary)' }}>
                <Loader2 className="animate-spin" size={24} />
                <span>Matritsalar yuklanmoqda...</span>
            </div>
        );
    }

    const activeChainId = selectedChain ? (selectedChain._id || selectedChain.id) : null;

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Tasdiqlash matritsasi (Approval Matrix)</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Arizalar va moliyaviy hujjatlarni tasdiqlash zanjirini boshqarish.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '30px' }}>
                {/* Left Side: Chains list */}
                <div className="premium-card" style={{ padding: '20px', height: 'fit-content' }}>
                    <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>HUJJAT TURLARI</p>
                    {approvalChains.map(chain => {
                        const chainId = chain._id || chain.id;
                        const isActive = activeChainId === chainId;
                        return (
                            <div 
                                key={chainId}
                                onClick={() => {
                                    setSelectedChain(chain);
                                    setIsEditing(false);
                                }}
                                style={{
                                    padding: '14px 16px',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    marginBottom: '8px',
                                    transition: 'all 0.2s ease',
                                    background: isActive ? 'rgba(212,175,55,0.1)' : 'transparent',
                                    color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
                                    borderLeft: isActive ? '3px solid var(--accent-gold)' : '3px solid transparent',
                                    border: '1px solid ' + (isActive ? 'var(--accent-gold)' : 'var(--border-color)')
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <ClipboardList size={16} />
                                        <span style={{ lineHeight: '1.4' }}>{chain.name}</span>
                                    </div>
                                    <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>v{chain.version || 1}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Right Side: Chain Details */}
                {selectedChain && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="premium-card" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                        <h4 style={{ fontSize: '18px', fontWeight: '800' }}>{selectedChain.name}</h4>
                                        <span style={{ fontSize: '12px', background: 'rgba(212,175,55,0.15)', color: 'var(--accent-gold)', padding: '2px 8px', borderRadius: '12px', fontWeight: '800' }}>
                                            Versiya: v{selectedChain.version || 1} (Faol)
                                        </span>
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{selectedChain.description}</p>
                                </div>
                                <button 
                                    className="gold-btn" 
                                    onClick={handleToggleEdit}
                                    disabled={saving}
                                    style={{ padding: '10px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="animate-spin" size={14} />
                                            <span>Saqlanmoqda...</span>
                                        </>
                                    ) : isEditing ? (
                                        <>
                                            <Save size={14} />
                                            <span>Saqlash (Yangi versiya)</span>
                                        </>
                                    ) : (
                                        <span>Workflow tahrirlash</span>
                                    )}
                                </button>
                            </div>

                            {/* Visual Workflow Steps */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
                                {selectedChain.steps.map((step, idx) => (
                                    <div key={step.step_order || idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', position: 'relative' }}>
                                        {/* Connection Line */}
                                        {idx < selectedChain.steps.length - 1 && (
                                            <div style={{
                                                position: 'absolute',
                                                left: '20px',
                                                top: '40px',
                                                bottom: '-30px',
                                                width: '2px',
                                                background: 'var(--border-color)',
                                                zIndex: 1
                                            }} />
                                        )}

                                        {/* Number Circle */}
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: 'rgba(212,175,55,0.1)',
                                            border: '1px solid var(--accent-gold)',
                                            color: 'var(--accent-gold)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: '700',
                                            fontSize: '14px',
                                            zIndex: 2,
                                            marginTop: '6px'
                                        }}>
                                            {step.step_order}
                                        </div>

                                        {/* Step card */}
                                        <div style={{
                                            flex: 1,
                                            background: 'rgba(255,255,255,0.01)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '16px',
                                            padding: '20px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '16px'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                {isEditing ? (
                                                    <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                                                        <div style={{ flex: 1 }}>
                                                            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Bosqich nomi</label>
                                                            <input 
                                                                value={step.label || ''} 
                                                                onChange={(e) => handleStepFieldChange(step.step_order, 'label', e.target.value)}
                                                                placeholder="Masalan: Showroom rahbari"
                                                                style={{ height: '36px', width: '100%', background: '#1e293b', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', padding: '0 10px' }}
                                                            />
                                                        </div>
                                                        <div style={{ width: '180px' }}>
                                                            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Tasdiqlovchi turi</label>
                                                            <select 
                                                                value={step.approver_type} 
                                                                onChange={(e) => handleStepFieldChange(step.step_order, 'approver_type', e.target.value)}
                                                                style={{ height: '36px', width: '100%', background: '#1e293b', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', padding: '0 8px' }}
                                                            >
                                                                <option value="role">Rol bo'yicha</option>
                                                                <option value="showroom_manager">Showroom rahbari</option>
                                                                <option value="director">Bosh direktor (CEO)</option>
                                                                <option value="finance_manager">Moliyaviy rahbar (CFO)</option>
                                                                <option value="department_head">Bo'lim boshlig'i</option>
                                                                <option value="specific_user">Aniq foydalanuvchi</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <h5 style={{ fontWeight: '800', fontSize: '15px', color: 'white' }}>{step.label || step.role}</h5>
                                                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                                            Turi: <span style={{ color: 'var(--accent-gold)' }}>{step.approver_type}</span>
                                                        </span>
                                                    </div>
                                                )}

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    {isEditing && (
                                                        <button 
                                                            onClick={() => handleDeleteStep(step.step_order)}
                                                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Sub-inputs if editing or detail view */}
                                            {isEditing ? (
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                                                    {step.approver_type === 'role' && (
                                                        <div>
                                                            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Rolni tanlang</label>
                                                            <select 
                                                                value={step.role_id || ''} 
                                                                onChange={(e) => handleStepFieldChange(step.step_order, 'role_id', e.target.value)}
                                                                style={{ height: '36px', width: '100%', background: '#1e293b', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', padding: '0 8px' }}
                                                            >
                                                                <option value="">Rolni tanlang...</option>
                                                                <option value="sales_head">Savdo rahbari</option>
                                                                <option value="finance_manager">Moliyaviy rahbar</option>
                                                                <option value="chief_accountant">Bosh buxgalter</option>
                                                                <option value="hr_manager">HR menejeri</option>
                                                                <option value="warehouse_head">Ombor mudiri</option>
                                                                {roles.map(r => (
                                                                    <option key={r._id || r.id} value={r.key}>{r.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    )}

                                                    {step.approver_type === 'specific_user' && (
                                                        <div>
                                                            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Foydalanuvchini tanlang</label>
                                                            <select 
                                                                value={step.user_id || ''} 
                                                                onChange={(e) => handleStepFieldChange(step.step_order, 'user_id', e.target.value)}
                                                                style={{ height: '36px', width: '100%', background: '#1e293b', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', padding: '0 8px' }}
                                                            >
                                                                <option value="">Foydalanuvchini tanlang...</option>
                                                                {users.map(u => (
                                                                    <option key={u._id || u.id} value={u._id || u.id}>{u.name} {u.surname} ({u.login})</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    )}

                                                    {(step.approver_type === 'role' || step.approver_type === 'department_head') && (
                                                        <div>
                                                            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Qamrov (Scope)</label>
                                                            <select 
                                                                value={step.scope || 'all_company'} 
                                                                onChange={(e) => handleStepFieldChange(step.step_order, 'scope', e.target.value)}
                                                                style={{ height: '36px', width: '100%', background: '#1e293b', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', padding: '0 8px' }}
                                                            >
                                                                <option value="all_company">Barcha kompaniya</option>
                                                                <option value="requester_showroom">Faqat arizachi showroomi</option>
                                                                <option value="requester_department">Faqat arizachi bo'limi</option>
                                                            </select>
                                                        </div>
                                                    )}

                                                    <div style={{ gridColumn: 'span 2' }}>
                                                        <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Shart (Masalan: {"amount > 5000000"})</label>
                                                        <input 
                                                            value={step.condition || ''} 
                                                            onChange={(e) => handleStepFieldChange(step.step_order, 'condition', e.target.value)}
                                                            placeholder="Bo'sh bo'lsa barcha arizalar uchun ishlaydi"
                                                            style={{ height: '36px', width: '100%', background: '#1e293b', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', padding: '0 10px' }}
                                                        />
                                                    </div>

                                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '10px' }}>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#fff', cursor: 'pointer' }}>
                                                            <input 
                                                                type="checkbox" 
                                                                checked={step.required !== false} 
                                                                onChange={(e) => handleStepFieldChange(step.step_order, 'required', e.target.checked)}
                                                            />
                                                            Majburiy step
                                                        </label>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#fff', cursor: 'pointer' }}>
                                                            <input 
                                                                type="checkbox" 
                                                                checked={step.active !== false} 
                                                                onChange={(e) => handleStepFieldChange(step.step_order, 'active', e.target.checked)}
                                                            />
                                                            Faol step
                                                        </label>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '12px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                                        <span style={{ color: 'var(--text-secondary)' }}>Qamrov (Scope):</span>
                                                        <span style={{ color: '#fff', fontWeight: '600' }}>
                                                            {step.scope === 'requester_showroom' ? 'Arizachi showroomi' :
                                                             step.scope === 'requester_department' ? 'Arizachi bo\'limi' : 'Barcha kompaniya'}
                                                        </span>
                                                    </div>
                                                    {step.role_id && (
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                                            <span style={{ color: 'var(--text-secondary)' }}>Mavqe / Rol:</span>
                                                            <span style={{ color: '#fff', fontWeight: '600' }}>{step.role_id}</span>
                                                        </div>
                                                    )}
                                                    {step.user_id && (
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                                            <span style={{ color: 'var(--text-secondary)' }}>Foydalanuvchi:</span>
                                                            <span style={{ color: '#fff', fontWeight: '600' }}>
                                                                {users.find(u => u._id === step.user_id || u.id === step.user_id)?.name || step.user_id}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                                        <span style={{ color: 'var(--text-secondary)' }}>Ishlash sharti:</span>
                                                        <span style={{ color: 'var(--accent-gold)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <Clock size={12} /> {step.condition || 'Barcha arizalar uchun'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add Step Button */}
                            {isEditing && (
                                <button 
                                    onClick={handleAddStep}
                                    className="gold-btn" 
                                    style={{ marginTop: '24px', background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--accent-gold)', color: 'var(--accent-gold)', width: '100%', justifyContent: 'center' }}
                                >
                                    <Plus size={16} /> Yangi bosqich qo'shish
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApprovalMatrixSettings;
