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
import KPModal from '../SalesManager/KPModal';
import api from '../../utils/api';

// --- Constants ---
const STAGES = [
  { id: 'yangi_buyurtma', title: 'Yangi buyurtma ✨', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  { id: 'kontrol_zamer', title: 'Kontrolni zamer 📏', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  { id: 'chizma_chizish', title: 'Chizma chizish ✏️', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  { id: 'chizma_tasdiqlash', title: 'Chizma tasdiqlash 📋', color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
  { id: 'ishlab_chiqarishda', title: 'Ishlab chiqarishda 🏗️', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  { id: 'ombor', title: 'Omborda 📦', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  { id: 'ornatish', title: 'O\'rnatishda 🚚', color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
  { id: 'tayyor', title: 'Mijozga topshirishga tayyor 🎁', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { id: 'bajarildi', title: 'Bajarildi 🎉', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
];

const LOCKED_STAGES = ['yopildi'];

const PROPERTY_TYPES = [
  { label: 'Hovli', value: 'hovli', icon: '🏡' },
  { label: 'Dom', value: 'dom', icon: '🏢' },
  { label: 'Ofis', value: 'ofis', icon: '🏢' }
];

const CHECKLIST_LABELS = {
  design3d: '3D Dizayn',
  construction: 'Konstruksiya',
  color: 'Rang',
  handle: 'Ruchka',
  materials: 'Materiallar'
};

const SOURCE_OPTIONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tanish', label: 'Tanish orqali' },
  { value: 'tavsiya', label: 'Tavsiya orqali' },
  { value: 'agent', label: 'Agentlar orqali' },
];

const getNowDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

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
  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;
    const uploadedFiles = [];
    for (const f of selectedFiles) {
      try {
        const formData = new FormData();
        formData.append('file', f);
        const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        uploadedFiles.push({ name: res.data.name, size: f.size, type: f.type, url: res.data.url, uploadedAt: new Date().toISOString() });
      } catch (err) { alert(`"${f.name}" faylini yuklashda xatolik yuz berdi.`); }
    }
    if (uploadedFiles.length > 0) onAdd(uploadedFiles);
    e.target.value = '';
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

// --- AgentModal ---
const AgentModal = ({ onClose, onSaved }) => {
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '+998 ', firm: '' });
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => { const { name, value } = e.target; setForm({ ...form, [name]: name === 'phone' ? formatPhone(value) : value }); };
  const handleSave = async (e) => { 
    e.preventDefault(); 
    setLoading(true);
    try { await api.post('/customers', { ...form, type: 'agent' }); if (onSaved) onSaved(); onClose(); } catch (err) { alert("Xatolik!"); }
    setLoading(false);
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
      <div className="premium-card" style={{ width: '450px', padding: '32px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>Yangi Agent Qo'shish</h3>
        <form onSubmit={handleSave}><div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}><div><Lbl>Ism</Lbl><input name="firstName" value={form.firstName} onChange={handleChange} required autoComplete="off" style={{ width: '100%', height: '44px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '10px', padding: '0 12px' }} /></div><div><Lbl>Familiya</Lbl><input name="lastName" value={form.lastName} onChange={handleChange} required autoComplete="off" style={{ width: '100%', height: '44px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '10px', padding: '0 12px' }} /></div><div><Lbl>Telefon</Lbl><input name="phone" value={form.phone} onChange={handleChange} required autoComplete="off" style={{ width: '100%', height: '44px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '10px', padding: '0 12px' }} /></div><div><Lbl>Firma (Agar bo'lsa)</Lbl><input name="firm" value={form.firm} onChange={handleChange} autoComplete="off" style={{ width: '100%', height: '44px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '10px', padding: '0 12px' }} /></div></div><div style={{ display: 'flex', gap: '10px', marginTop: '32px' }}><button type="button" onClick={onClose} className="secondary-btn" style={{ flex: 1, height: '48px' }} disabled={loading}>Bekor qilish</button><button type="submit" className="gold-btn" style={{ flex: 1, height: '48px', justifyContent: 'center' }} disabled={loading}>{loading ? 'Saqlanmoqda...' : 'Saqlash'}</button></div></form>
      </div>
    </div>
  );
};

// --- CustomerModal ---
const CustomerModal = ({ onClose, onSaved, user }) => {
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '+998 ', address: '', propertyType: 'kvartira', age: '', gender: 'erkak', source: '', selectedAgent: null });
  const [agentSearch, setAgentSearch] = useState('');
  const [agentSuggestions, setAgentSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => { const { name, value } = e.target; setForm({ ...form, [name]: name === 'phone' ? formatPhone(value) : value }); };
  useEffect(() => { 
    const searchAgents = async () => { if (form.source === 'agent' && agentSearch.length > 1) { try { const res = await api.get('/customers', { params: { type: 'agent', search: agentSearch } }); setAgentSuggestions(res.data); } catch (err) {} } else setAgentSuggestions([]); };
    searchAgents();
  }, [agentSearch, form.source]);
  const handleSave = async (e) => { e.preventDefault(); setLoading(true); try { await api.post('/customers', { ...form, type: 'customer' }); if (onSaved) onSaved(); onClose(); } catch (err) { alert("Xatolik!"); } setLoading(false); };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1500 }}>
      <div className="premium-card" style={{ width: '1000px', padding: '48px', maxHeight: '92vh', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '40px' }}>Yangi Mijoz Qo'shish</h3>
        <form onSubmit={handleSave}><div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}><div><Lbl>Ism</Lbl><input name="firstName" value={form.firstName} onChange={handleChange} required autoComplete="off" style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px' }} /></div><div><Lbl>Familiya</Lbl><input name="lastName" value={form.lastName} onChange={handleChange} required autoComplete="off" style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px' }} /></div></div><div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '24px' }}><div><Lbl>Telefon</Lbl><input name="phone" value={form.phone} onChange={handleChange} required autoComplete="off" style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px' }} /></div><div><Lbl>Yoshi</Lbl><input name="age" type="number" value={form.age} onChange={handleChange} autoComplete="off" style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px' }} /></div><div><Lbl>Jinsi</Lbl><div style={{ display: 'flex', gap: '8px' }}>{['erkak', 'ayol'].map(g => (<button key={g} type="button" onClick={() => setForm({...form, gender: g})} style={{ flex: 1, height: '54px', borderRadius: '12px', background: form.gender === g ? 'var(--accent-gold)' : 'rgba(255,255,255,0.03)', color: g === form.gender ? 'black' : 'white', border: '1px solid var(--border-color)', fontWeight: '700' }}>{g}</button>))}</div></div></div><div><Lbl>Manzil</Lbl><input name="address" value={form.address} onChange={handleChange} required autoComplete="off" style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px' }} /></div><div><Lbl>Uy Turi</Lbl><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>{PROPERTY_TYPES.map(pt => (<button key={pt.value} type="button" onClick={() => setForm({...form, propertyType: pt.value})} style={{ height: '54px', borderRadius: '12px', background: form.propertyType === pt.value ? 'var(--accent-gold)' : 'rgba(255,255,255,0.03)', color: pt.value === form.propertyType ? 'black' : 'white', border: '1px solid var(--border-color)', fontSize: '14px', fontWeight: '700' }}>{pt.label}</button>))}</div></div><div><Lbl>Platforma</Lbl><div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>{SOURCE_OPTIONS.map(opt => (<button key={opt.value} type="button" onClick={() => setForm({...form, source: opt.value})} style={{ height: '60px', borderRadius: '12px', background: form.source === opt.value ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${form.source === opt.value ? 'var(--accent-gold)' : 'var(--border-color)'}`, color: opt.value === form.source ? 'var(--accent-gold)' : 'white', fontSize: '12px', fontWeight: '800' }}>{opt.label}</button>))}</div></div>{form.source === 'agent' && (<div style={{ position: 'relative' }}><Lbl>Agent Qidirish</Lbl><IconInput icon={Search} value={agentSearch} onChange={e => setAgentSearch(e.target.value)} placeholder="Agent ismi..." autoComplete="off" style={{ height: '54px' }} />{agentSuggestions.length > 0 && (<div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: '#1a1a2e', zIndex: 100, border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>{agentSuggestions.map(a => <div key={a._id} onClick={() => { setForm({...form, selectedAgent: a}); setAgentSearch(`${a.firstName} ${a.lastName}`); setAgentSuggestions([]); }} style={{ padding: '15px 20px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{a.firstName} {a.lastName}</div>)}</div>)}</div>)}</div><div style={{ display: 'flex', gap: '16px', marginTop: '54px' }}><button type="button" onClick={onClose} className="secondary-btn" style={{ flex: 1, height: '60px' }} disabled={loading}>Bekor Qilish</button><button type="submit" className="gold-btn" style={{ flex: 1, height: '60px', justifyContent: 'center' }} disabled={loading}>{loading ? 'Saqlanmoqda...' : 'Saqlash'}</button></div></form>
      </div>
    </div>
  );
};

