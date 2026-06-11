import React, { useState } from 'react';
import { Key, Shield, CheckCircle, XCircle, Search, Info } from 'lucide-react';

const PermissionsSettings = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const roles = [
        { key: 'super', label: 'Super Admin' },
        { key: 'showroom', label: 'Showroom Admin' },
        { key: 'sales_manager', label: 'Savdo Menejeri' },
        { key: 'proekt_manager', label: 'Proekt Menejer (PM)' },
        { key: 'kassa', label: 'Kassa / Hisobchi' },
        { key: 'fabrika', label: 'Fabrika Menejeri' }
    ];

    const permissionGroups = [
        {
            module: 'Tizim & Foydalanuvchilar',
            permissions: [
                { key: 'manage_users', name: 'Xodimlarni boshqarish', desc: 'Xodimlarni qo\'shish, tahrirlash va o\'chirish', roles: ['super'] },
                { key: 'system_settings', name: 'Tizim sozlamalari', desc: 'Master Data va umumiy sozlamalarga kirish', roles: ['super'] },
                { key: 'view_logs', name: 'Tizim jurnallarini ko\'rish', desc: 'Amallar jurnali (activity logs) va xatoliklarni ko\'rish', roles: ['super'] }
            ]
        },
        {
            module: 'Savdo & Mijozlar (CRM)',
            permissions: [
                { key: 'create_lead', name: 'Lead/Mijoz yaratish', desc: 'Yangi mijozlarni ro\'yxatga olish', roles: ['super', 'showroom', 'sales_manager'] },
                { key: 'edit_customer', name: 'Mijoz ma\'lumotlarini tahrirlash', desc: 'Mijoz kartochkasini tahrirlash', roles: ['super', 'showroom', 'sales_manager'] },
                { key: 'create_proposal', name: 'Tijorat taklifi (KP) yaratish', desc: 'Tijorat takliflarini tayyorlash', roles: ['super', 'showroom', 'sales_manager'] },
                { key: 'approve_proposal', name: 'KPni shartnomaga aylantirish', desc: 'KPni buyurtma holatiga o\'tkazish', roles: ['super', 'showroom', 'sales_manager'] }
            ]
        },
        {
            module: 'Loyiha & PM',
            permissions: [
                { key: 'manage_projects', name: 'Loyihalarni boshqarish', desc: 'Loyihalarni nazorat qilish, bosqichlarni belgilash', roles: ['super', 'proekt_manager'] },
                { key: 'upload_designs', name: 'Dizayn/Chizmalarni yuklash', desc: 'Chizmalar va vizualizatsiyani buyurtmaga biriktirish', roles: ['super', 'proekt_manager'] }
            ]
        },
        {
            module: 'Ishlab chiqarish (Fabrika)',
            permissions: [
                { key: 'factory_control', name: 'Fabrika nazorati', desc: 'Ishlab chiqarish rejasini boshqarish va ustalar biriktirish', roles: ['super', 'fabrika'] },
                { key: 'update_task_status', name: 'Vazifalar holatini yangilash', desc: 'Usta ish amallarini yakunlash', roles: ['super', 'fabrika', 'fabrika_worker', 'cutting', 'edging', 'drilling', 'carpentry', 'painting', 'qc', 'packaging'] }
            ]
        },
        {
            module: 'Moliya & Kassa',
            permissions: [
                { key: 'view_finance_reports', name: 'Moliyaviy hisobotlar', desc: 'P&L, Cash Flow va Balans hisobotlarini ko\'rish', roles: ['super'] },
                { key: 'approve_pre_sale_expense', name: 'Sotuvoldi xarajatlarni tasdiqlash', desc: 'Sotuvoldi xarajat arizalarini tasdiqlash', roles: ['super', 'kassa'] },
                { key: 'make_payments', name: 'Kassa operatsiyalari', desc: 'Kirim va chiqim to\'lovlarini amalga oshirish', roles: ['super', 'kassa', 'showroom'] }
            ]
        },
        {
            module: 'Ombor & Xarid',
            permissions: [
                { key: 'warehouse_inout', name: 'Ombor kirim/chiqim', desc: 'Materiallar kirimi va chiqimi operatsiyalari', roles: ['super', 'warehouse', 'finished_warehouse'] },
                { key: 'create_purchase_req', name: 'Xarid so\'rovi yaratish', desc: 'Xom-ashyo uchun xarid so\'rovini jo\'natish', roles: ['super', 'proekt_manager', 'warehouse', 'fabrika'] },
                { key: 'approve_purchase_order', name: 'Xarid buyurtmasini tasdiqlash', desc: 'Yetkazib beruvchi bilan shartnomani tasdiqlash', roles: ['super', 'warehouse'] }
            ]
        }
    ];

    const filteredGroups = permissionGroups.map(group => {
        const filteredPermissions = group.permissions.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.desc.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return { ...group, permissions: filteredPermissions };
    }).filter(group => group.permissions.length > 0);

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Tizim ruxsatnomalari</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Kod darajasidagi ruxsatlar katalogi va rollarga bog\'liqligi.</p>
                </div>
                <div style={{ position: 'relative', width: '250px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input 
                        placeholder="Ruxsatni qidirish..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', paddingLeft: '36px', fontSize: '13px', height: '38px' }}
                    />
                </div>
            </div>

            <div className="premium-card" style={{ padding: '24px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px', textAlign: 'left' }}>
                            <th style={{ padding: '12px 8px', width: '250px' }}>RUXSAT NOMI / KALITI</th>
                            <th style={{ padding: '12px 8px', width: '300px' }}>TAVSIFI</th>
                            {roles.map(r => (
                                <th key={r.key} style={{ padding: '12px 8px', textAlign: 'center', fontSize: '11px', fontWeight: '700' }}>
                                    {r.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredGroups.map((group, gIdx) => (
                            <React.Fragment key={gIdx}>
                                <tr style={{ background: 'rgba(255,255,255,0.01)' }}>
                                    <td colSpan={2 + roles.length} style={{ padding: '12px 8px', fontSize: '12px', fontWeight: '800', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {group.module}
                                    </td>
                                </tr>
                                {group.permissions.map((p, pIdx) => (
                                    <tr key={pIdx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '16px 8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Key size={14} style={{ color: 'var(--accent-gold)' }} />
                                                <div>
                                                    <p style={{ fontWeight: '600', fontSize: '13px' }}>{p.name}</p>
                                                    <code style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{p.key}</code>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 8px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                            {p.desc}
                                        </td>
                                        {roles.map(r => {
                                            const hasAccess = p.roles.includes(r.key);
                                            return (
                                                <td key={r.key} style={{ padding: '16px 8px', textAlign: 'center' }}>
                                                    {hasAccess ? (
                                                        <CheckCircle size={18} style={{ color: '#10b981', margin: '0 auto' }} />
                                                    ) : (
                                                        <XCircle size={18} style={{ color: 'rgba(255,255,255,0.05)', margin: '0 auto' }} />
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(212,175,55,0.6)', fontSize: '12px' }}>
                <Info size={14} />
                Ruxsatnomalar tizim xavfsizligi va yaxlitligi uchun dastur kodi darajasida boshqariladi.
            </div>
        </div>
    );
};

export default PermissionsSettings;
