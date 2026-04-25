import React, { useState, useEffect } from 'react';
import { X, Printer, Trash2 } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

// PARTNERS_MAP will be built dynamically from localStorage

const ProposalsModal = ({ onClose }) => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [partnersMap, setPartnersMap] = useState({});
  const [companySettings, setCompanySettings] = useState({
    companyName: 'EXPRESS MEBEL',
    companyPhone: '+998 88 737 54 43',
    companyLogo: '',
    companyAddress: "Toshkent sh. Jomiy ko'chasi",
    instagram: 'instagram.com/express_mebel__uz',
    telegram: 't.me/expressmebel'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [propRes, partRes, settRes] = await Promise.all([
          api.get('/proposals'),
          api.get('/partners'),
          api.get('/settings')
        ]);
        setProposals(propRes.data);
        if (settRes.data) setCompanySettings(settRes.data);
        const pMap = partRes.data.reduce((acc, curr) => {
          acc[curr._id] = curr;
          return acc;
        }, {});
        setPartnersMap(pMap);
      } catch (err) {
        console.error("Proposals load error", err);
      }
    };
    loadData();
  }, []);

  const removeProposal = async (id) => {
    if (!window.confirm("Bu taklifni o'chirishni xohlaysizmi?")) return;
    try {
      await api.delete(`/proposals/${id}`);
      setProposals(prev => prev.filter(x => x._id !== id));
    } catch (err) {
      alert("O'chirishda xatolik!");
    }
  };

  const handlePrint = (p) => {
    const activePartners = (p.selectedPartners || []).map(id => partnersMap[id]).filter(Boolean);
    const basisText =
      p.deadlineBasis === 'custom'   ? (p.customBasis || '') :
      p.deadlineBasis === 'nazorat'  ? "muddat hisobi nazorat o'lchami olingan kundan boshlanadi" :
      p.deadlineBasis === 'avans'    ? "muddat hisobi avans berilgan kundan boshlanadi" :
      p.deadlineBasis === 'tayyor'   ? "muddat hisobi obyekt tayyor bo'lgan kundan hisoblanadi" : '';

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Tijorat Taklifi ${p.kpNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@700;900&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Inter', Arial, sans-serif; background:#fff; color:#1a1a1a; padding:40px; min-height:100vh; line-height:1.4; }
    .hdr { display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #ccc; padding-bottom:20px; margin-bottom:30px; }
    .logo-container { display: flex; align-items: center; gap: 15px; }
    .official-logo { height: 52px; width: auto; }
    .tt-badge-side { text-align: right; }
    .tt-badge { background:#000; color:#fff; padding:8px 24px; border-radius:8px; font-size:11px; font-weight:950; text-transform:uppercase; letter-spacing:2px; display:inline-block; }
    .tt-meta { margin-top:10px; font-size:14px; font-weight:700; color:#888; }
    .tt-meta span { color:#008B8B; font-weight:900; }
    .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:25px; margin-bottom:35px; }
    .info-card { background:#f9fafb; border:1px solid #ccc; border-radius:16px; padding:20px; }
    .card-title { font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px; }
    .buyer-name { font-size:18px; font-weight:900; color:#1e293b; margin-bottom:4px; }
    .buyer-phone { font-size:14px; font-weight:600; color:#64748b; }
    .manager-box { display:flex; align-items:center; gap:12px; }
    .manager-photo { width:45px; height:45px; border-radius:50%; border:2px solid #008B8B; object-fit:cover; }
    .manager-placeholder { width:45px; height:45px; border-radius:50%; background:#f1f5f9; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:20px; }
    .partners-section { margin-bottom:35px; }
    .partners-label { font-size:11px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px; }
    .partners-row { display:flex; flex-wrap:wrap; gap:10px; }
    .partner-logo-item { height:36px; background:#fff; border:1px solid #e5e7eb; border-radius:8px; padding:6px 12px; display:flex; alignItems:center; }
    .partner-logo-item img { height:100%; width:auto; object-fit:contain; }
    table { width:100%; border-collapse:collapse; margin-bottom:35px; }
    th { text-align:left; padding:15px; background:#f8fafb; color:#64748b; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:1px; border-bottom:2px solid #ccc; }
    td { padding:15px; border-bottom:1px solid #ddd; vertical-align:middle; font-size:14px; }
    .item-img { width:60px; height:60px; border-radius:10px; object-fit:cover; background:#f9fafb; }
    .item-info strong { display:block; font-size:15px; color:#1e293b; margin-bottom:2px; }
    .item-info small { color:#94a3b8; font-size:12px; }
    .summary-grid { display:grid; grid-template-columns:1fr 1fr; gap:25px; margin-bottom:40px; }
    .deadline-card { background:#fff8eb; border:1px solid #ccc; border-radius:20px; padding:25px; }
    .deadline-val { font-size:24px; font-weight:900; color:#9a3412; margin-bottom:5px; font-family:'Outfit',sans-serif; }
    .deadline-sub { font-size:12px; color:#c2410c; font-weight:600; font-style:italic; }
    .grand-total-card { background:#008B8B; border-radius:24px; padding:30px; color:#fff; }
    .total-row { display:flex; justify-content:space-between; margin-bottom:10px; font-size:14px; opacity:0.9; }
    .grand-label { font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:2px; margin:15px 0 5px; opacity:0.8; }
    .grand-val { font-size:32px; font-weight:950; font-family:'Outfit',sans-serif; }
    .footer { border-top:2px solid #ccc; padding-top:30px; display:flex; justify-content:space-between; align-items:baseline; color:#94a3b8; font-size:12px; }
    .footer-logo { color:#1e293b; font-weight:950; font-size:16px; text-transform:uppercase; letter-spacing:1px; }
  </style>
</head>
<body>
  <div class="hdr">
    <div class="logo-container">
      ${companySettings.kpLogo ? `<img src="${companySettings.kpLogo}" class="official-logo" />` : (companySettings.companyLogo ? `<img src="${companySettings.companyLogo}" class="official-logo" />` : '<div></div>')}
    </div>
    <div class="tt-badge-side">
      <div class="tt-badge">Tijorat Taklifi</div>
      <div class="tt-meta">#${p.kpNumber} | <span>${p.createdAt ? new Date(p.createdAt).toLocaleDateString('uz-UZ') : ''}</span></div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-card">
      <div class="card-title">Buyurtmachi</div>
      <div class="buyer-name">${p.customer ? `${p.customer.firstName} ${p.customer.lastName}` : '—'}</div>
      <div class="buyer-phone">Tel: ${p.customer?.phone || '—'}</div>
    </div>
    <div class="info-card">
      <div class="card-title">Taklif Tayyorladi</div>
      <div class="manager-box">
        <div class="manager-placeholder">👤</div>
        <div class="person-details">
          <div class="person-name" style="font-size:16px; margin-bottom:2px;">${p.managerName || 'Menejer'}</div>
          <div style="font-size:11px; color:#999; text-transform:uppercase; font-weight:700;">${companySettings.companyName}</div>
          <div>Tel: <b>${p.managerPhone || companySettings.companyPhone}</b></div>
        </div>
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:40px">#</th>
        <th style="width:110px">Surat</th>
        <th>Mahsulot Nomi / Tavsif</th>
        <th style="text-align:center">Soni</th>
        <th style="text-align:right">Narxi</th>
        <th style="text-align:right">Umumiy</th>
      </tr>
    </thead>
    <tbody>
      ${(p.items || []).filter(i => i.name).map((item, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>
            ${item.image ? `<img src="${item.image}" class="item-img" />` : '<div class="item-img" style="display:flex;align-items:center;justify-content:center;color:#ccc;font-size:24px;">🛋️</div>'}
          </td>
          <td class="item-info">
            <strong>${item.name}</strong>
            <small>${item.desc || 'Tavsif kiritilmagan'}</small>
          </td>
          <td style="text-align:center">${item.qty} ${item.unit}</td>
          <td style="text-align:right">${(item.price || 0).toLocaleString()} so'm</td>
          <td style="text-align:right; font-weight:900;">${((item.qty || 0) * (item.price || 0)).toLocaleString()} so'm</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="summary-grid">
    <div class="deadline-card">
      <div class="card-title">Topshirish muddati</div>
      <div class="deadline-val">${p.deadline || '—'} ish kuni</div>
      <div class="deadline-sub">* ${basisText || "Muddat o'lcham olishdan boshlanadi"}</div>
    </div>
    <div class="grand-total-card">
      <div class="grand-label">Jami summa</div>
      <div class="grand-val">${(p.grandTotal || 0).toLocaleString()} so'm</div>
    </div>
  </div>

  <div class="partners-section" style="margin-top: 40px;">
    ${activePartners.length > 0 ? `
    <div class="partners-label">Loyihadagi Hamkorlarimiz</div>
    <div class="partners-row">
      ${activePartners.map(pt => `
        <div class="partner-logo-item">
          ${pt.logo.startsWith('<svg') ? pt.logo : `<img src="${pt.logo}" style="height:22px;object-fit:contain;" />`}
        </div>
      `).join('')}
    </div>` : ''}
  </div>

  <div class="footer">
    <div class="footer-logo">${companySettings.companyName}</div>
    <div class="footer-details">
      ${companySettings.companyAddress} &middot; ${companySettings.telegram} &middot; ${companySettings.instagram}
    </div>
  </div>
</body></html>`;

    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); w.focus(); setTimeout(() => w.print(), 700); }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.92)', backdropFilter:'blur(10px)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:2500 }}>
      <div className="premium-card" style={{ width:'900px', padding:'40px', maxHeight:'85vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'30px' }}>
          <h3 style={{ fontSize:'24px', fontWeight:'900' }}>Saqlangan Tijorat Takliflari</h3>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.05)', padding:'10px', borderRadius:'50%', color:'var(--text-secondary)', border:'none', cursor:'pointer' }}><X size={20}/></button>
        </div>
        {proposals.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px', color:'var(--text-secondary)' }}>Hali tijorat takliflari yaratilmagan.</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {proposals.map(p => (
              <div key={p._id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid var(--border-color)', borderRadius:'16px', padding:'20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <p style={{ fontSize:'11px', color:'var(--accent-gold)', fontWeight:'800' }}>{p.kpNumber}</p>
                  <h4 style={{ fontSize:'16px', fontWeight:'700' }}>{p.customer?.firstName} {p.customer?.lastName}</h4>
                  <p style={{ fontSize:'12px', color:'var(--text-secondary)' }}>
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''} | {(p.grandTotal || 0).toLocaleString()} so'm {p.deadline ? `| ${p.deadline} ish kuni` : ''}
                  </p>
                </div>
                <div style={{ display:'flex', gap:'8px' }}>
                  <button onClick={() => handlePrint(p)} style={{ padding:'10px', borderRadius:'10px', background:'rgba(251,191,36,0.1)', color:'var(--accent-gold)', border:'none', cursor:'pointer' }}><Printer size={18}/></button>
                  <button onClick={() => removeProposal(p._id)} style={{ padding:'10px', borderRadius:'10px', background:'rgba(239,68,68,0.1)', color:'#ef4444', border:'none', cursor:'pointer' }}><Trash2 size={18}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalsModal;
