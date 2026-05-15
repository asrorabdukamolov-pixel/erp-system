import React from 'react';
import { ShieldCheck, Lock, Check, Info } from 'lucide-react';

const RolesPermissionsSettings = () => {
    const roles = [
        { 
            id: 'super', 
            name: 'Super Admin', 
            description: 'Tizimning to\'liq boshqaruvi, barcha modullarga cheksiz ruxsat.',
            permissions: ['Barcha ma\'lumotlarni ko\'rish', 'Foydalanuvchilarni boshqarish', 'Tizim sozlamalari', 'Moliyaviy hisobotlar']
        },
        { 
            id: 'showroom', 
            name: 'Showroom Admin', 
            description: 'Muayyan filial (showroom) boshqaruvi va nazorati.',
            permissions: ['Filial buyurtmalari', 'Filial xodimlari', 'Mijozlar bazasi', 'Kassa operatsiyalari']
        },
        { 
            id: 'sales_manager', 
            name: 'Savdo Menejeri', 
            description: 'Mijozlar bilan ishlash va savdo jarayonlarini yuritish.',
            permissions: ['Buyurtma yaratish', 'Mijozlar bilan aloqa', 'Tijorat takliflari']
        },
        { 
            id: 'proekt_manager', 
            name: 'Proekt Menejer (PM)', 
            description: 'Loyiha-dizayn va ishlab chiqarish jarayonini muvofiqlashtirish.',
            permissions: ['Loyiha nazorati', 'Xarid so\'rovlari', 'Texnik topshiriqlar']
        },
        { 
            id: 'kassa', 
            name: 'Kassa / Hisobchi', 
            description: 'Moliyaviy tranzaksiyalar va to\'lovlar nazorati.',
            permissions: ['Kirim/Chiqim operatsiyalari', 'To\'lovlarni tasdiqlash', 'Kassa qoldig\'i']
        },
        { 
            id: 'fabrika', 
            name: 'Fabrika Menejeri', 
            description: 'Ishlab chiqarish jarayoni va fabrika xodimlari nazorati.',
            permissions: ['Ishlab chiqarish plani', 'Sklad nazorati', 'Usta vazifalari']
        }
    ];

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Rollar va huquqlar</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Tizim foydalanuvchilarining roli va ularga berilgan ruxsatlar nazorati.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
                {roles.map(role => (
                    <div key={role.id} className="premium-card" style={{ padding: '24px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ 
                                    width: '40px', height: '40px', borderRadius: '10px', 
                                    background: 'rgba(212,175,55,0.1)', display: 'flex', 
                                    alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)'
                                }}>
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '16px', fontWeight: '700' }}>{role.name}</h4>
                                    <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-secondary)' }}>ID: {role.id}</span>
                                </div>
                            </div>
                            <div style={{ color: 'var(--text-secondary)', cursor: 'help' }}>
                                <Lock size={16} />
                            </div>
                        </div>

                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
                            {role.description}
                        </p>

                        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-color)' }}>
                            <p style={{ fontSize: '12px', fontWeight: '700', marginBottom: '12px', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Check size={14} /> ASOSIY RUXSATLAR:
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {role.permissions.map((perm, idx) => (
                                    <span key={idx} style={{ 
                                        fontSize: '11px', padding: '4px 10px', borderRadius: '6px', 
                                        background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)',
                                        border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        {perm}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(212,175,55,0.6)', fontSize: '11px' }}>
                            <Info size={14} />
                            Ushbu rol tizim tomonidan boshqariladi.
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RolesPermissionsSettings;
