import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, Plus, Search, FileUp, FileCheck, CheckSquare, 
  Send, X, Check, MapPin, Phone, User, Users, ChevronDown, 
  Store, Smartphone, File as FileIcon, UserPlus, Calendar, Info,
  Edit, Trash2, Eye, Trash, ZoomIn, Clock, ArrowRight, MoreHorizontal,
  GripVertical, FileText, ArrowLeft, Lock, ShoppingBag, History, MessageSquare, Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import KPModal from '../SalesManager/KPModal';
import api from '../../utils/api';

const STAGES = [
  { id: 'yangi_buyurtma', title: 'Yangi buyurtma', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  { id: 'kontrol_zamer', title: 'Kontrolni zamer jarayonida', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  { id: 'chizma_chizish', title: 'Chizma chizish jarayonida', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  { id: 'chizma_tasdiqlash', title: 'Chizma tasdiqlash jarayonida', color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
  { id: 'topshirildi', title: 'Ishlab chiqarishga topshirildi', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { id: 'ustanovka', title: 'Ustanovka jarayonida', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  { id: 'tayyor', title: 'Mijozga topshirishga tayyor', color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
  { id: 'bajarildi', title: 'Buyurtma bajarildi', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
];

const PROPERTY_TYPES = [
  { label: 'Hovli', value: 'hovli' },
  { label: 'Dom', value: 'dom' },
  { label: 'Ofis', value: 'ofis' }
];

const LOCKED_STAGES = ['yopildi']; // PM can move any stage except archived



const SOURCE_OPTIONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tanish', label: 'Tanish orqali' },
  { value: 'tavsiya', label: 'Tavsiya orqali' },
  { value: 'agent', label: 'Agentlar orqali' },
];

const checklistLabels = {
  design3d: '3D Dizayn', construction: 'Konstruksiya',
  color: 'Rang', handle: 'Ruchka', materials: 'Materiallar'
};

// в”Ђв”Ђв”Ђ Shared Components в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
const Lbl = ({ children }) => (
  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
    {children}
  </label>
);

const IconInput = ({ icon: Icon, ...props }) => (
  <div style={{ position: 'relative' }}>
    <Icon size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
    <input {...props} style={{ width: '100%', paddingLeft: '40px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', height: '44px', color: 'white', fontSize: '14px', ...(props.style || {}) }} />
  </div>
);

// в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
//  FAYL MENEJERI MODALI
// в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// в”Ђв”Ђв”Ђ Formatters в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
const formatAmount = (val) => {
  if (val === undefined || val === null || val === "") return "";
  const num = val.toString().replace(/\D/g, "");
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const formatPhone = (val) => {
  if (!val) return "+998 ";
  let v = val.replace(/\D/g, "");
  if (!v.startsWith("998")) v = "998" + v;
  v = v.substring(0, 12); // Max 12 digits (998 + 9 digits)
  
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

const FileManagerModal = ({ type, files, onRemove, onClose, onAdd }) => {
  const [zoomFile, setZoomFile] = useState(null);
  const [contextMenu, setContextMenu] = useState({ isOpen: false, x: 0, y: 0, file: null });
  const inputRef = useRef(null);

  const getFileUrl = (file) => {
    if (file instanceof File) return URL.createObjectURL(file);
    if (file.content) return file.content;
    return file.url || '';
  };

  const handleViewFile = (file) => {
    const url = getFileUrl(file);
    if (!url) return alert("Faylni ochib bo'lmadi.");
    
    const win = window.open();
    if (win) {
      if (file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf')) {
        win.document.write(`<title>${file.name}</title><embed width="100%" height="100%" src="${url}" type="application/pdf">`);
      } else if (file.type?.includes('image')) {
        win.document.write(`<title>${file.name}</title><img src="${url}" style="max-width:100%; height:auto;">`);
      } else {
        win.location.href = url;
      }
    }
  };

  const handleDownloadFile = (f) => {
    const url = getFileUrl(f);
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = f.name || 'yuklangan_fayl';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setContextMenu({ isOpen: false, x: 0, y: 0, file: null });
  };

  const handleFilesAdded = async (newFiles) => {
    const processed = [];
    for (let f of Array.from(newFiles)) {
      const base64 = await fileToBase64(f);
      processed.push({ name: f.name, type: f.type, content: base64, size: f.size });
    }
    onAdd(processed);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(15px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
      <div className="premium-card" style={{ width: '800px', maxWidth: '95%', padding: '40px', border: '1px solid var(--accent-gold)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--accent-gold)' }}>
            {type === 'kp' ? <FileCheck size={28} /> : <FileIcon size={28} />}
            {type === 'kp' ? 'KP Hujjatlari' : 'Dizayn Hujjatlari'}
          </h3>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '50%' }}><X /></button>
        </div>

        <div style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', display: 'grid', gap: '20px', maxHeight: '500px', overflowY: 'auto', padding: '10px' }}>
          {files.map((file, idx) => (
            <div 
              key={idx} 
              className="file-item" 
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ isOpen: true, x: e.pageX, y: e.pageY, file: file });
              }}
              style={{ background: '#111', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', transition: '0.3s' }}
            >
              <div style={{ height: '140px', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                 {file.type?.includes('image') ? (
                   <img src={getFileUrl(file)} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 ) : (
                   <div style={{ textAlign: 'center' }}>
                      <FileIcon size={48} color="var(--accent-gold)" />
                      <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '8px' }}>PDF HUJJAT</p>
                   </div>
                 )}
              </div>
              <div style={{ padding: '15px' }}>
                 <p style={{ fontSize: '12px', fontWeight: '700', marginBottom: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</p>
                 <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleViewFile(file)} className="gold-btn" style={{ flex: 1, padding: '8px 0', fontSize: '11px', justifyContent: 'center' }}><Eye size={14} /> Ochish</button>
                    <button onClick={() => onRemove(idx)} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '8px', borderRadius: '8px' }}><Trash2 size={16} /></button>
                 </div>
              </div>
            </div>
          ))}
          <button onClick={() => inputRef.current?.click()} style={{ border: '2px dashed var(--accent-gold)', borderRadius: '16px', height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', background: 'rgba(251,191,36,0.05)', gap: '15px', transition: '0.3s' }}>
            <Plus size={32} />
            <span style={{ fontWeight: '800' }}>Yangi Fayl</span>
          </button>
        </div>

        <input type="file" ref={inputRef} style={{ display: 'none' }} multiple onChange={(e) => handleFilesAdded(e.target.files)} />
        <button onClick={onClose} className="gold-btn" style={{ width: '100%', marginTop: '32px', justifyContent: 'center', height: '54px', fontSize: '16px', fontWeight: '800' }}> Ma'lumotlarni Saqlash</button>
      </div>

      {contextMenu.isOpen && (
        <div 
          style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, background: '#1a1a2e', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 5000, minWidth: '160px', overflow: 'hidden' }}
          onMouseLeave={() => setContextMenu({ isOpen: false, x: 0, y: 0, file: null })}
        >
          <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>
            Fayl amallari
          </div>
          <button 
            onClick={() => handleDownloadFile(contextMenu.file)}
            style={{ width: '100%', padding: '12px 16px', textAlign: 'left', background: 'transparent', border: 'none', color: '#10b981', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: '0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <FileUp size={14} style={{ transform: 'rotate(180deg)' }} /> Yuklab olish
          </button>
        </div>
      )}
    </div>
  );
};

// в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
//  YANGI MIJOZ VA AGENT MODALLARI
// в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
const AgentModal = ({ onClose, onSaved }) => {
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '+998 ', firm: '' });
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setForm({ ...form, [name]: formatPhone(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
      <div className="premium-card" style={{ width: '450px', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px' }}>Yangi Agent Qo'shish</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSave} autoComplete="off">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div><Lbl>Ism</Lbl><input name="firstName" value={form.firstName} onChange={handleChange} required style={{ width: '100%' }} autoComplete="off" /></div>
            <div><Lbl>Familiya</Lbl><input name="lastName" value={form.lastName} onChange={handleChange} required style={{ width: '100%' }} autoComplete="off" /></div>
            <div><Lbl>Telefon</Lbl><input name="phone" value={form.phone} onChange={handleChange} required style={{ width: '100%' }} autoComplete="off" /></div>
            <div><Lbl>Firma (Agar bo'lsa)</Lbl><input name="firm" value={form.firm} onChange={handleChange} style={{ width: '100%' }} autoComplete="off" /></div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '32px' }}>
            <button type="button" onClick={onClose} className="secondary-btn" style={{ flex: 1 }} disabled={loading}>Bekor Qilish</button>
            <button type="submit" className="gold-btn" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CustomerModal = ({ onClose, onSaved, user }) => {
    const [form, setForm] = useState({ 
      firstName: '', lastName: '', phone: '+998 ', address: '', 
      propertyType: 'kvartira', age: '', gender: 'erkak', source: '', selectedAgent: null 
    });
    const [agentSearch, setAgentSearch] = useState('');
    const [agentSuggestions, setAgentSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      if (name === 'phone') {
        setForm({ ...form, [name]: formatPhone(value) });
      } else {
        setForm({ ...form, [name]: value });
      }
    };
  
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
        <div className="premium-card" style={{ width: '1000px', padding: '48px', maxHeight: '92vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
            <h3 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-0.5px' }}>Yangi Mijoz Qo'shish</h3>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '50%', color: 'var(--text-secondary)' }}><X size={24} /></button>
          </div>
          <form onSubmit={handleSave} autoComplete="off">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div><Lbl>Ism</Lbl><input name="firstName" value={form.firstName} onChange={handleChange} required style={{ width: '100%', height: '54px', fontSize: '16px' }} placeholder="Mijoz ismi..." autoComplete="off" /></div>
                <div><Lbl>Familiya</Lbl><input name="lastName" value={form.lastName} onChange={handleChange} required style={{ width: '100%', height: '54px', fontSize: '16px' }} placeholder="Mijoz familiyasi..." autoComplete="off" /></div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '24px' }}>
                <div><Lbl>Telefon</Lbl><input name="phone" value={form.phone} onChange={handleChange} required style={{ width: '100%', height: '54px', fontSize: '16px' }} autoComplete="off" /></div>
                <div><Lbl>Yoshi</Lbl><input name="age" type="number" value={form.age} onChange={handleChange} style={{ width: '100%', height: '54px', fontSize: '16px' }} placeholder="Yosh..." autoComplete="off" /></div>
                <div>
                  <Lbl>Jinsi</Lbl>
                  <div style={{ display: 'flex', gap: '8px' }}>{['erkak', 'ayol'].map(g => (
                    <button key={g} type="button" onClick={() => setForm({...form, gender: g})} style={{ flex: 1, height: '54px', borderRadius: '12px', background: form.gender === g ? 'var(--accent-gold)' : 'rgba(255,255,255,0.03)', color: g === form.gender ? 'black' : 'var(--text-secondary)', border: '1px solid var(--border-color)', textTransform: 'capitalize', fontWeight: '700', fontSize: '14px' }}>{g}</button>
                  ))}</div>
                </div>
              </div>

              <div>
                <Lbl>Uy Turi</Lbl>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>{PROPERTY_TYPES.map(pt => (
                  <button key={pt.value} type="button" onClick={() => setForm({...form, propertyType: pt.value})} style={{ height: '54px', borderRadius: '12px', background: form.propertyType === pt.value ? 'var(--accent-gold)' : 'rgba(255,255,255,0.03)', color: pt.value === form.propertyType ? 'black' : 'var(--text-secondary)', border: '1px solid var(--border-color)', fontSize: '14px', fontWeight: '700' }}>{pt.label}</button>
                ))}</div>
              </div>

              <div><Lbl>Manzil</Lbl><input name="address" value={form.address} onChange={handleChange} required style={{ width: '100%', height: '54px', fontSize: '16px' }} placeholder="To'liq manzil..." autoComplete="off" /></div>
              
              <div>
                <Lbl>Platforma (Mijoz qaerdan kelgan?)</Lbl>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>{SOURCE_OPTIONS.map(opt => (
                  <button key={opt.value} type="button" onClick={() => setForm({...form, source: opt.value})} style={{ height: '60px', borderRadius: '12px', background: form.source === opt.value ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${form.source === opt.value ? 'var(--accent-gold)' : 'var(--border-color)'}`, color: opt.value === form.source ? 'var(--accent-gold)' : 'var(--text-secondary)', fontSize: '13px', fontWeight: '700', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>{opt.label}</button>
                ))}</div>
              </div>

              {form.source === 'agent' && (
                <div style={{ position: 'relative' }}>
                  <Lbl>Agent Qidirish</Lbl>
                  <IconInput icon={Search} value={agentSearch} onChange={e => setAgentSearch(e.target.value)} placeholder="Agent ismini yozing..." autoComplete="off" style={{ height: '54px' }} />
                  {agentSuggestions.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: '#1a1a2e', zIndex: 100, border: '1px solid var(--border-color)', marginTop: '8px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                      {agentSuggestions.map(a => <div key={a._id} onClick={() => { setForm({...form, selectedAgent: a}); setAgentSearch(`${a.firstName} ${a.lastName}`); setAgentSuggestions([]); }} style={{ padding: '15px 20px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '14px' }}>{a.firstName} {a.lastName} <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>({a.firm})</span></div>)}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '54px' }}>
              <button type="button" onClick={onClose} className="secondary-btn" style={{ flex: 1, height: '60px', fontSize: '18px', fontWeight: '800' }} disabled={loading}>Bekor Qilish</button>
              <button type="submit" className="gold-btn" style={{ flex: 1, justifyContent: 'center', height: '60px', fontSize: '18px', fontWeight: '800' }} disabled={loading}>
                {loading ? 'Saqlanmoqda...' : 'Mijozni Saqlash'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
};

// в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
//  ASOSIY CRM BOARD (DRAG AND DROP INTEGRATED)
// в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
const Orders = () => {
  const { user } = useAuth();
  const [allOrders, setAllOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);
  
  const location = useLocation();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('kanban');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'day', 'month', 'year'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setCurrentView(location.pathname.includes('archive') ? 'archive' : 'kanban');
  }, [location.pathname]);
  
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  
  const [fileManager, setFileManager] = useState({ isOpen: false, type: 'kp' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, orderId: null });
  const [editingId, setEditingId] = useState(null);
  const [contextMenu, setContextMenu] = useState({ isOpen: false, x: 0, y: 0, orderId: null });
  const [isKPModalOpen, setIsKPModalOpen] = useState(false);
  const timelineEndRef = useRef(null);



  useEffect(() => {
    const customersList = JSON.parse(localStorage.getItem('erp_customers') || '[]');
    const updatedCustomers = customersList.map(c => {
      if (c.stage === 'dizayn') return { ...c, stage: 'prezentatsiya' };
      if (c.stage === 'montaj') return { ...c, stage: 'ornatish' };
      return c;
    });
    if (JSON.stringify(customersList) !== JSON.stringify(updatedCustomers)) {
      localStorage.setItem('erp_customers', JSON.stringify(updatedCustomers));
    }
  }, []);

  useEffect(() => {
    // Migration: Update old status IDs to new one
    const migrationMap = {
      'Yangi': 'yangi',
      'Tasdiqlangan': 'tasdiqlandi',
      'Ishlab chiqarishda': 'ishlab_chiqarishda',
      'Ombor': 'ombor',
      'O\'rnatishda': 'ornatish',
      'Bajarildi': 'bajarildi'
    };
    
    let needsMigration = false;
    const migrated = allOrders.map(o => {
      if (migrationMap[o.status]) {
        needsMigration = true;
        return { ...o, status: migrationMap[o.status] };
      }
      return o;
    });

    if (needsMigration) {
      setAllOrders(migrated);
      localStorage.setItem('erp_orders', JSON.stringify(migrated));
    }
  }, []);

  useEffect(() => {
    const handleGlobalClick = () => {
      if (contextMenu.isOpen) setContextMenu(prev => ({ ...prev, isOpen: false }));
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [contextMenu.isOpen]);
  const [lastRate, setLastRate] = useState(() => localStorage.getItem('erp_last_rate') || '');

  const emptyOrder = { 
    customerSearch: '', selectedCustomer: null, amount: '', currency: 'UZS', exchangeRate: lastRate, 
    kpFiles: [], designFiles: [], checklist: { design3d: false, construction: false, color: false, handle: false, materials: false }, 
    durationDays: '', orderDate: new Date().toISOString().split('T')[0], deliveryDate: '', status: 'yangi', description: '',
    meetingLocation: '' // 'Showroomda' or 'Obyektda'
  };
  const [newOrder, setNewOrder] = useState(emptyOrder);

  const scrollToBottom = () => { timelineEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(() => { if (isOrderModalOpen) setTimeout(scrollToBottom, 100); }, [isOrderModalOpen, newOrder?.timeline]);
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

  useEffect(() => {
    if (isOrderModalOpen && !editingId) {
      setNewOrder(prev => ({ ...prev, exchangeRate: localStorage.getItem('erp_last_rate') || '' }));
    }
  }, [isOrderModalOpen, editingId]);

  const filteredOrders = allOrders.filter(o => {
    const matchesUser = user?.role === 'super' || (user?.role === 'showroom' && o.showroom === user.showroom) || (user?.role === 'proekt_manager' && o.assignedPmId === user.id);
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

  useEffect(() => {
    // Agar mijoz tanlangan bo'lsa va qidiruv matni uning ismi bilan to'g'ri kelsa - variantlarni ko'rsatma
    if (newOrder.selectedCustomer) {
      const selectedName = `${newOrder.selectedCustomer.firstName} ${newOrder.selectedCustomer.lastName}`;
      if (newOrder.customerSearch === selectedName) {
        setCustomerSuggestions([]);
        return;
      }
      // Foydalanuvchi qaytadan yozayotgan bo'lsa - tanlangan mijozni bekor qil
      setNewOrder(prev => ({ ...prev, selectedCustomer: null }));
    }
    if (newOrder.customerSearch.length > 1) {
      const filtered = customers.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(newOrder.customerSearch.toLowerCase()));
      setCustomerSuggestions(filtered);
      setSelectedSuggestionIndex(0); // Reset index on results change
    } else {
      setCustomerSuggestions([]);
      setSelectedSuggestionIndex(0);
    }
  }, [newOrder.customerSearch, customers]);

  const handleCustomerKeyDown = (e) => {
    if (customerSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => (prev + 1) % customerSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => (prev - 1 + customerSuggestions.length) % customerSuggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault(); // Stop form submission
      const selected = customerSuggestions[selectedSuggestionIndex];
      if (selected) {
        setNewOrder({ ...newOrder, selectedCustomer: selected, customerSearch: `${selected.firstName} ${selected.lastName}` });
        setCustomerSuggestions([]);
      }
    } else if (e.key === 'Escape') {
      setCustomerSuggestions([]);
    }
  };

  const handleDragStart = (e, orderId) => { e.dataTransfer.setData('orderId', orderId); e.target.style.opacity = '0.5'; };
  const handleDragEnd = (e) => { e.target.style.opacity = '1'; };
  const handleDragOver = (e) => { e.preventDefault(); };
  const handleDrop = async (e, stageId) => {
    const orderId = e.dataTransfer.getData('orderId');
    const order = allOrders.find(o => o._id === orderId || o.id === Number(orderId));
    if (!order) return;

    try {
      const updates = { pmStatus: stageId };
      if (stageId === 'topshirildi') updates.status = 'ishlab_chiqarishda';
      else if (stageId === 'ustanovka') updates.status = 'ornatish';
      else if (stageId === 'bajarildi') updates.status = 'bajarildi';
      else if (stageId === 'yangi_buyurtma') updates.status = 'pm';
      else updates.status = 'pm';

      const log = { type: 'system', text: `Bosqich o'zgartirildi: ${STAGES.find(s => s.id === stageId)?.title}`, time: new Date().toISOString(), user: user.name };
      
      const res = await api.put(`/orders/${order._id || orderId}`, {
        ...updates,
        timeline: [...(order.timeline || []), log]
      });
      
      setAllOrders(allOrders.map(o => o._id === (order._id || orderId) ? res.data : o));
    } catch (err) {
      console.error("Drop error", err);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!newOrder.selectedCustomer) return alert('Mijozni tanlang!');
    
    const cleanAmount = newOrder.amount.toString().replace(/\s/g, '');
    const cleanExchangeRate = newOrder.exchangeRate.toString().replace(/\s/g, '');
    if (!cleanAmount) return alert('Summani kiriting!');

    let finalAmount = Number(cleanAmount);
    let originalData = null;
    
    if (newOrder.currency === 'USD') {
      if (!cleanExchangeRate) return alert('Valyuta kursini kiriting!');
      localStorage.setItem('erp_last_rate', cleanExchangeRate);
      finalAmount = Number(cleanAmount) * Number(cleanExchangeRate);
      originalData = { originalAmount: cleanAmount, originalCurrency: newOrder.currency, originalRate: cleanExchangeRate };
    }

    const orderPayload = { ...newOrder, amount: finalAmount, exchangeRate: Number(cleanExchangeRate || 0), currency: 'UZS', meta: originalData };
    
    try {
      if (editingId) {
        const res = await api.put(`/orders/${editingId}`, orderPayload);
        setAllOrders(allOrders.map(o => o._id === editingId ? res.data : o));
      } else {
        const res = await api.post('/orders', {
          ...orderPayload,
          uniqueId: `EXP-${allOrders.length + 1001}`
        });
        setAllOrders([...allOrders, res.data]);
      }
      setIsOrderModalOpen(false); 
      setEditingId(null); 
      setNewOrder(emptyOrder);
    } catch (err) {
      console.error("Save error", err);
      alert("Saqlashda xatolik!");
    }
  };

  const confirmDelete = (reason) => {
    if (!reason.trim()) return alert('Sababini kiriting!');
    const deletedOrder = allOrders.find(o => o.id === deleteModal.orderId);
    const updated = allOrders.filter(o => o.id !== deleteModal.orderId);
    setAllOrders(updated);
    localStorage.setItem('erp_orders', JSON.stringify(updated));
    const trash = JSON.parse(localStorage.getItem('erp_trash') || '[]');
    trash.push({ 
      ...deletedOrder, 
      type: 'order', 
      deleteReason: reason, 
      deletedAt: new Date().toISOString() 
    });
    localStorage.setItem('erp_trash', JSON.stringify(trash));
    setDeleteModal({ isOpen: false, orderId: null });
  };

  if (!user) return <div style={{ padding: '40px', textAlign: 'center' }}>Yuklanmoqda...</div>;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexShrink: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {currentView === 'archive' && (
              <button 
                onClick={() => navigate('/proekt-manager/orders')} 
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '10px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 style={{ fontSize: '32px', fontWeight: '900' }}>{currentView === 'archive' ? 'Buyurtmalar Arxivi' : 'CRM kengashi'} <span style={{ color: 'var(--accent-gold)' }}>{currentView === 'archive' ? 'yopilgan' : 'faol'}</span></h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{currentView === 'archive' ? 'Barcha yakunlangan va arxivlangan buyurtmalar.' : 'Buyurtmalarni sichqoncha bilan surib boshqaring.'}</p>
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
          <div style={{ position: 'relative', width: '280px' }}>
             <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
             <input type="text" placeholder="Qidirish..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%', paddingLeft: '44px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', height: '44px' }} />
          </div>
          {currentView !== 'archive' && (
            <>
              <button className="secondary-btn" onClick={() => setIsAgentModalOpen(true)} style={{ height: '44px', color: '#8b5cf6', background: 'rgba(139,92,246,0.1)' }}><Smartphone size={18} /> Yangi Agent</button>
              <button className="secondary-btn" onClick={() => setIsCustomerModalOpen(true)} style={{ height: '44px' }}><UserPlus size={18} /> Yangi Mijoz</button>
              <button className="secondary-btn" onClick={() => setIsKPModalOpen(true)} style={{ height: '44px', color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}><FileText size={18} /> Tijorat Taklifi</button>
              <button className="gold-btn" onClick={() => { setEditingId(null); setNewOrder(emptyOrder); setIsOrderModalOpen(true); }} style={{ height: '44px' }}><Plus size={20} /> Yangi Buyurtma</button>
            </>
          )}
        </div>
      </div>

      <div className="no-scrollbar" style={{ flex: 1, display: 'flex', gap: '24px', overflowX: 'auto', overflowY: 'hidden', paddingBottom: '20px', alignItems: 'stretch' }}>
        {currentView === 'archive' ? (
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
             <div style={{ overflowX: 'auto', flex: 1 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '20px 24px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>ID</th>
                      <th style={{ padding: '20px 24px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Mijoz</th>
                      <th style={{ padding: '20px 24px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Obyekt</th>
                      <th style={{ padding: '20px 24px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Summa</th>
                      <th style={{ padding: '20px 24px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Yopilgan Sana</th>
                      <th style={{ padding: '20px 24px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr><td colSpan="6" style={{ padding: '100px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                          <History size={48} opacity={0.2} />
                          <p>Ushbu muddat uchun arxivlangan buyurtmalar topilmadi.</p>
                        </div>
                      </td></tr>
                    ) : (
                      filteredOrders.map(o => (
                        <tr key={o._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: '0.2s' }}>
                          <td style={{ padding: '20px 24px' }}><span style={{ color: 'var(--accent-gold)', fontWeight: '900' }}>{o.uniqueId}</span></td>
                          <td style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '900' }}>{o.selectedCustomer?.firstName?.charAt(0)}</div>
                              <div>
                                <p style={{ fontWeight: '700', fontSize: '14px' }}>{o.selectedCustomer?.firstName} {o.selectedCustomer?.lastName}</p>
                                <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{o.selectedCustomer?.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '20px 24px' }}><span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{o.propertyType || '—'}</span></td>
                          <td style={{ padding: '20px 24px' }}><span style={{ fontWeight: '900', color: '#fff' }}>{Number(o.amount).toLocaleString()} UZS</span></td>
                          <td style={{ padding: '20px 24px' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                              {(() => {
                                const archLog = o.timeline?.find(l => l?.text?.includes("Arxivlandi"));
                                return archLog ? new Date(archLog.time).toLocaleDateString() : '—';
                              })()}
                            </span>
                          </td>
                          <td style={{ padding: '20px 24px' }}>
                            <button onClick={() => { setEditingId(o._id); setNewOrder(o); setIsOrderModalOpen(true); }} className="secondary-btn" style={{ padding: '8px 16px', fontSize: '12px', gap: '8px' }}><Eye size={14} /> Ko'rish</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
             </div>
          </div>
        ) : (
          STAGES.map(stage => {
            const stageOrders = [...filteredOrders.filter(o => 
              o.pmStatus === stage.id || 
              ((!o.pmStatus || o.pmStatus === 'yangi') && stage.id === 'yangi_buyurtma')
            )].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const total = stageOrders.reduce((s, o) => s + Number(o.amount || 0), 0);
            return (
              <div key={stage.id} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, stage.id)} style={{ minWidth: '320px', width: '320px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: stage.color }} /><h3 style={{ fontSize: '16px', fontWeight: '800' }}>{stage.title}</h3><span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '2px 10px', borderRadius: '12px' }}>{stageOrders.length}</span></div>
                </div>
                <div style={{ marginBottom: '20px', background: stage.bg, padding: '18px', borderRadius: '20px', border: `1px solid ${stage.color}33` }}>
                   <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Jami Qiymat</p>
                   <p style={{ fontSize: '22px', fontWeight: '900', color: stage.color }}>{total.toLocaleString()} UZS</p>
                </div>
                <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                  {stageOrders.map(order => {
                    const isLocked = LOCKED_STAGES.includes(order.status);
                    return (
                      <div 
                        key={order._id} 
                        draggable={!isLocked} 
                        onDragStart={(e) => handleDragStart(e, order._id)} 
                        onDragEnd={handleDragEnd} 
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setContextMenu({ isOpen: true, x: e.pageX, y: e.pageY, orderId: order._id, isLocked });
                        }}
                        style={{ 
                          background: 'var(--secondary-bg)', 
                          border: '1px solid var(--border-color)', 
                          borderRadius: '20px', 
                          padding: '24px', 
                          marginBottom: '16px', 
                          position: 'relative', 
                          cursor: isLocked ? 'default' : 'grab',
                          opacity: isLocked ? 0.8 : 1
                        }}
                        onClick={() => { setEditingId(order._id); setNewOrder(order); setIsOrderModalOpen(true); }}
                      >
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '100%', background: stage.color, borderRadius: '6px 0 0 6px' }} />
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                               <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--accent-gold)', background: 'rgba(212,175,55,0.1)', padding: '3px 10px', borderRadius: '8px' }}>{order.uniqueId}</span>
                               {order.productionId && <span style={{ fontSize: '11px', fontWeight: '900', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '3px 10px', borderRadius: '8px' }}>ID: {order.productionId}</span>}
                            </div>
                            {isLocked && <div style={{ fontSize: '10px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '2px 8px', borderRadius: '6px', fontWeight: '800' }}>🔒 Locked</div>}
                            {order.createdAt && !isLocked && (
                              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={10} />
                                {new Date(order.createdAt).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </span>
                            )}
                         </div>
                         <h4 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '8px' }}>{order.selectedCustomer?.firstName} {order.selectedCustomer?.lastName}</h4>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}><Phone size={14} /> {order.selectedCustomer?.phone}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '12px', color: 'var(--accent-gold)', fontWeight: '700' }}>
                          <User size={14} /> Sotuvchi: {order.managerName}
                        </div>
                        {(() => {
                          const status = getDeliveryStatus(order.deliveryDate);
                          return (
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              gap: '4px', 
                              marginBottom: '15px', 
                              padding: '12px 16px', 
                              background: status.bg, 
                              border: `1px solid ${status.color}33`, 
                              borderRadius: '14px' 
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: status.color, fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <Calendar size={12} /> {status.label}
                              </div>
                              <div style={{ fontSize: '20px', fontWeight: '900', color: status.color }}>
                                {status.text}
                              </div>
                            </div>
                          );
                        })()}
                        
                        {order.description && <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', marginBottom: '18px', fontSize: '13px', fontStyle: 'italic' }}>"{order.description}"</div>}
                        
                        {order.pmStatus === 'bajarildi' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', padding: '10px', borderRadius: '10px', background: order.smCompletionApproved ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)', color: order.smCompletionApproved ? '#22c55e' : 'var(--text-secondary)', border: `1px solid ${order.smCompletionApproved ? '#22c55e' : 'var(--border-color)'}` }}>
                              {order.smCompletionApproved ? <CheckSquare size={14} /> : <Clock size={14} />}
                              Sotuv Manager: {order.smCompletionApproved ? 'Tasdiqladi' : 'Kutilmoqda'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', padding: '10px', borderRadius: '10px', background: order.adminCompletionApproved ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)', color: order.adminCompletionApproved ? '#22c55e' : 'var(--text-secondary)', border: `1px solid ${order.adminCompletionApproved ? '#22c55e' : 'var(--border-color)'}` }}>
                              {order.adminCompletionApproved ? <CheckSquare size={14} /> : <Clock size={14} />}
                              Showroom Admin: {order.adminCompletionApproved ? 'Tasdiqladi' : 'Kutilmoqda'}
                            </div>
                          </div>
                        )}
                        
                        <div 
                          onClick={() => { 
                            setEditingId(order.id); 
                            setNewOrder({ ...order, customerSearch: `${order.selectedCustomer?.firstName} ${order.selectedCustomer?.lastName}` }); 
                            setIsOrderModalOpen(true); 
                          }} 
                          style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '16px', cursor: 'pointer' }}
                        >
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <div><p style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Summa</p><p style={{ fontSize: '16px', fontWeight: '900' }}>{Number(order.amount).toLocaleString()} UZS</p></div>
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

      {isOrderModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(20px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          {currentView === 'archive' ? (
            <div className="premium-card" style={{ width: '96vw', height: '94vh', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <div style={{ padding: '24px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--accent-gold)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShoppingBag size={28} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <h3 style={{ fontSize: '24px', fontWeight: '900' }}>Buyurtma: {newOrder.uniqueId}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                        <Lock size={16} />
                        <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>Arxivlangan</span>
                      </div>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
                      Menejer: <span style={{ color: '#fff', fontWeight: '600' }}>{newOrder.managerName}</span> • 
                      Showroom: <span style={{ color: '#fff', fontWeight: '600' }}>{newOrder.showroom}</span>
                      {newOrder.assignedPmName && (
                        <> • PM: <span style={{ color: '#3b82f6', fontWeight: '600' }}>{newOrder.assignedPmName}</span></>
                      )}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <Eye size={18} />
                    <span style={{ fontSize: '13px', fontWeight: '700' }}>Kuzatuv Rejimi</span>
                  </div>
                  <button 
                    onClick={() => setIsOrderModalOpen(false)} 
                    style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', transition: '0.2s', border: 'none', cursor: 'pointer', color: '#fff' }}
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Body Content */}
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '500px 1fr', overflow: 'hidden' }}>
                {/* Left Sidebar - Info */}
                <div style={{ borderRight: '1px solid rgba(255,255,255,0.05)', padding: '40px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    {/* Customer Info */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <User size={18} color="var(--accent-gold)" />
                        <h4 style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mijoz Ma'lumotlari</h4>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ position: 'relative' }}>
                          <Lbl>MIJOZNI TANLANG</Lbl>
                          <IconInput icon={Search} value={`${newOrder.selectedCustomer?.firstName} ${newOrder.selectedCustomer?.lastName}`} readOnly style={{ opacity: 0.7 }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <div><Lbl>TELEFON</Lbl><p style={{ fontWeight: '700', fontSize: '15px' }}>{newOrder.selectedCustomer?.phone}</p></div>
                          <div><Lbl>MANZIL</Lbl><p style={{ fontWeight: '700', fontSize: '15px' }}>{newOrder.selectedCustomer?.address}</p></div>
                        </div>
                      </div>
                    </div>

                    {/* Files Section */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <FileIcon size={18} color="var(--accent-gold)" />
                        <h4 style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hujjatlar va Fayllar</h4>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <button 
                          onClick={() => setFileManager({ isOpen: true, type: 'kp' })} 
                          className="premium-card clickable-card"
                          style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)', textAlign: 'left' }}
                        >
                          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                            <FileCheck size={20} />
                          </div>
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: '800' }}>KP Fayllari</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{newOrder.kpFiles?.length || 0} ta fayl</p>
                          </div>
                        </button>
                        <button 
                          onClick={() => setFileManager({ isOpen: true, type: 'design' })} 
                          className="premium-card clickable-card"
                          style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.03)', textAlign: 'left' }}
                        >
                          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(251,191,36,0.1)', color: 'var(--accent-gold)' }}>
                            <FileIcon size={20} />
                          </div>
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: '800' }}>Dizayn Fayllari</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{newOrder.designFiles?.length || 0} ta fayl</p>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Object & Financial */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <ShoppingCart size={18} color="var(--accent-gold)" />
                        <h4 style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Obyekt va Moliyaviy</h4>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <div><Lbl>QABUL SANASI</Lbl><p style={{ fontWeight: '700' }}>{newOrder.orderDate}</p></div>
                          <div><Lbl>MUDDATI (KUN)</Lbl><p style={{ fontWeight: '700' }}>{newOrder.durationDays || '—'}</p></div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
                          <div>
                            <Lbl>SUMMA</Lbl>
                            <p style={{ fontSize: '20px', fontWeight: '900', color: 'var(--accent-gold)' }}>
                              {Number(newOrder.amount).toLocaleString()} UZS
                            </p>
                          </div>
                          <div><Lbl>VALYUTA</Lbl><p style={{ fontWeight: '700' }}>{newOrder.currency || 'UZS'}</p></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Area - Timeline */}
                <div style={{ display: 'flex', flexDirection: 'column', background: '#0f0f1b', overflow: 'hidden' }}>
                  <div style={{ padding: '24px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <History size={20} color="var(--accent-gold)" />
                    <h4 style={{ fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Xarakatlar Tarixi</h4>
                  </div>
                  
                  <div style={{ flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {(newOrder.timeline || []).map((item, idx) => (
                      <div key={idx} style={{ position: 'relative', paddingLeft: '40px' }}>
                        {idx !== newOrder.timeline.length - 1 && (
                          <div style={{ position: 'absolute', left: '10px', top: '24px', bottom: '-24px', width: '2px', background: 'rgba(255,255,255,0.05)' }} />
                        )}
                        <div style={{ 
                          position: 'absolute', 
                          left: '0', 
                          top: '4px', 
                          width: '22px', 
                          height: '22px', 
                          borderRadius: '50%', 
                          background: item.type === 'comment' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: item.type === 'comment' ? 'black' : 'var(--text-secondary)',
                          zIndex: 2,
                          boxShadow: '0 0 0 4px #0f0f1b'
                        }}>
                          {item.type === 'comment' ? <MessageSquare size={10} /> : <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />}
                        </div>
                        
                        {item.type === 'comment' ? (
                          <div style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.1)', borderRadius: '16px', padding: '20px 24px', position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                              <span style={{ fontSize: '14px', fontWeight: '900', color: 'var(--accent-gold)' }}>{item.user}</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{new Date(item.time).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                            </div>
                            <p style={{ fontSize: '15px', color: '#fff', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{item.text}</p>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '16px', alignItems: 'baseline' }}>
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', minWidth: '60px' }}>{new Date(item.time).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                              <span style={{ fontWeight: '800', color: 'rgba(255,255,255,0.8)' }}>{item.user}</span>: {item.text}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={timelineEndRef} />
                  </div>

                  <div style={{ padding: '32px 40px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                    <div style={{ 
                      background: 'rgba(255,255,255,0.03)', 
                      borderRadius: '16px', 
                      padding: '24px', 
                      border: '1px dashed var(--border-color)',
                      textAlign: 'center',
                      color: 'var(--text-secondary)',
                      fontSize: '14px'
                    }}>
                      Kuzatuv rejimida izoh qoldirib bo'lmaydi
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="premium-card" style={{ width: '1400px', padding: '60px', maxHeight: '96vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
                <div>
                  <h3 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-1px' }}>{editingId ? 'Buyurtmani Tahrirlash' : 'Yangi Buyurtma Yaratish'}</h3>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Sotuvchi: {newOrder.managerName} • {newOrder.showroom}</p>
                </div>
                <button onClick={() => setIsOrderModalOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '50%', color: 'var(--text-secondary)' }}><X size={28} /></button>
              </div>
            
            <form onSubmit={handleCreateOrder} autoComplete="off">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
                 {/* Chap Ustun */}
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div style={{ position: 'relative' }}>
                       <Lbl>Mijozni Qidirish (Ism yoki Tel)</Lbl>
                       <IconInput 
                          icon={Search} 
                          value={newOrder.customerSearch} 
                          onChange={e => setNewOrder({...newOrder, customerSearch: e.target.value})} 
                          onKeyDown={handleCustomerKeyDown}
                          disabled={user?.role === 'proekt_manager'}
                          style={{ height: '60px', fontSize: '16px' }} 
                          placeholder="Mijoz ma'lumotlarini yozing..." 
                          autoComplete="off" 
                        />
                       {customerSuggestions.length > 0 && (
                         <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: '#1a1a2e', zIndex: 1200, borderRadius: '16px', border: '1px solid var(--border-color)', marginTop: '8px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
                            {customerSuggestions.map((c, idx) => (
                               <div 
                                 key={c.id} 
                                 onClick={() => { setNewOrder({...newOrder, selectedCustomer: c, customerSearch: `${c.firstName} ${c.lastName}`}); setCustomerSuggestions([]); }} 
                                 onMouseEnter={() => setSelectedSuggestionIndex(idx)}
                                 style={{ 
                                   padding: '18px 24px', 
                                   cursor: 'pointer', 
                                   borderBottom: '1px solid rgba(255,255,255,0.05)', 
                                   transition: '0.2s', 
                                   display: 'flex', 
                                   justifyContent: 'space-between', 
                                   alignItems: 'center', 
                                   background: idx === selectedSuggestionIndex ? 'rgba(251,191,36,0.15)' : 'transparent',
                                   borderLeft: idx === selectedSuggestionIndex ? '4px solid var(--accent-gold)' : '4px solid transparent'
                                 }}
                               >
                                 <div style={{ display: 'flex', flexDirection: 'column' }}>
                                   <span style={{ fontWeight: '800', color: idx === selectedSuggestionIndex ? 'var(--accent-gold)' : 'white', fontSize: '15px' }}>{c.firstName} {c.lastName}</span>
                                   <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{c.phone}</span>
                                 </div>
                                 {idx === selectedSuggestionIndex && <span style={{ fontSize: '10px', color: 'var(--accent-gold)', fontWeight: '900', background: 'rgba(212,175,55,0.1)', padding: '2px 8px', borderRadius: '4px' }}>ENTER</span>}
                               </div>
                             ))}
                         </div>
                       )}
                    </div>

                    {newOrder.selectedCustomer && (
                       <div style={{ background: 'rgba(251,191,36,0.03)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(251,191,36,0.15)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}><User size={16} color="var(--accent-gold)" /> <span style={{ fontWeight: '700' }}>{newOrder.selectedCustomer.firstName} {newOrder.selectedCustomer.lastName}</span></div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}><Phone size={16} color="var(--accent-gold)" /> {newOrder.selectedCustomer.phone}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', gridColumn: 'span 2' }}><MapPin size={16} color="var(--accent-gold)" /> {newOrder.selectedCustomer.address}</div>
                       </div>
                    )}

                    <div>
                       <Lbl>To'lov Summasi</Lbl>
                       <div style={{ display: 'grid', gridTemplateColumns: newOrder.currency === 'USD' ? '1.5fr 0.8fr 1.2fr' : '2.2fr 0.8fr', gap: '15px' }}>
                          <IconInput 
                             icon={Smartphone} 
                             type="text" 
                             value={formatAmount(newOrder.amount)} 
                             onChange={e => setNewOrder({...newOrder, amount: formatAmount(e.target.value)})} 
                             disabled={user?.role === 'proekt_manager'}
                             style={{ height: '60px', fontSize: '20px', fontWeight: '900' }} 
                             placeholder="0.00" 
                             required 
                             autoComplete="off" 
                          />
                          <select value={newOrder.currency} onChange={e => setNewOrder({...newOrder, currency: e.target.value})} disabled={user?.role === 'proekt_manager'} style={{ background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px', height: '60px', fontWeight: '700' }}>
                             <option value="UZS">UZS</option>
                             <option value="USD">USD</option>
                          </select>
                          {newOrder.currency === 'USD' && (
                            <IconInput icon={Clock} type="number" value={newOrder.exchangeRate} onChange={e => setNewOrder({...newOrder, exchangeRate: e.target.value})} placeholder="Kurs" style={{ height: '60px', border: '1px solid var(--accent-gold)', fontSize: '16px' }} required autoComplete="off" />
                          )}
                       </div>

                    {newOrder.status === 'uchrashuv' && (
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: '1px dotted var(--border-color)' }}>
                        <Lbl>Uchrashuv Joyi</Lbl>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          {['Showroomda', 'Obyektda'].map(loc => (
                            <button
                              key={loc}
                              type="button"
                              onClick={() => setNewOrder({ ...newOrder, meetingLocation: loc })}
                              style={{
                                flex: 1, height: '54px', borderRadius: '12px',
                                background: newOrder.meetingLocation === loc ? 'var(--accent-gold)' : 'rgba(255,255,255,0.03)',
                                color: newOrder.meetingLocation === loc ? 'black' : 'var(--text-secondary)',
                                border: '1px solid var(--border-color)', fontWeight: '800', fontSize: '14px'
                              }}
                            >
                              {loc}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      <div style={{ gridColumn: 'span 2' }}>
                        <Lbl>Tasdiqlash (Checklist)</Lbl>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                          {Object.entries(checklistLabels).map(([key, label]) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setNewOrder({
                                ...newOrder,
                                checklist: { ...newOrder.checklist, [key]: !newOrder.checklist[key] }
                              })}
                              style={{
                                height: '54px',
                                borderRadius: '12px',
                                background: newOrder.checklist[key] ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                color: newOrder.checklist[key] ? '#10b981' : 'var(--text-secondary)',
                                border: `1px solid ${newOrder.checklist[key] ? '#10b981' : 'var(--border-color)'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                fontWeight: '700',
                                fontSize: '13px',
                                transition: '0.2s'
                              }}
                            >
                              {newOrder.checklist[key] ? <CheckSquare size={18} /> : <div style={{ width: 18, height: 18, border: '2px solid currentColor', borderRadius: '4px' }} />}
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Lbl>Order Sanasi</Lbl>
                        <IconInput icon={Calendar} type="date" value={newOrder.orderDate} onChange={e => setNewOrder({...newOrder, orderDate: e.target.value})} style={{ height: '60px' }} />
                      </div>
                    </div>

                    <div>
                      <Lbl>Buyurtma Izohi (Xususiyatlar, talablar...)</Lbl>
                      <textarea value={newOrder.description} onChange={e => setNewOrder({...newOrder, description: e.target.value})} style={{ width: '100%', height: '140px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '16px', padding: '20px', fontSize: '15px', resize: 'none' }} placeholder="Buyurtma bo'yicha batafsil ma'lumotlar..."></textarea>
                    </div>
                 </div>

                 {/* O'ng Ustun */}
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', paddingLeft: '20px', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <Lbl>Hujjatlar Yuklash (KP va Dizayn)</Lbl>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <button type="button" onClick={() => setFileManager({isOpen: true, type: 'kp'})} style={{ padding: '30px', border: '2px dashed #10b981', borderRadius: '24px', color: '#10b981', background: 'rgba(16,185,129,0.03)', transition: '0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                          <FileUp size={32} /> 
                          <span style={{ fontWeight: '800' }}>KP ({newOrder.kpFiles.length})</span>
                        </button>
                        <button type="button" onClick={() => setFileManager({isOpen: true, type: 'design'})} style={{ padding: '30px', border: '2px dashed var(--accent-gold)', borderRadius: '24px', color: 'var(--accent-gold)', background: 'rgba(251,191,36,0.03)', transition: '0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                          <FileIcon size={32} /> 
                          <span style={{ fontWeight: '800' }}>DIZAYN ({newOrder.designFiles.length})</span>
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                       <div>
                         <Lbl>Ishlash Muddati (Kun)</Lbl>
                         <IconInput icon={Clock} type="number" value={newOrder.durationDays} onChange={e => { 
                           const d = e.target.value; 
                           const date = new Date(newOrder.orderDate); 
                           date.setDate(date.getDate() + parseInt(d || 0)); 
                           setNewOrder({...newOrder, durationDays: d, deliveryDate: date.toISOString().split('T')[0]}); 
                         }} style={{ width: '100%', height: '60px', fontSize: '18px', fontWeight: '800' }} placeholder="Kunlar soni..." autoComplete="off" />
                       </div>
                       <div>
                         <Lbl>Topshirish Sanasi</Lbl>
                         <div style={{ height: '60px', background: 'rgba(251,191,36,0.1)', color: 'var(--accent-gold)', fontWeight: '900', borderRadius: '12px', border: '1px solid rgba(251,191,36,0.3)', display: 'flex', alignItems: 'center', padding: '0 20px', fontSize: '18px' }}>
                           <Calendar size={20} style={{ marginRight: '12px' }} />
                           {newOrder.deliveryDate || 'Tanlanmagan'}
                         </div>
                       </div>
                    </div>

                    {editingId && (
                      <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: '20px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: '300px' }}>
                         <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                           <History size={18} color="var(--accent-gold)" />
                           <h4 style={{ fontSize: '14px', fontWeight: '800' }}>XARAKATLAR TARIXI</h4>
                         </div>
                         <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {(newOrder.timeline || []).map((t, i) => (
                              <div key={i} style={{ display: 'flex', gap: '12px' }}>
                                 <div style={{ minWidth: '100px', fontSize: '11px', color: 'var(--text-secondary)' }}>{new Date(t.time).toLocaleString()}</div>
                                 <div style={{ fontSize: '13px' }}><span style={{ fontWeight: '800' }}>{t.user}</span>: {t.text}</div>
                              </div>
                            ))}
                            <div ref={timelineEndRef} />
                         </div>
                      </div>
                    )}

                    <div style={{ background: '#0a0a0a', padding: '30px', borderRadius: '24px', border: '1px solid var(--border-color)', marginTop: 'auto' }}>
                       <p style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '20px' }}>Tasdiqlash</p>
                       <div style={{ display: 'flex', gap: '20px' }}>
                          <button type="button" onClick={() => setIsOrderModalOpen(false)} className="secondary-btn" style={{ flex: 1, height: '64px', fontSize: '16px', fontWeight: '800' }}>Bekor Qilish</button>
                          <button type="submit" className="gold-btn" style={{ flex: 1, height: '64px', fontSize: '16px', fontWeight: '800', justifyContent: 'center' }}>
                            <Check size={20} /> Saqlash
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
            </form>
          </div>
        )}
      </div>
    )}

      {isAgentModalOpen && <AgentModal onClose={() => setIsAgentModalOpen(false)} onSaved={() => setAllOrders([...allOrders])} />}
      {isCustomerModalOpen && <CustomerModal onClose={() => setIsCustomerModalOpen(false)} onSaved={() => setCustomers(JSON.parse(localStorage.getItem('erp_customers')))} user={user} />}
      {fileManager.isOpen && <FileManagerModal type={fileManager.type} files={fileManager.type === 'kp' ? newOrder.kpFiles : newOrder.designFiles} onClose={() => setFileManager({...fileManager, isOpen: false})} onRemove={(idx) => { if (currentView === 'archive') return; const k = fileManager.type === 'kp' ? 'kpFiles' : 'designFiles'; const up = [...newOrder[k]]; up.splice(idx,1); setNewOrder({...newOrder, [k]: up}); }} onAdd={(files) => { if (currentView === 'archive') return; const k = fileManager.type === 'kp' ? 'kpFiles' : 'designFiles'; const up = [...newOrder[k], ...files]; setNewOrder({...newOrder, [k]: up}); }} />}
      {deleteModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 4000 }}>
          <div className="premium-card" style={{ width: '450px', padding: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px', textAlign: 'center' }}>Nega ushbu buyurtmani o'chirmoqchisiz?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', marginBottom: '24px' }}>Sababni tanlang, bu tahlil uchun muhim.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                "Qimmatlik qildi",
                "Shartlar to'g'ri kelmadi",
                "Muddat to'g'ri kelmadi",
                "Mijoz yo'q bo'lib qoldi",
                "Boshqa konkurentdan sotib oldi"
              ].map(reason => (
                <button 
                  key={reason}
                  onClick={() => confirmDelete(reason)}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', textAlign: 'left', cursor: 'pointer', transition: '0.2s', fontSize: '14px', fontWeight: '600' }}
                  onMouseEnter={e => { e.target.style.background = 'rgba(251,191,36,0.1)'; e.target.style.borderColor = 'var(--accent-gold)'; }}
                  onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                >
                  {reason}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setDeleteModal({ isOpen: false, orderId: null })}
              style={{ width: '100%', marginTop: '20px', padding: '14px', borderRadius: '12px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '700' }}
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}

      {isKPModalOpen && <KPModal onClose={() => setIsKPModalOpen(false)} />}

      {contextMenu.isOpen && (
        <div style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 5000, background: '#1a1a2e', border: '1px solid var(--accent-gold)', borderRadius: '12px', padding: '8px', boxShadow: '0 15px 35px rgba(0,0,0,0.8)', minWidth: '180px', animation: 'fadeIn 0.2s ease-out' }}>
          {!contextMenu.isLocked && (
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', marginBottom: '8px' }}>
              <div style={{ padding: '8px 12px', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Bosqichga o'tkazish</div>
              {STAGES.map(s => (
                <button 
                  key={s.id}
                  onClick={() => {
                    const orderId = contextMenu.orderId;
                    const updated = allOrders.map(o => {
                      if (o.id === orderId) {
                        let updates = { pmStatus: s.id };
                        if (s.id === 'topshirildi') updates.status = 'ishlab_chiqarishda';
                        else if (s.id === 'ustanovka') updates.status = 'ornatish';
                        else if (s.id === 'bajarildi') updates.status = 'bajarildi';
                        else updates.status = 'pm';

                        if (s.id !== 'bajarildi') {
                          updates.smCompletionApproved = false;
                          updates.adminCompletionApproved = false;
                        }
                        
                        const log = { type: 'system', text: `Bosqich o'zgartirildi (Menyu orqali): ${s.title}`, time: new Date().toISOString(), user: user.name };
                        return { ...o, ...updates, timeline: [...(o.timeline || []), log] };
                      }
                      return o;
                    });
                    setAllOrders(updated);
                    localStorage.setItem('erp_orders', JSON.stringify(updated));
                    setContextMenu({ isOpen: false, x: 0, y: 0, orderId: null });
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
          {contextMenu.isLocked ? (
             <div style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={14} /> Faqat ko'rish rejimi
             </div>
          ) : (
            <button 
              onClick={() => setDeleteModal({ isOpen: true, orderId: contextMenu.orderId })}
              style={{ width: '100%', padding: '12px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', color: '#ef4444', background: 'transparent', transition: '0.2s', fontSize: '14px', fontWeight: '700' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Trash2 size={16} /> O'chirish
            </button>
          )}
        </div>
      )}

    </div>
  );
};

export default Orders;
