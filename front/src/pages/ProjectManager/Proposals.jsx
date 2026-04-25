import React, { useState, useEffect } from 'react';
import { 
  Search, FileText, Printer, Edit, Trash2, 
  Calendar, Clock, DollarSign, Plus, ArrowLeft, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import KPModal from './KPModal';

const Proposals = () => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, active, sold, rejected
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, proposalId: null });

  useEffect(() => {
    loadProposals();
  }, [user?.id]);

  const loadProposals = async () => {
    try {
      const res = await api.get('/proposals');
      setProposals(res.data);
    } catch (err) { 
      console.error("Load proposals error", err);
      setProposals([]); 
    }
  };

  const confirmDelete = async (reason) => {
    if (!reason) { alert("O'chirish sababini yozing."); return; }
    try {
      await api.delete(`/proposals/${deleteModal.proposalId}`, { data: { reason } });
      setDeleteModal({ isOpen: false, proposalId: null });
      loadProposals();
    } catch (err) {
      console.error("Delete error", err);
      alert("Taklifni o'chirishda xatolik yuz berdi");
    }
  };

  const removeProposal = (id) => {
    setDeleteModal({ isOpen: true, proposalId: id });
  };

  const handleEdit = (p) => {
    setSelectedProposal(p);
    setIsEditModalOpen(true);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.put(`/proposals/${id}`, { status: newStatus });
      loadProposals();
    } catch (err) {
      console.error("Status update error", err);
      alert("Holatni yangilashda xatolik yuz berdi");
    }
  };

  // в”Ђв”Ђ PDF chop etish (Professional Design V3.2) в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  const handlePrint = async (kp) => {
    let partnersDetails = [];
    try {
      const res = await api.get('/partners');
      partnersDetails = res.data.filter(p => kp.selectedPartners?.includes(p._id) || kp.selectedPartners?.includes(p.id));
    } catch (err) {
      console.error("Partners load error for print", err);
    }

    // Manager photo: saved in kp or current user
    const managerPhoto = kp.managerPhoto || user?.photo || '';
    const managerName  = kp.managerName  || user?.name  || 'Menejer';
    const managerPhone = kp.managerPhone || user?.phone  || '+998 90 000 00 00';

    const printContent = `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tijorat Taklifi ${kp.kpNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', Arial, sans-serif;
      background: #fff;
      color: #1a1a1a;
      padding: 40px 50px;
      min-height: 100vh;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* в”Ђв”Ђ HEADER в”Ђв”Ђ */
    .hdr {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 22px;
      margin-bottom: 32px;
      border-bottom: 1.5px solid #d1d1d1;
    }
    .official-logo { height: 52px; width: auto; }
    .tt-badge {
      background: #111;
      color: #fff;
      padding: 9px 22px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 2px;
      display: inline-block;
      margin-bottom: 8px;
    }
    .tt-meta { font-size: 13px; font-weight: 700; color: #999; text-align: right; }
    .tt-meta span { color: #c9a83c; font-weight: 900; }

    /* в”Ђв”Ђ INFO CARDS в”Ђв”Ђ */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 22px;
      margin-bottom: 24px;
    }
    .info-card {
      border: 1.5px solid #d1d1d1;
      border-radius: 16px;
      padding: 20px 24px;
    }
    .card-label {
      font-size: 9px;
      font-weight: 900;
      color: #c2a87a;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 12px;
    }
    .person-name {
      font-size: 18px;
      font-weight: 900;
      color: #111;
      margin-bottom: 6px;
    }
    .person-detail {
      font-size: 13px;
      color: #888;
      margin-bottom: 3px;
    }
    .person-detail b { color: #333; font-weight: 700; }

    .manager-row { display: flex; align-items: center; gap: 14px; }
    .mgr-photo {
      width: 52px; height: 52px; border-radius: 50%;
      object-fit: cover; border: 2px solid #f0ede8;
      box-shadow: 0 3px 8px rgba(0,0,0,0.06);
      flex-shrink: 0;
    }
    .mgr-placeholder {
      width: 52px; height: 52px; border-radius: 50%;
      background: #f5f2ed; display: flex;
      align-items: center; justify-content: center;
      font-size: 22px; flex-shrink: 0;
    }
    .mgr-tag {
      font-size: 10px; font-weight: 800; color: #bbb;
      text-transform: uppercase; letter-spacing: 1px;
      margin-bottom: 3px;
    }

    /* в”Ђв”Ђ PARTNERS в”Ђв”Ђ */
    .partners-section { margin-bottom: 40px; }
    .partners-label {
      font-size: 9px; font-weight: 900; color: #c2a87a;
      text-transform: uppercase; letter-spacing: 2px;
      margin-bottom: 14px;
    }
    .partners-row { display: flex; align-items: center; gap: 25px; flex-wrap: wrap; padding-bottom: 20px; border-bottom: 2px dashed #d1d1d1; }
    .partner-item {
      height: 22px; display: flex; align-items: center;
      justify-content: center; opacity: 0.85;
    }

    /* в”Ђв”Ђ TABLE в”Ђв”Ђ */
    table {
      width: 100%; border-collapse: separate; border-spacing: 0;
      margin-bottom: 40px; border: 1.5px solid #ede9e0;
      border-radius: 16px; overflow: hidden;
    }
    thead tr { background: #faf8f5; }
    th {
      padding: 16px 14px; text-align: left; font-size: 10px;
      font-weight: 900; color: #c2a87a; text-transform: uppercase;
      letter-spacing: 1.5px; border-bottom: 1.5px solid #d1d1d1;
    }
    td {
      padding: 20px 14px; border-bottom: 1px solid #e0e0e0;
      font-size: 14px; vertical-align: middle;
    }
    tr:last-child td { border-bottom: none; }
    .item-img {
      width: 78px; height: 78px; object-fit: cover;
      border-radius: 12px; border: 1px solid #ede9e0;
      display: block;
    }
    .item-img-placeholder {
      width: 78px; height: 78px; border-radius: 12px;
      background: #f5f2ed; display: flex; align-items: center;
      justify-content: center; font-size: 26px; color: #ccc;
    }
    .item-name { font-size: 15px; font-weight: 800; color: #111; margin-bottom: 5px; }
    .item-desc { font-size: 12px; color: #aaa; line-height: 1.5; }
    .price-col { text-align: right; }
    .total-col { text-align: right; font-weight: 900; color: #111; }

    .summary-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 22px;
      align-items: stretch;
      margin-bottom: 40px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .deadline-card {
      border: 1.5px solid #ede9e0; border-radius: 14px; padding: 22px 26px;
      display: flex; flex-direction: column; justify-content: center;
    }
    .deadline-num {
      font-size: 30px; font-weight: 900; color: #c9a83c;
      letter-spacing: -1px; margin-bottom: 6px; line-height: 1;
    }
    .deadline-unit { font-size: 14px; font-weight: 700; color: #888; }
    .deadline-note { font-size: 12px; color: #bbb; margin-top: 8px; font-style: italic; }

    .total-card {
      background: #111; color: #fff; border-radius: 14px;
      padding: 20px 26px; display: flex; flex-direction: column;
      justify-content: center;
    }
    .total-line {
      display: flex; justify-content: space-between;
      align-items: baseline; margin-bottom: 8px;
    }
    .total-line-label { font-size: 13px; color: #888; }
    .total-line-val { font-size: 13px; font-weight: 700; color: #ddd; }
    .grand-divider { border-top: 1px solid #2a2a2a; margin: 12px 0; }
    .grand-title { font-size: 10px; font-weight: 900; color: #888; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px; }
    .grand-amount { font-size: 28px; font-weight: 900; color: #fbbf24; letter-spacing: -0.5px; text-align: right; line-height: 1.2; }
    .grand-notice { font-size: 10px; color: #444; text-align: right; margin-top: 10px; font-style: italic; }

    /* в”Ђв”Ђ FOOTER в”Ђв”Ђ */
    .footer {
      border-top: 1.5px solid #d1d1d1; padding-top: 28px; margin-top: 60px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .footer-brand { font-size: 15px; font-weight: 950; color: #111; text-transform: uppercase; letter-spacing: 1px; }
    .footer-contact { font-size: 12px; color: #aaa; text-align: right; line-height: 1.7; }

    @media print {
      @page { margin: 1.2cm; size: A4; }
      body { padding: 0; }
      .total-card { background-color: #111 !important; }
      .summary-grid { page-break-inside: avoid !important; break-inside: avoid !important; }
      .info-grid { page-break-inside: avoid !important; break-inside: avoid !important; }
      tr { page-break-inside: avoid; break-inside: avoid; }
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div class="hdr">
    <svg class="official-logo" viewBox="0 0 455 130">
      <!-- 3 teal speed-line stripes -->
      <polygon points="55,8  150,8  133,24 38,24"  fill="#008B8B"/>
      <polygon points="37,34 150,34 133,50 20,50"  fill="#008B8B"/>
      <polygon points="19,60 150,60 133,76 2,76"   fill="#008B8B"/>
      <!-- express bold italic -->
      <text x="163" y="72" font-family="'Arial Black',Arial,sans-serif" font-weight="900" font-style="italic" font-size="60" fill="#2a2a2a">express</text>
      <text x="413" y="54" font-family="Arial,sans-serif" font-size="14" fill="#2a2a2a">В®</text>
      <!-- mebel bold italic -->
      <text x="178" y="118" font-family="'Arial Black',Arial,sans-serif" font-weight="900" font-style="italic" font-size="50" fill="#2a2a2a">mebel</text>
    </svg>
    <div>
      <div class="tt-badge">Tijorat Taklifi</div>
      <div class="tt-meta">#${kp.kpNumber} &nbsp;|&nbsp; <span>${new Date(kp.createdAt).toLocaleDateString('uz-UZ')}</span></div>
    </div>
  </div>

  <!-- INFO CARDS -->
  <div class="info-grid">
    <div class="info-card">
      <div class="card-label">Buyurtmachi</div>
      <div class="person-name">${kp.customer ? `${kp.customer.firstName} ${kp.customer.lastName}` : 'вЂ”'}</div>
      <div class="person-detail">Tel: <b>${kp.customer?.phone || 'вЂ”'}</b></div>
      <div class="person-detail">Manzil: <b>${kp.customer?.address || 'вЂ”'}${kp.customer?.houseNumber ? `, ${kp.customer.houseNumber}-uy` : ''}${kp.customer?.apartmentNumber ? `, ${kp.customer.apartmentNumber}-xonadon` : ''}</b></div>
    </div>

    <div class="info-card">
      <div class="card-label">Taklif Tayyorladi</div>
      <div class="manager-row">
        ${managerPhoto
          ? `<img src="${managerPhoto}" class="mgr-photo" />`
          : `<div class="mgr-placeholder">рџ‘¤</div>`}
        <div>
          <div class="mgr-tag">Sotuv Menejeri</div>
          <div class="person-name" style="font-size:16px;margin-bottom:4px;">${managerName}</div>
          <div class="person-detail" style="font-size:11px;color:#bbb;text-transform:uppercase;font-weight:700;margin-bottom:2px;">Express Mebel</div>
          <div class="person-detail">Tel: <b>${managerPhone}</b></div>
        </div>
      </div>
    </div>
  </div>

  <!-- PARTNERS -->
  ${partnersDetails.length > 0 ? `
  <div class="partners-section">
    <div class="partners-label">Loyihadagi Hamkorlarimiz</div>
    <div class="partners-row">
      ${partnersDetails.map(p => `
        <div class="partner-item">
          ${p.logo.startsWith('<svg')
            ? p.logo.replace('<svg', '<svg style="height:22px;width:auto;"')
            : `<img src="${p.logo}" style="height:22px;width:auto;object-fit:contain;" />`}
        </div>
      `).join('')}
    </div>
  </div>` : ''}

  <!-- ITEMS TABLE -->
  <table>
    <thead>
      <tr>
        <th style="width:38px">#</th>
        <th style="width:108px">Surat</th>
        <th>Mahsulot Nomi / Tavsif</th>
        <th style="text-align:center;width:80px">Soni</th>
        <th style="text-align:right;width:130px">Narxi</th>
        <th style="text-align:right;width:150px">Umumiy</th>
      </tr>
    </thead>
    <tbody>
      ${(kp.items || []).filter(i => i.name).map((item, idx) => `
        <tr>
          <td style="color:#bbb;font-weight:700;">${idx + 1}</td>
          <td>
            ${item.image
              ? `<img src="${item.image}" class="item-img" />`
              : `<div class="item-img-placeholder">рџ›‹пёЏ</div>`}
          </td>
          <td>
            <div class="item-name">${item.name}</div>
            <div class="item-desc">${item.desc || 'Tavsif kiritilmagan'}</div>
          </td>
          <td style="text-align:center;font-weight:700;">${item.qty} ${item.unit}</td>
          <td class="price-col" style="color:#666;">${Number(item.price).toLocaleString()} so'm</td>
          <td class="total-col">${(Number(item.qty) * Number(item.price)).toLocaleString()} so'm</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <!-- SUMMARY -->
  <div class="summary-grid">
    <div class="deadline-card">
      <div class="card-label">Topshirish muddati</div>
      <div>
        <span class="deadline-num">${kp.deadline || 'вЂ”'}</span>
        <span class="deadline-unit"> ish kuni</span>
      </div>
      <div class="deadline-note">* ${kp.deadlineBasis || "Muddat o'lcham olishdan boshlanadi"}</div>
    </div>

    <div class="total-card">
      <div class="total-line">
        <span class="total-line-label">Mahsulotlar:</span>
        <span class="total-line-val">${(kp.itemsTotal || 0).toLocaleString()} so'm</span>
      </div>
      ${(kp.servicesTotal || 0) > 0 ? `
      <div class="total-line">
        <span class="total-line-label">Xizmatlar:</span>
        <span class="total-line-val">${(kp.servicesTotal || 0).toLocaleString()} so'm</span>
      </div>` : ''}
      <div class="grand-divider"></div>
      <div class="grand-title">Jami summa</div>
      <div class="grand-amount">${(kp.grandTotal || 0).toLocaleString()} so'm</div>
      <div class="grand-notice">* narxlar 10 kungacha amal qiladi</div>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-brand">Express Mebel</div>
    <div class="footer-contact">
      Toshkent sh., Jomiy ko'chasi<br>
      t.me/expressmebel &nbsp;&middot;&nbsp; instagram.com/express_mebel__uz
    </div>
  </div>

