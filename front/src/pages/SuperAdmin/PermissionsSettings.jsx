import React, { useState, useEffect } from 'react';
import { Key, Shield, CheckCircle, XCircle, Search, Info, Loader2 } from 'lucide-react';
import api from '../../utils/api';

const permissionGroups = [
  {
    module: 'Tizim & Foydalanuvchilar',
    permissions: [
      { key: 'manage_users', name: 'Xodimlarni boshqarish', desc: 'Xodimlarni qo\'shish, tahrirlash va o\'chirish' },
      { key: 'system_settings', name: 'Tizim sozlamalari', desc: 'Master Data va umumiy sozlamalarga kirish' },
      { key: 'view_logs', name: 'Tizim jurnallarini ko\'rish', desc: 'Amallar jurnali (activity logs) va xatoliklarni ko\'rish' }
    ]
  },
  {
    module: 'Savdo & Mijozlar (CRM)',
    permissions: [
      { key: 'create_lead', name: 'Lead/Mijoz yaratish', desc: 'Yangi mijozlarni ro\'yxatga olish' },
      { key: 'edit_customer', name: 'Mijoz ma\'lumotlarini tahrirlash', desc: 'Mijoz kartochkasini tahrirlash' },
      { key: 'create_proposal', name: 'Tijorat taklifi (KP) yaratish', desc: 'Tijorat takliflarini tayyorlash' },
      { key: 'approve_proposal', name: 'KPni shartnomaga aylantirish', desc: 'KPni buyurtma holatiga o\'tkazish' }
    ]
  },
  {
    module: 'Loyiha & PM',
    permissions: [
      { key: 'manage_projects', name: 'Loyihalarni boshqarish', desc: 'Loyihalarni nazorat qilish, bosqichlarni belgilash' },
      { key: 'upload_designs', name: 'Dizayn/Chizmalarni yuklash', desc: 'Chizmalar va vizualizatsiyani buyurtmaga biriktirish' }
    ]
  },
  {
    module: 'Ishlab chiqarish (Fabrika)',
    permissions: [
      { key: 'factory_control', name: 'Fabrika nazorati', desc: 'Ishlab chiqarish rejasini boshqarish va ustalar biriktirish' },
      { key: 'update_task_status', name: 'Vazifalar holatini yangilash', desc: 'Usta ish amallarini yakunlash' }
    ]
  },
  {
    module: 'Moliya & Kassa',
    permissions: [
      { key: 'view_finance_reports', name: 'Moliyaviy hisobotlar', desc: 'P&L, Cash Flow va Balans hisobotlarini ko\'rish' },
      { key: 'approve_pre_sale_expense', name: 'Sotuvoldi xarajatlarni tasdiqlash', desc: 'Sotuvoldi xarajat arizalarini tasdiqlash' },
      { key: 'make_payments', name: 'Kassa operatsiyalari', desc: 'Kirim va chiqim to\'lovlarini amalga oshirish' }
    ]
  },
  {
    module: 'Ombor & Xarid',
    permissions: [
      { key: 'warehouse_inout', name: 'Ombor kirim/chiqim', desc: 'Materiallar kirimi va chiqimi operatsiyalari' },
      { key: 'create_purchase_req', name: 'Xarid so\'rovi yaratish', desc: 'Xom-ashyo uchun xarid so\'rovini jo\'natish' },
      { key: 'approve_purchase_order', name: 'Xarid buyurtmasini tasdiqlash', desc: 'Yetkazib beruvchi bilan shartnomani tasdiqlash' }
    ]
  }
];

