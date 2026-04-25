import React, { useState, useEffect } from 'react';
import {
  X, Search, Plus, Trash2, FileText, Printer,
  User, Phone, Clock, Package, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

// PARTNERS array moved inside the component to be dynamic

const DEADLINE_OPTIONS = [
  { id: 'nazorat', label: "* muddat hisobi nazorat o'lchami olingan kundan boshlanadi" },
  { id: 'avans',   label: "* muddat hisobi avans berilgan kundan boshlanadi" },
  { id: 'tayyor',  label: "* muddat hisobi obyekt tayyor bo'lgan kundan hisoblanadi" },
  { id: 'custom',  label: "O'z variantingizni kiriting..." },
];

const EXTRA_SERVICES = [
  { id: 'eco',      label: 'Zararsiz homashyolar',  desc: "Ekologik toza materiallardan foydalanish." },
  { id: 'cleaning', label: 'Cleaning (Tozalash)',   desc: "Mebel o'rnatilgan xonani tozalab berish." },
  { id: 'packing',  label: 'Maxsus qadoqlash',      desc: "Himoyalangan qadoqlash materiallaridan foydalanish." },
];

const emptyItem = () => ({ id: Date.now() + Math.random(), name: '', desc: '', qty: 1, unit: 'dona', price: '', image: null });

// --- Formatters ---
const formatAmount = (val) => {
  if (val === undefined || val === null || val === "") return "";
  const num = val.toString().replace(/\D/g, "");
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const KPModal = ({ onClose, editData = null }) => {
  const { user } = useAuth();

  // Mijoz
  const [customers, setCustomers]               = useState([]);
  const [customerSearch, setCustomerSearch]     = useState('');
  const [customerSuggestions, setSuggestions]   = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Muddat
  const [deadline, setDeadline]               = useState('18');
  const [deadlineBasis, setDeadlineBasis]     = useState('');
  const [customBasis, setCustomBasis]         = useState('');

  // Hamkorlar
  const [partnersList, setPartnersList]         = useState([]);
  const [selectedPartners, setSelectedPartners] = useState([]);

  // Mahsulotlar
  const [items, setItems]                       = useState([emptyItem()]);
  const [services, setServices]                 = useState({ eco: false, cleaning: false, packing: false });
  const [servicePrices, setServicePrices]       = useState({ eco: 0, cleaning: 0, packing: 0 });

  const [kpNumber, setKpNumber] = useState('');
  const [companySettings, setCompanySettings] = useState({
    companyName: 'EXPRESS MEBEL',
    companyPhone: '+998 88 737 54 43',
    companyLogo: '',
    companyAddress: "Toshkent sh. Jomiy ko'chasi",
    instagram: 'instagram.com/express_mebel__uz',
    telegram: 't.me/expressmebel'
  });

  // Edit mode initialization
  useEffect(() => {
    if (editData) {
      setSelectedCustomer(editData.customer);
      setCustomerSearch(editData.customer ? `${editData.customer.firstName} ${editData.customer.lastName}` : '');
      setDeadline(editData.deadline || '18');
      setDeadlineBasis(editData.deadlineBasis || '');
      setCustomBasis(editData.customBasis || '');
      setSelectedPartners(editData.selectedPartners || []);
      setItems(editData.items || [emptyItem()]);
      setServices(editData.services || { eco: false, cleaning: false, packing: false });
      setServicePrices(editData.servicePrices || { eco: 0, cleaning: 0, packing: 0 });
      setKpNumber(editData.kpNumber);
    } else {
      setKpNumber(`KP-${Date.now().toString().slice(-6)}`);
    }
  }, [editData]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get('/customers');
        setCustomers(res.data);
      } catch (err) {
        console.error("Customers load error", err);
      }

      // Load dynamic partners
      try {
        const pRes = await api.get('/partners');
        setPartnersList(pRes.data);
        if (pRes.data.length > 0 && selectedPartners.length === 0) {
          setSelectedPartners(pRes.data.slice(0, 3).map(p => p._id));
        }
      } catch (err) {
        console.error("Partners load error", err);
      }

      // Load company settings
      try {
        const sRes = await api.get('/settings');
        if (sRes.data) setCompanySettings(sRes.data);
      } catch (err) {
        console.error("Settings load error", err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      const name = `${selectedCustomer.firstName} ${selectedCustomer.lastName}`;
      if (customerSearch === name) { setSuggestions([]); return; }
      setSelectedCustomer(null);
    }
    if (customerSearch.length > 1) {
      setSuggestions(customers.filter(c =>
        `${c.firstName} ${c.lastName} ${c.phone}`.toLowerCase().includes(customerSearch.toLowerCase())
      ));
    } else setSuggestions([]);
  }, [customerSearch]);

  // Items helpers
  const addItem    = () => setItems(p => [...p, emptyItem()]);
  const removeItem = id => setItems(p => p.filter(i => i.id !== id));
  const updateItem = (id, field, value) => setItems(p => p.map(i => i.id === id ? { ...i, [field]: value } : i));
  const handleItemImage = (id, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => updateItem(id, 'image', e.target.result);
    reader.readAsDataURL(file);
  };

  const togglePartner = id => setSelectedPartners(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const itemsTotal = items.reduce((s, i) => {
    const qty = parseFloat(i.qty) || 0;
    const priceStr = String(i.price || '').replace(/[^0-9]/g, '');
    const price = parseInt(priceStr, 10) || 0;
    return s + (qty * price);
  }, 0);

  const servicesTotal = Object.entries(services).reduce((s, [k, v]) => {
    const priceStr = String(servicePrices[k] || '').replace(/[^0-9]/g, '');
    const price = parseInt(priceStr, 10) || 0;
    return s + (v ? price : 0);
  }, 0);
  
  const grandTotal   = itemsTotal + servicesTotal;

  const getBasisText = () => {
    if (deadlineBasis === 'custom') return customBasis;
    return DEADLINE_OPTIONS.find(o => o.id === deadlineBasis)?.label || '';
  };

  const handleSave = async () => {
    const cleanItems = items.map(i => ({
      ...i,
      price: Number(i.price?.toString().replace(/\D/g, '') || 0)
    }));

    // Clean service prices
    const cleanServicePrices = {};
    Object.entries(servicePrices).forEach(([k, v]) => {
      cleanServicePrices[k] = Number(v?.toString().replace(/\D/g, '') || 0);
    });

    const proposalData = {
      kpNumber,
      customer: selectedCustomer,
      deadline, deadlineBasis, customBasis,
      selectedPartners, 
      items: cleanItems, 
      services, 
      servicePrices: cleanServicePrices,
      grandTotal,
    };
    
    try {
      if (editData) {
        await api.put(`/proposals/${editData._id}`, proposalData);
      } else {
        await api.post('/proposals', proposalData);
      }
      alert(editData ? "Taklif muvaffaqiyatli yangilandi!" : "KP muvaffaqiyatli saqlandi!");
      onClose();
    } catch (err) {
      console.error("Save error", err);
      alert("Taklifni saqlashda xatolik: " + (err.response?.data?.message || err.message));
    }
  };

  // в”Ђв”Ђ PDF chop etish (Professional Design V3.2) в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  const handlePrint = () => {
    const activePartners = partnersList.filter(p => selectedPartners.includes(p._id));
    const basisText     = getBasisText();

    const printContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Tijorat Taklifi ${kpNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@700;900&display=swap');
    
    * { margin:0; padding:0; box-sizing:border-box; }
    body { 
      font-family:'Inter', Arial, sans-serif; 
      background:#fff; 
      color:#1a1a1a; 
      padding:40px; 
      min-height:100vh;
      line-height: 1.4;
    }

    /* Header & Logo Section */
    .hdr { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      border-bottom: 2px solid #eee;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .logo-container { display: flex; align-items: center; gap: 15px; }
    .official-logo { height: 52px; width: auto; }
    
    .tt-badge-side { text-align: right; }
    .tt-badge { 
      background: #000; 
      color: #fff; 
      padding: 8px 24px; 
      border-radius: 8px; 
      font-size: 11px; 
      font-weight: 950; 
      text-transform: uppercase; 
      letter-spacing: 2px;
      display: inline-block;
    }
    .tt-meta { margin-top: 10px; font-size: 14px; font-weight: 700; color: #888; }
    .tt-meta span { color: #008B8B; font-weight: 900; }
    .logo-container { display: flex; align-items: center; gap: 15px; }
    .official-logo { height: 60px; width: auto; object-fit: contain; }

    /* Info Section (Buyer & Manager) */
    .info-grid { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 25px; 
      margin-bottom: 25px; 
    }
    
    .info-card {
      background: #fff;
      border: 1px solid #f0f0ed;
      border-radius: 14px;
      padding: 20px 24px;
    }
    .card-title {
      font-size: 10px;
      font-weight: 900;
      color: #b5a38a;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 12px;
    }
    .person-name { font-size: 18px; font-weight: 900; color: #000; margin-bottom: 5px; }
    .person-details { font-size: 13px; color: #777; line-height: 1.6; }
    .person-details b { color: #222; font-weight: 700; }

    .manager-box { display: flex; align-items: center; gap: 14px; }
    .manager-photo {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #f9f9f7;
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }
    .manager-placeholder {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #f9f9f7;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ccc;
      font-size: 22px;
    }

    /* Partners Full Width - Repositioned Below Info */
    .partners-section { 
      margin-bottom: 40px; 
      padding: 0 5px;
    }
    .partners-label { 
      font-size: 9px; 
      font-weight: 900; 
      color: #b5a38a; 
      text-transform: uppercase; 
      letter-spacing: 2px; 
      margin-bottom: 15px; 
    }
    .partners-row { 
      display: flex; 
      align-items: center; 
      gap: 25px; 
      flex-wrap: wrap; 
      padding-bottom: 20px;
      border-bottom: 2px dashed #ede9e0;
    }
    .partner-logo-item { height: 22px; display: flex; align-items: center; justify-content: center; opacity: 0.85; }

    /* Table Design */
    table { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 40px; border: 1px solid #f0f0ed; border-radius: 16px; overflow: hidden; }
    th { 
      background: #fafaf9;
      padding: 16px 14px; 
      text-align: left; 
      font-size: 11px; 
      font-weight: 900; 
      color: #b5a38a; 
      text-transform: uppercase;
      border-bottom: 1px solid #f0f0ed;
    }
    td { padding: 20px 14px; border-bottom: 1px solid #f9f9f7; font-size: 14px; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    
    .item-img { width: 80px; height: 80px; object-fit: cover; border-radius: 12px; border: 1px solid #f0f0ed; }
    .item-info strong { display: block; font-size: 16px; font-weight: 900; margin-bottom: 6px; }
    .item-info small { color: #888; font-size: 12px; line-height: 1.5; display: block; white-space: pre-line; }

    /* Summary Section */
    .summary-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 22px; align-items: stretch; page-break-inside: avoid; break-inside: avoid; }
    
    .deadline-card { 
      background: #fff; 
      border: 1px solid #f0f0ed; 
      border-radius: 14px; 
      padding: 22px 26px;
    }
    .deadline-val { font-size: 30px; font-weight: 900; color: #008B8B; letter-spacing: -1px; margin-bottom: 6px; }
    .deadline-sub { font-size: 12px; color: #999; line-height: 1.5; }

    .grand-total-card { 
      background: #111; 
      color: #fff; 
      border-radius: 14px; 
      padding: 20px 26px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .total-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
    .total-label { font-size: 13px; color: #888; }
    .total-val { font-size: 13px; font-weight: 700; color: #ddd; }
    .grand-label { font-size: 11px; font-weight: 900; color: #888; border-top: 1px solid #2a2a2a; padding-top: 14px; margin-top: 6px; text-transform: uppercase; letter-spacing: 1px; }
    .grand-val { font-size: 28px; font-weight: 900; color: #008B8B; letter-spacing: -0.5px; text-align: right; margin-top: 4px; }

    /* Services Section (Bonus tags) */
    .services-title { font-size: 10px; font-weight: 900; color: #b5a38a; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 15px; margin-top: 40px; }
    .services-row { display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 20px; }
    .service-card { 
      background: #fbfbf9; 
      border: 1px solid #f0f0ed; 
      border-radius: 14px; 
      padding: 18px 24px; 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
    }
    .service-name { font-size: 14px; font-weight: 800; color: #222; }
    .service-desc { font-size: 12px; color: #888; margin-top: 3px; }
    .bonus-tag { background: #fff; color: #008B8B; padding: 6px 14px; border-radius: 8px; font-size: 11px; font-weight: 950; border: 1px solid #f0f0ed; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }

    /* Footer */
    .footer { 
      margin-top: 100px; 
      padding-top: 35px; 
      border-top: 1px solid #eee; 
      display: flex; 
      justify-content: space-between; 
      align-items: baseline;
      color: #999;
      font-size: 12px;
    }
    .footer-logo { color: #111; font-weight: 950; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; }
    .footer-details { text-align: right; }

    @media print {
      @page { margin: 1.2cm; size: A4; }
      body { padding: 0; }
      .grand-total-card { background-color: #111 !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .summary-grid { page-break-inside: avoid !important; break-inside: avoid !important; }
      .info-grid { page-break-inside: avoid !important; break-inside: avoid !important; }
      tr { page-break-inside: avoid; break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="hdr">
    <div class="logo-container">
      ${companySettings.companyLogo ? `<img src="${companySettings.companyLogo}" class="official-logo" />` : '<div></div>'}
    </div>
    <div class="tt-badge-side">
      <div class="tt-badge">Tijorat Taklifi</div>
      <div class="tt-meta">#${kpNumber} | <span>${new Date().toLocaleDateString('uz-UZ')}</span></div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-card">
      <div class="card-title">Buyurtmachi</div>
      <div class="person-name">${selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : 'вЂ”'}</div>
      <div class="person-details">
        <div>Tel: <b>${selectedCustomer?.phone || 'вЂ”'}</b></div>
        <div>Manzil: <b>${selectedCustomer?.address || 'вЂ”'}${selectedCustomer?.houseNumber ? `, ${selectedCustomer.houseNumber}-uy` : ''}${selectedCustomer?.apartmentNumber ? `, ${selectedCustomer.apartmentNumber}-xonadon` : ''}</b></div>
      </div>
    </div>
    
    <div class="info-card">
      <div class="card-title">Taklif Tayyorladi</div>
      <div class="manager-box">
        ${user?.photo ? `<img src="${user.photo}" class="manager-photo" />` : '<div class="manager-placeholder">рџ‘¤</div>'}
        <div class="person-details">
          <div class="person-name" style="font-size:16px; margin-bottom:2px;">${user?.name || 'Menejer'}</div>
          <div style="font-size:11px; color:#999; text-transform:uppercase; font-weight:700;">${companySettings.companyName}</div>
          <div>Tel: <b>${user?.phone || companySettings.companyPhone}</b></div>
        </div>
      </div>
    </div>
  </div>

  <div class="partners-section">
    ${activePartners.length > 0 ? `
    <div class="partners-label">Loyihadagi Hamkorlarimiz</div>
    <div class="partners-row">
      ${activePartners.map(p => `
        <div class="partner-logo-item">
          ${p.logo.startsWith('<svg') ? p.logo.replace('<svg', '<svg style="height:22px;width:auto;"') : `<img src="${p.logo}" style="height:22px;object-fit:contain;" />`}
        </div>
      `).join('')}
    </div>` : ''}
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
      ${items.filter(i => i.name).map((item, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>
            ${item.image ? `<img src="${item.image}" class="item-img" />` : '<div class="item-img" style="display:flex;align-items:center;justify-content:center;color:#ccc;font-size:24px;">рџ›‹пёЏ</div>'}
          </td>
          <td class="item-info">
            <strong>${item.name}</strong>
            <small>${item.desc || 'Tavsif kiritilmagan'}</small>
          </td>
          <td style="text-align:center">${item.qty} ${item.unit}</td>
          <td style="text-align:right">${(parseInt(String(item.price || '').replace(/[^0-9]/g, ''), 10) || 0).toLocaleString()} so'm</td>
          <td style="text-align:right; font-weight:900;">${((parseFloat(item.qty) || 0) * (parseInt(String(item.price || '').replace(/[^0-9]/g, ''), 10) || 0)).toLocaleString()} so'm</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="summary-grid">
    <div class="deadline-card">
      <div class="card-title">Topshirish muddati</div>
      <div class="deadline-val">${deadline} ish kuni</div>
      <div class="deadline-sub">* ${basisText || "Muddat o'lcham olishdan boshlanadi"}</div>
    </div>
    
    <div class="grand-total-card">
      <div class="total-row">
        <span class="total-label">Mahsulotlar:</span>
        <span class="total-val">${(itemsTotal || 0).toLocaleString()} so'm</span>
      </div>
      <div class="total-row" style="display: ${servicesTotal > 0 ? 'flex' : 'none'}">
        <span class="total-label">Xizmatlar:</span>
        <span class="total-val">${servicesTotal.toLocaleString()} so'm</span>
      </div>
      <div class="grand-label">Jami summa</div>
      <div class="grand-val">${(grandTotal || 0).toLocaleString()} so'm</div>
      <div style="font-size: 11px; color: #555; text-align: right; margin-top: 15px; font-style: italic;">* narxlar 10 kungacha amal qiladi</div>
    </div>
  </div>

  <div class="services-title">Qo'shimcha Xizmatlar</div>
  <div class="services-row">
    ${Object.entries(services).filter(([_, v]) => v).map(([k, _]) => {
      const svc = EXTRA_SERVICES.find(s => s.id === k);
      return svc ? `
        <div class="service-card">
          <div>
            <div class="service-name">${svc.label}</div>
            <div class="service-desc">${svc.desc}</div>
          </div>
          <div class="bonus-tag">BONUS</div>
        </div>
      ` : '';
    }).join('')}
  </div>

  <div class="footer">
    <div class="footer-logo">${companySettings.companyName}</div>
    <div class="footer-details">
      ${companySettings.companyAddress} &middot; ${companySettings.telegram} &middot; ${companySettings.instagram}
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

  // в”Ђв”Ђ LABEL STYLE в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  const lbl = { display:'block', fontSize:'11px', color:'var(--text-secondary)', marginBottom:'8px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.05em' };
  const inp = { width:'100%', height:'50px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', color:'white', padding:'0 14px', fontSize:'14px' };

  return (
    <div translate="no" style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.92)', backdropFilter:'blur(16px)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:3000, padding:'20px' }}>
      <div style={{ width:'1440px', maxWidth:'98vw', maxHeight:'95vh', background:'var(--secondary-bg)', borderRadius:'28px', border:'1px solid rgba(255,255,255,0.1)', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 40px 120px rgba(0,0,0,0.8)' }}>

        {/* в”Ђв”Ђ Header в”Ђв”Ђ */}
        <div style={{ padding:'28px 40px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <div>
            <h2 style={{ fontSize:'26px', fontWeight:'900' }}>Tijorat Taklifi <span style={{ color:'var(--accent-gold)' }}>{kpNumber}</span></h2>
            <p style={{ color:'var(--text-secondary)', marginTop:'4px', fontSize:'13px' }}>Mijozingizga professional KP tayyorlang</p>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.06)', padding:'12px', borderRadius:'50%', color:'var(--text-secondary)', border:'none', cursor:'pointer' }}><X size={22}/></button>
        </div>

        {/* в”Ђв”Ђ Body в”Ђв”Ђ */}
        <div className="no-scrollbar" style={{ flex:1, overflowY:'auto', padding:'36px 40px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'48px' }}>

            {/* в•ђв•ђ CHAP USTUN в•ђв•ђ */}
            <div style={{ display:'flex', flexDirection:'column', gap:'28px' }}>

              {/* Mijoz qidirish */}
              <div>
                <label style={lbl}>Mijozni Tanlash</label>
                <div style={{ position:'relative' }}>
                  <Search size={16} style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'var(--text-secondary)' }}/>
                  <input
                    value={customerSearch}
                    onChange={e => setCustomerSearch(e.target.value)}
                    placeholder="Ism yoki telefon..."
                    style={{ ...inp, paddingLeft:'42px' }}
                    autoComplete="off"
                  />
                  {customerSuggestions.length > 0 && (
                    <div style={{ position:'absolute', top:'100%', left:0, width:'100%', background:'#1a1a2e', zIndex:100, borderRadius:'12px', border:'1px solid rgba(255,255,255,0.1)', marginTop:'6px', overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.7)' }}>
                      {customerSuggestions.map(c => (
                        <div key={c._id}
                          onClick={() => { setSelectedCustomer(c); setCustomerSearch(`${c.firstName} ${c.lastName}`); setSuggestions([]); }}
                          style={{ padding:'14px 20px', cursor:'pointer', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', justifyContent:'space-between', fontSize:'14px' }}>
                          <span style={{ fontWeight:'700' }}>{c.firstName} {c.lastName}</span>
                          <span style={{ color:'var(--text-secondary)' }}>{c.phone}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedCustomer && (
                  <div style={{ marginTop:'12px', background:'rgba(251,191,36,0.05)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:'12px', padding:'14px 18px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                    <div style={{ display:'flex', gap:'8px', alignItems:'center', fontSize:'13px' }}><User size={14} color="#008B8B"/> {selectedCustomer.firstName} {selectedCustomer.lastName}</div>
                    <div style={{ display:'flex', gap:'8px', alignItems:'center', fontSize:'13px' }}><Phone size={14} color="#008B8B"/> {selectedCustomer.phone}</div>
                  </div>
                )}
              </div>

              {/* Menejer bloki */}
              <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', padding:'16px 20px', display:'flex', alignItems:'center', gap:'16px' }}>
                <div style={{ width:'50px', height:'50px', borderRadius:'50%', border:'2px solid var(--accent-gold)', overflow:'hidden', flexShrink:0, background:'rgba(251,191,36,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent-gold)', fontWeight:'900', fontSize:'20px' }}>
                  {user?.photo ? <img src={user.photo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : (user?.name?.charAt(0) || 'M')}
                </div>
                <div>
                  <p style={{ fontSize:'14px', fontWeight:'800', color:'white' }}>{user?.name || 'Menejer'}</p>
                  <p style={{ fontSize:'12px', color:'var(--text-secondary)' }}>Taklif tayyorlagan menejer</p>
                </div>
              </div>

              {/* Muddat */}
              <div>
                <label style={lbl}>Tayyor Bo'lish Muddati</label>
                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{ position:'relative', width:'160px' }}>
                    <Clock size={15} style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'var(--text-secondary)' }}/>
                    <input type="number" value={deadline} onChange={e => setDeadline(e.target.value)} placeholder="18"
                      style={{ ...inp, width:'100%', paddingLeft:'40px' }}/>
                  </div>
                  <span style={{ color:'var(--text-secondary)', fontSize:'13px' }}>ish kuni</span>
                </div>
              </div>

              {/* Muddat hisobi variantlari */}
              <div>
                <label style={lbl}>Muddat Hisobi Boshlanadi</label>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  {DEADLINE_OPTIONS.map(opt => (
                    <label key={opt.id}
                      style={{ display:'flex', alignItems:'center', gap:'12px', padding:'13px 16px', background: deadlineBasis === opt.id ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.03)', border:`1px solid ${deadlineBasis === opt.id ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius:'10px', cursor:'pointer', transition:'0.2s', fontSize:'13px' }}>
                      <div style={{ width:'18px', height:'18px', borderRadius:'50%', border:`2px solid ${deadlineBasis === opt.id ? '#008B8B' : 'rgba(255,255,255,0.25)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {deadlineBasis === opt.id && <div style={{ width:'9px', height:'9px', borderRadius:'50%', background:'#008B8B' }}/>}
                      </div>
                      <input type="radio" name="deadlineBasis" value={opt.id} checked={deadlineBasis === opt.id}
                        onChange={() => setDeadlineBasis(opt.id)} style={{ display:'none' }}/>
                      {opt.id === 'custom' && deadlineBasis === 'custom'
                        ? <input value={customBasis} onChange={e => setCustomBasis(e.target.value)}
                            placeholder="O'z variantingizni kiriting..."
                            style={{ flex:1, background:'transparent', border:'none', color:'white', fontSize:'13px', outline:'none' }}
                            onClick={e => e.stopPropagation()}/>
                        : <span style={{ color: deadlineBasis === opt.id ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)' }}>{opt.label}</span>
                      }
                    </label>
                  ))}
                </div>
              </div>

              {/* Qo'shimcha xizmatlar */}
              <div>
                <label style={lbl}>Qo'shimcha Xizmatlar</label>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  {EXTRA_SERVICES.map(svc => (
                    <div key={svc.id} style={{ background: services[svc.id] ? 'rgba(16,185,129,0.07)' : 'rgba(255,255,255,0.03)', border:`1px solid ${services[svc.id] ? '#10b981' : 'rgba(255,255,255,0.08)'}`, borderRadius:'12px', padding:'13px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', transition:'0.2s', gap:'12px' }}>
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:'13px', fontWeight:'700', marginBottom:'2px' }}>{svc.label}</p>
                        <p style={{ fontSize:'11px', color:'var(--text-secondary)' }}>{svc.desc}</p>
                      </div>
                      {services[svc.id] && (
                        <input 
                          type="text" 
                          value={formatAmount(servicePrices[svc.id])} 
                          onChange={e => setServicePrices(p => ({ ...p, [svc.id]: formatAmount(e.target.value) }))}
                          placeholder="0" 
                          style={{ width:'110px', height:'34px', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(16,185,129,0.4)', borderRadius:'8px', color:'#10b981', padding:'0 10px', fontSize:'13px', textAlign:'right' }}/>
                      )}
                      <button type="button" onClick={() => setServices(s => ({ ...s, [svc.id]: !s[svc.id] }))}
                        style={{ width:'44px', height:'24px', borderRadius:'12px', background: services[svc.id] ? '#10b981' : 'rgba(255,255,255,0.1)', position:'relative', transition:'0.3s', flexShrink:0, border:'none', cursor:'pointer' }}>
                        <div style={{ position:'absolute', width:'18px', height:'18px', background:'white', borderRadius:'50%', top:'3px', left: services[svc.id] ? '23px' : '3px', transition:'0.3s' }}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hamkorlar */}
              <div>
                <label style={lbl}>Loyihadagi Hamkorlarimiz</label>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px' }}>
                  {partnersList.length === 0 ? (
                    <p style={{ gridColumn: 'span 4', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>Hamkorlar topilmadi. Super Admin orqali qo'shing.</p>
                  ) : (
                    partnersList.map(p => {
                      const active = selectedPartners.includes(p.id);
                      return (
                        <button key={p.id} type="button" onClick={() => togglePartner(p.id)}
                          style={{ background: active ? 'rgba(251,191,36,0.08)' : '#fff', border:`2px solid ${active ? '#008B8B' : '#e5e7eb'}`, borderRadius:'12px', padding:'10px 6px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'6px', transition:'0.2s', position:'relative', overflow:'hidden', minHeight: '80px' }}>
                          {active && (
                            <div style={{ position:'absolute', top:'4px', right:'4px', width:'18px', height:'18px', background:'#008B8B', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                              <CheckCircle2 size={12} color="#0f1117" strokeWidth={3}/>
                            </div>
                          )}
                          <div style={{ width:'100%', height:'44px', display:'flex', alignItems:'center', justifyContent:'center', background: '#fff', borderRadius: '8px', padding: '4px', marginBottom: '4px' }}>
                            {p.logo && p.logo.startsWith('<svg') ? (
                              <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: p.logo }} />
                            ) : (
                              <img src={p.logo || ''} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                            )}
                          </div>
                          <span style={{ fontSize:'9px', fontWeight:'800', color: active ? '#008B8B' : '#555', textTransform:'uppercase', letterSpacing:'0.5px', textAlign: 'center' }}>{p.name}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* в•ђв•ђ O'NG USTUN вЂ” Mahsulotlar в•ђв•ђ */}
            <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <label style={lbl}>Mahsulotlar Ro'yxati</label>

              <div className="no-scrollbar" style={{ maxHeight:'540px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'12px' }}>
                {items.map((item, idx) => (
                  <div key={item.id} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', padding:'18px', position:'relative' }}>
                    <div style={{ display:'flex', gap:'14px', marginBottom:'12px' }}>
                      <label style={{ width:'66px', height:'66px', borderRadius:'12px', background: item.image ? 'transparent' : 'rgba(255,255,255,0.05)', border:'2px dashed rgba(255,255,255,0.15)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
                        {item.image ? <img src={item.image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <Package size={22} color="rgba(255,255,255,0.3)"/>}
                        <input type="file" accept="image/*" onChange={e => handleItemImage(item.id, e.target.files[0])} style={{ display:'none' }}/>
                      </label>
                      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'8px' }}>
                        <input value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} placeholder={`Mahsulot nomi (${idx + 1})`}
                          style={{ width:'100%', height:'38px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'white', padding:'0 12px', fontSize:'14px', fontWeight:'700' }}/>
                        <input value={item.desc} onChange={e => updateItem(item.id, 'desc', e.target.value)} placeholder="Tavsif, o'lcham, material... (ixtiyoriy)"
                          style={{ width:'100%', height:'34px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px', color:'white', padding:'0 12px', fontSize:'12px' }}/>
                      </div>
                      {items.length > 1 && (
                        <button onClick={() => removeItem(item.id)} style={{ color:'#ef4444', background:'transparent', border:'none', padding:'4px', alignSelf:'flex-start', flexShrink:0, cursor:'pointer' }}><Trash2 size={16}/></button>
                      )}
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'80px 1fr 1fr 1fr', gap:'8px', alignItems:'center' }}>
                      <div>
                        <p style={{ fontSize:'10px', color:'var(--text-secondary)', marginBottom:'4px', textTransform:'uppercase' }}>Soni</p>
                        <input type="number" value={item.qty} onChange={e => updateItem(item.id, 'qty', e.target.value)} min="1"
                          style={{ width:'100%', height:'38px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'white', padding:'0 10px', fontSize:'14px', fontWeight:'700' }}/>
                      </div>
                      <div>
                        <p style={{ fontSize:'10px', color:'var(--text-secondary)', marginBottom:'4px', textTransform:'uppercase' }}>Birligi</p>
                        <select value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)}
                          style={{ width:'100%', height:'38px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'white', padding:'0 10px', fontSize:'13px', outline: 'none' }}>
                          <option value="dona" style={{ background: '#1a1a2e', color: 'white' }}>dona</option>
                          <option value="kv/m" style={{ background: '#1a1a2e', color: 'white' }}>kv/m</option>
                          <option value="m/p" style={{ background: '#1a1a2e', color: 'white' }}>m/p</option>
                          <option value="komplekt" style={{ background: '#1a1a2e', color: 'white' }}>komplekt</option>
                        </select>
                      </div>
                      <div>
                        <p style={{ fontSize:'10px', color:'var(--text-secondary)', marginBottom:'4px', textTransform:'uppercase' }}>Narxi (so'm)</p>
                        <input 
                          type="text" 
                          value={formatAmount(item.price)} 
                          onChange={e => updateItem(item.id, 'price', formatAmount(e.target.value))} 
                          placeholder="0"
                          style={{ width:'100%', height:'38px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'white', padding:'0 10px', fontSize:'14px' }}/>
                      </div>
                      <div>
                        <p style={{ fontSize:'10px', color:'var(--text-secondary)', marginBottom:'4px', textTransform:'uppercase' }}>Jami</p>
                        <div style={{ height:'38px', background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:'8px', padding:'0 10px', display:'flex', alignItems:'center', fontSize:'14px', fontWeight:'700', color:'var(--accent-gold)' }}>
                          {((parseFloat(item.qty) || 0) * (parseInt(String(item.price || '').replace(/[^0-9]/g, ''), 10) || 0)).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" onClick={addItem}
                style={{ height:'48px', background:'rgba(255,255,255,0.04)', border:'2px dashed rgba(255,255,255,0.15)', borderRadius:'14px', color:'var(--text-secondary)', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', fontWeight:'700', cursor:'pointer', transition:'0.2s', fontSize:'14px' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent-gold)'; e.currentTarget.style.color='var(--accent-gold)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'; e.currentTarget.style.color='var(--text-secondary)'; }}>
                <Plus size={18}/> Mahsulot qo'shish
              </button>

              {/* Jami */}
              <div style={{ background:'linear-gradient(135deg,rgba(251,191,36,0.12),rgba(251,191,36,0.04))', border:'1px solid rgba(251,191,36,0.25)', borderRadius:'16px', padding:'20px 24px' }}>
                {itemsTotal > 0 && (
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px', fontSize:'14px', color:'var(--text-secondary)' }}>
                    <span>Mahsulotlar:</span><span>{itemsTotal.toLocaleString()} so'm</span>
                  </div>
                )}
                {servicesTotal > 0 && (
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px', fontSize:'14px', color:'var(--text-secondary)' }}>
                    <span>Xizmatlar:</span><span>{servicesTotal.toLocaleString()} so'm</span>
                  </div>
                )}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop: servicesTotal > 0 ? '12px' : '0', borderTop: servicesTotal > 0 ? '1px solid rgba(251,191,36,0.2)' : 'none' }}>
                  <span style={{ fontSize:'16px', fontWeight:'700' }}>JAMI:</span>
                  <span style={{ fontSize:'26px', fontWeight:'900', color:'var(--accent-gold)' }}>{grandTotal.toLocaleString()} so'm</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* в”Ђв”Ђ Footer в”Ђв”Ђ */}
        <div style={{ padding:'22px 40px', borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', justifyContent:'flex-end', gap:'12px', flexShrink:0 }}>
          <button onClick={onClose} style={{ height:'50px', padding:'0 28px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', color:'var(--text-secondary)', fontWeight:'700', cursor:'pointer', fontSize:'14px' }}>
            Bekor Qilish
          </button>
          <button onClick={handleSave} style={{ height:'50px', padding:'0 28px', background:'rgba(251,191,36,0.12)', border:'1px solid var(--accent-gold)', borderRadius:'12px', color:'var(--accent-gold)', fontWeight:'700', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px', fontSize:'14px' }}>
            <FileText size={18}/> Saqlash
          </button>
          <button onClick={handlePrint} style={{ height:'50px', padding:'0 32px', background:'var(--accent-gold)', borderRadius:'12px', color:'#0f172a', fontWeight:'900', cursor:'pointer', fontSize:'15px', display:'flex', alignItems:'center', gap:'8px', border:'none' }}>
            <Printer size={18}/> Preview & Chop etish
          </button>
        </div>
      </div>
    </div>
  );
};

export default KPModal;
