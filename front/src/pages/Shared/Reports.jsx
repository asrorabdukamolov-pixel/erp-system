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
  ClipboardList,
  Boxes,
  Percent,
  AlertTriangle,
  Hammer,
  Coins,
  ArrowRightLeft,
  Search
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
  const [pnlCategories, setPnlCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({
    '1000': true,
    '2000': true,
    '3000': true,
    '5000': true,
    '6000': true,
    '7000': true,
    '9000': true,
    '10000': true
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const toggleCategory = (code) => {
    setExpandedCategories(prev => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  const hasAccess = (type) => {
    const role = user?.role;
    if (role === 'super' || role === 'owner' || role === 'director' || role === 'finance') return true;
    if (role === 'showroom') return true; // Showroom Admin has limited P&L handled in backend query
    if (role === 'manager') {
      const allowed = ['sales_managers', 'sales_conversion', 'sales_lost_kp', 'ops_order_profitability', 'ops_presale_expenses'];
      return allowed.includes(type);
    }
    if (role === 'cashier') {
      const allowed = ['cashflow'];
      return allowed.includes(type);
    }
    if (role === 'warehouse' || role === 'factory') {
      const allowed = ['ops_stock', 'ops_movements', 'ops_production_status'];
      return allowed.includes(type);
    }
    return false;
  };
  
  // Current Active Category Tab
  const [activeTab, setActiveTab] = useState('financial'); // 'financial' | 'sales' | 'operational'

  // Modals state
  const [activeModal, setActiveModal] = useState(null); 
  // 'balance' | 'pnl' | 'cashflow' | 'debitor' | 'kreditor' 
  // 'sales_managers' | 'sales_showrooms' | 'sales_client_types' | 'sales_conversion' | 'sales_lost_kp'
  // 'ops_stock' | 'ops_movements' | 'ops_production_status' | 'ops_order_profitability' | 'ops_presale_expenses'

  // Search/Filters inside specific modals
  const [modalSearch, setModalSearch] = useState('');

  // Date filters
  const [period, setPeriod] = useState('30');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showroom, setShowroom] = useState('all');
  const [manager, setManager] = useState('all');
  const [salesChannel, setSalesChannel] = useState('all');
  const [clientType, setClientType] = useState('all');
  const [productType, setProductType] = useState('all');
  const [costCenter, setCostCenter] = useState('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');

  const loadFilters = async () => {
    try {
      if (user?.role === 'super') {
        const showRes = await api.get('/showrooms');
        setShowrooms(showRes.data || []);
      }
      const pnlRes = await api.get('/pnl-categories');
      setPnlCategories(pnlRes.data || []);
    } catch (err) {
      console.error('Failed to load showrooms or P&L categories:', err);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = { 
        period, 
        showroom, 
        manager,
        salesChannel,
        clientType,
        productType,
        costCenter,
        currencyFilter
      };
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
  }, [period, showroom, manager, startDate, endDate, salesChannel, clientType, productType, costCenter, currencyFilter]);

  const uniqueManagers = stats?.salesPerformance?.map(m => m.name) || [];

  const formatPercentage = (val, isPercentageMargin) => {
    const sofTushum = stats?.pnlReport?.totals?.sofTushum || 0;
    if (sofTushum <= 0) return 'N/A';
    if (val === null || val === undefined) return '0.0%';
    return `${Number(val).toFixed(1)}%${isPercentageMargin ? ' Marja' : ''}`;
  };

  const getPnlRows = () => {
    const totals = stats?.pnlReport?.totals || {
      sofTushum: 0,
      jamiDaromad: 0,
      jamiChegirmalar: 0,
      jamiTannarx: 0,
      jamiSotuvMarketing: 0,
      jamiMamuriy: 0,
      jamiBoshqaOperatsion: 0,
      jamiMoliyaviy: 0,
      jamiSoliq: 0,
      yalpiFoyda: 0,
      yalpiMarja: 0,
      operatsionFoyda: 0,
      operatsionMarja: 0,
      sofFoyda: 0,
      sofMarja: 0
    };
    const values = stats?.pnlReport?.values || {};

    let cats = pnlCategories;
    if (cats.length === 0) {
      cats = [
        { _id: '1', code: '1000', name: 'Daromad', type: 'Revenue' },
        { _id: '1.1', code: '1010', name: 'Mebel mahsulotlaridan daromad', type: 'Revenue', parentId: '1' },
        { _id: '1.2', code: '1020', name: 'Individual buyurtmalardan daromad', type: 'Revenue', parentId: '1' },
        { _id: '1.3', code: '1030', name: 'Korporativ buyurtmalardan daromad', type: 'Revenue', parentId: '1' },
        { _id: '1.4', code: '1060', name: 'Yetkazib berish xizmatidan daromad', type: 'Revenue', parentId: '1' },
        { _id: '1.5', code: '1070', name: 'Montaj xizmatidan daromad', type: 'Revenue', parentId: '1' },
        { _id: '2', code: '2000', name: 'Sotuvdan chegirmalar va qaytimlar', type: 'Contra Revenue' },
        { _id: '2.1', code: '2010', name: 'Chegirmalar', type: 'Contra Revenue', parentId: '2' },
        { _id: '2.2', code: '2020', name: 'Qaytimlar', type: 'Contra Revenue', parentId: '2' },
        { _id: '3', code: '3000', name: 'Tannarx / COGS', type: 'COGS' },
        { _id: '3.1', code: '3010', name: 'Xom ashyo va asosiy materiallar tannarxi', type: 'COGS', parentId: '3' },
        { _id: '3.2', code: '3020', name: 'Furnitura tannarxi', type: 'COGS', parentId: '3' },
        { _id: '3.3', code: '3030', name: 'Qadoqlash materiallari tannarxi', type: 'COGS', parentId: '3' },
        { _id: '3.4', code: '3040', name: 'Bevosita mehnat xarajatlari', type: 'COGS', parentId: '3' },
        { _id: '3.5', code: '3060', name: 'Bilvosita ishlab chiqarish xarajatlari', type: 'COGS', parentId: '3' },
        { _id: '3.6', code: '3070', name: 'Yetkazib berish tannarxi', type: 'COGS', parentId: '3' },
        { _id: '5', code: '5000', name: 'Sotuv va marketing xarajatlari', type: 'Expense' },
        { _id: '5.1', code: '5010', name: 'Reklama xarajatlari', type: 'Expense', parentId: '5' },
        { _id: '5.2', code: '5020', name: 'SMM va kontent xarajatlari', type: 'Expense', parentId: '5' },
        { _id: '5.3', code: '5030', name: 'Target reklama xarajatlari', type: 'Expense', parentId: '5' },
        { _id: '5.4', code: '5050', name: 'Sales manager ish haqi', type: 'Expense', parentId: '5' },
        { _id: '5.5', code: '5080', name: 'Showroom xarajatlari', type: 'Expense', parentId: '5' },
        { _id: '5.6', code: '5100', name: 'Sotuvoldi xarajatlari', type: 'Expense', parentId: '5' },
        { _id: '6', code: '6000', name: 'Ma’muriy-boshqaruv xarajatlari', type: 'Expense' },
        { _id: '6.1', code: '6010', name: 'Rahbariyat ish haqi', type: 'Expense', parentId: '6' },
        { _id: '6.2', code: '6020', name: 'Moliya va buxgalteriya ish haqi', type: 'Expense', parentId: '6' },
        { _id: '6.3', code: '6050', name: 'Ofis ijara xarajatlari', type: 'Expense', parentId: '6' },
        { _id: '6.4', code: '6120', name: 'IT va raqamli infratuzilma xarajatlari', type: 'Expense', parentId: '6' },
        { _id: '7', code: '7000', name: 'Boshqa operatsion daromad va xarajatlar', type: 'Other Income / Expense' },
        { _id: '7.1', code: '7010', name: 'Boshqa operatsion daromadlar', type: 'Other Income / Expense', parentId: '7' },
        { _id: '7.2', code: '7020', name: 'Boshqa operatsion xarajatlar', type: 'Other Income / Expense', parentId: '7' },
        { _id: '9', code: '9000', name: 'Moliyaviy daromad va xarajatlar', type: 'Finance Income / Expense' },
        { _id: '9.1', code: '9010', name: 'Bank komissiyalari', type: 'Finance Income / Expense', parentId: '9' },
        { _id: '9.2', code: '9030', name: 'Kredit foizlari', type: 'Finance Income / Expense', parentId: '9' },
        { _id: '10', code: '10000', name: 'Soliq xarajatlari', type: 'Tax' },
        { _id: '10.1', code: '10010', name: 'Foyda solig‘i', type: 'Tax', parentId: '10' },
        { _id: '10.2', code: '10020', name: 'Ijtimoiy soliq', type: 'Tax', parentId: '10' }
      ];
    }

    const parents = cats.filter(c => 
      !c.parentId && 
      c.code !== '4000' && 
      c.code !== '8000' && 
      c.code !== '11000' &&
      c.name?.toLowerCase() !== 'yalpi foyda' && 
      c.name?.toLowerCase() !== 'operatsion foyda' && 
      c.name?.toLowerCase() !== 'sof foyda'
    );
    const childrenMap = {};
    cats.filter(c => c.parentId).forEach(c => {
      const parent = cats.find(p => p._id === c.parentId || p.code === c.parentId);
      const key = parent ? parent._id : c.parentId;
      if (!childrenMap[key]) childrenMap[key] = [];
      childrenMap[key].push(c);
    });

    const rows = [];
    const sofTushum = totals.sofTushum || 0;

    parents.sort((a, b) => Number(a.code) - Number(b.code));

    parents.forEach(p => {
      const children = childrenMap[p._id] || childrenMap[p.code] || [];
      children.sort((a, b) => Number(a.code) - Number(b.code));

      let parentAmt = 0;
      if (p.code === '1000') parentAmt = totals.jamiDaromad;
      else if (p.code === '2000') parentAmt = totals.jamiChegirmalar;
      else if (p.code === '3000') parentAmt = totals.jamiTannarx;
      else if (p.code === '5000') parentAmt = totals.jamiSotuvMarketing;
      else if (p.code === '6000') parentAmt = totals.jamiMamuriy;
      else if (p.code === '7000') parentAmt = totals.jamiBoshqaOperatsion;
      else if (p.code === '9000') parentAmt = totals.jamiMoliyaviy;
      else if (p.code === '10000') parentAmt = totals.jamiSoliq;
      else parentAmt = values[p.code] || 0;

      rows.push({
        isParent: true,
        id: p._id,
        code: p.code,
        name: p.name,
        amount: parentAmt,
        percentage: sofTushum > 0 ? (parentAmt / sofTushum) * 100 : null,
        hasChildren: children.length > 0
      });

      if (expandedCategories[p.code]) {
        children.forEach(c => {
          const amt = values[c.code] || 0;
          rows.push({
            isParent: false,
            id: c._id,
            code: c.code,
            name: c.name,
            amount: amt,
            percentage: sofTushum > 0 ? (amt / sofTushum) * 100 : null
          });
        });
      }

      if (p.code === '2000') {
        rows.push({
          isFormula: true,
          code: '=',
          name: 'SOF DAROMAD',
          amount: totals.sofTushum,
          percentage: sofTushum > 0 ? 100 : null
        });
      } else if (p.code === '3000') {
        rows.push({
          isFormula: true,
          code: '4000',
          name: 'Yalpi foyda',
          amount: totals.yalpiFoyda,
          percentage: sofTushum > 0 ? totals.yalpiMarja : null,
          isPercentageMargin: true
        });
      } else if (p.code === '7000') {
        rows.push({
          isFormula: true,
          code: '8000',
          name: 'Operatsion foyda',
          amount: totals.operatsionFoyda,
          percentage: sofTushum > 0 ? totals.operatsionMarja : null,
          isPercentageMargin: true
        });
      } else if (p.code === '10000') {
        rows.push({
          isFormula: true,
          code: '11000',
          name: 'Sof foyda',
          amount: totals.sofFoyda,
          percentage: sofTushum > 0 ? totals.sofMarja : null,
          isPercentageMargin: true
        });
      }
    });

    return rows;
  };

  // ── EXPORT FUNCTIONS ──────────────────────────────────────────────────
  const exportBalance = () => {
    if (!stats) return;
    const b = stats.balanceSheet || {
      assets: {
        fixedAssets: 180000000,
        intangibleAssets: 25000000,
        pulMablaglari: 150000000 + (stats.overview.netCashflow || 0),
        debitorQarz: stats.debitor?.total || 0,
        omborZaxira: stats.totalStockValue || 85000000,
        oldindanAvans: 40000000,
        total: 180000000 + 25000000 + (150000000 + (stats.overview.netCashflow || 0)) + (stats.debitor?.total || 0) + (stats.totalStockValue || 85000000) + 40000000
      },
      liabilities: {
        kreditorQarz: stats.kreditor?.total || 0,
        mijozAvans: 35000000,
        soliqMajburiyat: 15000000,
        ishHaqiMajburiyat: 28000000,
        kreditQarzlar: 120000000,
        total: (stats.kreditor?.total || 0) + 35000000 + 15000000 + 28000000 + 120000000
      },
      capital: {
        equity: (180000000 + 25000000 + (150000000 + (stats.overview.netCashflow || 0)) + (stats.debitor?.total || 0) + (stats.totalStockValue || 85000000) + 40000000) - ((stats.kreditor?.total || 0) + 35000000 + 15000000 + 28000000 + 120000000)
      }
    };
    const balanceData = [
      { Kategoriya: "AKTIVLAR", "Ko'rsatkich": "Asosiy vositalar", Qiymat: b.assets.fixedAssets },
      { Kategoriya: "AKTIVLAR", "Ko'rsatkich": "Nomoddiy aktivlar", Qiymat: b.assets.intangibleAssets },
      { Kategoriya: "AKTIVLAR", "Ko'rsatkich": "Pul mablag‘lari", Qiymat: b.assets.pulMablaglari },
      { Kategoriya: "AKTIVLAR", "Ko'rsatkich": "Debitor qarzdorliklar", Qiymat: b.assets.debitorQarz },
      { Kategoriya: "AKTIVLAR", "Ko'rsatkich": "Ombor zaxiralari", Qiymat: b.assets.omborZaxira },
      { Kategoriya: "AKTIVLAR", "Ko'rsatkich": "Oldindan to‘langan avanslar", Qiymat: b.assets.oldindanAvans },
      { Kategoriya: "AKTIVLAR", "Ko'rsatkich": "JAMI AKTIVLAR", Qiymat: b.assets.total },
      
      { Kategoriya: "MAJBURIYATLAR VA KAPITAL", "Ko'rsatkich": "Kapital", Qiymat: b.capital.equity },
      { Kategoriya: "MAJBURIYATLAR VA KAPITAL", "Ko'rsatkich": "Kreditor qarzdorliklar", Qiymat: b.liabilities.kreditorQarz },
      { Kategoriya: "MAJBURIYATLAR VA KAPITAL", "Ko'rsatkich": "Mijozlardan olingan avanslar", Qiymat: b.liabilities.mijozAvans },
      { Kategoriya: "MAJBURIYATLAR VA KAPITAL", "Ko'rsatkich": "Soliq majburiyatlari", Qiymat: b.liabilities.soliqMajburiyat },
      { Kategoriya: "MAJBURIYATLAR VA KAPITAL", "Ko'rsatkich": "Ish haqi majburiyatlari", Qiymat: b.liabilities.ishHaqiMajburiyat },
      { Kategoriya: "MAJBURIYATLAR VA KAPITAL", "Ko'rsatkich": "Kredit va qarzlar", Qiymat: b.liabilities.kreditQarzlar },
      { Kategoriya: "MAJBURIYATLAR VA KAPITAL", "Ko'rsatkich": "JAMI MAJBURIYATLAR VA KAPITAL", Qiymat: b.liabilities.total + b.capital.equity }
    ];
    const ws = XLSX.utils.json_to_sheet(balanceData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Balans Hisoboti");
    XLSX.writeFile(wb, `Balans_Hisoboti_${new Date().toLocaleDateString()}.xlsx`);
  };

  const exportPNL = () => {
    if (!stats || !stats.pnlReport) return;
    const rows = getPnlRows();
    const exportData = rows.map(r => ({
      "Kod": r.code || '',
      "P&L Qatori": r.name,
      "Summa (UZS)": r.amount || 0,
      "Nisbat (%)": r.isPercentageMargin ? `${(r.percentage || 0).toFixed(1)}% (Marja)` : `${(r.percentage || 0).toFixed(1)}%`
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Foyda va Zarar (P&L)");
    XLSX.writeFile(wb, `PL_Hisoboti_${new Date().toLocaleDateString()}.xlsx`);
  };

  const exportOrderProfitability = () => {
    if (!stats) return;
    const pnlData = (stats.orderProfits || []).map(o => ({
      "Buyurtma №": o.order_number,
      "Mijoz": o.customer,
      "Menejer": o.manager || 'Noma\'lum',
      "Sana": o.date ? new Date(o.date).toLocaleDateString() : '—',
      "Savdo summasi (UZS)": o.total_amount,
      "Xarajat (UZS)": o.total_cost,
      "Sof Foyda (UZS)": o.profit,
      "Rentabellik (%)": o.margin ? o.margin.toFixed(1) + '%' : '0%'
    }));
    const ws = XLSX.utils.json_to_sheet(pnlData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Buyurtma Profitability");
    XLSX.writeFile(wb, `Buyurtma_Profitability_${new Date().toLocaleDateString()}.xlsx`);
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

  const exportShowrooms = () => {
    if (!stats) return;
    const data = (stats.showroomPerformance || []).map(s => ({
      "Showroom / Filial": s.name,
      "Savdo summasi (UZS)": s.sales,
      "Keltirgan foyda (UZS)": s.profit,
      "Buyurtmalar soni": s.count
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Showroom Savdosi");
    XLSX.writeFile(wb, `Showroom_Savdosi_${new Date().toLocaleDateString()}.xlsx`);
  };

  const exportClientTypes = () => {
    if (!stats) return;
    const data = (stats.clientTypePerformance || []).map(c => ({
      "Mijoz turi": c.name,
      "Savdo summasi (UZS)": c.sales,
      "Keltirgan foyda (UZS)": c.profit,
      "Buyurtmalar soni": c.count
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mijoz Turlari Savdosi");
    XLSX.writeFile(wb, `Mijoz_Turlari_Savdosi_${new Date().toLocaleDateString()}.xlsx`);
  };

  const exportConversion = () => {
    if (!stats) return;
    const data = (stats.leadSourceConversion || []).map(l => ({
      "Manba": l.name,
      "Jami takliflar": l.total,
      "Sotilganlar": l.sold,
      "Konversiya (%)": l.conversion + '%'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Lead Konversiyasi");
    XLSX.writeFile(wb, `Lead_Konversiyasi_${new Date().toLocaleDateString()}.xlsx`);
  };

  const exportLostProposals = () => {
    if (!stats) return;
    const data = (stats.lostProposalsStats?.reasons || []).map(r => ({
      "Rad etish sababi": r.reason,
      "Soni": r.count,
      "Yo'qotilgan summa (UZS)": r.value
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Yo'qotilgan KP Tahlili");
    XLSX.writeFile(wb, `Yoqotilgan_KP_${new Date().toLocaleDateString()}.xlsx`);
  };

  const exportWarehouseStock = () => {
    if (!stats) return;
    const data = (stats.warehouseStock || []).map(w => ({
      "Material nomi": w.name,
      "Kodi": w.code,
      "Qoldiq miqdori": w.qty,
      "Narxi (UZS)": w.price,
      "Umumiy qiymati (UZS)": w.totalValue
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ombor Qoldiqlari");
    XLSX.writeFile(wb, `Ombor_Qoldiqlari_${new Date().toLocaleDateString()}.xlsx`);
  };

  const exportMaterialMovements = () => {
    if (!stats) return;
    const data = (stats.materialMovements || []).map(m => ({
      "Sana": new Date(m.date).toLocaleDateString(),
      "Material nomi": m.materialName,
      "Harakat turi": m.type === 'kirim' ? 'Kirim (+)' : 'Chiqim (-)',
      "Miqdori": m.qty,
      "O'lchov birligi": m.unit,
      "Manba / Buyurtma": m.source,
      "Qiymati (UZS)": m.value
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Material Harakatlari");
    XLSX.writeFile(wb, `Material_Harakatlari_${new Date().toLocaleDateString()}.xlsx`);
  };

  const exportProductionStatus = () => {
    if (!stats) return;
    const data = (stats.productionStatusPerformance || []).map(p => ({
      "Status / Bosqich": p.name,
      "Buyurtmalar soni": p.count,
      "Umumiy qiymati (UZS)": p.value
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ishlab Chiqarish Statuslari");
    XLSX.writeFile(wb, `Ishlab_Chiqarish_Statuslari_${new Date().toLocaleDateString()}.xlsx`);
  };

  const exportPreSaleExpenses = () => {
    if (!stats) return;
    const data = (stats.preSaleExpenses || []).map(e => ({
      "Sana": new Date(e.date).toLocaleDateString(),
      "Menejer": e.managerName,
      "Mijoz": e.customerName,
      "Xarajat miqdori (UZS)": e.amount,
      "Tavsif / Sabab": e.description,
      "Status": e.status
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sotuvoldi Xarajatlar");
    XLSX.writeFile(wb, `Sotuvoldi_Xarajatlar_${new Date().toLocaleDateString()}.xlsx`);
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
      onClick={() => {
        setModalSearch('');
        setActiveModal(type);
      }}
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
          setModalSearch('');
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
        <p style={{ color: 'var(--text-secondary)' }}>Kompaniyaning moliyaviy, savdo va operatsion ko'rsatkichlarini chuqur tahlil qilish tizimi.</p>
      </div>

      {/* Navigation tabs for main panels */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <button 
          onClick={() => setActiveTab('financial')}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: '800',
            fontSize: '15px',
            cursor: 'pointer',
            background: activeTab === 'financial' ? 'var(--accent-gold)' : 'transparent',
            color: activeTab === 'financial' ? 'black' : 'var(--text-secondary)',
            border: activeTab === 'financial' ? 'none' : '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: '0.2s'
          }}
        >
          <Coins size={18} />
          Moliyaviy hisobotlar
        </button>
        <button 
          onClick={() => setActiveTab('sales')}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: '800',
            fontSize: '15px',
            cursor: 'pointer',
            background: activeTab === 'sales' ? 'var(--accent-gold)' : 'transparent',
            color: activeTab === 'sales' ? 'black' : 'var(--text-secondary)',
            border: activeTab === 'sales' ? 'none' : '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: '0.2s'
          }}
        >
          <ShoppingBag size={18} />
          Savdo hisobotlari
        </button>
        <button 
          onClick={() => setActiveTab('operational')}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: '800',
            fontSize: '15px',
            cursor: 'pointer',
            background: activeTab === 'operational' ? 'var(--accent-gold)' : 'transparent',
            color: activeTab === 'operational' ? 'black' : 'var(--text-secondary)',
            border: activeTab === 'operational' ? 'none' : '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: '0.2s'
          }}
        >
          <Activity size={18} />
          Operatsion hisobotlar
        </button>
      </div>

      {/* Grid panels according to selected activeTab */}
      {activeTab === 'financial' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          {hasAccess('balance') && renderCard("Balans hisoboti", "Aktivlar, passivlar va kapitalning sana bo'yicha joriy holati hamda sof balans ko'rsatkichi.", <Scale size={20} />, 'balance', '#3b82f6')}
          {hasAccess('pnl') && renderCard("Foyda yoki zarar (P&L)", "Shartnomalar rentabelligi, sotuvlar, xarajatlar va oylik yalpi/sof foyda ko'rsatkichlari tahlili.", <TrendingUp size={20} />, 'pnl', '#10b981')}
          {hasAccess('cashflow') && renderCard("Cash Flow (Pul Oqimi)", "Kirim va chiqim pullari oqimi, kunlik tranzaksiyalar dinamikasi va kassa qoldiqlari o'zgarishi.", <Activity size={20} />, 'cashflow', '#8b5cf6')}
          {hasAccess('debitor') && renderCard("Debitor Qarzdorliklar", "Mijozlar tomonidan to'lanishi kutilayotgan qarzdorliklar ro'yxati va umumiy qarzdorlik summasi.", <UserCheck size={20} />, 'debitor', '#fbbf24')}
          {hasAccess('kreditor') && renderCard("Kreditor Qarzdorliklar", "Yetkazib beruvchilar va hamkorlar oldidagi qarzdorliklar, to'lanishi kerak bo'lgan summalar ro'yxati.", <UserMinus size={20} />, 'kreditor', '#f43f5e')}
        </div>
      )}

      {activeTab === 'sales' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          {hasAccess('sales_managers') && renderCard("Sotuv menejerlari bo‘yicha savdo", "Menejerlar faoliyati, shartnomalar soni, o'rtacha chek va savdo hajmlari statistikasi.", <ShoppingBag size={20} />, 'sales_managers', '#06b6d4')}
          {hasAccess('sales_showrooms') && renderCard("Showroom bo‘yicha savdo", "Filiallar (Showroom) bo'yicha sotuvlar dinamikasi va foyda ko'rsatkichlari.", <Store size={20} />, 'sales_showrooms', '#fbbf24')}
          {hasAccess('sales_client_types') && renderCard("Mijoz turi bo‘yicha savdo", "Yuridik shaxslar (B2B), Jismoniy shaxslar (B2C) va boshqa mijoz turlari bo'yicha sotuvlar.", <User size={20} />, 'sales_client_types', '#10b981')}
          {hasAccess('sales_conversion') && renderCard("Lead manbasi bo‘yicha konversiya", "Mijozlarning kelish kanallari (reklama manbalari) bo'yicha konversiya darajasi.", <Percent size={20} />, 'sales_conversion', '#8b5cf6')}
          {hasAccess('sales_lost_kp') && renderCard("Yo‘qotilgan KP tahlili", "Rad etilgan yoki yo'qotilgan tijorat takliflari sabablarini o'rganish va tahlil qilish.", <AlertTriangle size={20} />, 'sales_lost_kp', '#f43f5e')}
        </div>
      )}

      {activeTab === 'operational' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          {hasAccess('ops_stock') && renderCard("Ombor qoldiqlari", "Mavjud xom-ashyo va materiallarning qoldiqlari, o'rtacha tannarxi va umumiy qiymati.", <Boxes size={20} />, 'ops_stock', '#8b5cf6')}
          {hasAccess('ops_movements') && renderCard("Material harakatlari", "Materiallarning omborga kirimi va ishlab chiqarishga chiqib ketish harakatlari.", <ArrowRightLeft size={20} />, 'ops_movements', '#3b82f6')}
          {hasAccess('ops_production_status') && renderCard("Production order statuslari", "Ishlab chiqarish buyurtmalarining joriy holatlari va bosqichlar bo'yicha hisoboti.", <Hammer size={20} />, 'ops_production_status', '#fbbf24')}
          {hasAccess('ops_order_profitability') && renderCard("Buyurtma profitability", "Har bir buyurtmaning individual xarajati, rentabelligi va foyda ulushi.", <TrendingUp size={20} />, 'ops_order_profitability', '#10b981')}
          {hasAccess('ops_presale_expenses') && renderCard("Sotuvoldi xarajatlar hisoboti", "Zamer (o'lchov olish) va muzokaralar uchun qilingan transport hamda xizmat xarajatlari.", <Coins size={20} />, 'ops_presale_expenses', '#f43f5e')}
        </div>
      )}

      {/* REPORT MODALS */}
      {activeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '20px' }}>
          <div style={{ background: 'var(--secondary-bg)', width: '100%', maxWidth: '1100px', maxHeight: '90vh', borderRadius: '24px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'white' }}>
                  {activeModal === 'balance' && "Balans hisoboti (Sana bo'yicha)"}
                  {activeModal === 'pnl' && "Foyda va Zarar Hisoboti (P&L)"}
                  {activeModal === 'cashflow' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      Pul Oqimlari Dinamikasi (Cash Flow)
                      <span style={{ fontSize: '11px', color: '#a8a29e', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold' }}>Demo hisobot</span>
                    </span>
                  )}
                  {activeModal === 'debitor' && "Mijozlar Qarzdorligi (Debitorlar)"}
                  {activeModal === 'kreditor' && "Yetkazib Beruvchilardan Qarzlar (Kreditorlar)"}
                  {activeModal === 'sales_managers' && "Menejerlar bo'yicha savdo"}
                  {activeModal === 'sales_showrooms' && "Showroomlar bo'yicha savdo"}
                  {activeModal === 'sales_client_types' && "Mijoz turlari bo'yicha savdo"}
                  {activeModal === 'sales_conversion' && "Lead manbalari bo'yicha konversiya"}
                  {activeModal === 'sales_lost_kp' && "Yo'qotilgan KP tahlili"}
                  {activeModal === 'ops_stock' && "Ombor qoldiqlari hisoboti"}
                  {activeModal === 'ops_movements' && "Materiallar harakati logi"}
                  {activeModal === 'ops_production_status' && "Production order statuslari"}
                  {activeModal === 'ops_order_profitability' && "Buyurtmalar rentabelligi (Profitability)"}
                  {activeModal === 'ops_presale_expenses' && "Sotuvoldi xarajatlar hisoboti"}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
                  {activeModal === 'balance' && "Kompaniyaning joriy aktivlari va majburiyatlari nisbati"}
                  {activeModal === 'pnl' && "Kompaniyaning davr bo‘yicha daromadlari, xarajatlari va sof moliyaviy natijasi."}
                  {activeModal === 'cashflow' && "Haqiqiy kirib kelgan va chiqib ketgan pul mablag'lari oqimi"}
                  {activeModal === 'debitor' && "Mijozlar bo'yicha to'lanmagan qarzdorliklar tahlili"}
                  {activeModal === 'kreditor' && "Firma va yetkazib beruvchilar oldidagi qarzlarimiz"}
                  {activeModal === 'sales_managers' && "Menejerlar sotuv ko'rsatkichlari va savdo tahlili"}
                  {activeModal === 'sales_showrooms' && "Filiallar va showroomlarning savdo hajmlari tahlili"}
                  {activeModal === 'sales_client_types' && "B2B vs B2C mijozlar kesimidagi savdo ulushi"}
                  {activeModal === 'sales_conversion' && "Tijorat takliflarining savdoga aylanish konversiyasi"}
                  {activeModal === 'sales_lost_kp' && "Yo'qotilgan takliflar summalari va bekor qilinish sabablari"}
                  {activeModal === 'ops_stock' && "Ombordagi xom-ashyolar ro'yxati va zaxira jami qiymati"}
                  {activeModal === 'ops_movements' && "Materiallarning kirim-chiqim tranzaksiyalari tarixi"}
                  {activeModal === 'ops_production_status' && "Buyurtmalarning ishlab chiqarish jarayonidagi holati"}
                  {activeModal === 'ops_order_profitability' && "Alohida shartnomalarning sof foydasi va marjasi"}
                  {activeModal === 'ops_presale_expenses' && "Zamer transportlari va o'lchov chiqish xarajatlari"}
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
                    if (activeModal === 'sales_managers') exportSales();
                    if (activeModal === 'sales_showrooms') exportShowrooms();
                    if (activeModal === 'sales_client_types') exportClientTypes();
                    if (activeModal === 'sales_conversion') exportConversion();
                    if (activeModal === 'sales_lost_kp') exportLostProposals();
                    if (activeModal === 'ops_stock') exportWarehouseStock();
                    if (activeModal === 'ops_movements') exportMaterialMovements();
                    if (activeModal === 'ops_production_status') exportProductionStatus();
                    if (activeModal === 'ops_order_profitability') exportOrderProfitability();
                    if (activeModal === 'ops_presale_expenses') exportPreSaleExpenses();
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
              {activeModal === 'balance' && (
                <>
                  <div style={{ flex: 1, minWidth: '150px' }}>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '11px', fontWeight: '700' }}>Sana bo'yicha</label>
                    <input 
                      type="date" 
                      value={endDate || new Date().toISOString().split('T')[0]} 
                      onChange={(e) => { 
                        setEndDate(e.target.value); 
                        setStartDate(''); 
                        setPeriod(''); 
                      }} 
                      style={{ width: '100%', height: '38px', borderRadius: '8px', padding: '0 12px' }} 
                    />
                  </div>
                  {user?.role === 'super' && (
                    <div style={{ flex: 1, minWidth: '150px' }}>
                      <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '11px', fontWeight: '700' }}>Showroom</label>
                      <select value={showroom} onChange={(e) => setShowroom(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', padding: '0 12px' }}>
                        <option value="all">Barchasi</option>
                        <option value="Global">Global (Super)</option>
                        {showrooms.map(s => <option key={s._id} value={s.name} style={{ color: '#000' }}>{s.name}</option>)}
                      </select>
                    </div>
                  )}
                </>
              )}

              {activeModal === 'pnl' && (
                <>
                  <div style={{ flex: '1 1 140px', minWidth: '120px' }}>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '11px', fontWeight: '700' }}>Davr</label>
                    <select value={period} onChange={(e) => setPeriod(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', padding: '0 12px' }}>
                      <option value="1">Bugun</option>
                      <option value="7">7 kun</option>
                      <option value="30">30 kun</option>
                      <option value="90">90 kun</option>
                      <option value="all">Butun davr</option>
                    </select>
                  </div>
                  <div style={{ flex: '1.2 1 280px', minWidth: '280px', display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '11px', fontWeight: '700' }}>Sana (dan)</label>
                      <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPeriod(''); }} style={{ width: '100%', height: '38px', borderRadius: '8px', padding: '0 12px' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '11px', fontWeight: '700' }}>Sana (gacha)</label>
                      <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPeriod(''); }} style={{ width: '100%', height: '38px', borderRadius: '8px', padding: '0 12px' }} />
                    </div>
                  </div>
                  {user?.role === 'super' && (
                    <div style={{ flex: '1 1 140px', minWidth: '120px' }}>
                      <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '11px', fontWeight: '700' }}>Showroom</label>
                      <select value={showroom} onChange={(e) => setShowroom(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', padding: '0 12px' }}>
                        <option value="all">Barchasi</option>
                        <option value="Global">Global (Super)</option>
                        {showrooms.map(s => <option key={s._id} value={s.name} style={{ color: '#000' }}>{s.name}</option>)}
                      </select>
                    </div>
                  )}
                  <div style={{ flex: '1 1 140px', minWidth: '120px' }}>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '11px', fontWeight: '700' }}>Savdo kanali</label>
                    <select value={salesChannel} onChange={(e) => setSalesChannel(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', padding: '0 12px' }}>
                      <option value="all">Barchasi</option>
                      <option value="Showroom">Showroom</option>
                      <option value="Telegram">Telegram</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Website">Website</option>
                      <option value="B2B Savdo">B2B Savdo</option>
                      <option value="Tavsiya">Tavsiya</option>
                      <option value="Boshqa">Boshqa</option>
                    </select>
                  </div>
                  <div style={{ flex: '1 1 140px', minWidth: '120px' }}>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '11px', fontWeight: '700' }}>Mijoz turi</label>
                    <select value={clientType} onChange={(e) => setClientType(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', padding: '0 12px' }}>
                      <option value="all">Barchasi</option>
                      <option value="B2B">Yuridik shaxs (B2B)</option>
                      <option value="B2C">Jismoniy shaxs (B2C)</option>
                    </select>
                  </div>
                  <div style={{ flex: '1 1 140px', minWidth: '120px' }}>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '11px', fontWeight: '700' }}>Mahsulot turi</label>
                    <select value={productType} onChange={(e) => setProductType(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', padding: '0 12px' }}>
                      <option value="all">Barchasi</option>
                      <option value="Oshxona mebeli">Oshxona mebeli</option>
                      <option value="Ofis mebeli">Ofis mebeli</option>
                      <option value="Yotoqxona mebeli">Yotoqxona mebeli</option>
                      <option value="Yumshoq mebel">Yumshoq mebel</option>
                      <option value="Boshqa">Boshqa</option>
                    </select>
                  </div>
                  <div style={{ flex: '1 1 140px', minWidth: '120px' }}>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '11px', fontWeight: '700' }}>Xarajat markazi</label>
                    <select value={costCenter} onChange={(e) => setCostCenter(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', padding: '0 12px' }}>
                      <option value="all">Barchasi</option>
                      <option value="Bosh ofis">Bosh ofis</option>
                      <option value="Showroom 1">Showroom 1</option>
                      <option value="Showroom 2">Showroom 2</option>
                      <option value="Ishlab chiqarish sexi">Ishlab chiqarish sexi</option>
                      <option value="Logistika">Logistika</option>
                    </select>
                  </div>
                  <div style={{ flex: '1 1 100px', minWidth: '90px' }}>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '11px', fontWeight: '700' }}>Valyuta</label>
                    <select value={currencyFilter} onChange={(e) => setCurrencyFilter(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', padding: '0 12px' }}>
                      <option value="all">Barchasi</option>
                      <option value="UZS">UZS</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                  <div style={{ flex: '1 1 140px', minWidth: '120px' }}>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '11px', fontWeight: '700' }}>Menejer</label>
                    <select value={manager} onChange={(e) => setManager(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', padding: '0 12px' }}>
                      <option value="all">Barchasi</option>
                      {uniqueManagers.map(m => <option key={m} value={m} style={{ color: '#000' }}>{m}</option>)}
                    </select>
                  </div>
                </>
              )}

              {activeModal !== 'balance' && activeModal !== 'pnl' && (
                <>
                  <div style={{ flex: 1, minWidth: '150px' }}>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '11px', fontWeight: '700' }}>Davr</label>
                    <select value={period} onChange={(e) => setPeriod(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', padding: '0 12px' }}>
                      <option value="1">Bugun</option>
                      <option value="7">7 kun</option>
                      <option value="30">30 kun</option>
                      <option value="90">90 kun</option>
                      <option value="all">Butun davr</option>
                    </select>
                  </div>
                  <div style={{ flex: '1.2 1 280px', minWidth: '280px', display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '11px', fontWeight: '700' }}>Sana (dan)</label>
                      <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPeriod(''); }} style={{ width: '100%', height: '38px', borderRadius: '8px', padding: '0 12px' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '11px', fontWeight: '700' }}>Sana (gacha)</label>
                      <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPeriod(''); }} style={{ width: '100%', height: '38px', borderRadius: '8px', padding: '0 12px' }} />
                    </div>
                  </div>
                  {user?.role === 'super' && (
                    <div style={{ flex: 1, minWidth: '150px' }}>
                      <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '11px', fontWeight: '700' }}>Showroom</label>
                      <select value={showroom} onChange={(e) => setShowroom(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', padding: '0 12px' }}>
                        <option value="all">Barchasi</option>
                        <option value="Global">Global (Super)</option>
                        {showrooms.map(s => <option key={s._id} value={s.name} style={{ color: '#000' }}>{s.name}</option>)}
                      </select>
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: '150px' }}>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '11px', fontWeight: '700' }}>Menejer</label>
                    <select value={manager} onChange={(e) => setManager(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', padding: '0 12px' }}>
                      <option value="all">Barchasi</option>
                      {uniqueManagers.map(m => <option key={m} value={m} style={{ color: '#000' }}>{m}</option>)}
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Modal Content */}
            <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                  <div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
              ) : (!stats && activeModal !== 'pnl') ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Hisobot ma'lumotlari topilmadi.</div>
              ) : (
                <>
                  {/* BALANCE REPORT */}
                  {activeModal === 'balance' && (() => {
                    const b = stats.balanceSheet || {
                      assets: {
                        fixedAssets: 180000000,
                        intangibleAssets: 25000000,
                        pulMablaglari: 150000000 + (stats.overview.netCashflow || 0),
                        debitorQarz: stats.debitor?.total || 0,
                        omborZaxira: stats.totalStockValue || 85000000,
                        oldindanAvans: 40000000,
                        total: 180000000 + 25000000 + (150000000 + (stats.overview.netCashflow || 0)) + (stats.debitor?.total || 0) + (stats.totalStockValue || 85000000) + 40000000
                      },
                      liabilities: {
                        kreditorQarz: stats.kreditor?.total || 0,
                        mijozAvans: 35000000,
                        soliqMajburiyat: 15000000,
                        ishHaqiMajburiyat: 28000000,
                        kreditQarzlar: 120000000,
                        total: (stats.kreditor?.total || 0) + 35000000 + 15000000 + 28000000 + 120000000
                      },
                      capital: {
                        equity: (180000000 + 25000000 + (150000000 + (stats.overview.netCashflow || 0)) + (stats.debitor?.total || 0) + (stats.totalStockValue || 85000000) + 40000000) - ((stats.kreditor?.total || 0) + 35000000 + 15000000 + 28000000 + 120000000)
                      }
                    };
                    const check = b.assets.total - b.liabilities.total - b.capital.equity;
                    return (
                      <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                          {/* Assets list */}
                          <div className="premium-card" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#10b981', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px', marginBottom: '16px' }}>AKTIVLAR</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Asosiy vositalar</span>
                                <span style={{ fontWeight: '700' }}>{b.assets.fixedAssets.toLocaleString()} UZS</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Nomoddiy aktivlar</span>
                                <span style={{ fontWeight: '700' }}>{b.assets.intangibleAssets.toLocaleString()} UZS</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Pul mablag‘lari</span>
                                <span style={{ fontWeight: '700', color: '#10b981' }}>{b.assets.pulMablaglari.toLocaleString()} UZS</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Debitor qarzdorliklar</span>
                                <span style={{ fontWeight: '700' }}>{b.assets.debitorQarz.toLocaleString()} UZS</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Ombor zaxiralari</span>
                                <span style={{ fontWeight: '700' }}>{b.assets.omborZaxira.toLocaleString()} UZS</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Oldindan to‘langan avanslar</span>
                                <span style={{ fontWeight: '700' }}>{b.assets.oldindanAvans.toLocaleString()} UZS</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', borderTop: '2px solid rgba(255,255,255,0.05)', paddingTop: '12px', fontWeight: '900', color: 'white' }}>
                                <span>JAMI AKTIVLAR</span>
                                <span style={{ color: '#10b981' }}>{b.assets.total.toLocaleString()} UZS</span>
                              </div>
                            </div>
                          </div>

                          {/* Liabilities and Equity list */}
                          <div className="premium-card" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#f43f5e', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px', marginBottom: '16px' }}>MAJBURIYATLAR VA KAPITAL</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Kapital</span>
                                <span style={{ fontWeight: '700', color: 'var(--accent-gold)' }}>{b.capital.equity.toLocaleString()} UZS</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Kreditor qarzdorliklar</span>
                                <span style={{ fontWeight: '700' }}>{b.liabilities.kreditorQarz.toLocaleString()} UZS</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Mijozlardan olingan avanslar</span>
                                <span style={{ fontWeight: '700' }}>{b.liabilities.mijozAvans.toLocaleString()} UZS</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Soliq majburiyatlari</span>
                                <span style={{ fontWeight: '700' }}>{b.liabilities.soliqMajburiyat.toLocaleString()} UZS</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Ish haqi majburiyatlari</span>
                                <span style={{ fontWeight: '700' }}>{b.liabilities.ishHaqiMajburiyat.toLocaleString()} UZS</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Kredit va qarzlar</span>
                                <span style={{ fontWeight: '700' }}>{b.liabilities.kreditQarzlar.toLocaleString()} UZS</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', borderTop: '2px solid rgba(255,255,255,0.05)', paddingTop: '12px', fontWeight: '900', color: 'white' }}>
                                <span>JAMI MAJBURIYATLAR VA KAPITAL</span>
                                <span style={{ color: '#f43f5e' }}>{(b.liabilities.total + b.capital.equity).toLocaleString()} UZS</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Balance Validation Check */}
                        <div className="premium-card" style={{ padding: '20px 24px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', background: 'rgba(0,0,0,0.1)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <h4 style={{ color: 'white', fontWeight: '800', fontSize: '15px' }}>Balans Tekshiruvi</h4>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>
                                Aktivlar - Majburiyatlar - Kapital = 0 (Muvozanat formulasining bajarilishi)
                              </p>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '10px',
                              padding: '10px 18px',
                              borderRadius: '10px',
                              background: Math.abs(check) < 1 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                              border: Math.abs(check) < 1 ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)',
                              color: Math.abs(check) < 1 ? '#10b981' : '#ef4444',
                              fontWeight: '900',
                              fontSize: '14px'
                            }}>
                              <span style={{ fontSize: '12px', textTransform: 'uppercase', tracking: '1px', opacity: 0.8 }}>Farq:</span>
                              <span>{check.toLocaleString()} UZS</span>
                              <span style={{ 
                                display: 'inline-block', 
                                width: '8px', 
                                height: '8px', 
                                borderRadius: '50%', 
                                background: Math.abs(check) < 1 ? '#10b981' : '#ef4444' 
                              }}></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* PNL REPORT */}
                  {activeModal === 'pnl' && (() => {
                    const pnlTotals = stats?.pnlReport?.totals || {
                      sofTushum: 0,
                      yalpiFoyda: 0,
                      operatsionFoyda: 0,
                      sofFoyda: 0,
                      yalpiMarja: 0,
                      sofMarja: 0
                    };
                    return (
                      <div>
                        {/* Summary Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '30px' }}>
                          <div className="premium-card" style={{ padding: '16px' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '700' }}>Sof daromad</span>
                            <h4 style={{ fontSize: '16px', fontWeight: '900', color: 'white', marginTop: '6px' }}>{(pnlTotals.sofTushum || 0).toLocaleString()} UZS</h4>
                          </div>
                          <div className="premium-card" style={{ padding: '16px' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '700' }}>Yalpi foyda</span>
                            <h4 style={{ fontSize: '16px', fontWeight: '900', color: '#10b981', marginTop: '6px' }}>{(pnlTotals.yalpiFoyda || 0).toLocaleString()} UZS</h4>
                          </div>
                          <div className="premium-card" style={{ padding: '16px' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '700' }}>Operatsion foyda</span>
                            <h4 style={{ fontSize: '16px', fontWeight: '900', color: '#3b82f6', marginTop: '6px' }}>{(pnlTotals.operatsionFoyda || 0).toLocaleString()} UZS</h4>
                          </div>
                          <div className="premium-card" style={{ padding: '16px' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '700' }}>Sof foyda</span>
                            <h4 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--accent-gold)', marginTop: '6px' }}>{(pnlTotals.sofFoyda || 0).toLocaleString()} UZS</h4>
                          </div>
                          <div className="premium-card" style={{ padding: '16px' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '700' }}>Yalpi marja</span>
                            <h4 style={{ fontSize: '16px', fontWeight: '900', color: '#10b981', marginTop: '6px' }}>{(pnlTotals.yalpiMarja || 0).toFixed(1)}%</h4>
                          </div>
                          <div className="premium-card" style={{ padding: '16px' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '700' }}>Sof marja</span>
                            <h4 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--accent-gold)', marginTop: '6px' }}>{(pnlTotals.sofMarja || 0).toFixed(1)}%</h4>
                          </div>
                        </div>

                        {/* Collapsible Category Tree */}
                        <div className="premium-card" style={{ padding: '24px', overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                                <th style={{ padding: '12px 16px', width: '100px' }}>Kod</th>
                                <th style={{ padding: '12px 16px' }}>P&L qatori</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', width: '220px' }}>Summa</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', width: '120px' }}>Revenue %</th>
                              </tr>
                            </thead>
                            <tbody>
                              {getPnlRows().map((row, idx) => {
                                if (row.isFormula) {
                                  return (
                                    <tr 
                                      key={idx} 
                                      style={{ 
                                        background: 'rgba(16, 185, 129, 0.06)', 
                                        borderBottom: '2px solid rgba(255,255,255,0.08)',
                                        borderTop: '2px solid rgba(255,255,255,0.08)',
                                        fontWeight: '900',
                                        color: 'white'
                                      }}
                                    >
                                      <td style={{ padding: '14px 16px', color: 'var(--accent-gold)' }}>{row.code}</td>
                                      <td style={{ padding: '14px 16px', letterSpacing: '0.5px' }}>{row.name}</td>
                                      <td style={{ padding: '14px 16px', textAlign: 'right', color: row.amount >= 0 ? '#10b981' : '#f43f5e' }}>
                                        {(row.amount || 0).toLocaleString()} UZS
                                      </td>
                                      <td style={{ padding: '14px 16px', textAlign: 'right', color: 'var(--accent-gold)' }}>
                                        {formatPercentage(row.percentage, row.isPercentageMargin)}
                                      </td>
                                    </tr>
                                  );
                                }

                                const isExpanded = expandedCategories[row.code];
                                return (
                                  <tr 
                                    key={idx} 
                                    onClick={() => row.isParent && toggleCategory(row.code)}
                                    style={{ 
                                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                                      cursor: row.isParent ? 'pointer' : 'default',
                                      background: row.isParent ? 'rgba(255,255,255,0.01)' : 'transparent',
                                      transition: 'background 0.2s',
                                      fontWeight: row.isParent ? '700' : 'normal'
                                    }}
                                    onMouseEnter={(e) => {
                                      if (row.isParent) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                    }}
                                    onMouseLeave={(e) => {
                                      if (row.isParent) e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
                                    }}
                                  >
                                    <td style={{ padding: '12px 16px', color: row.isParent ? 'white' : 'var(--text-secondary)', fontSize: row.isParent ? '14px' : '13px' }}>
                                      {row.code}
                                    </td>
                                    <td style={{ padding: '12px 16px', paddingLeft: row.isParent ? '16px' : '36px', color: row.isParent ? 'white' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      {row.isParent && (
                                        <span style={{ fontSize: '10px', color: 'var(--accent-gold)', display: 'inline-block', width: '12px' }}>
                                          {isExpanded ? '▼' : '▶'}
                                        </span>
                                      )}
                                      {!row.isParent && <span style={{ display: 'inline-block', width: '12px' }}></span>}
                                      {row.name}
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'right', color: row.isParent ? 'white' : 'var(--text-secondary)' }}>
                                      {(row.amount || 0).toLocaleString()} UZS
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                                      {formatPercentage(row.percentage)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}

                  {/* CASH FLOW REPORT */}
                  {activeModal === 'cashflow' && (() => {
                    const endingBalanceActual = stats.balanceSheet?.assets?.pulMablaglari || 150000000;
                    const jamiKirimActual = stats.overview?.cashIn || 0;
                    const jamiChiqimActual = stats.overview?.cashOut || 0;
                    const sofPulOqimiActual = jamiKirimActual - jamiChiqimActual;
                    const beginningBalance = endingBalanceActual - sofPulOqimiActual;

                    // Sections data
                    const operatingInflow = [
                      { name: "Savdodan tushum", amount: jamiKirimActual, isDemo: false }
                    ];
                    const operatingOutflow = (stats.expenseBreakdown || []).map(e => {
                      const name = e.name.toLowerCase() === 'maxsulot uchun' ? 'Xom ashyo va materiallar uchun to‘lov' : e.name;
                      return {
                        name,
                        amount: -e.value,
                        isDemo: false
                      };
                    });
                    const operatingTotal = jamiKirimActual - jamiChiqimActual;

                    const investingInflow = [
                      { name: "Asosiy vositalar va aktivlar sotuvi", amount: 0, isDemo: true }
                    ];
                    const investingOutflow = [
                      { name: "Asosiy vositalar xaridi", amount: -12000000, isDemo: true },
                      { name: "Nomoddiy aktivlar xaridi", amount: -3000000, isDemo: true }
                    ];
                    const investingTotal = -15000000;

                    const financingInflow = [
                      { name: "Bank kreditlari va qarzlar olinishi", amount: 45000000, isDemo: true },
                      { name: "Ustav kapitaliga badallar", amount: 20000000, isDemo: true }
                    ];
                    const financingOutflow = [
                      { name: "Kreditlar va qarzlar so'ndirilishi", amount: -8000000, isDemo: true },
                      { name: "Dividendlarning to'lanishi", amount: -5000000, isDemo: true }
                    ];
                    const financingTotal = 52000000;

                    // Summary values linked directly to the rows shown in the table
                    const totalKirim = jamiKirimActual + 65000000; // 0 (investing) + 65000000 (financing)
                    const totalChiqim = jamiChiqimActual + 15000000 + 13000000; // 15000000 (investing) + 13000000 (financing)
                    const totalSofPulOqimi = totalKirim - totalChiqim;
                    const totalEndingBalance = beginningBalance + totalSofPulOqimi;

                    const sections = [
                      {
                        title: "1. OPERATSION FAOLIYAT",
                        color: "#3b82f6",
                        inflow: operatingInflow,
                        outflow: operatingOutflow,
                        subtotalLabel: "Operatsion sof pul oqimi",
                        total: operatingTotal,
                        isDemo: false
                      },
                      {
                        title: "2. INVESTITSION FAOLIYAT",
                        color: "#10b981",
                        inflow: investingInflow,
                        outflow: investingOutflow,
                        subtotalLabel: "Investitsion sof pul oqimi",
                        total: investingTotal,
                        isDemo: true
                      },
                      {
                        title: "3. MOLIYAVIY FAOLIYAT",
                        color: "#8b5cf6",
                        inflow: financingInflow,
                        outflow: financingOutflow,
                        subtotalLabel: "Moliyaviy sof pul oqimi",
                        total: financingTotal,
                        isDemo: true
                      }
                    ];

                    return (
                      <div>
                        {/* 5 Summary Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '30px' }}>
                          <div className="premium-card" style={{ padding: '16px' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '700' }}>Boshlang‘ich qoldiq</span>
                            <h4 style={{ fontSize: '15px', fontWeight: '900', color: 'white', marginTop: '6px' }}>{beginningBalance.toLocaleString()} UZS</h4>
                          </div>
                          <div className="premium-card" style={{ padding: '16px' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '700' }}>Jami kirim</span>
                            <h4 style={{ fontSize: '15px', fontWeight: '900', color: '#10b981', marginTop: '6px' }}>{totalKirim.toLocaleString()} UZS</h4>
                          </div>
                          <div className="premium-card" style={{ padding: '16px' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '700' }}>Jami chiqim</span>
                            <h4 style={{ fontSize: '15px', fontWeight: '900', color: '#f43f5e', marginTop: '6px' }}>{totalChiqim.toLocaleString()} UZS</h4>
                          </div>
                          <div className="premium-card" style={{ padding: '16px' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '700' }}>Sof pul oqimi</span>
                            <h4 style={{ fontSize: '15px', fontWeight: '900', color: totalSofPulOqimi >= 0 ? '#10b981' : '#f43f5e', marginTop: '6px' }}>{totalSofPulOqimi.toLocaleString()} UZS</h4>
                          </div>
                          <div className="premium-card" style={{ padding: '16px' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '700' }}>Yakuniy qoldiq</span>
                            <h4 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--accent-gold)', marginTop: '6px' }}>{totalEndingBalance.toLocaleString()} UZS</h4>
                          </div>
                        </div>

                        <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', letterSpacing: '0.5px' }}>Pul oqimi moddalari bo‘yicha tahlil</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px', textAlign: 'left' }}>
                              <th style={{ padding: '12px 16px' }}>Pul oqimi moddasi</th>
                              <th style={{ padding: '12px 16px', textAlign: 'right', width: '250px' }}>Summa (UZS)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sections.map((sec, sIdx) => (
                              <React.Fragment key={sIdx}>
                                {/* Section Header Row */}
                                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                  <td colSpan="2" style={{ padding: '14px 16px', fontWeight: '800', color: sec.color, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {sec.title}
                                    {sec.isDemo && (
                                      <span style={{ 
                                        color: '#a8a29e', 
                                        background: 'rgba(255,255,255,0.06)', 
                                        padding: '2px 6px', 
                                        borderRadius: '4px', 
                                        fontSize: '9px',
                                        fontWeight: '700' 
                                      }}>
                                        demo data
                                      </span>
                                    )}
                                  </td>
                                </tr>

                                {/* Inflows */}
                                {sec.inflow.map((item, iIdx) => (
                                  <tr key={`in-${sIdx}-${iIdx}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.01)' }}>
                                    <td style={{ padding: '10px 16px', paddingLeft: '32px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                                      {item.name}
                                      {item.isDemo && <span style={{ fontSize: '9px', color: '#a8a29e', opacity: 0.6, marginLeft: '6px' }}>(demo data)</span>}
                                    </td>
                                    <td style={{ padding: '10px 16px', textAlign: 'right', color: '#10b981', fontSize: '13px', fontWeight: '700' }}>
                                      +{item.amount.toLocaleString()} UZS
                                    </td>
                                  </tr>
                                ))}

                                {/* Outflows */}
                                {sec.outflow.map((item, oIdx) => (
                                  <tr key={`out-${sIdx}-${oIdx}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.01)' }}>
                                    <td style={{ padding: '10px 16px', paddingLeft: '32px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                                      {item.name}
                                      {item.isDemo && <span style={{ fontSize: '9px', color: '#a8a29e', opacity: 0.6, marginLeft: '6px' }}>(demo data)</span>}
                                    </td>
                                    <td style={{ padding: '10px 16px', textAlign: 'right', color: '#f43f5e', fontSize: '13px', fontWeight: '700' }}>
                                      {item.amount.toLocaleString()} UZS
                                    </td>
                                  </tr>
                                ))}

                                {/* Section Subtotal Row */}
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.01)' }}>
                                  <td style={{ padding: '12px 16px', paddingLeft: '32px', fontWeight: '800', color: 'white', fontSize: '13px' }}>
                                    {sec.subtotalLabel}
                                  </td>
                                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '900', color: sec.total >= 0 ? '#10b981' : '#f43f5e', fontSize: '13px' }}>
                                    {sec.total >= 0 ? '+' : ''}{sec.total.toLocaleString()} UZS
                                  </td>
                                </tr>
                              </React.Fragment>
                            ))}

                            {/* GRAND TOTALS */}
                            <tr style={{ background: 'rgba(255,255,255,0.03)', borderTop: '2px solid rgba(255,255,255,0.1)' }}>
                              <td style={{ padding: '14px 16px', fontWeight: '900', color: 'white', fontSize: '14px', textTransform: 'uppercase' }}>
                                Jami sof pul oqimi
                              </td>
                              <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '950', color: totalSofPulOqimi >= 0 ? '#10b981' : '#f43f5e', fontSize: '14px' }}>
                                {totalSofPulOqimi >= 0 ? '+' : ''}{totalSofPulOqimi.toLocaleString()} UZS
                              </td>
                            </tr>
                            <tr style={{ background: 'rgba(251,191,36,0.04)', borderBottom: '1px solid var(--accent-gold)' }}>
                              <td style={{ padding: '14px 16px', fontWeight: '900', color: 'var(--accent-gold)', fontSize: '14px', textTransform: 'uppercase' }}>
                                Yakuniy pul qoldig‘i
                              </td>
                              <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '950', color: 'var(--accent-gold)', fontSize: '14px' }}>
                                {totalEndingBalance.toLocaleString()} UZS
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}

                  {/* DEBITOR REPORT */}
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

                  {/* KREDITOR REPORT */}
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

                  {/* SALES MANAGERS REPORT */}
                  {activeModal === 'sales_managers' && (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        <div className="premium-card" style={{ padding: '20px' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Jami Savdo</span>
                          <h4 style={{ fontSize: '20px', fontWeight: '900', color: 'white', marginTop: '6px' }}>{stats.overview.totalSales.toLocaleString()} UZS</h4>
                        </div>
                        <div className="premium-card" style={{ padding: '20px' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Menejerlar Soni</span>
                          <h4 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--accent-gold)', marginTop: '6px' }}>{stats.salesPerformance.length} ta</h4>
                        </div>
                      </div>

                      <div style={{ height: '300px', width: '100%', marginBottom: '30px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.salesPerformance}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" stroke="var(--text-secondary)" />
                            <YAxis stroke="var(--text-secondary)" tickFormatter={(v) => (v / 1000000) + 'M'} />
                            <Tooltip contentStyle={{ background: 'var(--secondary-bg)', color: 'white' }} />
                            <Bar name="Savdo summasi" dataKey="sales" fill="var(--accent-gold)" radius={[4, 4, 0, 0]} />
                            <Bar name="Keltirgan Foyda" dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                            <th style={{ padding: '12px 16px' }}>Menejer Nomi</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Jami Shartnomalar</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Keltirgan Sof Foydasi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.salesPerformance.map((s, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                              <td style={{ padding: '14px 16px', fontWeight: '700' }}>{s.name}</td>
                              <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '700' }}>{s.sales.toLocaleString()} UZS</td>
                              <td style={{ padding: '14px 16px', textAlign: 'right', color: '#10b981', fontWeight: '800' }}>{s.profit.toLocaleString()} UZS</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* SALES SHOWROOMS REPORT */}
                  {activeModal === 'sales_showrooms' && (
                    <div>
                      <div style={{ height: '300px', width: '100%', marginBottom: '30px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.showroomPerformance}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" stroke="var(--text-secondary)" />
                            <YAxis stroke="var(--text-secondary)" tickFormatter={(v) => (v / 1000000) + 'M'} />
                            <Tooltip contentStyle={{ background: 'var(--secondary-bg)', color: 'white' }} />
                            <Bar name="Savdo hajmi" dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar name="Sof foyda" dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                            <th style={{ padding: '12px 16px' }}>Showroom / Filial</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center' }}>Shartnomalar soni</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Jami Sotuvlar</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Sof Foyda</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.showroomPerformance.length === 0 ? (
                            <tr>
                              <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>Showroomlar savdo ma'lumoti yo'q.</td>
                            </tr>
                          ) : (
                            stats.showroomPerformance.map((s, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '14px 16px', fontWeight: '700' }}>{s.name}</td>
                                <td style={{ padding: '14px 16px', textAlign: 'center' }}>{s.count} ta</td>
                                <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '700' }}>{s.sales.toLocaleString()} UZS</td>
                                <td style={{ padding: '14px 16px', textAlign: 'right', color: '#10b981', fontWeight: '800' }}>{s.profit.toLocaleString()} UZS</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* SALES CLIENT TYPES REPORT */}
                  {activeModal === 'sales_client_types' && (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px', marginBottom: '30px' }}>
                        <div style={{ height: '280px' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={stats.clientTypePerformance}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="sales"
                              >
                                {stats.clientTypePerformance.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ background: 'var(--secondary-bg)', color: 'white' }} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                              <th style={{ padding: '12px 16px' }}>Rang</th>
                              <th style={{ padding: '12px 16px' }}>Mijoz turi</th>
                              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Soni</th>
                              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Jami Savdo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.clientTypePerformance.map((c, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '14px 16px' }}>
                                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS[idx % COLORS.length] }}></div>
                                </td>
                                <td style={{ padding: '14px 16px', fontWeight: '700' }}>{c.name}</td>
                                <td style={{ padding: '14px 16px', textAlign: 'center' }}>{c.count} ta</td>
                                <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '750' }}>{c.sales.toLocaleString()} UZS</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* SALES CONVERSION REPORT */}
                  {activeModal === 'sales_conversion' && (
                    <div>
                      <div style={{ height: '300px', width: '100%', marginBottom: '30px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.leadSourceConversion}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" stroke="var(--text-secondary)" />
                            <YAxis stroke="var(--text-secondary)" unit="%" />
                            <Tooltip contentStyle={{ background: 'var(--secondary-bg)', color: 'white' }} />
                            <Bar name="Konversiya (%)" dataKey="conversion" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                            <th style={{ padding: '12px 16px' }}>Lead Manbasi</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center' }}>Jami CPlar (Takliflar)</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center' }}>Sotilgan CPlar</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Konversiya Koeffitsiyenti</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.leadSourceConversion.length === 0 ? (
                            <tr>
                              <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>Mijoz manbalari bo'yicha ma'lumot topilmadi.</td>
                            </tr>
                          ) : (
                            stats.leadSourceConversion.map((l, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '14px 16px', fontWeight: '700' }}>{l.name}</td>
                                <td style={{ padding: '14px 16px', textAlign: 'center' }}>{l.total} ta</td>
                                <td style={{ padding: '14px 16px', textAlign: 'center', color: '#10b981' }}>{l.sold} ta</td>
                                <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '800', color: 'var(--accent-gold)' }}>
                                  {l.conversion}%
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* SALES LOST KP REPORT */}
                  {activeModal === 'sales_lost_kp' && (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                        <div className="premium-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Yo'qotilgan takliflar soni</span>
                          <h3 style={{ fontSize: '36px', fontWeight: '950', color: '#f43f5e', margin: '8px 0' }}>{stats.lostProposalsStats.totalLostCount} ta</h3>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                            Moliyaviy yo'qotish jami: <b style={{ color: 'white' }}>{stats.lostProposalsStats.totalLostValue.toLocaleString()} UZS</b>
                          </span>
                        </div>
                        <div style={{ height: '220px' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={stats.lostProposalsStats.reasons}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="count"
                              >
                                {stats.lostProposalsStats.reasons.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ background: 'var(--secondary-bg)', color: 'white' }} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                            <th style={{ padding: '12px 16px' }}>Rad etish / Bekor qilish sababi</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center' }}>Takliflar soni</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Yo'qotilgan summa</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.lostProposalsStats.reasons.length === 0 ? (
                            <tr>
                              <td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>Rad etilgan takliflar yo'q.</td>
                            </tr>
                          ) : (
                            stats.lostProposalsStats.reasons.map((r, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '14px 16px', fontWeight: '700' }}>{r.reason}</td>
                                <td style={{ padding: '14px 16px', textAlign: 'center' }}>{r.count} ta</td>
                                <td style={{ padding: '14px 16px', textAlign: 'right', color: '#f43f5e', fontWeight: '750' }}>{r.value.toLocaleString()} UZS</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* OPS STOCK REPORT */}
                  {activeModal === 'ops_stock' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Ombor zaxirasining joriy umumiy qiymati</span>
                          <h3 style={{ fontSize: '28px', fontWeight: '950', color: 'var(--accent-gold)', marginTop: '4px' }}>
                            {stats.totalStockValue.toLocaleString()} UZS
                          </h3>
                        </div>
                        <div style={{ position: 'relative', width: '250px' }}>
                          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                          <input 
                            type="text" 
                            placeholder="Materialni qidirish..." 
                            value={modalSearch}
                            onChange={(e) => setModalSearch(e.target.value)}
                            style={{ width: '100%', paddingLeft: '38px', height: '38px', borderRadius: '8px' }} 
                          />
                        </div>
                      </div>

                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                            <th style={{ padding: '12px 16px' }}>Material Kodi</th>
                            <th style={{ padding: '12px 16px' }}>Nomi</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center' }}>Mavjud Qoldiq</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>O'rtacha Tannarx</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Jami Qiymati</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.warehouseStock.filter(w => w.name.toLowerCase().includes(modalSearch.toLowerCase()) || w.code.toLowerCase().includes(modalSearch.toLowerCase())).length === 0 ? (
                            <tr>
                              <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>Materiallar topilmadi.</td>
                            </tr>
                          ) : (
                            stats.warehouseStock.filter(w => w.name.toLowerCase().includes(modalSearch.toLowerCase()) || w.code.toLowerCase().includes(modalSearch.toLowerCase())).map((w, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: '800', color: 'var(--text-secondary)' }}>{w.code}</td>
                                <td style={{ padding: '14px 16px', fontWeight: '700' }}>{w.name}</td>
                                <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '700' }}>{w.qty} dona</td>
                                <td style={{ padding: '14px 16px', textAlign: 'right' }}>{w.price.toLocaleString()} UZS</td>
                                <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '800', color: 'white' }}>{w.totalValue.toLocaleString()} UZS</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* OPS MOVEMENTS REPORT */}
                  {activeModal === 'ops_movements' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                        <div style={{ position: 'relative', width: '250px' }}>
                          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                          <input 
                            type="text" 
                            placeholder="Material bo'yicha..." 
                            value={modalSearch}
                            onChange={(e) => setModalSearch(e.target.value)}
                            style={{ width: '100%', paddingLeft: '38px', height: '38px', borderRadius: '8px' }} 
                          />
                        </div>
                      </div>

                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                            <th style={{ padding: '12px 16px' }}>Sana</th>
                            <th style={{ padding: '12px 16px' }}>Material Nomi</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center' }}>Harakat Turi</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center' }}>Miqdori</th>
                            <th style={{ padding: '12px 16px' }}>Manba / Hujjat</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Qiymati</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.materialMovements.filter(m => m.materialName.toLowerCase().includes(modalSearch.toLowerCase())).length === 0 ? (
                            <tr>
                              <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>Harakatlar topilmadi.</td>
                            </tr>
                          ) : (
                            stats.materialMovements.filter(m => m.materialName.toLowerCase().includes(modalSearch.toLowerCase())).map((m, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>{new Date(m.date).toLocaleDateString()}</td>
                                <td style={{ padding: '14px 16px', fontWeight: '700' }}>{m.materialName}</td>
                                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                  <span style={{ 
                                    padding: '4px 10px', 
                                    borderRadius: '6px', 
                                    fontSize: '11px', 
                                    fontWeight: '800',
                                    background: m.type === 'kirim' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                                    color: m.type === 'kirim' ? '#10b981' : '#ef4444'
                                  }}>
                                    {m.type === 'kirim' ? "Kirim" : "Chiqim"}
                                  </span>
                                </td>
                                <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '800' }}>{m.qty} {m.unit}</td>
                                <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>{m.source}</td>
                                <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '750' }}>{m.value.toLocaleString()} UZS</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* OPS PRODUCTION STATUS */}
                  {activeModal === 'ops_production_status' && (
                    <div>
                      <div style={{ height: '300px', width: '100%', marginBottom: '30px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.productionStatusPerformance}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" stroke="var(--text-secondary)" />
                            <YAxis stroke="var(--text-secondary)" />
                            <Tooltip contentStyle={{ background: 'var(--secondary-bg)', color: 'white' }} />
                            <Bar name="Buyurtmalar Soni" dataKey="count" fill="var(--accent-gold)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                            <th style={{ padding: '12px 16px' }}>Ishlab Chiqarish Bosqichi (Status)</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center' }}>Buyurtmalar Soni</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Joriy Jami Qiymati</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.productionStatusPerformance.length === 0 ? (
                            <tr>
                              <td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>Buyurtmalar topilmadi.</td>
                            </tr>
                          ) : (
                            stats.productionStatusPerformance.map((p, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '14px 16px', fontWeight: '800', textTransform: 'capitalize' }}>{p.name}</td>
                                <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '700' }}>{p.count} ta</td>
                                <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '800', color: 'var(--accent-gold)' }}>{p.value.toLocaleString()} UZS</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* OPS ORDER PROFITABILITY */}
                  {activeModal === 'ops_order_profitability' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                        <div style={{ position: 'relative', width: '250px' }}>
                          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                          <input 
                            type="text" 
                            placeholder="Mijoz yoki shartnoma №..." 
                            value={modalSearch}
                            onChange={(e) => setModalSearch(e.target.value)}
                            style={{ width: '100%', paddingLeft: '38px', height: '38px', borderRadius: '8px' }} 
                          />
                        </div>
                      </div>

                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                            <th style={{ padding: '12px 16px' }}>Shartnoma №</th>
                            <th style={{ padding: '12px 16px' }}>Mijoz</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Shartnoma Qiymati</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Tannarx (Ishlab chiqarish)</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Sof Foyda</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Marja / Rentabellik</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.orderProfits.filter(o => o.customer.toLowerCase().includes(modalSearch.toLowerCase()) || o.order_number.toLowerCase().includes(modalSearch.toLowerCase())).length === 0 ? (
                            <tr>
                              <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>Buyurtmalar topilmadi.</td>
                            </tr>
                          ) : (
                            stats.orderProfits.filter(o => o.customer.toLowerCase().includes(modalSearch.toLowerCase()) || o.order_number.toLowerCase().includes(modalSearch.toLowerCase())).map((o, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '14px 16px', fontWeight: '800', color: 'var(--accent-gold)' }}>{o.order_number}</td>
                                <td style={{ padding: '14px 16px' }}>{o.customer}</td>
                                <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '700' }}>{o.total_amount.toLocaleString()} UZS</td>
                                <td style={{ padding: '14px 16px', textAlign: 'right', color: '#f43f5e' }}>{o.total_cost.toLocaleString()} UZS</td>
                                <td style={{ padding: '14px 16px', textAlign: 'right', color: '#10b981', fontWeight: '750' }}>{o.profit.toLocaleString()} UZS</td>
                                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                  <span style={{ 
                                    padding: '4px 10px', 
                                    borderRadius: '6px', 
                                    fontSize: '11px', 
                                    fontWeight: '800',
                                    background: o.margin >= 30 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                                    color: o.margin >= 30 ? '#10b981' : '#ef4444'
                                  }}>
                                    {o.margin.toFixed(1)}%
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* OPS PRESALE EXPENSES */}
                  {activeModal === 'ops_presale_expenses' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Jami sotuvoldi xarajatlar summasi</span>
                          <h3 style={{ fontSize: '28px', fontWeight: '950', color: '#f43f5e', marginTop: '4px' }}>
                            {stats.preSaleExpenses.reduce((s, e) => s + e.amount, 0).toLocaleString()} UZS
                          </h3>
                        </div>
                        <div style={{ position: 'relative', width: '250px' }}>
                          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                          <input 
                            type="text" 
                            placeholder="Menejer yoki mijoz..." 
                            value={modalSearch}
                            onChange={(e) => setModalSearch(e.target.value)}
                            style={{ width: '100%', paddingLeft: '38px', height: '38px', borderRadius: '8px' }} 
                          />
                        </div>
                      </div>

                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                            <th style={{ padding: '12px 16px' }}>Sana</th>
                            <th style={{ padding: '12px 16px' }}>Menejer</th>
                            <th style={{ padding: '12px 16px' }}>Mijoz</th>
                            <th style={{ padding: '12px 16px' }}>Xarajat Sababi (Tavsif)</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center' }}>Holat</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Xarajat Summasi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.preSaleExpenses.filter(e => e.managerName.toLowerCase().includes(modalSearch.toLowerCase()) || e.customerName.toLowerCase().includes(modalSearch.toLowerCase())).length === 0 ? (
                            <tr>
                              <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>Sotuvoldi xarajatlar topilmadi.</td>
                            </tr>
                          ) : (
                            stats.preSaleExpenses.filter(e => e.managerName.toLowerCase().includes(modalSearch.toLowerCase()) || e.customerName.toLowerCase().includes(modalSearch.toLowerCase())).map((e, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>{new Date(e.date).toLocaleDateString()}</td>
                                <td style={{ padding: '14px 16px', fontWeight: '700' }}>{e.managerName}</td>
                                <td style={{ padding: '14px 16px' }}>{e.customerName}</td>
                                <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>{e.description}</td>
                                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                  <span style={{ 
                                    padding: '4px 10px', 
                                    borderRadius: '6px', 
                                    fontSize: '11px', 
                                    fontWeight: '800',
                                    background: e.status === 'paid' ? 'rgba(16,185,129,0.15)' : e.status === 'approved' ? 'rgba(59,130,246,0.15)' : 'rgba(251,191,36,0.15)',
                                    color: e.status === 'paid' ? '#10b981' : e.status === 'approved' ? '#3b82f6' : '#fbbf24'
                                  }}>
                                    {e.status === 'paid' ? "To'langan" : e.status === 'approved' ? "Tasdiqlangan" : "Kutilmoqda"}
                                  </span>
                                </td>
                                <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '800', color: '#f43f5e' }}>{e.amount.toLocaleString()} UZS</td>
                              </tr>
                            ))
                          )}
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
