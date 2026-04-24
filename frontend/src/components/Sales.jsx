import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, User, Phone, MapPin, 
  Calendar, DollarSign, Package, Clock, 
  CheckCircle2, Send, Trash2, X, 
  ChevronRight, LayoutGrid, List as ListIcon,
  ShoppingBag, PenTool, PieChart as PieChartIcon,
  TrendingUp, ArrowRight, Download, Filter,
  CheckSquare, Square, UploadCloud, MessageSquare, Paperclip
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function Sales() {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, jarayonda, ishlab_chiqarish, topshirilgan, otkaz, mijozlar
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCustModal, setShowCustModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Database States (Mock)
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('erp_orders');
    return saved ? JSON.parse(saved) : [
      { 
        id: 'ORD-1024', 
        mijoz: 'Aliyev Vali', 
        tel: '+998 90 123 45 67', 
        manzil: 'Toshkent sh, Yunusobod 4-kv', 
        tur: 'Oshxona Mebeli', 
        jami: 2500, 
        currency: 'USD', 
        orderDate: '2026-03-25',
        deadline: '2026-04-15', 
        status: 'Jarayonda',
        createdAt: new Date('2026-03-25T10:00:00').toISOString(),
        files: [],
        checks: { konstruksiya: true, rangi: true }
      },
      { 
        id: 'ORD-1025', 
        mijoz: 'Karimova Nargiza', 
        tel: '+998 91 987 65 43', 
        manzil: 'Chilonzor 2-kv, 12-uy', 
        tur: 'Yotoqxona (Spalniy)', 
        jami: 12000000, 
        currency: 'UZS', 
        orderDate: '2026-03-20',
        deadline: '2026-04-10', 
        status: 'Ishlab Chiqarish',
        createdAt: new Date('2026-03-20T14:30:00').toISOString(),
        files: [],
        checks: { konstruksiya: true, rangi: true, furnitura: true }
      }
    ];
  });

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('erp_customers');
    return saved ? JSON.parse(saved) : [
      { id: 'CUST-001', name: 'Aliyev Vali', phone: '+998 90 123 45 67', address: 'Toshkent sh, Yunusobod 4-kv', createdAt: '2026-01-10' },
      { id: 'CUST-002', name: 'Karimova Nargiza', phone: '+998 91 987 65 43', address: 'Chilonzor 2-kv, 12-uy', createdAt: '2026-02-15' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('erp_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('erp_customers', JSON.stringify(customers));
  }, [customers]);

  // Form States
  const [formData, setFormData] = useState({
    customerId: '',
    mijoz: '',
    tel: '',
    manzil: '',
    tur: '',
    jami: '',
    currency: 'USD',
    srok: '',
    orderDate: new Date().toISOString().split('T')[0],
    izoh: '',
    files: []
  });

  const [mijozSearch, setMijozSearch] = useState('');
  const [showCustDropdown, setShowCustDropdown] = useState(false);
  const [checks, setChecks] = useState({
    konstruksiya: false, rangi: false, furnitura: false, dizayn3d: false
  });

  const checkLabels = {
    konstruksiya: 'Konstruksiya chizmasi',
    rangi: 'Rangi tasdiqlandi',
    furnitura: 'Furnitura tanlandi',
    dizayn3d: '3D Dizayn tayyor'
  };

  // Helper Functions
  const formatWithSpaces = (num) => num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") : "0";
  
  const getDaysLeft = (deadline) => {
    const diff = new Date(deadline) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const updateStatus = (id, newStatus) => {
    if (!window.confirm(`Buyurtma holatini "${newStatus}" ga o'zgartirmoqchimisiz?`)) return;
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    const deadlineDate = new Date(formData.orderDate);
    deadlineDate.setDate(deadlineDate.getDate() + parseInt(formData.srok || 0));
    
    const newOrder = {
      ...formData,
      id: `ORD-${1026 + orders.length}`,
      deadline: deadlineDate.toISOString().split('T')[0],
      status: 'Jarayonda',
      createdAt: new Date().toISOString(),
      checks: { ...checks }
    };

    setOrders([newOrder, ...orders]);
    setShowOrderModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setFormData({ customerId: '', mijoz: '', tel: '', manzil: '', tur: '', jami: '', currency: 'USD', srok: '', orderDate: new Date().toISOString().split('T')[0], izoh: '', files: [] });
    setMijozSearch('');
  };

  // Pie Chart Data
  const chartData = [
    { name: 'Jarayonda', value: orders.filter(o => o.status === 'Jarayonda').length, color: '#6366f1' },
    { name: 'Ishlab Chiqarish', value: orders.filter(o => o.status === 'Ishlab Chiqarish').length, color: '#10b981' },
    { name: 'Topshirilgan', value: orders.filter(o => o.status === 'Topshirilgan').length, color: '#1e293b' },
    { name: 'Otkaz', value: orders.filter(o => o.status === 'Otkaz').length, color: '#f43f5e' }
  ].filter(d => d.value > 0);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(mijozSearch.toLowerCase()) || 
    c.phone.includes(mijozSearch)
  );

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col gap-4 animate-in fade-in duration-500">
      
      {/* Header & Navigation */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-wrap justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <ShoppingBag size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Savdo Markazi</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Buyurtmalar Boshqaruvi</p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 overflow-x-auto custom-scrollbar">
          {[
            { id: 'dashboard', label: 'Statistika', icon: <PieChartIcon size={16} /> },
            { id: 'jarayonda', label: 'Jarayonda', icon: <Clock size={16} /> },
            { id: 'ishlab_chiqarish', label: 'Ishlab Chiqarish', icon: <PenTool size={16} /> },
            { id: 'topshirilgan', label: 'Topshirilgan', icon: <CheckCircle2 size={16} /> },
            { id: 'otkaz', label: 'Otkaz', icon: <X size={16} /> },
            { id: 'mijozlar', label: 'Mijozlar', icon: <User size={16} /> }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <button 
          onClick={() => setShowOrderModal(true)}
          className="bg-indigo-600 hover:bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95"
        >
          <Plus size={18} /> YANGI BUYURTMA
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        
        {/* DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="h-full grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar pr-1">
            <div className="col-span-1 md:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[400px]">
              <h3 className="text-lg font-black text-slate-800 mb-8 uppercase tracking-widest">Umumiy Holat</h3>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-1">Jarayonda</h4>
                <p className="text-4xl font-black">{formatWithSpaces(orders.filter(o => o.status === 'Jarayonda').reduce((acc, o) => acc + o.jami, 0))} <span className="text-sm font-bold opacity-60">UZS eq.</span></p>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold">
                  <span className="bg-white/20 px-2 py-1 rounded-lg">{orders.filter(o => o.status === 'Jarayonda').length} ta buyurtma</span>
                </div>
              </div>

              <div className="bg-emerald-500 p-8 rounded-[2rem] text-white shadow-xl shadow-emerald-100">
                <h4 className="text-xs font-bold text-emerald-100 uppercase tracking-widest mb-1">Topshirildi</h4>
                <p className="text-4xl font-black">{formatWithSpaces(orders.filter(o => o.status === 'Topshirilgan').reduce((acc, o) => acc + o.jami, 0))} <span className="text-sm font-bold opacity-60">UZS eq.</span></p>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold">
                  <span className="bg-white/20 px-2 py-1 rounded-lg">{orders.filter(o => o.status === 'Topshirilgan').length} ta yakunlangan</span>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Eng so'nggi harakat</h4>
                {orders.length > 0 ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{orders[0].mijoz}</p>
                      <p className="text-[10px] font-bold text-slate-400">{orders[0].tur}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs font-bold text-slate-300 italic">Ma'lumot yo'q</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* LIST VIEWS (Jarayonda, Ishlab Chiqarish, Topshirilgan, Otkaz) */}
        {['jarayonda', 'ishlab_chiqarish', 'topshirilgan', 'otkaz'].includes(activeTab) && (
          <div className="h-full bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  activeTab === 'jarayonda' ? 'bg-indigo-500' : 
                  activeTab === 'ishlab_chiqarish' ? 'bg-emerald-500' :
                  activeTab === 'topshirilgan' ? 'bg-slate-800' : 'bg-rose-500'
                }`}></div>
                {activeTab.replace('_', ' ')}
              </h3>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <Search size={14} className="text-slate-400" />
                <input type="text" placeholder="Qidirish..." className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 w-32" />
              </div>
            </div>

            <div className="flex-1 overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Mijoz / Tel</th>
                    <th className="px-6 py-4">Manzil</th>
                    <th className="px-6 py-4">Mebel / Sana</th>
                    <th className="px-6 py-4">Muddat / Srok</th>
                    <th className="px-6 py-4 text-right">Summa</th>
                    <th className="px-6 py-4 text-center">Harakat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.filter(o => o.status.toLowerCase().replace(' ', '_') === activeTab).map(order => {
                    const daysLeft = getDaysLeft(order.deadline);
                    const isLate = daysLeft < 0;
                    const isWarning = daysLeft >= 0 && daysLeft <= 3;

                    return (
                      <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
                        <td className="px-6 py-5">
                          <span className="text-[11px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg">#{order.id}</span>
                        </td>
                        <td className="px-6 py-5">
                          <div>
                            <p className="text-sm font-black text-slate-800 leading-none mb-1">{order.mijoz}</p>
                            <p className="text-[10px] font-bold text-slate-400">{order.tel}</p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-xs font-medium text-slate-600 max-w-[200px] truncate">{order.manzil}</p>
                        </td>
                        <td className="px-6 py-5">
                          <div>
                            <p className="text-xs font-bold text-slate-700 leading-none mb-1">{order.tur}</p>
                            <p className="text-[10px] font-bold text-slate-400">{order.orderDate}</p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className={`flex flex-col ${isLate ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-slate-800'}`}>
                            <span className="text-[11px] font-black">{order.deadline}</span>
                            <span className="text-[10px] font-bold opacity-70">
                              {isLate ? `Srok o'tgan (${Math.abs(daysLeft)} kun)` : `${daysLeft} kun qoldi`}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <p className="text-sm font-black text-slate-900">{formatWithSpaces(order.jami)} <span className="text-[10px] opacity-40">{order.currency}</span></p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-center gap-2">
                             {activeTab === 'jarayonda' && (
                               <button onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'Ishlab Chiqarish'); }} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                                 <ArrowRight size={14} strokeWidth={3} />
                               </button>
                             )}
                             {activeTab === 'ishlab_chiqarish' && (
                               <button onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'Topshirilgan'); }} className="p-2 bg-slate-900 text-white rounded-xl hover:bg-black transition-all shadow-sm">
                                 <CheckCircle2 size={14} strokeWidth={3} />
                               </button>
                             )}
                             <button onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'Otkaz'); }} className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                               <X size={14} strokeWidth={3} />
                             </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MIJOZLAR VIEW */}
        {activeTab === 'mijozlar' && (
          <div className="h-full bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                <User className="text-indigo-600" /> Mijozlar Bazasi
              </h3>
              <button onClick={() => setShowCustModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-emerald-100 transition-all active:scale-95">
                + YANGI MIJOZ
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customers.map(c => (
                  <div key={c.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-indigo-200 hover:bg-white transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm border border-slate-100">
                        <User size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">{c.id}</p>
                        <h4 className="font-black text-slate-800">{c.name}</h4>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-500 flex items-center gap-2"><Phone size={14} className="text-slate-300" /> {c.phone}</p>
                      <p className="text-[11px] font-medium text-slate-400 flex items-start gap-2"><MapPin size={14} className="text-slate-300 mt-0.5 shrink-0" /> {c.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MODALS SECTION */}

      {/* NEW ORDER MODAL */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
          <form onSubmit={handleOrderSubmit} className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Yangi Buyurtma</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Ma'lumotlarni kiriting</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowOrderModal(false)} className="w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8 bg-slate-50/50">
              {/* Customer Search Section */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} /> Mijozni tanlang
                </h4>
                <div className="relative">
                   <div className="relative group">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                     <input 
                       type="text" 
                       placeholder="Mijoz ismi yoki telefon raqami..." 
                       value={mijozSearch}
                       onChange={e => { setMijozSearch(e.target.value); setShowCustDropdown(true); }}
                       onFocus={() => setShowCustDropdown(true)}
                       className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all font-bold text-slate-700"
                     />
                   </div>

                   {showCustDropdown && (mijozSearch || filteredCustomers.length > 0) && (
                     <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-20">
                        {filteredCustomers.length > 0 ? (
                          <div className="max-h-60 overflow-y-auto custom-scrollbar">
                            {filteredCustomers.map(c => (
                              <button 
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, customerId: c.id, mijoz: c.name, tel: c.phone, manzil: c.address });
                                  setMijozSearch(c.name);
                                  setShowCustDropdown(false);
                                }}
                                className="w-full p-4 flex items-center justify-between hover:bg-indigo-50 transition-colors text-left border-b border-slate-50 last:border-none"
                              >
                                <div>
                                  <p className="font-black text-slate-800 text-sm">{c.name}</p>
                                  <p className="text-[10px] font-bold text-slate-400">{c.phone}</p>
                                </div>
                                <ArrowRight size={14} className="text-indigo-300" />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 text-center">
                            <p className="text-xs font-bold text-slate-400 mb-4 italic">Bazada bunday mijoz topilmadi</p>
                            <button 
                              type="button" 
                              onClick={() => { setShowCustModal(true); setShowCustDropdown(false); }}
                              className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100"
                            >
                              + YANGI MIJOZ QO'SHISH
                            </button>
                          </div>
                        )}
                     </div>
                   )}
                </div>

                {formData.mijoz && (
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-start gap-4 animate-in zoom-in-95">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                      <CheckCircle2 size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-black text-emerald-800">{formData.mijoz}</p>
                        <button type="button" onClick={() => { setFormData({...formData, mijoz: '', customerId: ''}); setMijozSearch(''); }} className="text-[10px] font-black text-rose-500 uppercase">Bekor qilish</button>
                      </div>
                      <p className="text-[11px] font-bold text-emerald-600/70 leading-relaxed italic">{formData.manzil}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div className="col-span-1 md:col-span-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <Package size={14} /> Buyurtma Tafsilotlari
                  </h4>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Mebel Turi</label>
                  <div className="relative group">
                    <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <select 
                      required
                      value={formData.tur}
                      onChange={e => setFormData({...formData, tur: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                    >
                      <option value="">Tanlang...</option>
                      {["Oshxona Mebeli", "Yotoqxona (Spalniy)", "Garderob", "Ofis Mebeli", "Bolalar Mebeli", "Boshqa"].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Buyurtma Sanasi</label>
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                      <input 
                        type="date" 
                        required
                        value={formData.orderDate}
                        onChange={e => setFormData({...formData, orderDate: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all font-bold text-slate-700"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Muddat (Kun)</label>
                    <div className="relative group">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                      <input 
                        type="number" 
                        placeholder="Kunlar"
                        required
                        value={formData.srok}
                        onChange={e => setFormData({...formData, srok: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all font-bold text-slate-700"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Summa</label>
                  <div className="relative group flex">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input 
                      type="number" 
                      placeholder="Kelishilgan narx"
                      required
                      value={formData.jami}
                      onChange={e => setFormData({...formData, jami: e.target.value})}
                      className="w-full pl-12 pr-24 py-4 bg-white border border-slate-200 rounded-l-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-600 outline-none transition-all font-bold text-slate-700"
                    />
                    <div className="flex bg-slate-100 border-y border-r border-slate-200 rounded-r-2xl overflow-hidden p-1">
                      <button type="button" onClick={() => setFormData({...formData, currency: 'USD'})} className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all ${formData.currency === 'USD' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>USD</button>
                      <button type="button" onClick={() => setFormData({...formData, currency: 'UZS'})} className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all ${formData.currency === 'UZS' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>UZS</button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <CheckSquare size={14} /> Tasdiqlar (Checklist)
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.keys(checks).map(k => (
                      <button 
                        key={k}
                        type="button"
                        onClick={() => setChecks({...checks, [k]: !checks[k]})}
                        className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${checks[k] ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-100 text-slate-400'}`}
                      >
                        {checks[k] ? <CheckSquare size={16} /> : <Square size={16} />}
                        <span className="text-[11px] font-bold">{checkLabels[k]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
               <button 
                type="submit" 
                className="bg-indigo-600 hover:bg-slate-900 text-white px-12 py-5 rounded-3xl font-black text-sm flex items-center gap-4 shadow-2xl shadow-indigo-100 transition-all active:scale-[0.98] group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform"></div>
                BUYURTMANI TASDIQLASH <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SELECTED ORDER DETAIL VIEW */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                  <Search size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Buyurtma Detallari</h3>
                  <p className="text-indigo-600 text-[10px] font-black uppercase tracking-widest leading-none mt-1">#{selectedOrder.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Client & Order Info */}
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2 mb-4">Mijoz Profili</h4>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                        <User size={28} />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-800 leading-none">{selectedOrder.mijoz}</h4>
                        <p className="text-xs font-bold text-slate-400 mt-2 flex items-center gap-2"><Phone size={14} /> {selectedOrder.tel}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50">
                      <p className="text-xs font-bold text-slate-500 flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0" /> {selectedOrder.manzil}</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2 mb-4">Mahsulot va Vaqt</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Mebel Turi</p>
                        <p className="text-sm font-black text-slate-800">{selectedOrder.tur}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Status</p>
                        <p className="text-sm font-black text-indigo-600">{selectedOrder.status}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Qabul Sanasi</p>
                        <p className="text-sm font-black text-slate-800">{selectedOrder.orderDate}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Topshirish</p>
                        <p className="text-sm font-black text-rose-600">{selectedOrder.deadline}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Finance & Checklist */}
                <div className="space-y-6">
                  <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>
                    <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2 relative z-10">Umumiy Kelishilgan Summa</h4>
                    <p className="text-4xl font-black relative z-10">{formatWithSpaces(selectedOrder.jami)} <span className="text-lg opacity-40">{selectedOrder.currency}</span></p>
                    <div className="mt-8 pt-8 border-t border-white/10 relative z-10 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center">
                          <DollarSign size={16} />
                        </div>
                        <span className="text-[10px] font-bold text-white/60">Tizimda saqlandi</span>
                      </div>
                      <span className="text-[11px] font-black bg-white/10 px-3 py-1.5 rounded-xl uppercase tracking-widest">Kassa OK</span>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2 mb-4">Tasdiqlar (Checklist)</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.keys(selectedOrder.checks).map(k => (
                        <div key={k} className={`p-3 rounded-2xl border flex items-center gap-3 ${selectedOrder.checks[k] ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-400 opacity-50'}`}>
                          {selectedOrder.checks[k] ? <CheckSquare size={16} /> : <Square size={16} />}
                          <span className="text-[11px] font-bold">{checkLabels[k]}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedOrder.izoh && (
                    <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 space-y-2">
                       <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare size={14} /> Menejer Izohi
                      </h4>
                      <p className="text-xs font-bold text-amber-900 leading-relaxed italic">{selectedOrder.izoh}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-white flex justify-between items-center shrink-0">
               {/* 3 Minute Rule Check for Editing (Mock) */}
               <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Clock size={14} /> Tahrirlash ochiq
               </div>
               <div className="flex gap-4">
                  <button className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-8 py-4 rounded-2xl font-black text-xs transition-all flex items-center gap-2">
                    <Download size={18} /> SHARTNOMA YUKLASH
                  </button>
                  <button className="bg-indigo-600 hover:bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs shadow-lg shadow-indigo-100 transition-all flex items-center gap-2">
                    <PenTool size={18} /> TAHRIRLASH
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW CUSTOMER MODAL */}
      {showCustModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
           <form 
            onSubmit={(e) => {
              e.preventDefault();
              const newCust = {
                id: `CUST-00${customers.length + 1}`,
                name: e.target.name.value,
                phone: e.target.phone.value,
                address: e.target.address.value,
                createdAt: new Date().toISOString().split('T')[0]
              };
              setCustomers([...customers, newCust]);
              setShowCustModal(false);
              setMijozSearch(newCust.name);
              setFormData({...formData, customerId: newCust.id, mijoz: newCust.name, tel: newCust.phone, manzil: newCust.address});
            }} 
            className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 overflow-hidden border border-slate-100"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Yangi Mijoz Qo'shish</h3>
              <button type="button" onClick={() => setShowCustModal(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Mijoz Ismi</label>
                <input name="name" required type="text" placeholder="Masalan: Aziz Rahimov" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-600 outline-none transition-all font-bold text-slate-700" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Telefon Raqami</label>
                <input name="phone" required type="tel" placeholder="+998 90 123 45 67" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-600 outline-none transition-all font-bold text-slate-700" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Aniq Manzil</label>
                <textarea name="address" required placeholder="Tuman, ko'cha, uy, kvartira..." className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-600 outline-none transition-all font-bold text-slate-700 min-h-[100px] resize-none" />
              </div>
            </div>

            <button type="submit" className="w-full py-5 bg-emerald-600 hover:bg-slate-900 text-white font-black rounded-3xl transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 mt-8">
              SAQLASH VA DAVOM ETISH
            </button>
          </form>
        </div>
      )}

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-20 duration-500">
          <div className="bg-emerald-600 text-white px-10 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 border border-white/20">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shadow-inner">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="font-black text-sm tracking-tight">Buyurtma Saqlandi!</p>
              <p className="text-[10px] font-medium opacity-80">Konveyerga muvaffaqiyatli qo'shildi.</p>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />
    </div>
  );
}