</body>
</html>`;

    const w = window.open('', '_blank');
    w.document.write(printContent);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 700);
  };

  const filteredProposals = proposals.filter(p => {
    const matchesSearch = `${p.kpNumber} ${p.customer?.firstName} ${p.customer?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || p.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const stats = {
    total: proposals.filter(p => p.status !== 'trash').length,
    totalSum: proposals.filter(p => p.status !== 'trash').reduce((s, p) => s + (p.grandTotal || 0), 0),
    soldCount: proposals.filter(p => p.status === 'sold').length,
    soldSum: proposals.filter(p => p.status === 'sold').reduce((s, p) => s + (p.grandTotal || 0), 0),
    rejectedCount: proposals.filter(p => p.status === 'rejected').length,
    rejectedSum: proposals.filter(p => p.status === 'rejected').reduce((s, p) => s + (p.grandTotal || 0), 0),
    activeCount: proposals.filter(p => p.status === 'active').length,
    activeSum: proposals.filter(p => p.status === 'active').reduce((s, p) => s + (p.grandTotal || 0), 0),
  };

  const StatCard = ({ label, count, sum, color, icon: Icon }) => (
    <div className="premium-card" style={{ padding: '20px', flex: 1, border: `1px solid ${color}33` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} />
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</p>
          <p style={{ fontSize: '18px', fontWeight: '900', color: color }}>{count}</p>
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
        <p style={{ fontSize: '14px', fontWeight: '800' }}>{sum.toLocaleString()} <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>so'm</span></p>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '40px', flex: 1, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: '900' }}>Tijorat Takliflari</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loyihalar uchun saqlangan barcha tijorat takliflari.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}/>
            <input 
              type="text" 
              placeholder="Taklif raqami yoki mijoz..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '44px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', height: '48px', color: 'white' }} 
            />
          </div>
          <button onClick={() => { setSelectedProposal(null); setIsEditModalOpen(true); }} className="gold-btn" style={{ height: '48px' }}>
            <Plus size={20} /> Yangi KP Yaratish
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
        <StatCard label="Jami Takliflar" count={stats.total} sum={stats.totalSum} color="var(--accent-gold)" icon={FileText} />
        <StatCard label="Sotilgan" count={stats.soldCount} sum={stats.soldSum} color="#10b981" icon={DollarSign} />
        <StatCard label="Jarayonda" count={stats.activeCount} sum={stats.activeSum} color="#3b82f6" icon={Clock} />
        <StatCard label="O'tkaz (Rejected)" count={stats.rejectedCount} sum={stats.rejectedSum} color="#ef4444" icon={X} />
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '12px', width: 'fit-content', border: '1px solid var(--border-color)' }}>
        {[
          { id: 'all', label: `Barchasi (${stats.total})` },
          { id: 'active', label: `Jarayonda (${stats.activeCount})` },
          { id: 'sold', label: `Sotilgan (${stats.soldCount})` },
          { id: 'rejected', label: `O'tkaz (${stats.rejectedCount})` }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === t.id ? 'var(--accent-gold)' : 'transparent',
              color: activeTab === t.id ? 'black' : 'var(--text-secondary)',
              transition: '0.2s'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        {filteredProposals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed var(--border-color)' }}>
             <FileText size={48} color="var(--text-secondary)" style={{ marginBottom: '16px', opacity: 0.3 }} />
             <p style={{ color: 'var(--text-secondary)' }}>Takliflar topilmadi.</p>
          </div>
        ) : (
          filteredProposals.map(p => (
            <div key={p._id} style={{ background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: '0.2s' }} className="proposal-card">
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(251,191,36,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)' }}>
                  <FileText size={28} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '900', color: 'var(--accent-gold)', background: 'rgba(212,175,55,0.1)', padding: '2px 8px', borderRadius: '6px' }}>{p.kpNumber}</span>
                    <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{p.customer?.firstName} {p.customer?.lastName}</h3>
                    <span style={{ 
                      fontSize: '10px', 
                      fontWeight: '800', 
                      padding: '2px 8px', 
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      background: p.status === 'sold' ? 'rgba(16,185,129,0.1)' : p.status === 'rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
                      color: p.status === 'sold' ? '#10b981' : p.status === 'rejected' ? '#ef4444' : '#3b82f6',
                      border: `1px solid ${p.status === 'sold' ? '#10b98133' : p.status === 'rejected' ? '#ef444433' : '#3b82f633'}`
                    }}>
                      {p.status === 'sold' ? 'Sotilgan' : p.status === 'rejected' ? 'O\'tkaz' : 'Jarayonda'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {new Date(p.createdAt).toLocaleDateString()}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><DollarSign size={14} /> {(p.grandTotal || 0).toLocaleString()} so'm</span>
                    {p.deadline && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {p.deadline} ish kuni</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => handlePrint(p)} style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(251,191,36,0.1)', color: 'var(--accent-gold)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Chop etish">
                  <Printer size={20} />
                </button>
                <button onClick={() => handleEdit(p)} style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Tahrirlash">
                  <Edit size={20} />
                </button>
                {p.status === 'active' && (
                  <button onClick={() => handleStatusUpdate(p._id, 'rejected')} style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="O'tkaz qilish">
                    <X size={20} />
                  </button>
                )}
                <button onClick={() => removeProposal(p._id)} style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="O'chirish">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {deleteModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
          <div style={{ background: '#1a1a2e', border: '1px solid var(--accent-gold)', borderRadius: '24px', padding: '32px', width: '450px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px', textAlign: 'center' }}>O'chirish Sababi</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', marginBottom: '24px' }}>Ushbu taklifni o'chirish sababini yozing (tahlil uchun muhim).</p>
            
            <textarea 
              id="kp_del_reason"
              style={{ width: '100%', height: '120px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '16px', padding: '16px', fontSize: '14px', marginBottom: '20px', resize: 'none' }}
              placeholder="Sababni batafsil yozishingiz mumkin..."
            ></textarea>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setDeleteModal({ isOpen: false, proposalId: null })}
                style={{ flex: 1, padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '700' }}
              >
                Bekor qilish
              </button>
              <button 
                onClick={() => confirmDelete(document.getElementById('kp_del_reason').value)}
                style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#ef4444', border: 'none', color: 'white', cursor: 'pointer', fontWeight: '700' }}
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <KPModal 
          editData={selectedProposal} 
          onClose={() => { setIsEditModalOpen(false); loadProposals(); }} 
        />
      )}

      <style>{`
        .proposal-card:hover {
          border-color: var(--accent-gold) !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
};

export default Proposals;