// --- Orders Component ---
const Orders = () => {
  const { user } = useAuth();
  const [allOrders, setAllOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('kanban');
  const [modalTab, setModalTab] = useState('timeline');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [isKPModalOpen, setIsKPModalOpen] = useState(false);
  const [fileManager, setFileManager] = useState({ isOpen: false, type: 'kp', files: [], orderId: null });
  const [editingId, setEditingId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [inputType, setInputType] = useState('comment');
  const [taskDueDate, setTaskDueDate] = useState(getNowDateTime());
  const [proposalSearch, setProposalSearch] = useState('');
  const [proposalSuggestions, setProposalSuggestions] = useState([]);
  const [contextMenu, setContextMenu] = useState({ isOpen: false, x: 0, y: 0, orderId: null, isLocked: false });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, orderId: null, reason: '' });
  const timelineEndRef = useRef(null);

  const emptyOrder = { customerSearch: '', selectedCustomer: null, kpAmount: '', discount: '0', amount: '', currency: 'UZS', exchangeRate: '', kpFiles: [], designFiles: [], checklist: { design3d: false, construction: false, color: false, handle: false, materials: false }, durationDays: '', orderDate: new Date().toISOString().split('T')[0], deliveryDate: '', status: 'yangi', description: '', timeline: [], proposalId: null, proposalNumber: '', productionAmount: '' };
  const [newOrder, setNewOrder] = useState(emptyOrder);
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try { const [ordersRes, customersRes, proposalsRes] = await Promise.all([api.get('/orders'), api.get('/customers'), api.get('/proposals')]); setAllOrders(ordersRes.data); setCustomers(customersRes.data); setProposals(proposalsRes.data); } catch (err) {}
    setLoading(false);
  };
  useEffect(() => { loadData(); }, []);
  useEffect(() => { setCurrentView(location.pathname.includes('archive') ? 'archive' : 'kanban'); }, [location.pathname]);
  useEffect(() => { if (editingId) loadOrderTasks(editingId); }, [editingId]);
  const loadOrderTasks = async (orderId) => { try { const res = await api.get('/tasks'); setTasks(res.data.filter(t => t.orderId === orderId)); } catch (err) {} };

  const handleSelectCustomer = (c) => { setNewOrder({ ...newOrder, selectedCustomer: c, customerSearch: `${c.firstName} ${c.lastName}` }); setCustomerSuggestions([]); };
  const handleSelectProposal = (p) => { const kpSum = formatAmount(p.grandTotal || 0); setNewOrder({ ...newOrder, proposalId: p._id, proposalNumber: p.kpNumber, kpAmount: kpSum, amount: kpSum, discount: '0', kpFiles: p.kpFiles || [], designFiles: p.designFiles || [] }); setProposalSearch(p.kpNumber); setProposalSuggestions([]); };

  useEffect(() => {
    const term = newOrder.customerSearch.toLowerCase().trim();
    if (term.length < 2) { setCustomerSuggestions([]); return; }
    setCustomerSuggestions(customers.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(term) || c.phone.includes(term)));
  }, [newOrder.customerSearch, customers]);

  useEffect(() => {
    const term = proposalSearch.toLowerCase().trim();
    if (term.length < 2) { setProposalSuggestions([]); return; }
    setProposalSuggestions(proposals.filter(p => p.kpNumber.toLowerCase().includes(term) || `${p.customer?.firstName} ${p.customer?.lastName}`.toLowerCase().includes(term)));
  }, [proposalSearch, proposals]);

  useEffect(() => {
    if (newOrder.orderDate && newOrder.durationDays) {
      const date = new Date(newOrder.orderDate);
      date.setDate(date.getDate() + parseInt(newOrder.durationDays));
      const calcDate = date.toISOString().split('T')[0];
      if (newOrder.deliveryDate !== calcDate) {
        setNewOrder(prev => ({ ...prev, deliveryDate: calcDate }));
      }
    }
  }, [newOrder.orderDate, newOrder.durationDays]);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    const log = { type: inputType === 'comment' ? 'comment' : 'task', text: inputType === 'comment' ? commentText : `Vazifa: ${commentText} (Muddat: ${taskDueDate})`, time: new Date().toISOString(), user: user.name };
    if (editingId) {
      try { const res = await api.post(`/orders/${editingId}/log`, { text: log.text, type: log.type }); if (inputType === 'task') { await api.post('/tasks', { title: commentText, dueDate: taskDueDate, assigneeId: user.id || user._id, assigneeName: user.name, orderId: editingId, orderUniqueId: res.data.uniqueId, priority: 'orta' }); loadOrderTasks(editingId); } setAllOrders(allOrders.map(o => o._id === editingId ? res.data : o)); setNewOrder(res.data); } catch (err) {}
    } else setNewOrder({ ...newOrder, timeline: [...(newOrder.timeline || []), log] });
    setCommentText(''); setInputType('comment');
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!newOrder.selectedCustomer) return alert('Mijozni tanlang!');
    const cleanAmount = newOrder.amount.toString().replace(/\s/g, '');
    try { 
      const currentUserId = user.id || user._id;
      const payload = { 
        ...newOrder, 
        amount: Number(cleanAmount),
        showroom: user.showroom || ''
      };
      
      if (!editingId && user.role === 'proekt_manager') {
        payload.assignedPmId = currentUserId;
        payload.pmStatus = 'yangi_buyurtma';
        payload.status = 'pm'; // Ensure it's treated as a PM order
      }
      
      const res = editingId ? await api.put(`/orders/${editingId}`, payload) : await api.post('/orders', payload); 
      
      // Ensure the returned data has the fields we need for filtering, even if backend behaves unexpectedly
      const savedOrder = { ...res.data };
      if (!savedOrder.assignedPmId && payload.assignedPmId) savedOrder.assignedPmId = payload.assignedPmId;
      if (!savedOrder.status && payload.status) savedOrder.status = payload.status;
      if (!savedOrder._id && res.data.id) savedOrder._id = res.data.id;

      setAllOrders(editingId ? allOrders.map(o => o._id === editingId ? savedOrder : o) : [...allOrders, savedOrder]); 
      setIsOrderModalOpen(false); 
      setEditingId(null); 
      setNewOrder(emptyOrder); 
    } catch (err) {
      console.error("Order creation error:", err);
      alert("Buyurtmani saqlashda xatolik yuz berdi.");
    }
  };

  const PM_DELETE_ALLOWED_STAGES = ['yangi_buyurtma', 'kontrol_zamer', 'chizma_chizish', 'chizma_tasdiqlash'];

  const handleContextMenu = (e, orderId, status, assignedPmId) => {
    e.preventDefault();
    const currentUserId = user.id || user._id;
    // PM can only delete if they are the creator/assignee and stage is allowed
    const canDelete = PM_DELETE_ALLOWED_STAGES.includes(status) && assignedPmId === currentUserId;
    
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      orderId,
      isLocked: !canDelete
    });
  };

  const confirmDelete = async (reason) => {
    if (!deleteModal.orderId) return;
    try {
      const log = { type: 'system', text: `Buyurtma PM tomonidan o'chirildi. Sabab: ${reason}`, time: new Date().toISOString(), user: user.name };
      await api.delete(`/orders/${deleteModal.orderId}`, { data: { reason, log } });
      setAllOrders(allOrders.filter(o => o._id !== deleteModal.orderId));
      setDeleteModal({ isOpen: false, orderId: null, reason: '' });
    } catch (err) {
      console.error("Delete error", err);
      alert("O'chirishda xatolik yuz berdi!");
    }
  };

  const handleDragStart = (e, orderId) => { e.dataTransfer.setData('orderId', orderId); };
  const handleDrop = async (e, stageId) => {
    const orderId = e.dataTransfer.getData('orderId');
    const order = allOrders.find(o => o._id === orderId);
    if (!order) return;
    const updates = { pmStatus: stageId };
    if (stageId === 'ishlab_chiqarishda') updates.status = 'ishlab_chiqarishda';
    else if (stageId === 'ornatish') updates.status = 'ornatish';
    else if (stageId === 'bajarildi') updates.status = 'bajarildi';
    else updates.status = 'pm';
    const log = { type: 'stage', text: `Bosqich: ${STAGES.find(s => s.id === stageId)?.title}`, time: new Date().toISOString(), user: user.name };
    const res = await api.put(`/orders/${order._id}`, { ...updates, timeline: [...(order.timeline || []), log] });
    setAllOrders(allOrders.map(o => o._id === orderId ? res.data : o));
  };

  const filteredOrders = allOrders.filter(o => {
    const currentUserId = user?.id || user?._id;
    const matchesUser = user?.role === 'super' || (user?.role === 'showroom' && o.showroom === user.showroom) || (user?.role === 'proekt_manager' && o.assignedPmId === currentUserId);
    const searchStr = `${o.selectedCustomer?.firstName || ''} ${o.uniqueId || ''}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
    return matchesUser && matchesSearch && (currentView === 'archive' ? o.status === 'yopildi' : o.status !== 'yopildi');
  });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '900' }}>CRM Board <span style={{ color: 'var(--accent-gold)' }}>Loyihalar</span></h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', width: '280px' }}><Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} /><input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Qidirish..." style={{ width: '100%', paddingLeft: '44px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', height: '44px', color: 'white' }} /></div>
          <button onClick={() => setIsAgentModalOpen(true)} className="secondary-btn" style={{ height: '44px', color: '#8b5cf6', background: 'rgba(139,92,246,0.1)' }}><Smartphone size={18} /> Yangi Agent</button>
          <button onClick={() => setIsCustomerModalOpen(true)} className="secondary-btn" style={{ height: '44px' }}><UserPlus size={18} /> Yangi Mijoz</button>
          <button onClick={() => setIsKPModalOpen(true)} className="secondary-btn" style={{ height: '44px', color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}><FileText size={18} /> Tijorat Taklifi</button>
          <button className="gold-btn" onClick={() => { setEditingId(null); setNewOrder(emptyOrder); setIsOrderModalOpen(true); }}><Plus size={20} /> Yangi Buyurtma</button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
        {STAGES.map(stage => {
          const stageOrders = filteredOrders.filter(o => {
            let s = o.pmStatus || 'yangi_buyurtma';
            if (o.status === 'ishlab_chiqarishda') s = 'ishlab_chiqarishda';
            if (o.status === 'ornatish') s = 'ornatish';
            if (o.status === 'ombor') s = 'ombor';
            if (o.status === 'tayyor') s = 'tayyor';
            if (o.status === 'bajarildi') s = 'bajarildi';
            return s === stage.id;
          });
          const totalAmount = stageOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
          
          return (
            <div key={stage.id} onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, stage.id)} style={{ minWidth: '320px', width: '320px', display: 'flex', flexDirection: 'column' }}>
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
                  const today = new Date();
                  today.setHours(0,0,0,0);
                  const delivery = order.deliveryDate ? new Date(order.deliveryDate) : null;
                  let deadlineStatus = { color: 'var(--text-secondary)', text: 'Srok yo\'q', bg: 'rgba(255,255,255,0.05)' };
                  
                  if (delivery) {
                    delivery.setHours(0,0,0,0);
                    const diffTime = delivery - today;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays < 0) deadlineStatus = { color: '#ef4444', text: `O'tib ketdi (${Math.abs(diffDays)} kun)`, bg: 'rgba(239,68,68,0.1)' };
                    else if (diffDays <= 3) deadlineStatus = { color: '#fbbf24', text: `Yaqin qoldi (${diffDays} kun)`, bg: 'rgba(251,191,36,0.1)' };
                    else deadlineStatus = { color: '#22c55e', text: `${diffDays} kun bor`, bg: 'rgba(34,197,94,0.1)' };
                  }

                  return (
                    <div key={order._id} draggable onDragStart={e => handleDragStart(e, order._id)} onContextMenu={(e) => handleContextMenu(e, order._id, order.pmStatus || 'yangi_buyurtma', order.assignedPmId)} onClick={() => { setEditingId(order._id); setNewOrder(order); setIsOrderModalOpen(true); }} style={{ background: '#1e213a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px', marginBottom: '16px', cursor: 'grab', position: 'relative', transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                      <div style={{ position: 'absolute', top: '15px', left: 0, width: '3px', height: 'calc(100% - 30px)', background: stage.color, borderRadius: '0 4px 4px 0' }} />
                      
                      {/* Top Row: ID and Status */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ background: 'rgba(251,191,36,0.1)', color: 'var(--accent-gold)', padding: '4px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '900' }}>{order.uniqueId}</div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {order.factoryDeadline && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: '800' }}>F: {order.factoryDeadline}</div>}
                          <div style={{ background: deadlineStatus.bg, color: deadlineStatus.color, padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', border: `1px solid ${deadlineStatus.color}22` }}>
                            {deadlineStatus.color === '#ef4444' ? <Lock size={12} /> : <Clock size={12} />}
                            {deadlineStatus.text}
                          </div>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px', color: 'white' }}>{order.selectedCustomer?.firstName} {order.selectedCustomer?.lastName}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
                        <Phone size={14} />
                        <span>{order.selectedCustomer?.phone}</span>
                      </div>

                      {/* Inner Card: Address & Dates */}
                      <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '14px', padding: '16px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                          <MapPin size={14} style={{ marginTop: '3px', color: 'var(--text-secondary)' }} />
                          <div>
                            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '2px' }}>Manzil:</p>
                            <p style={{ fontSize: '13px', fontWeight: '700', color: '#e2e8f0' }}>{order.selectedCustomer?.address || 'Belgilanmagan'}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={14} style={{ color: 'var(--text-secondary)' }} />
                            <div>
                                <p style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Qabul:</p>
                                <p style={{ fontSize: '12px', fontWeight: '700' }}>{order.orderDate}</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={14} style={{ color: 'var(--text-secondary)' }} />
                            <div>
                                <p style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Muddat:</p>
                                <p style={{ fontSize: '12px', fontWeight: '700', color: deadlineStatus.color }}>{order.deliveryDate || '---'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Checklist Pills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                        {Object.entries(CHECKLIST_LABELS).map(([key, label]) => (
                          <div key={key} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            background: order.checklist?.[key] ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.02)', 
                            border: `1px solid ${order.checklist?.[key] ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)'}`,
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: order.checklist?.[key] ? '#22c55e' : 'var(--text-secondary)'
                          }}>
                            {order.checklist?.[key] && <Check size={12} />}
                            {label}
                          </div>
                        ))}
                      </div>

                      {/* Sum Section */}
                      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '14px', padding: '16px' }}>
                        <p style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '800' }}>SUMMA</p>
                        <p style={{ fontSize: '18px', fontWeight: '900', color: 'white' }}>{Number(order.amount).toLocaleString()} <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>UZS</span></p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}
      </div>

      {isOrderModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(20px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
          <div className="premium-card" style={{ width: '96vw', height: '94vh', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ padding: '24px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--accent-gold)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingBag size={28} /></div>
                <div>
                  <h3 style={{ fontSize: '24px', fontWeight: '900' }}>{editingId ? `Buyurtma: ${newOrder.uniqueId}` : 'Yangi Buyurtma'}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Menejer: <span style={{ color: 'white', fontWeight: '700' }}>{newOrder.managerName || user.name}</span> • Showroom: <span style={{ color: 'white', fontWeight: '700' }}>{newOrder.showroom || user.showroom}</span></p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}><button onClick={handleCreateOrder} className="gold-btn" style={{ height: '48px', padding: '0 32px' }}><Check size={20} /> Saqlash</button><button onClick={() => setIsOrderModalOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', color: 'white' }}><X size={24} /></button></div>
            </div>
            
            {/* Body */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '550px 1fr', overflow: 'hidden' }}>
              <div style={{ borderRight: '1px solid rgba(255,255,255,0.05)', padding: '40px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Dynamic Editability Logic */}
                  {(() => {
                    const isNewStage = !editingId || newOrder.pmStatus === 'yangi_buyurtma';
                    
                    return (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <User size={18} color="var(--accent-gold)" />
                          <h4 style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase' }}>
                            MIJOZ MA'LUMOTLARI {!isNewStage && "(FAQAT KO'RISH)"}
                          </h4>
                        </div>
                        
                        <div>
                          <Lbl>MIJOZNI TANLANG</Lbl>
                          {isNewStage ? (
                            <div style={{ position: 'relative', marginBottom: newOrder.selectedCustomer ? '16px' : '0' }}>
                              <IconInput icon={Search} value={newOrder.customerSearch} onChange={e => setNewOrder({...newOrder, customerSearch: e.target.value})} placeholder="Ism yoki telefon..." autoComplete="off" style={{ height: '54px' }} />
                              {customerSuggestions.length > 0 && (<div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: '#1a1a2e', border: '1px solid var(--border-color)', borderRadius: '12px', zIndex: 2100, overflow: 'hidden' }}>{customerSuggestions.map((c, i) => <div key={c._id} onClick={() => handleSelectCustomer(c)} style={{ padding: '15px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', background: i === selectedIndex ? 'rgba(251,191,36,0.1)' : 'transparent' }}>{c.firstName} {c.lastName} | {c.phone}</div>)}</div>)}
                            </div>
                          ) : (
                            newOrder.selectedCustomer && (
                              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}><User size={18} /></div>
                                  <div>
                                    <p style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Mijoz:</p>
                                    <p style={{ fontSize: '15px', fontWeight: '800', color: 'white' }}>{newOrder.selectedCustomer.firstName} {newOrder.selectedCustomer.lastName}</p>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}><Phone size={18} /></div>
                                  <div>
                                    <p style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Telefon raqami:</p>
                                    <p style={{ fontSize: '15px', fontWeight: '800', color: 'white' }}>{newOrder.selectedCustomer.phone}</p>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}><MapPin size={18} /></div>
                                  <div>
                                    <p style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Manzil:</p>
                                    <p style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>{newOrder.selectedCustomer.address || 'Manzil belgilanmagan'}</p>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>

                        <div style={{ opacity: isNewStage ? 1 : 0.7, pointerEvents: isNewStage ? 'auto' : 'none' }}>
                          <Lbl>KP RAQAMI {!isNewStage && "(FAQAT KO'RISH)"}</Lbl>
                          <IconInput icon={Search} value={proposalSearch} onChange={e => setProposalSearch(e.target.value)} readOnly={!isNewStage} placeholder="KP raqami..." style={{ height: '54px' }} />
                          {isNewStage && proposalSuggestions.length > 0 && (<div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: '#1a1a2e', border: '1px solid var(--border-color)', borderRadius: '12px', zIndex: 2100, overflow: 'hidden' }}>{proposalSuggestions.map(p => <div key={p._id} onClick={() => handleSelectProposal(p)} style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{p.kpNumber} | {p.customer?.firstName} | {p.grandTotal?.toLocaleString()} so'm</div>)}</div>)}
                        </div>

                        <div style={{ position: 'relative', opacity: isNewStage ? 1 : 0.7, pointerEvents: isNewStage ? 'auto' : 'none' }}>
                          <Lbl>KP SUMMASI</Lbl>
                          <input value={newOrder.kpAmount} readOnly={!isNewStage} onChange={e => isNewStage && setNewOrder({...newOrder, kpAmount: formatAmount(e.target.value)})} style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0 60px 0 15px', color: 'white' }} />
                          <span style={{ position: 'absolute', right: '15px', top: '42px', color: 'rgba(255,255,255,0.2)', fontSize: '12px', fontWeight: '800' }}>so'm</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px', opacity: isNewStage ? 1 : 0.7, pointerEvents: isNewStage ? 'auto' : 'none' }}>
                          <div><Lbl>SKIDKA (%)</Lbl><input type="number" value={newOrder.discount} readOnly={!isNewStage} onChange={e => isNewStage && setNewOrder({...newOrder, discount: e.target.value})} style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0 15px', color: 'white' }} /></div>
                          <div style={{ position: 'relative' }}><Lbl>SHARTNOMA SUMMASI</Lbl><input value={newOrder.amount} readOnly={!isNewStage} onChange={e => isNewStage && setNewOrder({...newOrder, amount: formatAmount(e.target.value)})} style={{ width: '100%', height: '54px', background: 'rgba(16,185,129,0.05)', border: '1px solid #10b981', borderRadius: '12px', padding: '0 60px 0 15px', color: '#10b981', fontWeight: '900', fontSize: '16px' }} /><span style={{ position: 'absolute', right: '15px', top: '42px', color: 'rgba(16,185,129,0.4)', fontSize: '12px', fontWeight: '800' }}>so'm</span></div>
                        </div>

                        <div style={{ position: 'relative' }}>
                          <Lbl>ISHLAB CHIQARISH SUMMASI</Lbl>
                          <input value={newOrder.productionAmount} onChange={e => setNewOrder({...newOrder, productionAmount: formatAmount(e.target.value)})} placeholder="Ishlab chiqarish harajatlarini kiriting..." style={{ width: '100%', height: '54px', background: 'rgba(59,130,246,0.05)', border: '1px solid #3b82f6', borderRadius: '12px', padding: '0 60px 0 15px', color: 'white' }} />
                          <span style={{ position: 'absolute', right: '15px', top: '42px', color: 'rgba(59,130,246,0.4)', fontSize: '12px', fontWeight: '800' }}>so'm</span>
                        </div>

                        <div style={{ opacity: isNewStage ? 1 : 0.7, pointerEvents: isNewStage ? 'auto' : 'none' }}>
                          <Lbl>OBYEKT TURI</Lbl>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                            {PROPERTY_TYPES.map(t => (
                              <button key={t.value} onClick={() => isNewStage && setNewOrder({...newOrder, propertyType: t.value})} style={{ height: '54px', borderRadius: '12px', background: newOrder.propertyType === t.value ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${newOrder.propertyType === t.value ? 'var(--accent-gold)' : 'var(--border-color)'}`, color: newOrder.propertyType === t.value ? 'var(--accent-gold)' : 'white', fontWeight: '700' }}>{t.label}</button>
                            ))}
                          </div>
                        </div>

                        <div><Lbl>TASDIQLATISH (CHECKLIST)</Lbl><div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>{Object.entries(CHECKLIST_LABELS).map(([k, l]) => (<button key={k} onClick={() => setNewOrder({...newOrder, checklist: {...newOrder.checklist, [k]: !newOrder.checklist?.[k]}})} style={{ height: '48px', borderRadius: '12px', background: newOrder.checklist?.[k] ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${newOrder.checklist?.[k] ? '#10b981' : 'var(--border-color)'}`, color: newOrder.checklist?.[k] ? '#10b981' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 15px', fontSize: '13px', fontWeight: '700' }}>{newOrder.checklist?.[k] ? <CheckSquare size={16} /> : <div style={{ width: '16px', height: '16px', border: '1.5px solid currentColor', borderRadius: '4px' }} />}{l}</button>))}</div></div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}><div><Lbl>QABUL SANASI</Lbl><input type="date" value={newOrder.orderDate} onChange={e => setNewOrder({...newOrder, orderDate: e.target.value})} style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px' }} /></div><div><Lbl>MUDDATI (KUN)</Lbl><input type="number" value={newOrder.durationDays} onChange={e => setNewOrder({...newOrder, durationDays: e.target.value})} style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px' }} /></div></div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div style={{ background: '#0f0f1b', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '24px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}><History size={20} color="var(--accent-gold)" /><h4 style={{ fontSize: '15px', fontWeight: '900', textTransform: 'uppercase' }}>XARAKATLAR TARIXI</h4></div>
                <div style={{ flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(newOrder.timeline || []).map((item, idx) => {
                    const isSystem = ['system', 'status', 'stage', 'factory_rejection'].includes(item.type);
                    
                    if (isSystem) {
                      return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', display: 'flex', gap: '8px' }}>
                            <span style={{ color: 'rgba(255,255,255,0.2)' }}>{new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span style={{ fontWeight: '700', color: 'rgba(251,191,36,0.3)' }}>{item.user}:</span>
                            <span>{item.text}</span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={idx} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)', marginTop: '8px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '900', color: item.type === 'task' ? '#3b82f6' : 'var(--accent-gold)' }}>
                            {item.user} {item.type === 'task' ? '(Vazifa)' : '(Izoh)'}
                          </span>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>{new Date(item.time).toLocaleTimeString()}</span>
                        </div>
                        <p style={{ fontSize: '15px', color: '#e2e8f0', lineHeight: '1.6' }}>{item.text}</p>
                      </div>
                    );
                  })}
                  <div ref={timelineEndRef} />
                </div>
                <div style={{ padding: '24px 32px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', display: 'flex', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderRight: '1px solid rgba(255,255,255,0.05)', paddingRight: '20px' }}>
                    <button onClick={() => setInputType('comment')} style={{ width: '48px', height: '48px', borderRadius: '14px', background: inputType === 'comment' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.03)', color: inputType === 'comment' ? 'black' : 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageSquare size={20} /></button>
                    <button onClick={() => setInputType('task')} style={{ width: '48px', height: '48px', borderRadius: '14px', background: inputType === 'task' ? '#3b82f6' : 'rgba(255,255,255,0.03)', color: inputType === 'task' ? 'white' : 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckSquare size={20} /></button>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {inputType === 'task' && <input type="datetime-local" value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid #3b82f6', borderRadius: '10px', color: 'white', padding: '8px', fontSize: '12px' }} />}
                    <div style={{ position: 'relative' }}><textarea value={commentText} onChange={e => setCommentText(e.target.value)} placeholder={inputType === 'task' ? "Vazifa matni..." : "Izoh qoldiring..."} style={{ width: '100%', height: '100px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '15px', padding: '15px', color: 'white', resize: 'none' }} /><button onClick={handleAddComment} style={{ position: 'absolute', right: '10px', bottom: '10px', background: inputType === 'task' ? '#3b82f6' : 'var(--accent-gold)', color: inputType === 'task' ? 'white' : 'black', border: 'none', padding: '8px 15px', borderRadius: '10px', fontWeight: '800' }}>Yuborish</button></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isKPModalOpen && <KPModal onClose={() => setIsKPModalOpen(false)} onSaved={loadData} />}
      {isAgentModalOpen && <AgentModal onClose={() => setIsAgentModalOpen(false)} onSaved={loadData} />}
      {isCustomerModalOpen && <CustomerModal onClose={() => setIsCustomerModalOpen(false)} onSaved={loadData} />}

      {contextMenu.isOpen && (
        <div 
          style={{ 
            position: 'fixed', 
            top: contextMenu.y, 
            left: contextMenu.x, 
            zIndex: 9999, 
            background: '#1a1a2e', 
            border: '1px solid var(--border-color)', 
            borderRadius: '12px', 
            padding: '8px', 
            boxShadow: '0 20px 50px rgba(0,0,0,0.9)', 
            minWidth: '220px' 
          }}
          onMouseLeave={() => setContextMenu({ ...contextMenu, isOpen: false })}
        >
          <button 
            onClick={() => {
              if (contextMenu.isLocked) return alert("Ushbu bosqichdagi yoki boshqa menedjer ochgan buyurtmani o'chirib bo'lmaydi.");
              setDeleteModal({ isOpen: true, orderId: contextMenu.orderId, reason: '' });
              setContextMenu({ ...contextMenu, isOpen: false });
            }}
            style={{ 
              width: '100%', 
              padding: '12px', 
              textAlign: 'left', 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.2)', 
              borderRadius: '8px',
              color: '#ef4444', 
              fontSize: '13px', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              fontWeight: '800',
              marginBottom: contextMenu.isLocked ? '0' : '8px'
            }}
          >
            <Trash2 size={16} /> Buyurtmani o'chirish
          </button>

          {!contextMenu.isLocked && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', marginTop: '4px' }}>
              <div style={{ padding: '8px 12px', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Bosqichga o'tkazish</div>
              {STAGES.filter(s => PM_DELETE_ALLOWED_STAGES.includes(s.id)).map(s => (
                <button 
                  key={s.id}
                  onClick={async () => {
                    const orderId = contextMenu.orderId;
                    const order = allOrders.find(o => o._id === orderId || o.id === orderId);
                    if (!order) return;
                    
                    const log = { type: 'stage', text: `Bosqich o'zgardi (Menyu): ${s.title}`, time: new Date().toISOString(), user: user.name };
                    try {
                      const res = await api.put(`/orders/${order._id}`, { 
                        pmStatus: s.id, 
                        status: 'pm',
                        statusUpdatedAt: new Date().toISOString(),
                        timeline: [...(order.timeline || []), log] 
                      });
                      setAllOrders(allOrders.map(o => o._id === order._id ? res.data : o));
                      setContextMenu({ ...contextMenu, isOpen: false });
                    } catch (err) {
                      console.error("Move error", err);
                    }
                  }}
                  style={{ width: '100%', padding: '10px 12px', textAlign: 'left', background: 'transparent', border: 'none', color: 'white', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(251,191,36,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />
                  {s.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {deleteModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div className="premium-card" style={{ width: '450px', padding: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px', textAlign: 'center' }}>Buyurtmani o'chirish</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', marginBottom: '24px' }}>O'chirish sababini tanlang:</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                "Mijoz rad etdi",
                "Narxi qimmatlik qildi",
                "Muddat to'g'ri kelmadi",
                "Boshqa joydan sotib oldi",
                "Xato kiritilgan"
              ].map(reason => (
                <button 
                  key={reason}
                  onClick={() => confirmDelete(reason)}
                  style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: '0.2s', textAlign: 'left' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(251,191,36,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                >
                  {reason}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => setDeleteModal({ isOpen: false, orderId: null, reason: '' })}
              style={{ width: '100%', marginTop: '20px', padding: '12px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
