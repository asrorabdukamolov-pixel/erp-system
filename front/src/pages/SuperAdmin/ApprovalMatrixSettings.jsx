import React, { useState } from 'react';
import { ClipboardList, Plus, Trash2, ArrowRight, DollarSign, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

const ApprovalMatrixSettings = () => {
    const [approvalChains, setApprovalChains] = useState([
        {
            id: 'pre_sale',
            name: 'Sotuvoldi xarajatlar arizalari (Pre-sale Expenses)',
            description: 'Sales Manager tomonidan sotuvoldi arizalarining tasdiqlanish jarayoni.',
            steps: [
                { id: 1, role: 'Savdo Rahbari (Sales Head)', condition: 'Barcha arizalar uchun', status: 'active' },
                { id: 2, role: 'Moliyaviy Rahbar (CFO)', condition: 'Agar summa > 5,000,000 UZS bo\'lsa', status: 'active' }
            ]
        },
        {
            id: 'purchase_request',
            name: 'Xarid arizalari (Purchase Requests)',
            description: 'Xoma-ashyo yoki ofis ehtiyojlari uchun sotib olish so\'rovlari.',
            steps: [
                { id: 1, role: 'Ombor mudiri / Sex boshlig\'i', condition: 'Barcha arizalar uchun', status: 'active' },
                { id: 2, role: 'Bosh direktor (CEO)', condition: 'Agar summa > 15,000,000 UZS bo\'lsa', status: 'active' }
            ]
        },
        {
            id: 'cash_outflow',
            name: 'Kassadan chiqim qilish arizalari (Cash Outflow)',
            description: 'Kassadan yoki bank hisobidan to\'lov qilish so\'rovlari.',
            steps: [
                { id: 1, role: 'Bosh Buxgalter', condition: 'Barcha chiqimlar uchun', status: 'active' },
                { id: 2, role: 'Moliyaviy rahbar (CFO)', condition: 'Barcha chiqimlar uchun', status: 'active' },
                { id: 3, role: 'Bosh direktor (CEO)', condition: 'Agar summa > 50,000,000 UZS bo\'lsa', status: 'active' }
            ]
        }
    ]);

    const [selectedChain, setSelectedChain] = useState(approvalChains[0]);
    const [isEditing, setIsEditing] = useState(false);

    const handleAddStep = () => {
        const newStep = {
            id: selectedChain.steps.length + 1,
            role: 'Bosh direktor (CEO)',
            condition: 'Barcha arizalar uchun',
            status: 'active'
        };
        const updatedChain = {
            ...selectedChain,
            steps: [...selectedChain.steps, newStep]
        };
        setSelectedChain(updatedChain);
        setApprovalChains(approvalChains.map(c => c.id === selectedChain.id ? updatedChain : c));
    };

    const handleDeleteStep = (stepId) => {
        const updatedSteps = selectedChain.steps.filter(s => s.id !== stepId).map((s, idx) => ({ ...s, id: idx + 1 }));
        const updatedChain = {
            ...selectedChain,
            steps: updatedSteps
        };
        setSelectedChain(updatedChain);
        setApprovalChains(approvalChains.map(c => c.id === selectedChain.id ? updatedChain : c));
    };

    const handleRoleChange = (stepId, newRole) => {
        const updatedSteps = selectedChain.steps.map(s => s.id === stepId ? { ...s, role: newRole } : s);
        const updatedChain = {
            ...selectedChain,
            steps: updatedSteps
        };
        setSelectedChain(updatedChain);
        setApprovalChains(approvalChains.map(c => c.id === selectedChain.id ? updatedChain : c));
    };

    const handleConditionChange = (stepId, newCondition) => {
        const updatedSteps = selectedChain.steps.map(s => s.id === stepId ? { ...s, condition: newCondition } : s);
        const updatedChain = {
            ...selectedChain,
            steps: updatedSteps
        };
        setSelectedChain(updatedChain);
        setApprovalChains(approvalChains.map(c => c.id === selectedChain.id ? updatedChain : c));
    };

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
                    <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', uppercase: 'true', marginBottom: '12px', letterSpacing: '0.5px' }}>HUJJAT TURLARI</p>
                    {approvalChains.map(chain => (
                        <div 
                            key={chain.id}
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
                                background: selectedChain.id === chain.id ? 'rgba(212,175,55,0.1)' : 'transparent',
                                color: selectedChain.id === chain.id ? 'var(--accent-gold)' : 'var(--text-secondary)',
                                borderLeft: selectedChain.id === chain.id ? '3px solid var(--accent-gold)' : '3px solid transparent',
                                border: '1px solid ' + (selectedChain.id === chain.id ? 'var(--accent-gold)' : 'var(--border-color)')
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ClipboardList size={16} />
                                <span style={{ lineHeight: '1.4' }}>{chain.name.split(' (')[0]}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Side: Chain Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="premium-card" style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                            <div>
                                <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '6px' }}>{selectedChain.name}</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{selectedChain.description}</p>
                            </div>
                            <button 
                                className="gold-btn" 
                                onClick={() => setIsEditing(!isEditing)}
                                style={{ padding: '8px 16px', fontSize: '12px' }}
                            >
                                {isEditing ? 'Tahrirlashni tugatish' : 'Matritsani tahrirlash'}
                            </button>
                        </div>

                        {/* Visual Workflow Steps */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                            {selectedChain.steps.map((step, idx) => (
                                <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    {/* Connection Line */}
                                    {idx > 0 && (
                                        <div style={{
                                            position: 'absolute',
                                            left: '32px',
                                            top: `${(idx * 76) - 20}px`,
                                            height: '24px',
                                            width: '2px',
                                            background: 'var(--border-color)'
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
                                        zIndex: 2
                                    }}>
                                        {step.id}
                                    </div>

                                    {/* Step card */}
                                    <div style={{
                                        flex: 1,
                                        background: 'rgba(255,255,255,0.01)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '12px',
                                        padding: '16px 20px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            {isEditing ? (
                                                <select 
                                                    value={step.role} 
                                                    onChange={(e) => handleRoleChange(step.id, e.target.value)}
                                                    style={{ height: '36px', width: '220px', background: '#1e293b', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', padding: '0 8px' }}
                                                >
                                                    <option>Savdo Rahbari (Sales Head)</option>
                                                    <option>Moliyaviy Rahbar (CFO)</option>
                                                    <option>Ombor mudiri / Sex boshlig'i</option>
                                                    <option>Bosh direktor (CEO)</option>
                                                    <option>Bosh Buxgalter</option>
                                                </select>
                                            ) : (
                                                <p style={{ fontWeight: '700', fontSize: '14px' }}>{step.role}</p>
                                            )}

                                            {isEditing ? (
                                                <input 
                                                    value={step.condition} 
                                                    onChange={(e) => handleConditionChange(step.id, e.target.value)}
                                                    style={{ height: '36px', width: '300px', background: '#1e293b', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', padding: '0 10px', marginTop: '4px' }}
                                                />
                                            ) : (
                                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Clock size={12} /> Shart: {step.condition}
                                                </p>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{
                                                fontSize: '10px',
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                background: 'rgba(16,185,129,0.1)',
                                                color: '#10b981',
                                                fontWeight: '700'
                                            }}>
                                                FAOLLIK
                                            </span>
                                            {isEditing && (
                                                <button 
                                                    onClick={() => handleDeleteStep(step.id)}
                                                    style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
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
            </div>
        </div>
    );
};

export default ApprovalMatrixSettings;
