import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, Plus, Search, FileUp, FileCheck, CheckSquare, Briefcase,
  Send, X, Check, MapPin, Phone, User, Users, ChevronDown, 
  Store, Smartphone, File as FileIcon, UserPlus, Calendar, Info,
  Edit, Trash2, Eye, Trash, ZoomIn, Clock, ArrowRight, MoreHorizontal,
  GripVertical, FileText, ArrowLeft, Calculator, Building, Upload, Download, MessageSquare, History, Tag, Activity, Lock, ShoppingBag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import KPModal from './KPModal';
import api from '../../utils/api';

// --- Constants ---
const DEAL_STAGES = [
  { id: 'yangi', title: 'Yangi mijoz ✨', color: '#fbbf24', bg: 'rgba(251,191,36,0.05)' },
  { id: 'uchrashuv', title: 'Uchrashuv 🤝', color: '#3b82f6', bg: 'rgba(59,130,246,0.05)' },
  { id: 'kp_yuborildi', title: 'KP yuborildi 📩', color: '#8b5cf6', bg: 'rgba(139,92,246,0.05)' },
  { id: 'prezentatsiya', title: 'Prezentatsiya 📽️', color: '#ec4899', bg: 'rgba(236,72,153,0.05)' },
  { id: 'oylayabdi', title: 'O\'ylayabdi 🤔', color: '#94a3b8', bg: 'rgba(148,163,184,0.05)' },
  { id: 'shartnoma', title: 'Shartnoma ✍️', color: '#10b981', bg: 'rgba(16,185,129,0.05)' },
];

const ORDER_STAGES = [
  { id: 'tasdiqlandi', title: 'Tasdiqlandi ✅', color: '#0ea5e9', bg: 'rgba(14,165,233,0.05)' },
  { id: 'pm', title: 'PM ga o\'tkazildi ⚙️', color: '#f59e0b', bg: 'rgba(245,158,11,0.05)' },
  { id: 'kontrol_zamer', title: 'O\'lchov jarayonida 📏', color: '#3b82f6', bg: 'rgba(59,130,246,0.05)' },
  { id: 'chizma_chizish', title: 'Chizma chizish ✏️', color: '#8b5cf6', bg: 'rgba(139,92,246,0.05)' },
  { id: 'chizma_tasdiqlash', title: 'Chizma tasdiqlash 📋', color: '#ec4899', bg: 'rgba(236,72,153,0.05)' },
  { id: 'ishlab_chiqarishda', title: 'Ishlab chiqarishda 🏗️', color: '#ef4444', bg: 'rgba(239,68,68,0.05)' },
  { id: 'ombor', title: 'Omborda 📦', color: '#6366f1', bg: 'rgba(99,102,241,0.05)' },
  { id: 'ornatish', title: 'O\'rnatishda 🚚', color: '#a855f7', bg: 'rgba(168,85,247,0.05)' },
  { id: 'tayyor', title: 'Mijozga topshirishga tayyor 🎁', color: '#f59e0b', bg: 'rgba(245,158,11,0.05)' },
  { id: 'bajarildi', title: 'Bajarildi 🎉', color: '#22c55e', bg: 'rgba(34,197,94,0.05)' },
];

const STAGES = [...DEAL_STAGES, ...ORDER_STAGES];
const LOCKED_STAGES = ['tasdiqlandi', 'pm', 'ishlab_chiqarishda', 'ombor', 'ornatish', 'bajarildi', 'yopildi'];

const PROPERTY_TYPES = [
  { label: 'Hovli', value: 'hovli' },
  { label: 'Dom', value: 'dom' },
  { label: 'Ofis', value: 'ofis' }
];

const CHECKLIST_LABELS = {
  design3d: '3D Dizayn',
  construction: 'Konstruksiya',
  color: 'Rang',
  handle: 'Ruchka',
  materials: 'Materiallar'
};

const SOURCE_OPTIONS = [
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'facebook', label: 'Facebook', icon: '👥' },
  { value: 'tanish', label: 'Tanish orqali', icon: '🤝' },
  { value: 'tavsiya', label: 'Tavsiya orqali', icon: '⭐️' },
  { value: 'agent', label: 'Agentlar orqali', icon: '🏢' },
];

