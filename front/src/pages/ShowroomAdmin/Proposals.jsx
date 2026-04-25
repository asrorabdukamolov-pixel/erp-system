import React, { useState, useEffect } from 'react';
import { 
  Search, FileText, Printer, Trash2, 
  Calendar, Clock, DollarSign, User, Briefcase, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const ShowroomProposals = ({ onBack }) => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, proposalId: null });

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      const res = await api.get('/proposals');
      setProposals(res.data);
    } catch (err) { 
      console.error("Proposals load error", err);
      setProposals([]); 
    }
  };

  const confirmDelete = async (reason) => {
    if (!reason) { alert("O'chirish sababini yozing."); return; }
    try {
      await api.delete(`/proposals/${deleteModal.proposalId}`, { data: { reason } });
      alert("Taklif savatga tashlandi.");
      setDeleteModal({ isOpen: false, proposalId: null });
      loadProposals();
    } catch (err) {
      console.error("Delete error", err);
      alert("Xatolik yuz berdi");
    }
  };

  const removeProposal = (id) => {
    setDeleteModal({ isOpen: true, proposalId: id });
  };

  // ── PDF chop etish ───────────────────────────
  const handlePrint = async (kp) => {
    let partnersDetails = [];
    try {
      const res = await api.get('/partners');
      partnersDetails = res.data.filter(p => kp.selectedPartners?.includes(p._id) || kp.selectedPartners?.includes(p.id));
    } catch (err) {
      console.error("Partners load error for print", err);
    }

    const managerPhoto = kp.managerPhoto || '';
    const managerName  = kp.managerName  || 'Menejer';
    const managerPhone = kp.managerPhone || '+998 90 000 00 00';

    const printContent = `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <title>Tijorat Taklifi ${kp.kpNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', Arial, sans-serif; background: #fff; color: #1a1a1a; padding: 40px 50px; line-height: 1.5; }
    .hdr { display: flex; justify-content: space-between; align-items: center; padding-bottom: 22px; margin-bottom: 32px; border-bottom: 1.5px solid #ece8e0; }
    .official-logo { height: 52px; width: auto; }
    .tt-badge { background: #111; color: #fff; padding: 9px 22px; border-radius: 8px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; display: inline-block; }
    .tt-meta { font-size: 13px; font-weight: 700; color: #999; text-align: right; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; margin-bottom: 24px; }
    .info-card { border: 1.5px solid #ede9e0; border-radius: 16px; padding: 20px 24px; }
    .card-label { font-size: 9px; font-weight: 900; color: #c2a87a; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
    .person-name { font-size: 18px; font-weight: 900; color: #111; }
    .manager-row { display: flex; align-items: center; gap: 14px; }
    .mgr-photo { width: 52px; height: 52px; border-radius: 50%; object-fit: cover; border: 2px solid #f0ede8; }
    table { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 40px; border: 1.5px solid #ede9e0; border-radius: 16px; overflow: hidden; }
    th { padding: 16px 14px; text-align: left; font-size: 10px; font-weight: 900; color: #c2a87a; text-transform: uppercase; border-bottom: 1.5px solid #ede9e0; }
    td { padding: 20px 14px; border-bottom: 1px solid #f5f2ed; font-size: 14px; }
    .summary-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 22px; margin-bottom: 40px; }
    .total-card { background: #111; color: #fff; border-radius: 14px; padding: 20px 26px; }
    .grand-amount { font-size: 28px; font-weight: 900; color: #fbbf24; text-align: right; }
  </style>
</head>
<body>
  <div class="hdr">
    <div style="font-weight:900; font-size:24px;">EXPRESS MEBEL</div>
    <div>
      <div class="tt-badge">Tijorat Taklifi</div>
      <div class="tt-meta">#${kp.kpNumber} | ${new Date(kp.createdAt).toLocaleDateString()}</div>
    </div>
  </div>
  <div class="info-grid">
    <div class="info-card">
      <div class="card-label">Buyurtmachi</div>
      <div class="person-name">${kp.customer ? `${kp.customer.firstName} ${kp.customer.lastName}` : '—'}</div>
      <div style="font-size:13px; margin-top:8px;">Tel: ${kp.customer?.phone || '—'}</div>
    </div>
    <div class="info-card">
      <div class="card-label">Taklif Tayyorladi</div>
      <div class="manager-row">
        ${managerPhoto ? `<img src="${managerPhoto}" class="mgr-photo" />` : `<div style="width:52px;height:52px;border-radius:50%;background:#f5f2ed;display:flex;align-items:center;justify-content:center;font-size:24px;">👤</div>`}
        <div>
          <div class="person-name" style="font-size:16px;">${managerName}</div>
          <div style="font-size:12px; color:#666;">Tel: ${managerPhone}</div>
        </div>
      </div>
    </div>
  </div>
  <table>
    <thead>
      <tr><th>#</th><th>Mahsulot</th><th style="text-align:center">Soni</th><th style="text-align:right">Narxi</th><th style="text-align:right">Umumiy</th></tr>
    </thead>
    <tbody>
      ${(kp.items || []).filter(i => i.name).map((item, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td><b>${item.name}</b><br><small>${item.desc || ''}</small></td>
          <td style="text-align:center">${item.qty} ${item.unit}</td>
          <td style="text-align:right">${Number(item.price).toLocaleString()}</td>
          <td style="text-align:right; font-weight:700;">${(Number(item.qty) * Number(item.price)).toLocaleString()}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  <div class="summary-grid">
    <div style="border:1.5px solid #ede9e0; border-radius:14px; padding:22px;">
      <div class="card-label">Muddati</div>
      <div style="font-size:24px; font-weight:900; color:#c9a83c;">${kp.deadline || '—'} ish kuni</div>
    </div>
    <div class="total-card">
      <div style="font-size:12px; text-transform:uppercase; color:#888;">Jami Summa</div>
      <div class="grand-amount">${(kp.grandTotal || 0).toLocaleString()} so'm</div>
    </div>
  </div>
  <script>window.print();</script>
</body>
</html>`;

    const w = window.open('', '_blank');
    w.document.write(printContent);
    w.document.close();
  };

  const filteredProposals = proposals.filter(p => 
    `${p.kpNumber} ${p.customer?.firstName} ${p.customer?.lastName} ${p.managerName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '0px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {onBack && (
            <button 
              onClick={onBack} 
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '10px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: '900' }}>Tijorat Takliflari (Barchasi)</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Menejerlar va PMlar yaratgan barcha tijorat takliflari.</p>
          </div>
        </div>
        <div style={{ position: 'relative', width: '350px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}/>
          <input 
            type="text" 
            placeholder="Qidiruv (KP raqami, mijoz yoki menejer)..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '44px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', height: '48px', color: 'white' }} 
          />
        </div>
      </div>

      <div className="premium-card" style={{ padding: '0px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '13px' }}>
              <th style={{ padding: '20px' }}>KP Raqami</th>
              <th style={{ padding: '20px' }}>Mijoz</th>
              <th style={{ padding: '20px' }}>Tayyorladi (Menejer)</th>
              <th style={{ padding: '20px' }}>Sana</th>
              <th style={{ padding: '20px', textAlign: 'right' }}>Jami Summa</th>
              <th style={{ padding: '20px', textAlign: 'right' }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {filteredProposals.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '60px', textAlign: 'center' }}>Ma'lumotlar yo'q.</td></tr>
            ) : (
              filteredProposals.map(p => (
                <tr key={p._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '20px' }}>
                    <span style={{ fontWeight: '900', color: 'var(--accent-gold)', background: 'rgba(212,175,55,0.1)', padding: '4px 10px', borderRadius: '8px' }}>{p.kpNumber}</span>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <div style={{ fontWeight: '700' }}>{p.customer?.firstName} {p.customer?.lastName}</div>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Briefcase size={14} color="var(--text-secondary)" />
                      <span style={{ fontWeight: '600' }}>{p.managerName || '—'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                      <Calendar size={14} /> {new Date(p.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ padding: '20px', textAlign: 'right', fontWeight: '900' }}>
                    <div style={{ color: 'var(--accent-gold)' }}>{(p.grandTotal || 0).toLocaleString()} so'm</div>
                  </td>
                  <td style={{ padding: '20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => handlePrint(p)} style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(251,191,36,0.1)', color: 'var(--accent-gold)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Chop etish">
                        <Printer size={18} />
                      </button>
                      <button onClick={() => removeProposal(p._id)} style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="O'chirish">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {deleteModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
          <div className="premium-card" style={{ width: '400px', border: '1px solid #ef4444' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px', color: '#ef4444' }}>O'chirish Sababi</h3>
            <textarea 
              id="kp_del_reason_admin"
              style={{ width: '100%', height: '100px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '12px', marginBottom: '20px' }}
              placeholder="Nima uchun o'chirilmoqda?"
            ></textarea>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setDeleteModal({ isOpen: false, proposalId: null })} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'transparent', color: '#fff' }}>Bekor qilish</button>
              <button onClick={() => confirmDelete(document.getElementById('kp_del_reason_admin').value)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: '700' }}>O'chirish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowroomProposals;
