import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, ShoppingCart, 
  AlertCircle, ArrowUpRight, ArrowDownRight, RefreshCw,
  Calendar, User, PieChart as PieIcon, Activity,
  Briefcase, Users, X
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area
} from 'recharts';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const SimpleKPICard = ({ title, value, color, status }) => (
  <div className="premium-card" style={{ 
    flex: 1, 
    minWidth: '140px', 
    borderLeft: `4px solid ${status === 'danger' ? '#ef4444' : status === 'success' ? '#10b981' : color}`,
    padding: '12px 16px'
  }}>
    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
    <h3 style={{ 
        fontSize: '30px', 
        fontWeight: '950', 
        color: status === 'danger' ? '#ef4444' : status === 'success' ? '#10b981' : '#fff',
        letterSpacing: '-1.2px'
    }}>
        {value}
    </h3>
  </div>
);

const ShowroomDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ 
    manager: 'all', 
    status: 'all', 
    period: '30',
    month: 'all',
    year: new Date().getFullYear().toString(),
    startDate: '',
    endDate: ''
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const months = [
    { id: '0', name: 'Yanvar' }, { id: '1', name: 'Fevral' }, { id: '2', name: 'Mart' },
    { id: '3', name: 'Aprel' }, { id: '4', name: 'May' }, { id: '5', name: 'Iyun' },
    { id: '6', name: 'Iyul' }, { id: '7', name: 'Avgust' }, { id: '8', name: 'Sentyabr' },
    { id: '9', name: 'Oktyabr' }, { id: '10', name: 'Noyabr' }, { id: '11', name: 'Dekabr' }
  ];

  const years = ['2024', '2025', '2026'];

  const refreshData = async () => {
    setLoading(true);
    try {
        const res = await api.get('/transactions/stats', { params: filters });
        setData(res.data);
        setLastUpdated(new Date());
    } catch (err) {
        console.error("Dashboard data error", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 60000); // 1 min refresh
    return () => clearInterval(interval);
  }, [filters]);

  const managersList = useMemo(() => {
     // This should also be an API call, but for now we can use orders or a separate user list
     return [];
  }, []);

  if (!data) return <div style={{ padding: '100px', textAlign: 'center', color: 'var(--accent-gold)' }}>Analitika yuklanmoqda...</div>;

  return (
    <div style={{ width: '100%', padding: '0 30px 60px 30px' }}>
      
      {/* HEADER & GLOBAL FILTERS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <div>
            <h1 style={{ fontSize: '42px', fontWeight: '950', letterSpacing: '-1.8px', marginBottom: '4px' }}>MOLIYAVIY BOSHQARUV</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={15} color="#10b981" /> Reall vaqt rejimi (30s yangilanish). Oxirgi: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>

          {/* SANA ORALIG'I FILTRI (YASHIL HUDUD) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.05)', padding: '6px 12px', borderRadius: '14px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div className="dash-filter" style={{ height: '36px', background: 'transparent', border: 'none' }}>
              <Calendar size={14} color="#10b981" />
              <input 
                type="date" 
                value={filters.startDate} 
                onChange={e => setFilters({...filters, startDate: e.target.value, year: 'all', month: 'all'})}
                onKeyDown={e => e.preventDefault()}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '13px', outline: 'none', cursor: 'pointer', colorScheme: 'dark' }}
              />
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>—</span>
            <div className="dash-filter" style={{ height: '36px', background: 'transparent', border: 'none' }}>
              <Calendar size={14} color="#10b981" />
              <input 
                type="date" 
                value={filters.endDate} 
                onChange={e => setFilters({...filters, endDate: e.target.value, year: 'all', month: 'all'})}
                onKeyDown={e => e.preventDefault()}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '13px', outline: 'none', cursor: 'pointer', colorScheme: 'dark' }}
              />
            </div>
            {(filters.startDate || filters.endDate) && (
              <button 
                onClick={() => setFilters({...filters, startDate: '', endDate: '', year: new Date().getFullYear().toString()})}
                style={{ background: 'rgba(239, 68, 68, 0.2)', border: 'none', color: '#ef4444', borderRadius: '8px', padding: '4px', cursor: 'pointer', display: 'flex' }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '16px', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          <div className="dash-filter">
             <User size={16} />
             <select value={filters.manager} onChange={e => setFilters({...filters, manager: e.target.value})}>
                <option value="all">Barcha Menejerlar</option>
                {managersList.map(m => <option key={m} value={m} style={{color: '#000'}}>{m}</option>)}
             </select>
          </div>
          
          {/* Yil va Oy Filtrlar */}
          <div className="dash-filter">
             <Calendar size={16} />
             <select value={filters.year} onChange={e => setFilters({...filters, year: e.target.value})}>
                <option value="all">Barcha Yillar</option>
                {years.map(y => <option key={y} value={y}>{y}-yil</option>)}
             </select>
          </div>

          <div className="dash-filter">
             <PieIcon size={16} />
             <select value={filters.month} onChange={e => setFilters({...filters, month: e.target.value})}>
                <option value="all">Barcha Oylar</option>
                {months.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
             </select>
          </div>

          {filters.year === 'all' && !filters.startDate && !filters.endDate && (
            <div className="dash-filter">
               <Activity size={16} />
               <select value={filters.period} onChange={e => setFilters({...filters, period: e.target.value})}>
                  <option value="7">Oxirgi 7 kun</option>
                  <option value="30">Oxirgi 30 kun</option>
                  <option value="90">Oxirgi 3 oy</option>
               </select>
            </div>
          )}

          <button onClick={refreshData} style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '0 16px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', height: '44px' }}>
             <RefreshCw size={16} className={loading ? 'spin-anim' : ''} /> Yangilash
          </button>
        </div>
      </div>

      {/* ROW 1: KPI BLOCKS */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <SimpleKPICard title="Jami Savdo" value={data.overview.totalSales.toLocaleString() + " UZS"} color="#3b82f6" />
        <SimpleKPICard title="Cash In (Kirim)" value={data.overview.cashIn.toLocaleString() + " UZS"} status="success" />
        <SimpleKPICard title="Cash Out (Chiqim)" value={data.overview.cashOut.toLocaleString() + " UZS"} status="danger" />
        <SimpleKPICard title="Net Cash (Qoldiq)" value={data.overview.netCashflow.toLocaleString() + " UZS"} color="#fbbf24" status={data.overview.netCashflow < 0 ? 'danger' : 'default'} />
        <SimpleKPICard title="Sof Foyda (Profit)" value={data.overview.grossProfit.toLocaleString() + " UZS"} status={data.overview.grossProfit > 0 ? 'success' : 'danger'} />
      </div>

      {/* ROW 2: CHART (70%) & DEBTORS (30%) */}
      <div style={{ display: 'grid', gridTemplateColumns: '7.5fr 2.5fr', gap: '20px', marginBottom: '20px' }}>
        <div className="premium-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '950' }}>Kirim vs Chiqim Dinamikasi (Cashflow)</h3>
              <div style={{ display: 'flex', gap: '20px', fontSize: '13px', fontWeight: '800' }}>
                 <span style={{ color: '#10b981' }}>● KIRIM</span>
                 <span style={{ color: '#ef4444' }}>● CHIQIM</span>
              </div>
          </div>
          <div style={{ flex: 1, minHeight: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data.cashflowChart}>
                  <defs>
                    <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                    <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={15} tickFormatter={(v) => v?.split ? v.split('-').slice(1).reverse().join('.') : v} />
                  <YAxis stroke="var(--text-secondary)" fontSize={15} tickFormatter={(v) => v >= 1000000 ? (v/1000000).toFixed(0) + 'M' : v.toLocaleString()} />
                  <Tooltip contentStyle={{ background: '#111', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '18px' }} />
                  <Area type="monotone" dataKey="cash_in" stroke="#10b981" strokeWidth={3} fill="url(#gIn)" />
                  <Area type="monotone" dataKey="cash_out" stroke="#ef4444" strokeWidth={3} fill="url(#gOut)" />
               </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
          {/* Debitor */}
          <div className="premium-card" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
             <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}><Users color="#fbbf24" size={20} /> Debitor</h3>
                <div style={{ fontSize: '26px', fontWeight: '950', color: '#ef4444', marginTop: '6px' }}>{data.debitor.total.toLocaleString()}</div>
             </div>
             <div style={{ overflowY: 'auto', flex: 1 }}>
                <table style={{ width: '100%', fontSize: '15px' }}>
                   <tbody>
                      {data.debitor.list.map((d, i) => (
                         <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '10px 0' }}>
                               <div style={{ fontWeight: '800' }}>{d.name}</div>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: '900', color: '#ef4444' }}>{d.debt.toLocaleString()}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
          {/* Kreditor */}
          <div className="premium-card" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
             <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}><Briefcase color="#8b5cf6" size={20} /> Kreditor</h3>
                <div style={{ fontSize: '26px', fontWeight: '950', color: '#f59e0b', marginTop: '6px' }}>{data.kreditor.total.toLocaleString()}</div>
             </div>
             <div style={{ overflowY: 'auto', flex: 1 }}>
                <table style={{ width: '100%', fontSize: '15px' }}>
                   <tbody>
                      {data.kreditor.list.map((k, i) => (
                         <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '10px 0' }}>
                               <div style={{ fontWeight: '800' }}>{k.supplier}</div>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: '900', color: '#f59e0b' }}>{k.debt.toLocaleString()}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
          </div>
        </div>

      {/* ROW 3: EXPENSES & PERFORMANCE (0.8fr 1.2fr) */}
      <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '20px', marginBottom: '20px' }}>
        <div className="premium-card" style={{ flex: 1.2, display: 'flex', flexDirection: 'column' }}>
           <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '16px' }}>Xarajatlar Diagrammasi</h3>
           <div style={{ display: 'flex', gap: '16px', alignItems: 'center', height: '280px' }}>
             {/* Custom Vertical Legend (Left) */}
             <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto' }}>
                {[...data.expenseBreakdown].sort((a,b) => b.value - a.value).map((entry, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '10px', borderLeft: `6px solid ${COLORS[index % COLORS.length]}` }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                       <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>{entry.name}</span>
                       <span style={{ fontSize: '18px', fontWeight: '900' }}>{entry.value.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
             </div>

             <div style={{ flex: 1, height: '100%', marginLeft: '-20px' }}>
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={[...data.expenseBreakdown].sort((a,b) => b.value - a.value)} 
                      innerRadius={70} 
                      outerRadius={110} 
                      paddingAngle={5} 
                      dataKey="value"
                      cx="40%"
                    >
                      {[...data.expenseBreakdown].sort((a,b) => b.value - a.value).map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#111', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '14px' }} formatter={(v) => v.toLocaleString() + ' UZS'} />
                  </PieChart>
               </ResponsiveContainer>
             </div>
           </div>
        </div>

        <div className="premium-card" style={{ flex: 0.8 }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '900' }}>Manager Performance</h3>
              <div style={{ display: 'flex', gap: '15px', fontSize: '13px' }}>
                 <span style={{ color: '#3b82f6' }}>● SAVDO</span>
                 <span style={{ color: '#10b981' }}>● FOYDA</span>
              </div>
           </div>
           
           <div style={{ height: '280px' }}>
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.salesPerformance} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={15} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={15} tickFormatter={(v) => v >= 1000000 ? (v/1000000).toFixed(0) + 'M' : v.toLocaleString()} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#111', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '18px' }}
                    formatter={(value) => value.toLocaleString() + ' UZS'}
                    cursor={false}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="sales" name="Savdo" fill="#3b82f6" radius={[5, 5, 0, 0]} barSize={40} />
                  <Bar dataKey="profit" name="Foyda" fill="#10b981" radius={[5, 5, 0, 0]} barSize={40} />
                </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* ROW 4: ORDER STATISTICS PIE CHART */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', marginBottom: '20px' }}>
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
           <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '24px' }}>Buyurtmalar Statistikasi</h3>
           <div style={{ display: 'flex', gap: '30px', alignItems: 'center', height: '280px' }}>
             {/* Info Column */}
             <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.orderStats.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '14px 20px', borderRadius: '14px', borderLeft: `6px solid ${item.color}` }}>
                    <div>
                       <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>{item.name}</span>
                       <div style={{ fontSize: '22px', fontWeight: '900' }}>{item.value} <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>ta</span></div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                       <div style={{ fontSize: '20px', fontWeight: '950', color: item.color }}>{item.percentage}%</div>
                       <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' }}>ULUSH</div>
                    </div>
                  </div>
                ))}
             </div>

             {/* Chart Column */}
             <div style={{ flex: 1, height: '100%' }}>
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={data.orderStats} 
                      innerRadius={75} 
                      outerRadius={105} 
                      paddingAngle={5} 
                      dataKey="value"
                      stroke="none"
                    >
                      {data.orderStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: '#111', borderRadius: '12px', border: '1px solid var(--border-color)', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
               </ResponsiveContainer>
             </div>
           </div>
        </div>

        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: 'linear-gradient(135deg, rgba(251,191,36,0.05) 0%, rgba(0,0,0,0) 100%)' }}>
           <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(251,191,36,0.1)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <ShoppingCart size={40} />
           </div>
           <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Jami Buyurtmalar</p>
           <h2 style={{ fontSize: '64px', fontWeight: '950', color: '#fff', letterSpacing: '-2px' }}>{data.overview.totalOrders} <span style={{ fontSize: '24px', color: 'var(--accent-gold)' }}>ta</span></h2>
           <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '200px', marginTop: '10px' }}>Tanlangan davrdagi barcha faol va o'chirilgan buyurtmalar.</p>
        </div>
      </div>

      {/* ROW 5: ORDER PROFIT (BOTTOM) */}
      <div className="premium-card">
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '950' }}>BUYURTMALAR RENTABELLIGI (Order Profit)</h3>
            <div style={{ display: 'flex', gap: '15px', fontSize: '12px', fontWeight: '700' }}>
               <span style={{ color: '#22c55e' }}>● YAXSHI (&gt;25%)</span>
               <span style={{ color: '#eab308' }}>● PAST (15-25%)</span>
               <span style={{ color: '#ef4444' }}>● ZARAR (&lt;15%)</span>
            </div>
         </div>
         <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
               <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)', fontSize: '16px', textAlign: 'left' }}>
                     <th style={{ padding: '16px' }}>Order</th>
                     <th style={{ padding: '16px' }}>Mijoz / Menejer</th>
                     <th style={{ padding: '16px', textAlign: 'right' }}>Savdo (Sales)</th>
                     <th style={{ padding: '16px', textAlign: 'right' }}>Tannarx (Cost)</th>
                     <th style={{ padding: '16px', textAlign: 'right' }}>Foyda (Profit)</th>
                     <th style={{ padding: '16px', textAlign: 'center' }}>Margin (%)</th>
                  </tr>
               </thead>
               <tbody>
                  {data.orderProfits.map((o) => {
                     const marginColor = o.profit < 0 ? '#ef4444' : o.margin > 25 ? '#22c55e' : o.margin > 15 ? '#eab308' : '#ef4444';
                     return (
                        <tr key={o.id} style={{ borderBottom: '1px solid var(--border-color)', transition: '0.2s' }} className="hover-row">
                           <td style={{ padding: '16px' }}>
                              <div style={{ fontWeight: '900', color: 'var(--accent-gold)', fontSize: '18px' }}>{o.order_number}</div>
                              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{new Date(o.date).toLocaleDateString()}</div>
                           </td>
                           <td style={{ padding: '16px' }}>
                              <div style={{ fontWeight: '800', fontSize: '18px' }}>{o.customer}</div>
                              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{o.manager}</div>
                           </td>
                           <td style={{ padding: '16px', textAlign: 'right', fontWeight: '900', fontSize: '18px' }}>{o.total_amount.toLocaleString()}</td>
                           <td style={{ padding: '16px', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '16px' }}>{o.total_cost.toLocaleString()}</td>
                           <td style={{ padding: '16px', textAlign: 'right', fontWeight: '950', fontSize: '18px', color: o.profit < 0 ? '#ef4444' : '#fff' }}>
                              {o.profit.toLocaleString()}
                           </td>
                           <td style={{ padding: '16px', textAlign: 'center' }}>
                              <div style={{ 
                                 background: marginColor, 
                                 color: '#000', 
                                 padding: '8px 16px', 
                                 borderRadius: '8px', 
                                 fontSize: '16px', 
                                 fontWeight: '950',
                                 display: 'inline-block',
                                 minWidth: '90px'
                              }}>
                                 {o.margin.toFixed(1)}%
                              </div>
                           </td>
                        </tr>
                     )
                  })}
               </tbody>
            </table>
         </div>
      </div>

      <style>{`
        .dash-filter {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 0 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          height: 44px;
        }
        .dash-filter select {
          background: transparent;
          border: none;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          outline: none;
          cursor: pointer;
        }
        .dash-filter select option {
          color: #000;
        }
        .hover-row:hover {
          background: rgba(255,255,255,0.03);
        }
        .spin-anim {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 1200px) {
          div[style*="gridTemplateColumns: 7fr 3fr"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="gridTemplateColumns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          .premium-card { padding: 16px; }
          h1 { fontSize: 24px !important; }
        }
      `}</style>
    </div>
  );
};

export default ShowroomDashboard;
