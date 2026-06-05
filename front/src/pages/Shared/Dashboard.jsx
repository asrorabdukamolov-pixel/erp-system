import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter, 
  Calendar, 
  RotateCw, 
  Download, 
  Award, 
  Store, 
  User, 
  PieChart as PieIcon,
  LineChart as LineIcon,
  Wallet
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

const Dashboard = () => {
  const { user } = useAuth();
  const [showrooms, setShowrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters
  const [period, setPeriod] = useState('30');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showroom, setShowroom] = useState('all');
  const [manager, setManager] = useState('all');

  const [stats, setStats] = useState(null);

  // Quick Date presets
  const handlePresetChange = (days) => {
    setPeriod(days);
    if (days === 'all') {
      setStartDate('');
      setEndDate('');
    } else {
      const start = new Date();
      start.setDate(start.getDate() - Number(days));
      const end = new Date();
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    }
  };

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

  const fetchStats = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const params = {
        period,
        showroom,
        manager
      };
      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) params.endDate = new Date(endDate).toISOString();

      const res = await api.get('/transactions/stats', { params });
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFilters();
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [period, showroom, manager, startDate, endDate]);

  const handleExportExcel = () => {
    if (!stats) return;

    const profitData = (stats.orderProfits || []).map(o => ({
      "Buyurtma №": o.order_number,
      "Mijoz": o.customer,
      "Mas'ul Menejer": o.manager,
      "Sana": o.date ? new Date(o.date).toLocaleDateString() : '—',
      "Shartnoma Summasi (UZS)": o.total_amount,
      "Xarajat (UZS)": o.total_cost,
      "Foyda (UZS)": o.profit,
      "Rentabellik (%)": o.margin ? o.margin.toFixed(1) + '%' : '0%'
    }));

    const expenseData = (stats.expenseBreakdown || []).map(e => ({
      "Xarajat Kategoriyasi": e.name,
      "Summa (UZS)": e.value
    }));

    const performanceData = (stats.salesPerformance || []).map(m => ({
      "Menejer": m.name,
      "Sotuvlar (UZS)": m.sales,
      "Yalpi Foyda (UZS)": m.profit
    }));

    const debitorData = (stats.debitor?.list || []).map(d => ({
      "Mijoz nomi": d.name,
      "Qarzdorlik (UZS)": d.debt
    }));

    const kreditorData = (stats.kreditor?.list || []).map(k => ({
      "Yetkazib beruvchi": k.supplier,
      "Qarzdorlik (UZS)": k.debt
    }));

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(profitData);
    XLSX.utils.book_append_sheet(wb, ws1, "Foyda Tahlili");

    if (expenseData.length > 0) {
      const ws2 = XLSX.utils.json_to_sheet(expenseData);
      XLSX.utils.book_append_sheet(wb, ws2, "Xarajatlar");
    }

    if (performanceData.length > 0) {
      const ws3 = XLSX.utils.json_to_sheet(performanceData);
      XLSX.utils.book_append_sheet(wb, ws3, "Menejerlar Faoliyati");
    }

    if (debitorData.length > 0) {
      const ws4 = XLSX.utils.json_to_sheet(debitorData);
      XLSX.utils.book_append_sheet(wb, ws4, "Debitorlik Qarzlari");
    }

    if (kreditorData.length > 0) {
      const ws5 = XLSX.utils.json_to_sheet(kreditorData);
      XLSX.utils.book_append_sheet(wb, ws5, "Kreditorlik Qarzlari");
    }

    const filePeriod = startDate && endDate ? `${startDate}_to_${endDate}` : `period_${period}_days`;
    XLSX.writeFile(wb, `Analitika_Hisoboti_${filePeriod}.xlsx`);
  };

  const uniqueManagers = stats?.salesPerformance?.map(m => m.name) || [];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '20px' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: 'var(--text-secondary)' }}>Dashboard yuklanmoqda...</p>
      </div>
    );
  }

  const overview = stats?.overview || { totalSales: 0, cashIn: 0, cashOut: 0, netCashflow: 0, grossProfit: 0, totalOrders: 0 };

  return (
    <div style={{ padding: '30px' }}>
      {/* Title block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'white', marginBottom: '8px' }}>Tizim Dashboardi</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Moliyaviy ko'rsatkichlar, pul oqimi va savdo faoliyati bo'yicha tahliliy boshqaruv paneli</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => fetchStats(true)} 
            disabled={refreshing}
            className="gold-btn" 
            style={{ 
              padding: '12px 24px', 
              borderRadius: '14px', 
              background: 'rgba(255,255,255,0.05)', 
              color: 'white', 
              border: '1px solid var(--border-color)',
              gap: '8px'
            }}
          >
            <RotateCw size={18} className={refreshing ? 'spin-animation' : ''} />
            Yangilash
          </button>
          <button 
            onClick={handleExportExcel}
            className="gold-btn" 
            style={{ padding: '12px 24px', borderRadius: '14px', gap: '8px' }}
          >
            <Download size={18} />
            Excelga Eksport
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="premium-card" style={{ padding: '20px', marginBottom: '32px', background: 'rgba(255, 255, 255, 0.02)' }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {/* Quick presets */}
          <div style={{ flex: 1.5, minWidth: '280px' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '12px', fontWeight: '700' }}>Tezkor davrlar</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { label: 'Bugun', value: '1' },
                { label: '7 kun', value: '7' },
                { label: '30 kun', value: '30' },
                { label: '90 kun', value: '90' },
                { label: 'Butun davr', value: 'all' }
              ].map(preset => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetChange(preset.value)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: period === preset.value ? 'rgba(251, 191, 36, 0.15)' : 'transparent',
                    color: period === preset.value ? 'var(--accent-gold)' : 'white',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date range picker */}
          <div style={{ flex: 2, minWidth: '320px', display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '12px', fontWeight: '700' }}>
                <Calendar size={12} style={{ marginRight: '6px' }} />
                Kutilgan sana (dan)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPeriod('');
                }}
                style={{ width: '100%', height: '44px', borderRadius: '10px' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '12px', fontWeight: '700' }}>
                <Calendar size={12} style={{ marginRight: '6px' }} />
                Gacha
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPeriod('');
                }}
                style={{ width: '100%', height: '44px', borderRadius: '10px' }}
              />
            </div>
          </div>

          {/* Showroom filter (Super Admin only) */}
          {user?.role === 'super' && (
            <div style={{ flex: 1, minWidth: '180px' }}>
              <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '12px', fontWeight: '700' }}>
                <Store size={12} style={{ marginRight: '6px' }} />
                Showroom
              </label>
              <select
                value={showroom}
                onChange={(e) => setShowroom(e.target.value)}
                style={{ width: '100%', height: '44px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }}
              >
                <option value="all">Barchasi</option>
                <option value="Global">Global (Super)</option>
                {showrooms.map(s => <option key={s._id} value={s.name} style={{ color: '#000' }}>{s.name}</option>)}
              </select>
            </div>
          )}

          {/* Manager filter */}
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '12px', fontWeight: '700' }}>
              <User size={12} style={{ marginRight: '6px' }} />
              Menejer
            </label>
            <select
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              style={{ width: '100%', height: '44px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }}
            >
              <option value="all">Barcha Menejerlar</option>
              {uniqueManagers.map(m => <option key={m} value={m} style={{ color: '#000' }}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Stats overview cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        
        {/* Total Sales */}
        <div className="premium-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '700' }}>Jami Sotuvlar</span>
            <div style={{ background: 'rgba(251, 191, 36, 0.15)', color: 'var(--accent-gold)', padding: '8px', borderRadius: '10px' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'white' }}>
            {overview.totalSales.toLocaleString()} <span style={{ fontSize: '12px', color: 'var(--accent-gold)' }}>so'm</span>
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '6px' }}>Shartnomalarning umumiy qiymati</p>
        </div>

        {/* Cash In */}
        <div className="premium-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '700' }}>Kassa Kirim</span>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '8px', borderRadius: '10px' }}>
              <ArrowUpRight size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'white' }}>
            {overview.cashIn.toLocaleString()} <span style={{ fontSize: '12px', color: '#10b981' }}>so'm</span>
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '6px' }}>Haqiqiy kirib kelgan mablag'</p>
        </div>

        {/* Cash Out */}
        <div className="premium-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '700' }}>Kassa Chiqim</span>
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '8px', borderRadius: '10px' }}>
              <ArrowDownRight size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'white' }}>
            {overview.cashOut.toLocaleString()} <span style={{ fontSize: '12px', color: '#ef4444' }}>so'm</span>
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '6px' }}>Kassadan chiqib ketgan xarajatlar</p>
        </div>

        {/* Net Cashflow */}
        <div className="premium-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '700' }}>Net Kassa oqimi</span>
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '8px', borderRadius: '10px' }}>
              <Wallet size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'white' }}>
            {overview.netCashflow.toLocaleString()} <span style={{ fontSize: '12px', color: '#3b82f6' }}>so'm</span>
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '6px' }}>Kirim va Chiqim farqi (Net)</p>
        </div>

        {/* Gross Profit */}
        <div className="premium-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '700' }}>Yalpi Foyda</span>
            <div style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', padding: '8px', borderRadius: '10px' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'white' }}>
            {overview.grossProfit.toLocaleString()} <span style={{ fontSize: '12px', color: '#8b5cf6' }}>so'm</span>
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '6px' }}>Sotuvdan xarajatlar chiqarilgan foyda</p>
        </div>

      </div>

      {/* Main Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '40px' }}>
        
        {/* Dynamic Cashflow Chart */}
        <div className="premium-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Kirim va Chiqim Dinamikasi</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LineIcon size={14} /> Kunlik tranzaksiya oqimi
            </span>
          </div>
          <div style={{ height: '320px', width: '100%' }}>
            {stats?.cashflowChart?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.cashflowChart}>
                  <defs>
                    <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="var(--text-secondary)" style={{ fontSize: '11px' }} />
                  <YAxis stroke="var(--text-secondary)" style={{ fontSize: '11px' }} tickFormatter={(v) => (v / 1000000) + 'M'} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'white' }} 
                    formatter={(value) => [value.toLocaleString() + ' UZS']}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Area type="monotone" name="Kirim" dataKey="cash_in" stroke="#10b981" fillOpacity={1} fill="url(#colorIn)" strokeWidth={2} />
                  <Area type="monotone" name="Chiqim" dataKey="cash_out" stroke="#ef4444" fillOpacity={1} fill="url(#colorOut)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                Ushbu davrda tranzaksiyalar mavjud emas.
              </div>
            )}
          </div>
        </div>

        {/* Expenses Pie Chart */}
        <div className="premium-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Xarajatlar Strukturasi</h3>
            <PieIcon size={16} style={{ color: 'var(--text-secondary)' }} />
          </div>
          <div style={{ height: '320px', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {stats?.expenseBreakdown?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.expenseBreakdown}
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stats.expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'white' }} 
                    formatter={(value) => [value.toLocaleString() + ' UZS']}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                Ushbu davrda xarajatlar kiritilmagan.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Managers & Debitors/Kreditors Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '40px' }}>
        
        {/* Manager Sales chart */}
        <div className="premium-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Menejerlar Sotuv Ko'rsatkichlari</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              <Award size={14} style={{ marginRight: '6px' }} /> Savdo liderlari
            </span>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            {stats?.salesPerformance?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.salesPerformance} margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" style={{ fontSize: '11px' }} />
                  <YAxis stroke="var(--text-secondary)" style={{ fontSize: '11px' }} tickFormatter={(v) => (v / 1000000) + 'M'} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'white' }} 
                    formatter={(value) => [value.toLocaleString() + ' UZS']}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar name="Sotuv (Shartnomalar)" dataKey="sales" fill="var(--accent-gold)" radius={[4, 4, 0, 0]} />
                  <Bar name="Keltirgan Yalpi Foyda" dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                Menejerlar bo'yicha sotuvlar topilmadi.
              </div>
            )}
          </div>
        </div>

        {/* Debitor / Kreditor Lists */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Debitor (Customers) */}
          <div className="premium-card" style={{ flex: 1, maxHeight: '240px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fbbf24' }}></span>
                Mijozlar Qarzdorligi (Debitor)
              </h3>
              <span style={{ color: '#fbbf24', fontWeight: '950', fontSize: '14px' }}>
                {stats?.debitor?.total?.toLocaleString() || 0} UZS
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(stats?.debitor?.list || []).length > 0 ? (
                (stats.debitor.list).map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                    <span style={{ fontWeight: '700', color: 'white' }}>{item.debt.toLocaleString()} UZS</span>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: '13px' }}>Debitorlik qarzi yo'q.</div>
              )}
            </div>
          </div>

          {/* Kreditor (Suppliers) */}
          <div className="premium-card" style={{ flex: 1, maxHeight: '240px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e' }}></span>
                Yetkazib Beruvchilardan Qarzlar (Kreditor)
              </h3>
              <span style={{ color: '#f43f5e', fontWeight: '950', fontSize: '14px' }}>
                {stats?.kreditor?.total?.toLocaleString() || 0} UZS
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(stats?.kreditor?.list || []).length > 0 ? (
                (stats.kreditor.list).map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.supplier}</span>
                    <span style={{ fontWeight: '700', color: 'white' }}>{item.debt.toLocaleString()} UZS</span>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: '13px' }}>Yetkazib beruvchilardan qarzlar yo'q.</div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Detailed Order Profitability Table */}
      <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'white' }}>Buyurtmalar Rentabelligi (P&L Tahlili)</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>Ushbu davrdagi buyurtmalarning shartnoma qiymati, haqiqiy xarajatlari va sof foydasi</p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Buyurtma №</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Mijoz</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Mas'ul</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Sana</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>Shartnoma (UZS)</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>Xarajat (UZS)</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>Foyda (UZS)</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>Rentabellik</th>
              </tr>
            </thead>
            <tbody>
              {(!stats?.orderProfits || stats.orderProfits.length === 0) ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Ushbu davrda buyurtmalar topilmadi.</td>
                </tr>
              ) : (
                stats.orderProfits.map((o) => {
                  let marginColor = '#ef4444'; // low (<15%)
                  if (o.margin >= 35) marginColor = '#10b981'; // high (>=35%)
                  else if (o.margin >= 15) marginColor = '#fbbf24'; // medium (15%-35%)

                  return (
                    <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '18px 24px', fontWeight: '800', color: 'var(--accent-gold)' }}>{o.order_number}</td>
                      <td style={{ padding: '18px 24px', fontSize: '14px', fontWeight: '600' }}>{o.customer}</td>
                      <td style={{ padding: '18px 24px', fontSize: '13px', color: 'var(--text-secondary)' }}>{o.manager}</td>
                      <td style={{ padding: '18px 24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {o.date ? new Date(o.date).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ padding: '18px 24px', textAlign: 'right', fontWeight: '700' }}>
                        {o.total_amount?.toLocaleString()}
                      </td>
                      <td style={{ padding: '18px 24px', textAlign: 'right', color: '#f43f5e', fontWeight: '600' }}>
                        {o.total_cost?.toLocaleString()}
                      </td>
                      <td style={{ padding: '18px 24px', textAlign: 'right', color: o.profit >= 0 ? '#10b981' : '#ef4444', fontWeight: '700' }}>
                        {o.profit?.toLocaleString()}
                      </td>
                      <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                        <span style={{ 
                          color: marginColor, 
                          background: `${marginColor}15`, 
                          padding: '4px 10px', 
                          borderRadius: '10px',
                          fontSize: '12px',
                          fontWeight: '800'
                        }}>
                          {o.margin ? o.margin.toFixed(1) : '0'}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
