import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  TrendingUp, 
  Activity, 
  UserCheck, 
  UserMinus, 
  ShoppingBag, 
  X, 
  Download, 
  Calendar, 
  Filter, 
  Store, 
  User, 
  DollarSign, 
  RotateCw,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ClipboardList
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar
} from 'recharts';
import * as XLSX from 'xlsx';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const COLORS = ['#fbbf24', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#06b6d4', '#14b8a6', '#f97316'];

const Reports = () => {
  const { user } = useAuth();
  const [showrooms, setShowrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  
  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'balance' | 'pnl' | 'cashflow' | 'debitor' | 'kreditor' | 'sales' | null

  // Date filters
  const [period, setPeriod] = useState('30');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showroom, setShowroom] = useState('all');
  const [manager, setManager] = useState('all');

  const loadFilters = async () => {
    try {
      if (user?.role === 'super') {
        const showRes = await api.get('/showrooms');
        setShowrooms(showRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load showrooms:', err);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = { period, showroom, manager };
      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) params.endDate = new Date(endDate).toISOString();

      const res = await api.get('/transactions/stats', { params });
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilters();
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [period, showroom, manager, startDate, endDate]);

  const uniqueManagers = stats?.salesPerformance?.map(m => m.name) || [];

  // Export functions for each specific report
  const exportBalance = () => {
    if (!stats) return;
    const balanceData = [
      { Kategoriya: "AKTIVLAR", "Ko'rsatkich": "Kassadagi pul (Net)", Qiymat: stats.overview.netCashflow },
      { Kategoriya: "AKTIVLAR", "Ko'rsatkich": "Mijozlar qarzi (Debitor)", Qiymat: stats.debitor.total },
      { Kategoriya: "AKTIVLAR", "Ko'rsatkich": "JAMI AKTIVLAR", Qiymat: stats.overview.netCashflow + stats.debitor.total },
      { Kategoriya: "PASSIVLAR", "Ko'rsatkich": "Yetkazib beruvchilardan qarz (Kreditor)", Qiymat: stats.kreditor.total },
      { Kategoriya: "PASSIVLAR", "Ko'rsatkich": "JAMI PASSIVLAR", Qiymat: stats.kreditor.total },
      { Kategoriya: "KAPITAL", "Ko'rsatkich": "Sof Aktivlar (Kapital)", Qiymat: (stats.overview.netCashflow + stats.debitor.total) - stats.kreditor.total }
    ];
    const ws = XLSX.utils.json_to_sheet(balanceData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Balans Hisoboti");
    XLSX.writeFile(wb, `Balans_Hisoboti_${new Date().toLocaleDateString()}.xlsx`);
  };

  const exportPNL = () => {
    if (!stats) return;
    const pnlData = (stats.orderProfits || []).map(o => ({
      "Buyurtma №": o.order_number,
      "Mijoz": o.customer,
      "Menejer": o.manager,
      "Sana": o.date ? new Date(o.date).toLocaleDateString() : '—',
      "Savdo summasi (UZS)": o.total_amount,
      "Xarajat (UZS)": o.total_cost,
      "Sof Foyda (UZS)": o.profit,
      "Rentabellik (%)": o.margin ? o.margin.toFixed(1) + '%' : '0%'
    }));
    const ws = XLSX.utils.json_to_sheet(pnlData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "P&L Foyda va Zarar");
    XLSX.writeFile(wb, `PL_Hisoboti_${new Date().toLocaleDateString()}.xlsx`);
  };

  const exportCashFlow = () => {
    if (!stats) return;
    const cfData = (stats.cashflowChart || []).map(c => ({
      "Sana": c.date,
      "Kirim (UZS)": c.cash_in,
      "Chiqim (UZS)": c.cash_out,
      "Net Oqim (UZS)": c.cash_in - c.cash_out
    }));
    const ws = XLSX.utils.json_to_sheet(cfData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cash Flow Dinamikasi");
    XLSX.writeFile(wb, `CashFlow_Hisoboti_${new Date().toLocaleDateString()}.xlsx`);
  };

  const exportDebitors = () => {
    if (!stats) return;
    const debData = (stats.debitor?.list || []).map(d => ({
      "Mijoz nomi": d.name,
      "Qarzdorlik (UZS)": d.debt
    }));
    const ws = XLSX.utils.json_to_sheet(debData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Debitorlar");
    XLSX.writeFile(wb, `Debitorlar_Qarzi_${new Date().toLocaleDateString()}.xlsx`);
  };

  const exportKreditors = () => {
    if (!stats) return;
    const kredData = (stats.kreditor?.list || []).map(k => ({
      "Yetkazib beruvchi / Firma": k.supplier,
      "Qarzdorlik (UZS)": k.debt
    }));
    const ws = XLSX.utils.json_to_sheet(kredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Kreditorlar");
    XLSX.writeFile(wb, `Kreditorlar_Qarzi_${new Date().toLocaleDateString()}.xlsx`);
  };

  const exportSales = () => {
    if (!stats) return;
    const salesData = (stats.salesPerformance || []).map(s => ({
      "Menejer": s.name,
      "Shartnomalar summasi (UZS)": s.sales,
      "Keltirgan foyda (UZS)": s.profit
    }));
    const ws = XLSX.utils.json_to_sheet(salesData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Menejerlar Savdosi");
    XLSX.writeFile(wb, `Savdo_Hisoboti_${new Date().toLocaleDateString()}.xlsx`);
  };

  // Render a Report Card
  const renderCard = (title, desc, icon, type, color) => (
    <div 
      className="premium-card" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        padding: '24px',
        minHeight: '220px',
        transition: 'transform 0.2s, box-shadow 0.2s',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        cursor: 'pointer'
      }}
      onClick={() => setActiveModal(type)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = `0 10px 20px ${color}10`;
        e.currentTarget.style.borderColor = `${color}40`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'white' }}>{title}</h3>
          <div style={{ background: `${color}15`, color: color, padding: '10px', borderRadius: '12px' }}>
            {icon}
          </div>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>{desc}</p>
      </div>
      <button 
        className="gold-btn" 
        style={{ 
          marginTop: '20px', 
          width: '100%', 
          padding: '10px', 
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.05)',
          color: 'white',
          border: '1px solid var(--border-color)',
          fontSize: '13px',
          fontWeight: '700'
        }}
        onClick={(e) => {
          e.stopPropagation();
          setActiveModal(type);
        }}
      >
        Hisobotni ochish
      </button>
    </div>
  );

  return (
    <div style={{ padding: '30px' }}>
      {/* Title */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'white', marginBottom: '8px' }}>Hisobotlar Markazi</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Kompaniyaning moliyaviy, P&L, pul oqimi va qarzdorlik tahlillari uchun maxsus yo'naltirilgan hisobotlar</p>
      </div>

      {/* Grid of Report Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {renderCard("Kompaniya Balansi", "Aktivlar, passivlar va kapitalning sana bo'yicha joriy holati hamda sof balans ko'rsatkichi.", <Scale size={20} />, 'balance', '#3b82f6')}
        {renderCard("Foyda yoki zarar (P&L)", "Shartnomalar rentabelligi, sotuvlar, xarajatlar va oylik yalpi/sof foyda ko'rsatkichlari tahlili.", <TrendingUp size={20} />, 'pnl', '#10b981')}
        {renderCard("Cash Flow (Pul Oqimi)", "Kirim va chiqim pullari oqimi, kunlik tranzaksiyalar dinamikasi va kassa qoldiqlari o'zgarishi.", <Activity size={20} />, 'cashflow', '#8b5cf6')}
        {renderCard("Debitor Qarzdorliklar", "Mijozlar tomonidan to'lanishi kutilayotgan qarzdorliklar ro'yxati va umumiy qarzdorlik summasi.", <UserCheck size={20} />, 'debitor', '#fbbf24')}
        {renderCard("Kreditor Qarzdorliklar", "Yetkazib beruvchilar va hamkorlar oldidagi qarzdorliklar, to'lanishi kerak bo'lgan summalar ro'yxati.", <UserMinus size={20} />, 'kreditor', '#f43f5e')}
        {renderCard("Savdo Hisobotlari", "Menejerlar faoliyati, shartnomalar soni, o'rtacha chek va savdo hajmlari statistikasi.", <ShoppingBag size={20} />, 'sales', '#06b6d4')}
      </div>

      {/* REPORT MODALS */}
      {activeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '20px' }}>
          <div style={{ background: 'var(--secondary-bg)', width: '100%', maxWidth: '1100px', maxHeight: '90vh', borderRadius: '24px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'white', textTransform: 'capitalize' }}>
                  {activeModal === 'balance' && "Kompaniya Balansi (Sana bo'yicha)"}
                  {activeModal === 'pnl' && "Foyda va Zarar Hisoboti (P&L)"}
                  {activeModal === 'cashflow' && "Pul Oqimlari Dinamikasi (Cash Flow)"}
                  {activeModal === 'debitor' && "Mijozlar Qarzdorligi (Debitorlar)"}
                  {activeModal === 'kreditor' && "Yetkazib Beruvchilardan Qarzlar (Kreditorlar)"}
                  {activeModal === 'sales' && "Savdo va Menejerlar Faoliyati"}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
                  {activeModal === 'balance' && "Kompaniyaning joriy aktivlari va majburiyatlari nisbati"}
                  {activeModal === 'pnl' && "Buyurtmalar daromadlari, xarajatlar va rentabellik tahlili"}
                  {activeModal === 'cashflow' && "Haqiqiy kirib kelgan va chiqib ketgan pul mablag'lari oqimi"}
                  {activeModal === 'debitor' && "Mijozlar bo'yicha to'lanmagan qarzdorliklar tahlili"}
                  {activeModal === 'kreditor' && "Firma va yetkazib beruvchilar oldidagi qarzlarimiz"}
                  {activeModal === 'sales' && "Sotuv menejerlari samaradorligi va buyurtmalar ko'rsatkichlari"}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => {
                    if (activeModal === 'balance') exportBalance();
                    if (activeModal === 'pnl') exportPNL();
                    if (activeModal === 'cashflow') exportCashFlow();
                    if (activeModal === 'debitor') exportDebitors();
                    if (activeModal === 'kreditor') exportKreditors();
                    if (activeModal === 'sales') exportSales();
                  }}
                  className="gold-btn" 
                  style={{ padding: '10px 20px', borderRadius: '10px', gap: '8px', fontSize: '13px' }}
                >
                  <Download size={16} /> Excelga
                </button>
                <button 
                  onClick={() => setActiveModal(null)} 
                  style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Filters Area */}
            <div style={{ background: 'rgba(0,0,0,0.15)', padding: '16px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '11px', fontWeight: '700' }}>Davr</label>
                <select value={period} onChange={(e) => setPeriod(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }}>
                  <option value="1">Bugun</option>
                  <option value="7">7 kun</option>
                  <option value="30">30 kun</option>
                  <option value="90">90 kun</option>
                  <option value="all">Butun davr</option>
                </select>
              </div>
              <div style={{ flex: 1.2, minWidth: '220px', display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '11px', fontWeight: '700' }}>Sana (dan)</label>
                  <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPeriod(''); }} style={{ width: '100%', height: '38px', borderRadius: '8px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '11px', fontWeight: '700' }}>Sana (gacha)</label>
                  <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPeriod(''); }} style={{ width: '100%', height: '38px', borderRadius: '8px' }} />
                </div>
              </div>
              {user?.role === 'super' && (
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '11px', fontWeight: '700' }}>Showroom</label>
                  <select value={showroom} onChange={(e) => setShowroom(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }}>
                    <option value="all">Barchasi</option>
                    <option value="Global">Global (Super)</option>
                    {showrooms.map(s => <option key={s._id} value={s.name} style={{ color: '#000' }}>{s.name}</option>)}
                  </select>
                </div>
              )}
              <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '11px', fontWeight: '700' }}>Menejer</label>
                <select value={manager} onChange={(e) => setManager(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }}>
                  <option value="all">Barchasi</option>
                  {uniqueManagers.map(m => <option key={m} value={m} style={{ color: '#000' }}>{m}</option>)}
                </select>
              </div>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                  <div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
              ) : !stats ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Hisobot ma'lumotlari topilmadi.</div>
              ) : (
                <>
                  {/* BALANCE REPORT MODAL CONTENT */}
                  {activeModal === 'balance' && (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                        {/* Assets list */}
                        <div className="premium-card" style={{ padding: '24px' }}>
                          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#10b981', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px', marginBottom: '16px' }}>AKTIVLAR</h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Kassadagi pul (Net kassa oqimi)</span>
                              <span style={{ fontWeight: '800' }}>{stats.overview.netCashflow.toLocaleString()} UZS</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Mijozlar qarzdorligi (Debitor)</span>
                              <span style={{ fontWeight: '800' }}>{stats.debitor.total.toLocaleString()} UZS</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', borderTop: '2px solid rgba(255,255,255,0.05)', paddingTop: '12px', fontWeight: '900', color: 'white' }}>
                              <span>JAMI AKTIVLAR</span>
                              <span>{(stats.overview.netCashflow + stats.debitor.total).toLocaleString()} UZS</span>
                            </div>
                          </div>
                        </div>

                        {/* Liabilities list */}
                        <div className="premium-card" style={{ padding: '24px' }}>
                          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#f43f5e', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px', marginBottom: '16px' }}>PASSIVLAR VA KAPITAL</h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Yetkazib beruvchilardan qarzlar (Kreditor)</span>
                              <span style={{ fontWeight: '800' }}>{stats.kreditor.total.toLocaleString()} UZS</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Sof aktivlar (Kapital)</span>
                              <span style={{ fontWeight: '800', color: 'var(--accent-gold)' }}>
                                {((stats.overview.netCashflow + stats.debitor.total) - stats.kreditor.total).toLocaleString()} UZS
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', borderTop: '2px solid rgba(255,255,255,0.05)', paddingTop: '12px', fontWeight: '900', color: 'white' }}>
                              <span>JAMI PASSIVLAR VA KAPITAL</span>
                              <span>{(stats.kreditor.total + ((stats.overview.netCashflow + stats.debitor.total) - stats.kreditor.total)).toLocaleString()} UZS</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Visual gauge */}
                      <div className="premium-card" style={{ padding: '24px', textAlign: 'center' }}>
                        <h4 style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px' }}>Balans holati</h4>
                        <div style={{ display: 'flex', width: '100%', height: '16px', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', marginBottom: '16px' }}>
                          <div style={{ width: `${(stats.overview.netCashflow + stats.debitor.total) > 0 ? (stats.overview.netCashflow + stats.debitor.total) / ((stats.overview.netCashflow + stats.debitor.total) + stats.kreditor.total) * 100 : 50}%`, background: '#10b981' }}></div>
                          <div style={{ width: `${stats.kreditor.total > 0 ? stats.kreditor.total / ((stats.overview.netCashflow + stats.debitor.total) + stats.kreditor.total) * 100 : 50}%`, background: '#f43f5e' }}></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          <span>Aktivlar: {((stats.overview.netCashflow + stats.debitor.total) > 0 ? (stats.overview.netCashflow + stats.debitor.total) / ((stats.overview.netCashflow + stats.debitor.total) + stats.kreditor.total) * 100 : 50).toFixed(0)}%</span>
                          <span>Passivlar: {(stats.kreditor.total > 0 ? stats.kreditor.total / ((stats.overview.netCashflow + stats.debitor.total) + stats.kreditor.total) * 100 : 50).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PNL REPORT MODAL CONTENT */}
                  {activeModal === 'pnl' && (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        <div className="premium-card" style={{ padding: '20px' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '700' }}>Jami Savdo</span>
                          <h4 style={{ fontSize: '20px', fontWeight: '900', color: 'white', marginTop: '6px' }}>{stats.overview.totalSales.toLocaleString()} UZS</h4>
                        </div>
                        <div className="premium-card" style={{ padding: '20px' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '700' }}>Ishlab chiqarish / Shartnoma xarajatlari</span>
                          <h4 style={{ fontSize: '20px', fontWeight: '900', color: '#f43f5e', marginTop: '6px' }}>{(stats.overview.totalSales - stats.overview.grossProfit).toLocaleString()} UZS</h4>
                        </div>
                        <div className="premium-card" style={{ padding: '20px' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '700' }}>Sof Foyda (Yalpi)</span>
                          <h4 style={{ fontSize: '20px', fontWeight: '900', color: '#10b981', marginTop: '6px' }}>{stats.overview.grossProfit.toLocaleString()} UZS</h4>
                        </div>
                      </div>

                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                            <th style={{ padding: '12px 16px' }}>Buyurtma №</th>
                            <th style={{ padding: '12px 16px' }}>Mijoz</th>
                            <th style={{ padding: '12px 16px' }}>Menejer</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Shartnoma Summasi</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Xarajat</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Foyda</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Rentabellik</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(stats.orderProfits || []).map((o, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                              <td style={{ padding: '14px 16px', fontWeight: '800', color: 'var(--accent-gold)' }}>{o.order_number}</td>
                              <td style={{ padding: '14px 16px' }}>{o.customer}</td>
                              <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{o.manager}</td>
                              <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '700' }}>{o.total_amount.toLocaleString()} UZS</td>
                              <td style={{ padding: '14px 16px', textAlign: 'right', color: '#f43f5e' }}>{o.total_cost.toLocaleString()} UZS</td>
                              <td style={{ padding: '14px 16px', textAlign: 'right', color: '#10b981', fontWeight: '700' }}>{o.profit.toLocaleString()} UZS</td>
                              <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                <span style={{ background: o.margin >= 25 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: o.margin >= 25 ? '#10b981' : '#ef4444', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '800' }}>
                                  {o.margin.toFixed(1)}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* CASH FLOW REPORT MODAL CONTENT */}
                  {activeModal === 'cashflow' && (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        <div className="premium-card" style={{ padding: '20px' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Jami Kirim (Kassa Kirim)</span>
                          <h4 style={{ fontSize: '20px', fontWeight: '900', color: '#10b981', marginTop: '6px' }}>{stats.overview.cashIn.toLocaleString()} UZS</h4>
                        </div>
                        <div className="premium-card" style={{ padding: '20px' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Jami Chiqim (Kassa Chiqim)</span>
                          <h4 style={{ fontSize: '20px', fontWeight: '900', color: '#f43f5e', marginTop: '6px' }}>{stats.overview.cashOut.toLocaleString()} UZS</h4>
                        </div>
                        <div className="premium-card" style={{ padding: '20px' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Sof Pul Oqimi (Qoldiq)</span>
                          <h4 style={{ fontSize: '20px', fontWeight: '900', color: '#3b82f6', marginTop: '6px' }}>{stats.overview.netCashflow.toLocaleString()} UZS</h4>
                        </div>
                      </div>

                      <div style={{ height: '300px', width: '100%', marginBottom: '30px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={stats.cashflowChart}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="date" stroke="var(--text-secondary)" />
                            <YAxis stroke="var(--text-secondary)" tickFormatter={(v) => (v / 1000000) + 'M'} />
                            <Tooltip contentStyle={{ background: 'var(--secondary-bg)', color: 'white' }} />
                            <Area type="monotone" name="Kirim" dataKey="cash_in" stroke="#10b981" fill="rgba(16,185,129,0.1)" strokeWidth={2} />
                            <Area type="monotone" name="Chiqim" dataKey="cash_out" stroke="#f43f5e" fill="rgba(244,63,94,0.1)" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>Xarajatlar Turlari</h3>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px', textAlign: 'left' }}>
                            <th style={{ padding: '12px 16px' }}>Xarajat Kategoriyasi</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Summa (UZS)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(stats.expenseBreakdown || []).map((e, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                              <td style={{ padding: '12px 16px', fontWeight: '700' }}>{e.name}</td>
                              <td style={{ padding: '12px 16px', textAlign: 'right', color: '#f43f5e', fontWeight: '800' }}>{e.value.toLocaleString()} UZS</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* DEBITOR REPORT MODAL CONTENT */}
                  {activeModal === 'debitor' && (
                    <div>
                      <div className="premium-card" style={{ padding: '24px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '700' }}>Jami mijozlar qarzdorligi</span>
                          <h3 style={{ fontSize: '28px', fontWeight: '950', color: '#fbbf24', marginTop: '6px' }}>{stats.debitor.total.toLocaleString()} UZS</h3>
                        </div>
                        <span style={{ fontSize: '13px', background: 'rgba(251,191,36,0.1)', color: '#fbbf24', padding: '6px 12px', borderRadius: '8px', fontWeight: '800' }}>
                          Mijozlar qarzdorligi
                        </span>
                      </div>

                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                            <th style={{ padding: '12px 16px' }}>Mijoz Nomi</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Qarzdorlik (UZS)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.debitor.list.length === 0 ? (
                            <tr>
                              <td colSpan="2" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>Debitorlik qarzi yo'q.</td>
                            </tr>
                          ) : (
                            stats.debitor.list.map((item, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '14px 16px', fontWeight: '700' }}>{item.name}</td>
                                <td style={{ padding: '14px 16px', textAlign: 'right', color: '#fbbf24', fontWeight: '900' }}>{item.debt.toLocaleString()} UZS</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* KREDITOR REPORT MODAL CONTENT */}
                  {activeModal === 'kreditor' && (
                    <div>
                      <div className="premium-card" style={{ padding: '24px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '700' }}>Jami yetkazib beruvchilar oldidagi qarzlar</span>
                          <h3 style={{ fontSize: '28px', fontWeight: '950', color: '#f43f5e', marginTop: '6px' }}>{stats.kreditor.total.toLocaleString()} UZS</h3>
                        </div>
                        <span style={{ fontSize: '13px', background: 'rgba(244,63,94,0.1)', color: '#f43f5e', padding: '6px 12px', borderRadius: '8px', fontWeight: '800' }}>
                          Kreditorlik qarzlari
                        </span>
                      </div>

                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                            <th style={{ padding: '12px 16px' }}>Yetkazib beruvchi / Firma</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Qarzdorlik (UZS)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.kreditor.list.length === 0 ? (
                            <tr>
                              <td colSpan="2" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>Kreditorlik qarzi yo'q.</td>
                            </tr>
                          ) : (
                            stats.kreditor.list.map((item, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '14px 16px', fontWeight: '700' }}>{item.supplier}</td>
                                <td style={{ padding: '14px 16px', textAlign: 'right', color: '#f43f5e', fontWeight: '900' }}>{item.debt.toLocaleString()} UZS</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* SALES REPORT MODAL CONTENT */}
                  {activeModal === 'sales' && (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        <div className="premium-card" style={{ padding: '20px' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Jami Sotuvlar</span>
                          <h4 style={{ fontSize: '20px', fontWeight: '900', color: 'white', marginTop: '6px' }}>{stats.overview.totalSales.toLocaleString()} UZS</h4>
                        </div>
                        <div className="premium-card" style={{ padding: '20px' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Buyurtmalar soni</span>
                          <h4 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--accent-gold)', marginTop: '6px' }}>{stats.overview.totalOrders} ta</h4>
                        </div>
                        <div className="premium-card" style={{ padding: '20px' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>O'rtacha Buyurtma Qiymati</span>
                          <h4 style={{ fontSize: '20px', fontWeight: '900', color: '#3b82f6', marginTop: '6px' }}>
                            {stats.overview.totalOrders > 0 ? Math.round(stats.overview.totalSales / stats.overview.totalOrders).toLocaleString() : 0} UZS
                          </h4>
                        </div>
                      </div>

                      <div style={{ height: '300px', width: '100%', marginBottom: '30px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.salesPerformance}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" stroke="var(--text-secondary)" />
                            <YAxis stroke="var(--text-secondary)" tickFormatter={(v) => (v / 1000000) + 'M'} />
                            <Tooltip contentStyle={{ background: 'var(--secondary-bg)', color: 'white' }} />
                            <Bar name="Savdo" dataKey="sales" fill="var(--accent-gold)" radius={[4, 4, 0, 0]} />
                            <Bar name="Keltirgan Foyda" dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                            <th style={{ padding: '12px 16px' }}>Menejer</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Jami Savdosi</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Sof Foydasi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.salesPerformance.map((s, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                              <td style={{ padding: '14px 16px', fontWeight: '700' }}>{s.name}</td>
                              <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '700' }}>{s.sales.toLocaleString()} UZS</td>
                              <td style={{ padding: '14px 16px', textAlign: 'right', color: '#10b981', fontWeight: '750' }}>{s.profit.toLocaleString()} UZS</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Modal Footer */}
            <div style={{ padding: '20px 32px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.1)' }}>
              <button 
                onClick={() => setActiveModal(null)} 
                style={{ 
                  padding: '10px 24px', 
                  borderRadius: '10px', 
                  border: '1px solid var(--border-color)', 
                  background: 'transparent', 
                  color: 'white',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Yopish
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
