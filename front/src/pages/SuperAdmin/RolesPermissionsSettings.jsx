import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Edit2, Trash2, X, Check, Loader2, Key } from 'lucide-react';
import api from '../../utils/api';

const permissionGroups = [
  {
    module: 'Tizim & Foydalanuvchilar',
    permissions: [
      { key: 'manage_users', name: 'Xodimlarni boshqarish', desc: 'Xodimlarni qo\'shish, tahrirlash va o\'chirish' },
      { key: 'system_settings', name: 'Tizim sozlamalari', desc: 'Master Data va umumiy sozlamalarga kirish' },
      { key: 'view_logs', name: 'Tizim jurnallarini ko\'rish', desc: 'Amallar jurnali va xatoliklarni ko\'rish' }
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
      { key: 'manage_projects', name: 'Loyihalarni boshqarish', desc: 'Loyihalarni nazorat qilish va bosqichlarni belgilash' },
      { key: 'upload_designs', name: 'Dizayn/Chizmalarni yuklash', desc: 'Chizmalarni buyurtmaga biriktirish' }
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

const RolesPermissionsSettings = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedRole, setSelectedRole] = useState(null);

  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: '',
    permissions: []
  });

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

  const handleOpenModal = (mode, role = null) => {
    setModalMode(mode);
    if (mode === 'edit' && role) {
      setSelectedRole(role);
      setFormData({
        key: role.key || '',
        name: role.name || '',
        description: role.description || '',
        permissions: role.permissions || []
      });
    } else {
      setFormData({
        key: '',
        name: '',
        description: '',
        permissions: []
      });
    }
    setIsModalOpen(true);
  };

  const handleTogglePermission = (permKey) => {
    const isChecked = formData.permissions.includes(permKey);
    const updatedPerms = isChecked
      ? formData.permissions.filter(k => k !== permKey)
      : [...formData.permissions, permKey];
    setFormData({ ...formData, permissions: updatedPerms });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        await api.post('/roles', formData);
      } else {
        await api.put(`/roles/${selectedRole._id || selectedRole.id}`, formData);
      }
      loadRoles();
      setIsModalOpen(false);
    } catch (err) {
      alert("Xatolik yuz berdi");
    }
  };

  const handleDeleteRole = async (role) => {
    if (role.key === 'super') {
      alert("Super Admin rolini o'chirib bo'lmaydi!");
      return;
    }
    if (window.confirm(`Haqiqatdan ham "${role.name}" rolini o'chirmoqchimisiz?`)) {
      try {
        await api.delete(`/roles/${role._id || role.id}`);
        loadRoles();
      } catch (err) {
        alert("Xatolik yuz berdi");
      }
    }
  };

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
          <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Tizim Rollari Boshqaruvi</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Foydalanuvchi guruhlari (rollar) va ularga ruxsatnomalar biriktirish.</p>
        </div>
        <button className="gold-btn" onClick={() => handleOpenModal('add')} style={{ height: '36px', fontSize: '12px' }}>
          <Plus size={16} /> Yangi Rol yaratish
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
        {roles.map(role => (
          <div key={role._id || role.id} className="premium-card" style={{ padding: '24px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
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
                    <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-secondary)' }}>Kalit: {role.key}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleOpenModal('edit', role)} className="action-btn" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '6px' }}>
                    <Edit2 size={14} />
                  </button>
                  {role.key !== 'super' && (
                    <button onClick={() => handleDeleteRole(role)} className="action-btn" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '6px' }}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
                {role.description || 'Tavsif kiritilmagan.'}
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-color)' }}>
              <p style={{ fontSize: '12px', fontWeight: '700', marginBottom: '12px', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={14} /> RUXSATLAR ({role.permissions?.length || 0}):
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {role.permissions && role.permissions.length > 0 ? (
                  role.permissions.map((permKey) => {
                    // find human readable name
                    let permName = permKey;
                    for (const group of permissionGroups) {
                      const found = group.permissions.find(p => p.key === permKey);
                      if (found) {
                        permName = found.name;
                        break;
                      }
                    }
                    return (
                      <span key={permKey} style={{ 
                        fontSize: '10px', padding: '4px 8px', borderRadius: '6px', 
                        background: 'rgba(212,175,55,0.05)', color: 'var(--accent-gold)',
                        border: '1px solid rgba(212,175,55,0.1)'
                      }}>
                        {permName}
                      </span>
                    );
                  })
                ) : (
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Hech qanday huquq biriktirilmagan</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="premium-card" style={{ width: '680px', padding: '40px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800' }}>
                {modalMode === 'add' ? 'Yangi Rol Yaratish' : 'Rol Tahrirlash'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent' }}><X size={24} /></button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Rol Nomi</label>
                  <input 
                    placeholder="Masalan: Savdo Menejeri"
                    style={{ width: '100%' }} 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Rol Kodi (Unique Key)</label>
                  <input 
                    placeholder="Masalan: sales_manager"
                    style={{ width: '100%' }} 
                    value={formData.key} 
                    onChange={e => setFormData({ ...formData, key: e.target.value })} 
                    disabled={modalMode === 'edit'}
                    required 
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Tavsifi</label>
                  <textarea 
                    placeholder="Rol vazifasi va cheklovlari haqida batafsil..."
                    style={{ width: '100%', height: '80px', background: '#1e293b', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', padding: '12px', fontSize: '13px', resize: 'vertical' }}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              {/* Permissions Checklist */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Key size={16} /> Rol Huquqlari (Permissions)
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {permissionGroups.map((group, gIdx) => (
                    <div key={gIdx} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
                      <h5 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-gold)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {group.module}
                      </h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        {group.permissions.map(perm => {
                          const isChecked = formData.permissions.includes(perm.key);
                          return (
                            <div key={perm.key} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }} onClick={() => handleTogglePermission(perm.key)}>
                              <input 
                                type="checkbox" 
                                checked={isChecked} 
                                onChange={() => {}} // toggled by parent div click
                                style={{ marginTop: '3px', cursor: 'pointer' }}
                              />
                              <div>
                                <span style={{ fontSize: '13px', fontWeight: '600', display: 'block', color: isChecked ? '#fff' : 'var(--text-secondary)' }}>{perm.name}</span>
                                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{perm.desc}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
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

export default RolesPermissionsSettings;
