import React, { useState, useEffect } from 'react';
import { X, Printer, Trash2 } from 'lucide-react';

// PARTNERS_MAP will be built dynamically from localStorage

const ProposalsModal = ({ onClose }) => {
  const [proposals, setProposals] = useState([]);
  const [partnersMap, setPartnersMap] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [propRes, partRes] = await Promise.all([
          api.get('/proposals'),
          api.get('/partners')
        ]);
        setProposals(propRes.data);
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
<html><head><meta charset="UTF-8"><title>Tijorat Taklifi ${p.kpNumber}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;background:#0f1117;color:#fff;padding:44px}
  .hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:40px;padding-bottom:24px;border-bottom:2px solid #008B8B}
  .co{font-size:30px;font-weight:900;color:#008B8B}.kpn{font-size:14px;color:rgba(255,255,255,0.5);margin-top:5px}
  .mb{display:flex;align-items:center;gap:14px}
  .ma{width:58px;height:58px;border-radius:50%;border:2px solid #008B8B;object-fit:cover}
  .mi{width:58px;height:58px;border-radius:50%;background:rgba(251,191,36,0.12);border:2px solid #008B8B;display:flex;align-items:center;justify-content:center;color:#008B8B;font-weight:900;font-size:22px}
  .minfo{text-align:right;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7}
  .mn{font-weight:900;color:#fff;font-size:15px}
  .st{font-size:16px;font-weight:700;color:#008B8B;margin:32px 0 14px;text-transform:uppercase;letter-spacing:1px}
  .cb{background:rgba(255,255,255,0.04);border:1px solid rgba(251,191,36,0.2);border-radius:14px;padding:20px;display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .cf span{font-size:11px;color:rgba(255,255,255,0.4);display:block;margin-bottom:3px}.cf{font-size:14px;font-weight:600}
  table{width:100%;border-collapse:collapse}
  th{background:#008B8B;color:#0f1117;padding:12px 16px;text-align:left;font-size:11px;text-transform:uppercase}
  td{padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.07);font-size:13px;vertical-align:middle}
  .ni{width:56px;height:56px;background:rgba(255,255,255,0.07);border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font-size:22px}
  .amt{font-weight:700;color:#008B8B}
  .tb{background:linear-gradient(135deg,#008B8B,#d97706);border-radius:16px;padding:24px 32px;display:flex;justify-content:space-between;align-items:center;margin-top:32px}
  .tl{font-size:15px;font-weight:700;color:#0f1117}.ta{font-size:32px;font-weight:900;color:#0f1117}
  .db{background:rgba(255,255,255,0.03);border:1px solid rgba(251,191,36,0.15);border-radius:12px;padding:16px 22px;font-size:13px}
  .dv{color:#008B8B;font-weight:700;font-size:22px}
  .bb{margin-top:14px;padding:12px 16px;background:rgba(255,255,255,0.03);border-left:3px solid #008B8B;border-radius:0 10px 10px 0;font-size:12px;color:rgba(255,255,255,0.6);font-style:italic}
  .pg{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
  .pc{background:#fff;border-radius:10px;padding:10px 6px;display:flex;flex-direction:column;align-items:center;gap:5px}
  .pn{font-size:10px;font-weight:700;color:#555;text-transform:uppercase}
  .ft{margin-top:50px;text-align:center;font-size:11px;color:rgba(255,255,255,0.25);border-top:1px solid rgba(255,255,255,0.08);padding-top:20px}
</style></head><body>
<div class="hdr">
  <div><div class="kpn">${p.kpNumber} &middot; ${p.createdAt ? new Date(p.createdAt).toLocaleDateString('uz-UZ') : ''}</div></div>
  <div class="mb">
    <div class="minfo"><div class="mn">${p.managerName || 'Menejer'}</div>${p.deadline ? `<div>Muddat: <b>${p.deadline} ish kuni</b></div>` : ''}</div>
    ${user?.photo ? `<img src="${user.photo}" class="ma"/>` : `<div class="mi">${(p.managerName || 'M').charAt(0)}</div>`}
  </div>
</div>
<div class="st">Mijoz Ma'lumotlari</div>
<div class="cb">
  <div class="cf"><span>Ism Familiya</span>${p.customer ? `${p.customer.firstName} ${p.customer.lastName}` : '&mdash;'}</div>
  <div class="cf"><span>Telefon</span>${p.customer?.phone || '&mdash;'}</div>
</div>
<div class="st">Mahsulotlar Ro'yxati</div>
<table>
  <thead><tr><th>#</th><th></th><th>Mahsulot</th><th>Soni</th><th>Birligi</th><th>Narxi</th><th>Jami</th></tr></thead>
  <tbody>
    ${(p.items || []).filter(i => i.name).map((item, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${item.image ? `<img src="${item.image}" style="width:56px;height:56px;object-fit:cover;border-radius:8px" alt=""/>` : '<span class="ni">&#128715;</span>'}</td>
        <td><strong>${item.name}</strong>${item.desc ? `<br/><small style="color:rgba(255,255,255,0.4)">${item.desc}</small>` : ''}</td>
        <td>${item.qty}</td><td>${item.unit}</td>
        <td>${(parseInt(String(item.price || '').replace(/[^0-9]/g, ''), 10) || 0).toLocaleString()} so'm</td>
        <td class="amt">${(Number(item.qty) * (parseInt(String(item.price || '').replace(/[^0-9]/g, ''), 10) || 0)).toLocaleString()} so'm</td>
      </tr>`).join('')}
  </tbody>
</table>
<div class="tb"><span class="tl">JAMI TO'LOV SUMMASI</span><span class="ta">${(p.grandTotal || 0).toLocaleString()} so'm</span></div>
${p.deadline ? `
<div class="st">Tayyor Bo'lish Muddati</div>
<div class="db">Tayyor bo'lish muddati: <span class="dv">${p.deadline} ish kuni</span>${basisText ? `<div class="bb">${basisText}</div>` : ''}</div>` : ''}
  ${activePartners.length > 0 ? `
<div class="st">Loyihadagi Hamkorlarimiz</div>
<div class="pg">${activePartners.map(pt => `
  <div class="pc">
    <div style="width:100%;max-height:36px;display:flex;justify-content:center;align-items:center;">
      ${pt.logo.startsWith('<svg') ? pt.logo : `<img src="${pt.logo}" style="max-width:100%;max-height:100%;object-fit:contain;" />`}
    </div>
    <div class="pn">${pt.name}</div>
  </div>`).join('')}</div>` : ''}
<div class="ft">Express Mebel &mdash; Sifat va ishonchlilik garantiyasi &middot; ${new Date().toLocaleDateString('uz-UZ')}</div>
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