// --- Formatters ---
const formatAmount = (val) => {
  if (val === undefined || val === null || val === "" || val === 0) return "";
  const num = val.toString().replace(/\D/g, "");
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const formatPhone = (val) => {
  if (!val) return "+998 ";
  let v = val.replace(/\D/g, "");
  if (!v.startsWith("998")) v = "998" + v;
  v = v.substring(0, 12);
  let res = "+";
  if (v.length > 0) res += v.substring(0, 3);
  if (v.length > 3) res += " " + v.substring(3, 5);
  if (v.length > 5) res += " " + v.substring(5, 8);
  if (v.length > 8) res += " " + v.substring(8, 10);
  if (v.length > 10) res += " " + v.substring(10, 12);
  return res;
};

const getDeliveryStatus = (deliveryDate) => {
  if (!deliveryDate) return { color: 'var(--text-secondary)', text: 'Belgilanmagan', bg: 'rgba(255,255,255,0.05)', label: 'Sana yo\'q' };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(deliveryDate);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { color: '#ef4444', text: deliveryDate, bg: 'rgba(239,68,68,0.1)', label: 'Muddati o\'tgan' };
  if (diffDays <= 3) return { color: '#f59e0b', text: deliveryDate, bg: 'rgba(245,158,11,0.1)', label: 'Yaqin qoldi' };
  return { color: '#10b981', text: deliveryDate, bg: 'rgba(16,185,129,0.1)', label: 'Vaqt bor' };
};

// --- Components ---
const Lbl = ({ children }) => (
  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
    {children}
  </label>
);

const IconInput = ({ icon: Icon, ...props }) => (
  <div style={{ position: 'relative' }}>
    <Icon size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
    <input {...props} style={{ width: '100%', paddingLeft: '40px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', height: '48px', color: 'white', fontSize: '14px', ...(props.style || {}) }} />
  </div>
);

// --- FileManagerModal ---
const FileManagerModal = ({ type, files, onClose, onRemove, onAdd, readOnly }) => {
  const fileInputRef = useRef(null);
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files).map(f => ({
      name: f.name, size: f.size, type: f.type, url: URL.createObjectURL(f), uploadedAt: new Date().toISOString()
    }));
    onAdd(newFiles);
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(15px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 4000 }}>
      <div className="premium-card" style={{ width: '600px', padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div><h3 style={{ fontSize: '24px', fontWeight: '900' }}>{type === 'kp' ? 'KP Fayllari' : 'Dizayn Fayllari'}</h3><p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Hujjatlarni yuklang va boshqaring.</p></div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '50%' }}><X /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', maxHeight: '400px', overflowY: 'auto', marginBottom: '32px', paddingRight: '10px' }}>
          {files.length === 0 ? (<div style={{ gridColumn: 'span 2', padding: '60px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '20px', color: 'var(--text-secondary)' }}><Upload size={32} style={{ opacity: 0.2, marginBottom: '12px' }} /><p>Fayllar mavjud emas</p></div>) : 
            files.map((file, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '16px', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(251,191,36,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)' }}><FileText size={20} /></div><div style={{ overflow: 'hidden', flex: 1 }}><p style={{ fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</p><p style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p></div></div>
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '4px' }}>
                  <button onClick={() => window.open(file.url, '_blank')} style={{ color: 'var(--accent-gold)', background: 'rgba(251, 191, 36, 0.1)', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Ko'rish"><Eye size={14} /></button>
                  {!readOnly && <button onClick={() => onRemove(idx)} style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="O'chirish"><Trash2 size={14} /></button>}
                </div>
              </div>
            ))
          }
        </div>
        <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
        <div style={{ display: 'flex', gap: '12px' }}>
            {!readOnly && <button onClick={() => fileInputRef.current.click()} className="gold-btn" style={{ flex: 1, height: '54px', justifyContent: 'center' }}><Plus size={20} /> Fayl Qo'shish</button>}
            <button onClick={onClose} className="secondary-btn" style={{ flex: 1, height: '54px' }}>Yopish</button>
        </div>
      </div>
    </div>
  );
};

// --- Modals ---
const AgentModal = ({ onClose, onSaved }) => {
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '+998 ', firm: '' });
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => { const { name, value } = e.target; setForm({ ...form, [name]: name === 'phone' ? formatPhone(value) : value }); };
  const handleSave = async (e) => { 
    e.preventDefault(); 
    setLoading(true);
    try {
      await api.post('/customers', { ...form, type: 'agent' });
      if (onSaved) onSaved(); 
      onClose(); 
    } catch (err) {
      console.error("Agent save error", err);
      alert("Agentni saqlashda xatolik: " + (err.response?.data?.message || err.message));
    }
    setLoading(false);
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
      <div className="premium-card" style={{ width: '450px', padding: '32px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>Yangi Agent Qo'shish</h3>
        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div><Lbl>Ism</Lbl><input name="firstName" value={form.firstName} onChange={handleChange} required autoComplete="off" style={{ width: '100%', height: '44px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '10px', padding: '0 12px' }} /></div>
            <div><Lbl>Familiya</Lbl><input name="lastName" value={form.lastName} onChange={handleChange} required autoComplete="off" style={{ width: '100%', height: '44px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '10px', padding: '0 12px' }} /></div>
            <div><Lbl>Telefon</Lbl><input name="phone" value={form.phone} onChange={handleChange} required autoComplete="off" style={{ width: '100%', height: '44px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '10px', padding: '0 12px' }} /></div>
            <div><Lbl>Firma (Agar bo'lsa)</Lbl><input name="firm" value={form.firm} onChange={handleChange} autoComplete="off" style={{ width: '100%', height: '44px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '10px', padding: '0 12px' }} /></div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '32px' }}>
            <button type="button" onClick={onClose} className="secondary-btn" style={{ flex: 1, height: '48px' }} disabled={loading}>Bekor qilish</button>
            <button type="submit" className="gold-btn" style={{ flex: 1, height: '48px', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CustomerModal = ({ onClose, onSaved, user }) => {
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '+998 ', address: '', propertyType: 'kvartira', age: '', gender: 'erkak', source: '', selectedAgent: null });
  const [agentSearch, setAgentSearch] = useState('');
  const [agentSuggestions, setAgentSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => { const { name, value } = e.target; setForm({ ...form, [name]: name === 'phone' ? formatPhone(value) : value }); };
  
  useEffect(() => { 
    const searchAgents = async () => {
      if (form.source === 'agent' && agentSearch.length > 1) { 
        try {
          const res = await api.get('/customers', { params: { type: 'agent', search: agentSearch } });
          setAgentSuggestions(res.data);
        } catch (err) {
          console.error("Search agents error", err);
        }
      } else setAgentSuggestions([]); 
    };
    searchAgents();
  }, [agentSearch, form.source]);

  const handleSave = async (e) => { 
    e.preventDefault(); 
    setLoading(true);
    try {
      await api.post('/customers', { ...form, type: 'customer' });
      if (onSaved) onSaved(); 
      onClose(); 
    } catch (err) {
      console.error("Customer save error", err);
      alert("Mijozni saqlashda xatolik: " + (err.response?.data?.message || err.message));
    }
    setLoading(false);
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1500 }}>
      <div className="premium-card" style={{ width: '1000px', padding: '48px', maxHeight: '92vh', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '40px' }}>Yangi Mijoz Qo'shish</h3>
        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div><Lbl>Ism</Lbl><input name="firstName" value={form.firstName} onChange={handleChange} required autoComplete="off" style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px' }} /></div>
              <div><Lbl>Familiya</Lbl><input name="lastName" value={form.lastName} onChange={handleChange} required autoComplete="off" style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px' }} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '24px' }}>
              <div><Lbl>Telefon</Lbl><input name="phone" value={form.phone} onChange={handleChange} required autoComplete="off" style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px' }} /></div>
              <div><Lbl>Yoshi</Lbl><input name="age" type="number" value={form.age} onChange={handleChange} autoComplete="off" style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px' }} /></div>
              <div><Lbl>Jinsi</Lbl><div style={{ display: 'flex', gap: '8px' }}>{['erkak', 'ayol'].map(g => (<button key={g} type="button" onClick={() => setForm({...form, gender: g})} style={{ flex: 1, height: '54px', borderRadius: '12px', background: form.gender === g ? 'var(--accent-gold)' : 'rgba(255,255,255,0.03)', color: g === form.gender ? 'black' : 'white', border: '1px solid var(--border-color)', fontWeight: '700' }}>{g}</button>))}</div></div>
            </div>
            <div><Lbl>Manzil</Lbl><input name="address" value={form.address} onChange={handleChange} required autoComplete="off" style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px' }} /></div>
            
            <div>
              <Lbl>Uy Turi</Lbl>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {PROPERTY_TYPES.map(pt => (
                  <button 
                    key={pt.value} 
                    type="button" 
                    onClick={() => setForm({...form, propertyType: pt.value})} 
                    style={{ height: '54px', borderRadius: '12px', background: form.propertyType === pt.value ? 'var(--accent-gold)' : 'rgba(255,255,255,0.03)', color: pt.value === form.propertyType ? 'black' : 'white', border: '1px solid var(--border-color)', fontSize: '14px', fontWeight: '700' }}
                  >
                    {pt.label}
                  </button>
                ))}
              </div>
            </div>
            <div><Lbl>Platforma</Lbl><div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>{SOURCE_OPTIONS.map(opt => (<button key={opt.value} type="button" onClick={() => setForm({...form, source: opt.value})} style={{ height: '60px', borderRadius: '12px', background: form.source === opt.value ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${form.source === opt.value ? 'var(--accent-gold)' : 'var(--border-color)'}`, color: opt.value === form.source ? 'var(--accent-gold)' : 'white', fontSize: '12px', fontWeight: '800' }}>{opt.label}</button>))}</div></div>
            {form.source === 'agent' && (
              <div style={{ position: 'relative' }}>
                <Lbl>Agent Qidirish</Lbl><IconInput icon={Search} value={agentSearch} onChange={e => setAgentSearch(e.target.value)} placeholder="Agent ismi..." autoComplete="off" style={{ height: '54px' }} />
                {agentSuggestions.length > 0 && (<div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: '#1a1a2e', zIndex: 100, border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>{agentSuggestions.map(a => <div key={a._id} onClick={() => { setForm({...form, selectedAgent: a}); setAgentSearch(`${a.firstName} ${a.lastName}`); setAgentSuggestions([]); }} style={{ padding: '15px 20px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{a.firstName} {a.lastName}</div>)}</div>)}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '54px' }}>
            <button type="button" onClick={onClose} className="secondary-btn" style={{ flex: 1, height: '60px' }} disabled={loading}>Bekor Qilish</button>
            <button type="submit" className="gold-btn" style={{ flex: 1, height: '60px', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Component ---
const Orders = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [allOrders, setAllOrders] = useState(() => JSON.parse(localStorage.getItem('erp_orders') || '[]'));
  const [customers, setCustomers] = useState(() => JSON.parse(localStorage.getItem('erp_customers') || '[]'));
  const [currentView, setCurrentView] = useState(() => {
    if (location.pathname.includes('archive')) return 'archive';
    return 'kanban';
  });

  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'day', 'month', 'year'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (location.pathname.includes('archive')) {
      setCurrentView('archive');
    } else {
      setCurrentView('kanban');
    }
  }, [location.pathname]);

  const [searchTerm, setSearchTerm] = useState('');
  
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [isKPModalOpen, setIsKPModalOpen] = useState(false);
  const [fileManager, setFileManager] = useState({ isOpen: false, type: 'kp', files: [], orderId: null });
  const [editingId, setEditingId] = useState(null);
  const [contextMenu, setContextMenu] = useState({ isOpen: false, x: 0, y: 0, orderId: null, isLocked: false });

  const emptyOrder = { 
    customerSearch: '', selectedCustomer: null, amount: '', currency: 'UZS', exchangeRate: localStorage.getItem('erp_last_rate') || '', 
    propertyType: 'kvartira', orderDate: new Date().toISOString().split('T')[0], deliveryDate: '', durationDays: '',
    kpFiles: [], designFiles: [], checklist: { design3d: false, construction: false, color: false, handle: false, materials: false }, 
    status: 'yangi', description: '', timeline: [] 
  };

  const [newOrder, setNewOrder] = useState(emptyOrder);
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [commentText, setCommentText] = useState('');
  
  const timelineEndRef = useRef(null);

  const scrollToBottom = () => { if (timelineEndRef.current) { timelineEndRef.current.scrollIntoView({ behavior: 'smooth' }); } };
  
  useEffect(() => {
    if (isOrderModalOpen) {
      const timer = setTimeout(() => scrollToBottom(), 150);
      return () => clearTimeout(timer);
    }
  }, [isOrderModalOpen, newOrder.timeline]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ordersRes, customersRes] = await Promise.all([
          api.get('/orders'),
          api.get('/customers')
        ]);
        setAllOrders(ordersRes.data);
        setCustomers(customersRes.data);
      } catch (err) {
        console.error("Data load error", err);
      }
    };
    loadData();
    
    const handleStorage = () => { loadData(); };
    window.addEventListener('storage', handleStorage); 
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if (newOrder.orderDate && newOrder.durationDays) {
      const start = new Date(newOrder.orderDate); start.setDate(start.getDate() + parseInt(newOrder.durationDays));
      const calculated = start.toISOString().split('T')[0];
      if (calculated !== newOrder.deliveryDate) { setNewOrder(prev => ({ ...prev, deliveryDate: calculated })); }
    }
  }, [newOrder.orderDate, newOrder.durationDays]);

  useEffect(() => {
    const term = newOrder.customerSearch.toLowerCase();
    const filtered = customers.filter(c => 
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(term) || 
      c.phone.includes(term)
    );
    setCustomerSuggestions(filtered);
    setSelectedIndex(0);
  }, [newOrder.customerSearch, customers]);

  const handleSelectCustomer = (c) => {
    setNewOrder({ ...newOrder, selectedCustomer: c, customerSearch: `${c.firstName} ${c.lastName}` });
    setCustomerSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (customerSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(prev => (prev + 1) % customerSuggestions.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(prev => (prev - 1 + customerSuggestions.length) % customerSuggestions.length); }
    else if (e.key === 'Enter') { e.preventDefault(); handleSelectCustomer(customerSuggestions[selectedIndex]); }
  };

  const filteredOrders = allOrders.filter(o => {
    const matchesUser = user?.role === 'super' || (user?.role === 'showroom' && o.showroom === user.showroom) || (user?.role === 'sotuv_manager' && o.managerId === user.id);
    const matchesSearch = `${o.selectedCustomer?.firstName} ${o.selectedCustomer?.lastName} ${o.uniqueId}`.toLowerCase().includes(searchTerm.toLowerCase());
    const isArchived = o.status === 'yopildi';
    
    if (currentView === 'archive') {
      if (!isArchived) return false;
      if (!matchesUser || !matchesSearch) return false;
      
      if (dateFilter !== 'all') {
        const archLog = o.timeline?.find(l => l?.text?.includes("Arxivlandi"));
        if (!archLog) return false;
        const logDate = new Date(archLog.time);
        const selDate = new Date(selectedDate);
        
        if (dateFilter === 'day') {
          return logDate.toDateString() === selDate.toDateString();
        } else if (dateFilter === 'month') {
          return logDate.getMonth() === selDate.getMonth() && logDate.getFullYear() === selDate.getFullYear();
        } else if (dateFilter === 'year') {
          return logDate.getFullYear() === selDate.getFullYear();
        }
      }
      return true;
    }
    return matchesUser && matchesSearch && !isArchived;
  });

  const handleDragStart = (e, orderId) => { e.dataTransfer.setData('orderId', orderId); e.target.style.opacity = '0.5'; };
  const handleDragEnd = (e) => { e.target.style.opacity = '1'; };
  const handleDragOver = (e) => { e.preventDefault(); };
  const handleDrop = async (e, stageId) => {
    const orderId = e.dataTransfer.getData('orderId');
    const order = allOrders.find(o => o._id === orderId || o.id === Number(orderId));
    if (!order) return;
    
    if (LOCKED_STAGES.includes(order.status)) return alert("Ishlab chiqarishdagi buyurtmani surib bo'lmaydi.");
    if (LOCKED_STAGES.includes(stageId)) return alert("Tasdiqlash bosqichiga o'tkazish faqat Admin tomonidan amalga oshiriladi.");
    
    const prevStage = STAGES.find(s => s.id === order.status)?.title || order.status;
    const nextStage = STAGES.find(s => s.id === stageId)?.title || stageId;
    const log = { type: 'stage', text: `Bosqich o'zgardi: ${prevStage} → ${nextStage}`, time: new Date().toISOString(), user: user.name };
    
    try {
      const res = await api.put(`/orders/${order._id || orderId}`, { 
        status: stageId, 
        timeline: [...(order.timeline || []), log] 
      });
      setAllOrders(allOrders.map(o => o._id === (order._id || orderId) ? res.data : o));
    } catch (err) {
      console.error("Drop error", err);
    }
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const log = { type: 'comment', text: commentText, time: new Date().toISOString(), user: user.name };
    setNewOrder({ ...newOrder, timeline: [...(newOrder.timeline || []), log] });
    setCommentText('');
  };

  const handleCommentKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault(); 
    if (!newOrder.selectedCustomer) return alert('Mijozni tanlang!');
    if (editingId && LOCKED_STAGES.includes(newOrder.status)) return alert("Ishlab chiqarishdagi buyurtma ma'lumotlarini o'zgartirib bo'lmaydi.");
    
    const cleanAmount = newOrder.amount.toString().replace(/\s/g, ''); 
    let finalAmount = Number(cleanAmount);
    const isNew = !editingId;
    
    const log = isNew 
      ? { type: 'system', text: "Buyurtma yaratildi", time: new Date().toISOString(), user: user.name } 
      : { type: 'system', text: "Ma'lumotlar yangilandi", time: new Date().toISOString(), user: user.name };
    
    const payload = { 
      ...newOrder, 
      amount: finalAmount, 
      currency: 'UZS', 
      timeline: [...(newOrder.timeline || []), log] 
    };

    try {
      if (isNew) {
        const res = await api.post('/orders', {
          ...payload,
          uniqueId: `EXP-${allOrders.length + 1001}`
        });
        setAllOrders([...allOrders, res.data]);
      } else {
        const res = await api.put(`/orders/${editingId}`, payload);
        setAllOrders(allOrders.map(o => o._id === editingId ? res.data : o));
      }
      
      setIsOrderModalOpen(false); 
      setEditingId(null); 
      setNewOrder(emptyOrder);
    } catch (err) {
      console.error("Order save error", err);
      alert("Buyurtmani saqlashda xatolik!");
    }
  };

  if (!user) return <div style={{ padding: '40px', textAlign: 'center' }}>Yuklanmoqda...</div>;
  const isOrderLocked = editingId && LOCKED_STAGES.includes(newOrder.status);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {currentView === 'archive' && (
            <button 
              onClick={() => navigate('/sotuv-manager/orders')} 
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '10px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: '900' }}>{currentView === 'archive' ? 'Buyurtmalar Arxivi' : 'CRM kengashi'} <span style={{ color: 'var(--accent-gold)' }}>{currentView === 'archive' ? 'Tarixi' : 'faol'}</span></h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{currentView === 'archive' ? 'Yopilgan buyurtmalar ro\'yxati.' : 'Buyurtmalarni sichqoncha bilan surib boshqaring.'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {currentView === 'archive' && (
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              {['all', 'day', 'month', 'year'].map(f => (
                <button 
                  key={f}
                  onClick={() => setDateFilter(f)}
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: '10px', 
                    fontSize: '12px', 
                    fontWeight: '800',
                    background: dateFilter === f ? 'var(--accent-gold)' : 'transparent',
                    color: dateFilter === f ? 'black' : 'var(--text-secondary)',
                    border: 'none',
                    transition: '0.2s'
                  }}
                >
                  {f === 'all' ? 'Barchasi' : f === 'day' ? 'Kunlik' : f === 'month' ? 'Oylik' : 'Yillik'}
                </button>
              ))}
              {dateFilter !== 'all' && (
                <input 
                  type={dateFilter === 'year' ? 'number' : dateFilter === 'month' ? 'month' : 'date'}
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0 12px', color: 'white', fontSize: '12px', outline: 'none' }}
                />
              )}
            </div>
          )}
          <div style={{ position: 'relative', width: '280px' }}><Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} /><input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Qidirish..." style={{ width: '100%', paddingLeft: '44px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', height: '44px', color: 'white' }} /></div>
           
           {currentView !== 'archive' && (
             <>
               <button onClick={() => setIsAgentModalOpen(true)} className="secondary-btn" style={{ height: '44px', color: '#8b5cf6', background: 'rgba(139,92,246,0.1)' }}><Smartphone size={18} /> Yangi Agent</button>
               <button onClick={() => setIsCustomerModalOpen(true)} className="secondary-btn" style={{ height: '44px' }}><UserPlus size={18} /> Yangi Mijoz</button>
               <button onClick={() => setIsKPModalOpen(true)} className="secondary-btn" style={{ height: '44px', color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}><FileText size={18} /> Tijorat Taklifi</button>
               <button onClick={() => { setEditingId(null); setNewOrder(emptyOrder); setIsOrderModalOpen(true); }} className="gold-btn" style={{ height: '44px' }}><Plus size={20} /> Yangi Buyurtma</button>
             </>
           )}
        </div>
      </div>

      {/* Kanban Board / Archive View */}
      <div className="no-scrollbar" style={{ flex: 1, display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '30px' }}>
        {currentView === 'archive' ? (
          <div style={{ flex: 1, padding: '0 20px' }}>
            <div className="premium-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '800' }}>Yopilgan Buyurtmalar Arvixi</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '12px' }}>
                      <th style={{ padding: '15px' }}>ID</th>
                      <th style={{ padding: '15px' }}>Mijoz</th>
                      <th style={{ padding: '15px' }}>Menejer</th>
                      <th style={{ padding: '15px' }}>Summa</th>
                      <th style={{ padding: '15px' }}>Yopilgan Sana</th>
                      <th style={{ padding: '15px' }}>Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Arxivda buyurtmalar yo'q.</td></tr>
                    ) : (
                      filteredOrders.map(o => (
                        <tr key={o._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '15px', color: 'var(--accent-gold)', fontWeight: '800' }}>{o.uniqueId}</td>
                          <td style={{ padding: '15px' }}>{o.selectedCustomer?.firstName} {o.selectedCustomer?.lastName}</td>
                          <td style={{ padding: '15px' }}>{o.managerName}</td>
                          <td style={{ padding: '15px', fontWeight: '800' }}>{Number(o.amount).toLocaleString()} UZS</td>
                          <td style={{ padding: '15px', color: 'var(--text-secondary)' }}>
                            {(() => {
                              const archLog = o.timeline?.find(l => l?.text?.includes("Arxivlandi"));
                              return archLog?.time ? archLog.time.split('T')[0] : '—';
                            })()}
                          </td>
                          <td style={{ padding: '15px' }}>
                            <button onClick={() => { setEditingId(o._id); setNewOrder(o); setIsOrderModalOpen(true); }} className="secondary-btn" style={{ padding: '6px 12px', fontSize: '12px' }}><Eye size={14} /> Ko'rish</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          STAGES.map(stage => {
            const stageOrders = allOrders.filter(o => {
              const matchesUser = user?.role === 'super' || (user?.role === 'showroom' && o.showroom === user.showroom) || (user?.role === 'sotuv_manager' && o.managerId === user.id);
              const matchesSearch = `${o.selectedCustomer?.firstName} ${o.selectedCustomer?.lastName} ${o.uniqueId}`.toLowerCase().includes(searchTerm.toLowerCase());
              if (!(matchesUser && matchesSearch && o.status !== 'yopildi')) return false;

              let currentStatus = o.status;
              if (o.status === 'pm' && o.pmStatus && o.pmStatus !== 'yangi_buyurtma') {
                  currentStatus = o.pmStatus;
              } else if (o.status === 'ishlab_chiqarishda' && o.pmStatus === 'topshirildi') {
                  currentStatus = 'ishlab_chiqarishda';
              } else if (o.status === 'ornatish' && o.pmStatus === 'ustanovka') {
                  currentStatus = 'ornatish';
              } else if (o.status === 'pm' && o.pmStatus === 'tayyor') {
                  currentStatus = 'tayyor';
              }
              return currentStatus === stage.id;
            }).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)); 
            const totalAmount = stageOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
            return (
              <div key={stage.id} onDragOver={handleDragOver} onDrop={e => handleDrop(e, stage.id)} style={{ minWidth: '320px', width: '320px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '16px', padding: '0 8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: stage.color }} />
                      <h3 style={{ fontSize: '16px', fontWeight: '800' }}>{stage.title}</h3>
                      <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '2px 10px', borderRadius: '12px' }}>{stageOrders.length}</span>
                  </div>
                  <div style={{ background: stage.bg, border: `1px solid ${stage.color}33`, borderRadius: '20px', padding: '18px' }}>
                     <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Jami Qiymat</p>
                     <p style={{ fontSize: '22px', fontWeight: '900', color: stage.color }}>{totalAmount.toLocaleString()} <span style={{ fontSize: '14px' }}>UZS</span></p>
                  </div>
                </div>
                <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: '6px' }}>
                  {stageOrders.map(order => {
                    const isLocked = LOCKED_STAGES.includes(order.status);
                    return (
                      <div 
                        key={order._id} 
                        draggable={!isLocked} 
                        onDragStart={(e) => handleDragStart(e, order._id)} 
                        onDragEnd={handleDragEnd} 
                        style={{ background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '20px', marginBottom: '16px', position: 'relative', cursor: isLocked ? 'default' : 'grab' }}
                        onClick={() => { setEditingId(order._id); setNewOrder(order); setIsOrderModalOpen(true); }}
                      >
                          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: stage.color, borderRadius: '4px 0 0 4px' }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ fontSize: '10px', fontWeight: '900', color: 'var(--accent-gold)', background: 'rgba(212,175,55,0.1)', padding: '3px 8px', borderRadius: '6px' }}>{order.uniqueId}</span>
                            {isLocked && <div style={{ fontSize: '10px', background: 'rgba(212,175,55,0.1)', color: 'var(--accent-gold)', padding: '2px 8px', borderRadius: '6px' }}><Lock size={10} /> Locked</div>}
                          </div>
                          <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '6px' }}>{order.selectedCustomer?.firstName} {order.selectedCustomer?.lastName}</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}><Phone size={14} /> {order.selectedCustomer?.phone}</div>
                          
                          {order.assignedPmName && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '12px', color: '#3b82f6', fontWeight: '800', background: 'rgba(59,130,246,0.1)', padding: '4px 10px', borderRadius: '8px', width: 'fit-content' }}>
                              <Briefcase size={12} /> PM: {order.assignedPmName}
                            </div>
                          )}

                          {stage.id === 'bajarildi' && !order.smCompletionApproved && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const isFinal = order.adminCompletionApproved;
                                const updated = allOrders.map(o => {
                                  if (o.id === order.id) {
                                    const log = { type: 'system', text: isFinal ? "Buyurtma SM va Admin tomonidan tasdiqlandi. Arxivlandi." : "Buyurtma SM tomonidan tasdiqlandi (yakunlash)", time: new Date().toISOString(), user: user.name };
                                    return { 
                                      ...o, 
                                      smCompletionApproved: true, 
                                      status: isFinal ? 'yopildi' : o.status,
                                      timeline: [...(o.timeline || []), log]
                                    };
                                  }
                                  return o;
                                });
                                setAllOrders(updated);
                                localStorage.setItem('erp_orders', JSON.stringify(updated));
                                alert(isFinal ? "Buyurtma to'liq yopildi va arxivga o'tkazildi!" : "Sizning tasdig'ingiz qabul qilindi. Admin tasdig'i kutilmoqda.");
                              }}
                              style={{ width: '100%', marginBottom: '12px', background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', color: '#10b981', padding: '10px', borderRadius: '12px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                              <CheckSquare size={14} /> Yakunlashni Tasdiqlash
                            </button>
                          )}

                          {stage.id === 'bajarildi' && order.smCompletionApproved && !order.adminCompletionApproved && (
                            <div style={{ marginBottom: '12px', background: 'rgba(16,185,129,0.05)', color: '#10b981', padding: '8px', borderRadius: '10px', fontSize: '11px', textAlign: 'center', border: '1px dashed #10b981' }}>
                              Siz tasdiqladingiz. Admin kutilmoqda...
                            </div>
                          )}

                          {(() => {
                            const status = getDeliveryStatus(order.deliveryDate);
                            return (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                                {/* Address & Order Date Visibility */}
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                    <MapPin size={10} /> <span style={{ fontWeight: '700' }}>Manzil:</span>
                                  </div>
                                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#e2e8f0', lineHeight: '1.4' }}>{order.selectedCustomer?.address || '—'}</p>
                                  
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '2px' }}>
                                    <Calendar size={10} /> <span style={{ fontWeight: '700' }}>Qabul:</span> <span style={{ color: '#e2e8f0' }}>{order.orderDate}</span>
                                  </div>
                                </div>

                                <div style={{ 
                                  display: 'flex', 
                                  flexDirection: 'column', 
                                  gap: '4px', 
                                  padding: '12px 16px', 
                                  background: status.bg, 
                                  border: `1px solid ${status.color}33`, 
                                  borderRadius: '14px' 
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: status.color, fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <Clock size={12} /> {status.label} (Topshirish)
                                  </div>
                                  <div style={{ fontSize: '20px', fontWeight: '900', color: status.color }}>
                                    {status.text}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                       <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <div><p style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Summa</p><p style={{ fontSize: '16px', fontWeight: '900', color: 'white' }}>{Number(order.amount).toLocaleString()} UZS</p></div>
                             <div style={{ display: 'flex', gap: '8px' }}>
                                {order.kpFiles?.length > 0 && <FileCheck size={18} color="#10b981" />}
                                {order.designFiles?.length > 0 && <FileIcon size={18} color="var(--accent-gold)" />}
                             </div>
                          </div>
                       </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* AmoCRM Style Modal */}
      {isOrderModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(20px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div className="premium-card" style={{ width: '96vw', height: '94vh', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '24px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--accent-gold)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingBag size={28} /></div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><h3 style={{ fontSize: '24px', fontWeight: '900' }}>{editingId ? `Buyurtma: ${newOrder.uniqueId}` : 'Yangi Buyurtma'}</h3>{editingId && <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>{STAGES.find(s => s.id === newOrder.status)?.title}</span>}{isOrderLocked && <Lock size={16} color="var(--accent-gold)" />}</div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                    Menejer: <span style={{ color: 'white', fontWeight: '700' }}>{newOrder.managerName || user.name}</span> • 
                    Showroom: <span style={{ color: 'white', fontWeight: '700' }}>{newOrder.showroom || user.showroom}</span>
                    {newOrder.assignedPmName && <span style={{ color: '#3b82f6' }}> • PM: {newOrder.assignedPmName}</span>}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>{!isOrderLocked && <button onClick={handleCreateOrder} className="gold-btn" style={{ height: '48px', padding: '0 32px' }}><Check size={20} /> Saqlash</button>}{isOrderLocked && <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0 24px', borderRadius: '12px', color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}><Lock size={14} /> Kuzatuv Rejimi</div>}<button onClick={() => setIsOrderModalOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', color: 'white' }}><X size={24} /></button></div>
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '550px 1fr', overflow: 'hidden' }}>
              <div style={{ borderRight: '1px solid rgba(255,255,255,0.05)', padding: '40px', overflowY: 'auto', opacity: isOrderLocked ? 0.7 : 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}><User size={18} color="var(--accent-gold)" /><h4 style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase' }}>Mijoz Ma'lumotlari</h4></div>
                    <div style={{ position: 'relative', marginBottom: '24px' }}>
                       <Lbl>Mijozni Tanlang</Lbl>
                         <IconInput 
                          icon={Search} 
                          value={newOrder.customerSearch} 
                          onChange={e => !isOrderLocked && setNewOrder({...newOrder, customerSearch: e.target.value})} 
                          onFocus={() => !isOrderLocked && setCustomerSuggestions(customers.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(newOrder.customerSearch.toLowerCase()) || c.phone.includes(newOrder.customerSearch)))}
                          onKeyDown={handleKeyDown} 
                          placeholder="Ism yoki telefon..." 
                          autoComplete="off"
                          style={{ height: '54px' }} 
                          readOnly={isOrderLocked} 
                        />
                       {customerSuggestions.length > 0 && !isOrderLocked && (
                         <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: '#1a1a2e', border: '1px solid var(--border-color)', borderRadius: '12px', zIndex: 2100, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                           {customerSuggestions.map((c, idx) => (
                             <div 
                               key={c.id} 
                               onClick={() => handleSelectCustomer(c)} 
                               style={{ padding: '15px 20px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx === selectedIndex ? 'rgba(251,191,36,0.1)' : 'transparent', color: idx === selectedIndex ? 'var(--accent-gold)' : 'white' }}
                             >
                               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                 <div>
                                   <div style={{ fontWeight: '800' }}>{c.firstName} {c.lastName}</div>
                                   <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{c.phone}</div>
                                 </div>
                                 <div style={{ fontSize: '10px', color: 'var(--accent-gold)', opacity: 0.5 }}>{c.address.substring(0, 20)}...</div>
                               </div>
                             </div>
                           ))}
                         </div>
                       )}
                     </div>
                    {newOrder.selectedCustomer && (<div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}><div><Lbl>Telefon</Lbl><p style={{ fontWeight: '700' }}>{newOrder.selectedCustomer.phone}</p></div><div><Lbl>Manzil</Lbl><p style={{ fontWeight: '700' }}>{newOrder.selectedCustomer.address}</p></div></div>)}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}><FileText size={18} color="var(--accent-gold)" /><h4 style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase' }}>Hujjatlar va Fayllar</h4></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                       <div onClick={() => setFileManager({ isOpen: true, type: 'kp', files: newOrder.kpFiles || [], orderId: editingId })} className="clickable-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileCheck size={22} /></div>
                          <div><h5 style={{ fontSize: '14px', fontWeight: '800' }}>KP Fayllari</h5><p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{newOrder.kpFiles?.length || 0} ta fayl</p></div>
                       </div>
                       <div onClick={() => setFileManager({ isOpen: true, type: 'design', files: newOrder.designFiles || [], orderId: editingId })} className="clickable-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(251,191,36,0.1)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileIcon size={22} /></div>
                          <div><h5 style={{ fontSize: '14px', fontWeight: '800' }}>Dizayn Fayllari</h5><p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{newOrder.designFiles?.length || 0} ta fayl</p></div>
                       </div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}><Building size={18} color="var(--accent-gold)" /><h4 style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase' }}>Obyekt va Moliyaviy</h4></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <div>
                        <Lbl>Obyekt Turi</Lbl>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                          {PROPERTY_TYPES.map(type => (
                            <button 
                              key={type.value} 
                              type="button" 
                              onClick={() => !isOrderLocked && setNewOrder({...newOrder, propertyType: type.value})} 
                              style={{ height: '54px', borderRadius: '12px', background: newOrder.propertyType === type.value ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${newOrder.propertyType === type.value ? 'var(--accent-gold)' : 'var(--border-color)'}`, color: newOrder.propertyType === type.value ? 'var(--accent-gold)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: '700' }}
                            >
                              <span>{type.icon}</span> {type.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <Lbl>Qabul Sanasi</Lbl>
                          <input 
                            type="date" 
                            value={newOrder.orderDate} 
                            onChange={e => !isOrderLocked && setNewOrder({...newOrder, orderDate: e.target.value})} 
                            style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px', fontSize: '14px' }} 
                            readOnly={isOrderLocked} 
                          />
                        </div>
                        <div>
                          <Lbl>Muddati (Kun)</Lbl>
                          <input 
                            type="number" 
                            value={newOrder.durationDays} 
                            onChange={e => !isOrderLocked && setNewOrder({...newOrder, durationDays: e.target.value})} 
                            placeholder="30" 
                            style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px', fontSize: '14px' }} 
                            readOnly={isOrderLocked} 
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <Lbl>Summa</Lbl>
                          <input 
                            value={formatAmount(newOrder.amount)} 
                            onChange={e => !isOrderLocked && setNewOrder({...newOrder, amount: e.target.value.replace(/\D/g,'')})} 
                            placeholder="0" 
                            style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px', fontSize: '18px', fontWeight: '900' }} 
                            readOnly={isOrderLocked} 
                          />
                        </div>
                        <div>
                          <Lbl>Valyuta</Lbl>
                          <select 
                            value={newOrder.currency} 
                            onChange={e => !isOrderLocked && setNewOrder({...newOrder, currency: e.target.value})} 
                            style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 10px', fontWeight: '700' }} 
                            disabled={isOrderLocked}
                          >
                            <option value="UZS">UZS</option>
                            <option value="USD">USD</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ background: '#0f0f1b', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '24px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}><History size={20} color="var(--accent-gold)" /><h4 style={{ fontSize: '15px', fontWeight: '900' }}>Xarakatlar Tarixi</h4></div>
                <div style={{ flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {(newOrder.timeline || []).map((item, idx) => (
                    <div key={idx} style={{ position: 'relative', paddingLeft: '40px' }}>
                        {idx !== newOrder.timeline.length - 1 && <div style={{ position: 'absolute', left: '10px', top: '24px', bottom: '-24px', width: '1px', background: 'rgba(255,255,255,0.05)' }} />}
                        <div style={{ position: 'absolute', left: '0', top: '4px', width: '21px', height: '21px', borderRadius: '50%', background: item.type === 'comment' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.type === 'comment' ? 'black' : 'var(--text-secondary)' }}>{item.type === 'comment' ? <MessageSquare size={10} /> : <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'currentColor' }} />}</div>
                        {item.type === 'comment' ? (<div style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.1)', borderRadius: '16px', padding: '16px 20px' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ fontSize: '13px', fontWeight: '900', color: 'var(--accent-gold)' }}>{item.user}</span><span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{new Date(item.time).toLocaleTimeString()}</span></div><p style={{ fontSize: '15px', color: '#fff', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{item.text}</p></div>) : (<div style={{ display: 'flex', gap: '12px', alignItems: 'baseline' }}><span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(item.time).toLocaleTimeString()}</span><p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}><span style={{ fontWeight: '700' }}>{item.user}</span>: {item.text}</p></div>)}
                    </div>
                  ))}
                  <div ref={timelineEndRef} />
                </div>
                <div style={{ padding: '32px 40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ position: 'relative' }}>
                    <textarea 
                      value={commentText} 
                      onChange={e => !isOrderLocked && setCommentText(e.target.value)} 
                      onKeyDown={handleCommentKeyDown} 
                      placeholder={isOrderLocked ? "Kuzatuv rejimida izoh qoldirib bo'lmaydi" : "Izoh qoldiring..."} 
                      style={{ width: '100%', height: '100px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', color: 'white', resize: 'none', opacity: isOrderLocked ? 0.5 : 1 }} 
                      readOnly={isOrderLocked}
                    />
                    {!isOrderLocked && (
                      <button onClick={handleAddComment} style={{ position: 'absolute', right: '15px', bottom: '15px', height: '44px', padding: '0 24px', borderRadius: '12px', background: 'var(--accent-gold)', color: 'black', fontWeight: '900', border: 'none' }}>
                        <Send size={16} /> Yuborish
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCustomerModalOpen && <CustomerModal onClose={() => setIsCustomerModalOpen(false)} onSaved={() => setCustomers(JSON.parse(localStorage.getItem('erp_customers')))} user={user} />}
      {isAgentModalOpen && <AgentModal onClose={() => setIsAgentModalOpen(false)} onSaved={() => {}} />}
      {isKPModalOpen && <KPModal onClose={() => setIsKPModalOpen(false)} />}
      {fileManager.isOpen && (
        <FileManagerModal 
          type={fileManager.type} 
          files={fileManager.files} 
          onClose={() => setFileManager({...fileManager, isOpen: false})} 
          readOnly={isOrderLocked} 
          onRemove={(idx) => {
            const field = fileManager.type === 'kp' ? 'kpFiles' : 'designFiles';
            const updatedFiles = [...newOrder[field]];
            updatedFiles.splice(idx, 1);
            setNewOrder({ ...newOrder, [field]: updatedFiles });
            setFileManager({ ...fileManager, files: updatedFiles });
          }} 
          onAdd={(files) => {
            const field = fileManager.type === 'kp' ? 'kpFiles' : 'designFiles';
            const updatedFiles = [...(newOrder[field] || []), ...files];
            setNewOrder({ ...newOrder, [field]: updatedFiles });
            setFileManager({ ...fileManager, files: updatedFiles });
          }} 
        />
      )}
    </div>
  );
};

export default Orders;