const PermissionsSettings = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadRoles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/roles');
      let rolesData = res.data || [];
      
      // Auto seed if database is empty
      if (rolesData.length === 0) {
        const defaultRoles = [
          { key: 'super', name: 'Super Admin', description: 'Tizimning to\'liq boshqaruvi, barcha modullarga cheksiz ruxsat.', permissions: ['manage_users', 'system_settings', 'view_logs', 'create_lead', 'edit_customer', 'create_proposal', 'approve_proposal', 'manage_projects', 'upload_designs', 'factory_control', 'update_task_status', 'view_finance_reports', 'approve_pre_sale_expense', 'make_payments', 'warehouse_inout', 'create_purchase_req', 'approve_purchase_order'] },
          { key: 'showroom', name: 'Showroom Admin', description: 'Muayyan filial (showroom) boshqaruvi va nazorati.', permissions: ['create_lead', 'edit_customer', 'create_proposal', 'approve_proposal', 'make_payments'] },
          { key: 'sales_manager', name: 'Savdo Menejeri', description: 'Mijozlar bilan ishlash va savdo jarayonlarini yuritish.', permissions: ['create_lead', 'edit_customer', 'create_proposal', 'approve_proposal'] },
          { key: 'proekt_manager', name: 'Proekt Menejer (PM)', description: 'Loyiha-dizayn va ishlab chiqarish jarayonini muvofiqlashtirish.', permissions: ['manage_projects', 'upload_designs', 'create_purchase_req'] },
          { key: 'kassa', name: 'Kassa / Hisobchi', description: 'Moliyaviy tranzaksiyalar va to\'lovlar nazorati.', permissions: ['approve_pre_sale_expense', 'make_payments'] },
          { key: 'fabrika', name: 'Fabrika Menejeri', description: 'Ishlab chiqarish jarayoni va fabrika xodimlari nazorati.', permissions: ['factory_control', 'update_task_status', 'create_purchase_req'] },
          { key: 'warehouse', name: 'Xoma-ashyo ombori', description: 'Xom-ashyo ombori kirim-chiqim nazorati.', permissions: ['warehouse_inout', 'create_purchase_req', 'approve_purchase_order'] },
          { key: 'finished_warehouse', name: 'Tayyor mahsulot ombori', description: 'Tayyor mahsulotlar ombori boshqaruvi.', permissions: ['warehouse_inout'] },
          { key: 'fabrika_worker', name: 'Fabrika Ishchisi (Umumiy)', description: 'Ishlab chiqarish sexlaridagi umumiy ishchi.', permissions: ['update_task_status'] }
        ];
        for (const role of defaultRoles) {
          await api.post('/roles', role);
        }
        const freshRes = await api.get('/roles');
        rolesData = freshRes.data || [];
      }
      setRoles(rolesData);
    } catch (err) {
      console.error("Error loading roles", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleCellClick = async (role, permKey) => {
    if (role.key === 'super') {
      alert("Super Admin huquqlarini o'zgartirib bo'lmaydi!");
      return;
    }

    const currentPermissions = role.permissions || [];
    const hasAccess = currentPermissions.includes(permKey);
    
    // Toggle permission
    const updatedPermissions = hasAccess
      ? currentPermissions.filter(k => k !== permKey)
      : [...currentPermissions, permKey];

    // Optimistically update frontend state
    const updatedRoles = roles.map(r => 
      r.key === role.key 
        ? { ...r, permissions: updatedPermissions }
        : r
    );
    setRoles(updatedRoles);

    // Save to Firestore
    try {
      await api.put(`/roles/${role._id || role.id}`, {
        ...role,
        permissions: updatedPermissions
      });
    } catch (err) {
      console.error("Failed to update permission", err);
      alert("Ruxsatnomani saqlashda xatolik yuz berdi");
      loadRoles(); // Rollback on failure
    }
  };

  const filteredGroups = permissionGroups.map(group => {
    const filteredPermissions = group.permissions.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...group, permissions: filteredPermissions };
  }).filter(group => group.permissions.length > 0);

  if (loading) {
    return (
      <div style={{ height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={40} color="var(--accent-gold)" />
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Tizim Ruxsatnomalari Matritsasi</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Har bir rol uchun ruxsatnomalarni jadval katakchalarini bosish orqali to'g'ridan-to'g'ri faollashtiring yoki bekor qiling.</p>
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
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px', textAlign: 'left' }}>
              <th style={{ padding: '12px 8px', width: '250px' }}>RUXSAT NOMI / KALITI</th>
              <th style={{ padding: '12px 8px', width: '300px' }}>TAVSIFI</th>
              {roles.map(r => (
                <th key={r.key} style={{ padding: '12px 8px', textAlign: 'center', fontSize: '11px', fontWeight: '700' }}>
                  {r.name}
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
                      const hasAccess = (r.permissions || []).includes(p.key);
                      return (
                        <td 
                          key={r.key} 
                          style={{ padding: '16px 8px', textAlign: 'center', cursor: r.key === 'super' ? 'not-allowed' : 'pointer' }}
                          onClick={() => handleCellClick(r, p.key)}
                        >
                          {hasAccess ? (
                            <CheckCircle size={18} style={{ color: '#10b981', margin: '0 auto', transition: 'all 0.1s' }} />
                          ) : (
                            <XCircle size={18} style={{ color: 'rgba(255,255,255,0.05)', margin: '0 auto', transition: 'all 0.1s' }} />
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
        Jadvaldagi ruxsat doirachalarini bosish orqali ruxsatlarni to'g'ridan-to'g'ri o'zgartirishingiz mumkin (Super Admin huquqlaridan tashqari).
      </div>
    </div>
  );
};

export default PermissionsSettings;
