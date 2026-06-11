import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, DollarSign, Plus, Search, FileUp, FileCheck, CheckSquare, Briefcase,
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
  { id: 'amocrm_lead', title: 'Call Center (Amo) 📞', color: '#8b5cf6', bg: 'rgba(139,92,246,0.05)' },
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
  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;
    
    // Show loading state or feedback if needed
    const uploadedFiles = [];
    for (const f of selectedFiles) {
      try {
        const formData = new FormData();
        formData.append('file', f);
        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedFiles.push({
          name: res.data.name,
          size: f.size,
          type: f.type,
          url: res.data.url,
          uploadedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error("File upload error", err);
        alert(`"${f.name}" faylini yuklashda xatolik yuz berdi.`);
      }
    }
    
    if (uploadedFiles.length > 0) {
      onAdd(uploadedFiles);
    }
    // Reset input
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

const CustomerModal = ({ onClose, onSaved, user, initialType = 'B2C' }) => {
  const [clientType, setClientType] = useState(initialType); // B2C, B2B, Agent
  const [form, setForm] = useState({ 
    firstName: '', 
    lastName: '', 
    phone: '+998 ', 
    address: '', 
    propertyType: 'hovli', 
    source: '', 
    companyName: '',
    inn: '',
    contactPerson: '',
    legalAddress: '',
    agentName: '',
    agentType: '',
    commissionTerms: '',
    status: 'faol',
    managerId: user?.id || user?._id || '',
    managerName: user?.name || ''
  });
  const [leadSources, setLeadSources] = useState([]);
  const [managers, setManagers] = useState([]);
  const [customerTypes, setCustomerTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sourcesRes, usersRes, typesRes] = await Promise.all([
          api.get('/lead-sources'),
          api.get('/users'),
          api.get('/customer-types')
        ]);
        setLeadSources(sourcesRes.data);
        setManagers(usersRes.data);
        setCustomerTypes(typesRes.data);
      } catch (err) {
        console.error("Fetch data error", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => { 
    const { name, value } = e.target; 
    setForm({ ...form, [name]: name === 'phone' ? formatPhone(value) : value }); 
  };
  
  const handleSave = async (e) => { 
    e.preventDefault(); 
    setLoading(true);
    try {
      let payload = { clientType };
      const selectedManager = managers.find(m => m._id === form.managerId);
      const managerName = selectedManager ? `${selectedManager.name} ${selectedManager.surname}` : form.managerName;

      const selectedTypeObj = customerTypes.find(t => t.name === clientType);
      const isB2B = selectedTypeObj?.legalStatus?.toLowerCase().includes('yuridik');
      const isAgent = clientType === 'Agent';

      if (isAgent) {
        payload = { 
          ...payload, 
          type: 'agent', 
          agentName: form.agentName, 
          phone: form.phone, 
          agentType: form.agentType, 
          commissionTerms: form.commissionTerms, 
          status: form.status 
        };
      } else if (isB2B) {
        payload = { 
          ...payload, 
          type: 'customer', 
          subType: 'b2b', 
          companyName: form.companyName, 
          inn: form.inn, 
          contactPerson: form.contactPerson, 
          phone: form.phone, 
          legalAddress: form.legalAddress, 
          source: form.source, 
          managerId: form.managerId, 
          managerName 
        };
      } else {
        // B2C and others (jismoniy)
        payload = { 
          ...payload, 
          type: 'customer', 
          firstName: form.firstName, 
          lastName: form.lastName, 
          phone: form.phone, 
          address: form.address, 
          propertyType: form.propertyType, 
          source: form.source, 
          managerId: form.managerId, 
          managerName 
        };
      }

      await api.post('/customers', payload);
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
      <div className="premium-card" style={{ width: '800px', padding: '48px', maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '32px', fontWeight: '900' }}>Yangi Mijoz Qo'shish</h3>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '50%', color: 'white' }}><X /></button>
        </div>
        
        <div style={{ marginBottom: '32px' }}>
          <Lbl>Mijoz Turi</Lbl>
          <select 
            value={clientType} 
            onChange={(e) => setClientType(e.target.value)}
            style={{ 
              width: '100%', 
              height: '54px', 
              background: 'var(--secondary-bg)', 
              border: '1px solid var(--border-color)', 
              color: 'white', 
              borderRadius: '12px', 
              padding: '0 15px',
              fontSize: '15px',
              fontWeight: '600',
              outline: 'none'
            }}
          >
            {customerTypes.length > 0 ? (
              customerTypes.map(t => <option key={t._id} value={t.name}>{t.name}</option>)
            ) : (
              <>
                <option value="B2C">B2C</option>
                <option value="B2B">B2B</option>
                <option value="Agent">Agent</option>
              </>
            )}
          </select>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {(() => {
              const selectedTypeObj = customerTypes.find(t => t.name === clientType);
              const isB2B = selectedTypeObj?.legalStatus?.toLowerCase().includes('yuridik');
              const isAgent = clientType === 'Agent';

              if (isAgent) {
                return (
                  <>
                    <div><Lbl>Agent nomi</Lbl><input name="agentName" value={form.agentName} onChange={handleChange} required autoComplete="off" style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px' }} /></div>
                    <div><Lbl>Telefon</Lbl><input name="phone" value={form.phone} onChange={handleChange} required autoComplete="off" style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px' }} /></div>
                    <div><Lbl>Agent turi</Lbl><input name="agentType" value={form.agentType} onChange={handleChange} required placeholder="Masalan: Dizayner, Quruvchi" autoComplete="off" style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px' }} /></div>
                    <div><Lbl>Komissiya sharti</Lbl><input name="commissionTerms" value={form.commissionTerms} onChange={handleChange} required placeholder="Masalan: 5% yoki 500 000" autoComplete="off" style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px' }} /></div>
                    <div>
                       <Lbl>Status</Lbl>
                       <select name="status" value={form.status} onChange={handleChange} style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px', outline: 'none' }}>
                         <option value="faol">Faol</option>
                         <option value="bloklangan">Bloklangan</option>
                       </select>
                    </div>
                  </>
                );
              }

              if (isB2B) {
                return (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      <div><Lbl>Kompaniya nomi</Lbl><input name="companyName" value={form.companyName} onChange={handleChange} required autoComplete="off" style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px' }} /></div>
                      <div><Lbl>INN / STIR</Lbl><input name="inn" value={form.inn} onChange={handleChange} required autoComplete="off" style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px' }} /></div>
                    </div>
                    <div><Lbl>Kontakt shaxs</Lbl><input name="contactPerson" value={form.contactPerson} onChange={handleChange} required autoComplete="off" style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px' }} /></div>
                    <div><Lbl>Telefon</Lbl><input name="phone" value={form.phone} onChange={handleChange} required autoComplete="off" style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px' }} /></div>
                    <div><Lbl>Yuridik manzil</Lbl><input name="legalAddress" value={form.legalAddress} onChange={handleChange} required autoComplete="off" style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px' }} /></div>
                    <div>
                      <Lbl>Mijoz manbasi</Lbl>
                      <select name="source" value={form.source} onChange={handleChange} required style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px', outline: 'none' }}>
                        <option value="">Tanlang...</option>
                        {leadSources.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <Lbl>Mas’ul savdo menejeri</Lbl>
                      <select name="managerId" value={form.managerId} onChange={handleChange} required disabled={user?.role !== 'super'} style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px', outline: 'none', opacity: user?.role !== 'super' ? 0.7 : 1 }}>
                        {managers.map(m => <option key={m._id} value={m._id}>{m.name} {m.surname}</option>)}
                      </select>
                    </div>
                  </>
                );
              }

              // Default: B2C
              return (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div><Lbl>Ism</Lbl><input name="firstName" value={form.firstName} onChange={handleChange} required autoComplete="off" style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px' }} /></div>
                    <div><Lbl>Familiya</Lbl><input name="lastName" value={form.lastName} onChange={handleChange} required autoComplete="off" style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px' }} /></div>
                  </div>
                  <div><Lbl>Telefon</Lbl><input name="phone" value={form.phone} onChange={handleChange} required autoComplete="off" style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px' }} /></div>
                  <div><Lbl>Manzil</Lbl><input name="address" value={form.address} onChange={handleChange} required autoComplete="off" style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px' }} /></div>
                  <div>
                    <Lbl>Uy Turi</Lbl>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      {PROPERTY_TYPES.map(pt => (
                        <button key={pt.value} type="button" onClick={() => setForm({...form, propertyType: pt.value})} style={{ height: '54px', borderRadius: '12px', background: form.propertyType === pt.value ? 'var(--accent-gold)' : 'rgba(255,255,255,0.03)', color: pt.value === form.propertyType ? 'black' : 'white', border: '1px solid var(--border-color)', fontSize: '14px', fontWeight: '700' }}>{pt.label}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Lbl>Mijoz manbasi</Lbl>
                    <select name="source" value={form.source} onChange={handleChange} required style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px', outline: 'none' }}>
                      <option value="">Tanlang...</option>
                      {leadSources.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <Lbl>Mas’ul savdo menejeri</Lbl>
                    <select name="managerId" value={form.managerId} onChange={handleChange} required disabled={user?.role !== 'super'} style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '12px', padding: '0 15px', outline: 'none', opacity: user?.role !== 'super' ? 0.7 : 1 }}>
                      {managers.map(m => <option key={m._id} value={m._id}>{m.name} {m.surname}</option>)}
                    </select>
                  </div>
                </>
              );
            })()}
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
  const [tasks, setTasks] = useState([]);
  const [newTaskInput, setNewTaskInput] = useState({ title: '', dueDate: getNowDateTime() });
  const [customers, setCustomers] = useState(() => JSON.parse(localStorage.getItem('erp_customers') || '[]'));
  const [currentView, setCurrentView] = useState(() => {
    if (location.pathname.includes('archive')) return 'archive';
    return 'kanban';
  });
  const [modalTab, setModalTab] = useState('timeline');
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
  
  const [customerModal, setCustomerModal] = useState({ isOpen: false, type: 'B2C' });
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isKPModalOpen, setIsKPModalOpen] = useState(false);
  const [fileManager, setFileManager] = useState({ isOpen: false, type: 'kp', files: [], orderId: null });

  const [editingId, setEditingId] = useState(null);
  const [contextMenu, setContextMenu] = useState({ isOpen: false, x: 0, y: 0, orderId: null, isLocked: false });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, orderId: null, reason: '' });
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: '',
    amount: '',
    neededDate: new Date().toISOString().split('T')[0],
    orderId: '',
    comment: ''
  });

  const emptyOrder = { 
    customerSearch: '', selectedCustomer: null, kpAmount: '', discount: '0', amount: '', currency: 'UZS', exchangeRate: localStorage.getItem('erp_last_rate') || '', 
    propertyType: 'kvartira', orderDate: new Date().toISOString().split('T')[0], deliveryDate: '', durationDays: '',
    kpFiles: [], designFiles: [], checklist: { design3d: false, construction: false, color: false, handle: false, materials: false }, 
    status: 'yangi', description: '', timeline: [],
    proposalId: null, proposalNumber: '',
    productionAmount: ''
  };

  const [newOrder, setNewOrder] = useState(emptyOrder);
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [proposals, setProposals] = useState([]);
  const [proposalSearch, setProposalSearch] = useState('');
  const [proposalSuggestions, setProposalSuggestions] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [inputType, setInputType] = useState('comment'); // 'comment' or 'task'
  const [taskDueDate, setTaskDueDate] = useState(getNowDateTime());
  
  const timelineEndRef = useRef(null);
  const commentFileInputRef = useRef(null);

  const handleCommentFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0 || !editingId) return;

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        const fileLink = `[Fayl yuklandi: ${file.name}](${res.data.url})`;
        const logRes = await api.post(`/orders/${editingId}/log`, { text: fileLink, type: 'comment' });
        setAllOrders(allOrders.map(o => o._id === editingId ? logRes.data : o));
        setNewOrder(logRes.data);
      } catch (err) {
        alert(`"${file.name}" faylini yuklashda xatolik yuz berdi.`);
      }
    }
    e.target.value = '';
  };

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
        const ordersRes = await api.get('/orders');
        setAllOrders(ordersRes.data || []);
      } catch (err) {
        console.error("Orders load error", err);
      }

      try {
        const customersRes = await api.get('/customers');
        setCustomers(customersRes.data || []);
      } catch (err) {
        console.error("Customers load error", err);
      }

      try {
        const proposalsRes = await api.get('/proposals');
        setProposals(proposalsRes.data || []);
      } catch (err) {
        console.error("Proposals load error", err);
      }

      let categories = [];
      try {
        const expenseItemsRes = await api.get('/expense-items');
        const items = expenseItemsRes.data || [];
        
        // Find the main parent item (must not have parentId, and matches code '8000' or 'sotuvoldi' name)
        const mainItem = items.find(i => 
          !i.parentId && 
          (String(i.code).trim() === '8000' || (i.name && i.name.toLowerCase().includes('sotuvoldi')))
        );

        if (mainItem) {
          categories = items.filter(i => i.parentId === mainItem.id || i.parentId === mainItem._id);
        }

        // Fallback: if no categories are found via parent ID reference, find items with codes starting with '80' or '81'
        if (categories.length === 0) {
          categories = items.filter(i => 
            i.parentId && 
            (String(i.code).startsWith('80') || String(i.code).startsWith('81'))
          );
        }
      } catch (err) {
        console.error("Expense items load error", err);
      }

      // Ultimate fallback if still empty (e.g. database not seeded or empty, or API failed)
      if (categories.length === 0) {
        categories = [
          { id: 'exp_8010', code: '8010', name: "Zamer xarajatlari" },
          { id: 'exp_8020', code: '8020', name: "Transport / Yo'l xarajatlari" },
          { id: 'exp_8030', code: '8030', name: "Oziq-ovqat xarajatlari" },
          { id: 'exp_8110', code: '8110', name: "Boshqa sotuvoldi xarajatlari" }
        ];
      }

      categories.sort((a, b) => parseInt(a.code || 0) - parseInt(b.code || 0));
      setExpenseCategories(categories);
    };
    loadData();
    
    const handleStorage = () => { loadData(); };
    window.addEventListener('storage', handleStorage); 
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if (editingId) {
      loadOrderTasks(editingId);
    } else {
      setTasks([]);
    }
  }, [editingId]);

  useEffect(() => {
    if (expenseCategories.length > 0 && !expenseForm.category) {
      setExpenseForm(prev => ({ ...prev, category: expenseCategories[0].name }));
    }
  }, [expenseCategories, expenseForm.category]);

  const loadOrderTasks = async (orderId) => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data.filter(t => t.orderId === orderId));
    } catch (err) {
      console.error("Order tasks load error", err);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskInput.title.trim() || !editingId) return;
    try {
      const order = allOrders.find(o => o._id === editingId);
      const payload = {
        title: newTaskInput.title,
        dueDate: newTaskInput.dueDate,
        status: 'jarayonda',
        assigneeId: user.id || user._id,
        assigneeName: user.name,
        orderId: editingId,
        orderUniqueId: order?.uniqueId,
        priority: 'orta'
      };
      const res = await api.post('/tasks', payload);
      setTasks([...tasks, res.data]);
      setNewTaskInput({ ...newTaskInput, title: '' });
    } catch (err) {
      alert("Vazifa qo'shishda xatolik!");
    }
  };

  const toggleTaskStatus = async (task) => {
    try {
      const newStatus = task.status === 'bajarildi' ? 'yangi' : 'bajarildi';
      const res = await api.put(`/tasks/${task._id}`, { status: newStatus });
      setTasks(tasks.map(t => t._id === task._id ? res.data : t));
    } catch (err) {
      alert("Xatolik!");
    }
  };

  useEffect(() => {
    if (newOrder.orderDate && newOrder.durationDays) {
      const start = new Date(newOrder.orderDate); start.setDate(start.getDate() + parseInt(newOrder.durationDays));
      const calculated = start.toISOString().split('T')[0];
      if (calculated !== newOrder.deliveryDate) { setNewOrder(prev => ({ ...prev, deliveryDate: calculated })); }
    }
  }, [newOrder.orderDate, newOrder.durationDays]);

  useEffect(() => {
    const term = newOrder.customerSearch.toLowerCase().trim();
    if (term.length < 1) {
      setCustomerSuggestions([]);
      return;
    }

    if (newOrder.selectedCustomer && `${newOrder.selectedCustomer.firstName} ${newOrder.selectedCustomer.lastName}`.toLowerCase() === term) {
      setCustomerSuggestions([]);
      return;
    }

    const filtered = customers.filter(c => 
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(term) || 
      c.phone.replace(/\D/g, '').includes(term.replace(/\D/g, ''))
    );
    setCustomerSuggestions(filtered);
    setSelectedIndex(0);
  }, [newOrder.customerSearch, customers, newOrder.selectedCustomer]);

  const handleSelectCustomer = (c) => {
    setNewOrder({ ...newOrder, selectedCustomer: c, customerSearch: `${c.firstName} ${c.lastName}` });
    setCustomerSuggestions([]);
  };

  useEffect(() => {
    const term = proposalSearch.toLowerCase().trim();
    if (term.length < 1) {
      setProposalSuggestions([]);
      return;
    }

    const filtered = proposals.filter(p => {
      // Normalize search term: remove "KP-", "EXP-" and spaces
      const cleanTerm = term.replace(/kp-|exp-|\s/g, '');
      
      const kpNum = (p.kpNumber || '').toLowerCase().replace(/kp-|exp-|\s/g, '');
      const customerName = `${p.customer?.firstName || ''} ${p.customer?.lastName || ''}`.toLowerCase();
      
      // Match if the cleaned term is in the cleaned KP number, 
      // or if the original term is in the customer name
      return (cleanTerm && kpNum.includes(cleanTerm)) || 
             kpNum.includes(term) || 
             customerName.includes(term);
    });
    setProposalSuggestions(filtered);
  }, [proposalSearch, proposals, newOrder.proposalNumber]);

  const handleSelectProposal = (p) => {
    const kpSum = formatAmount(p.grandTotal || 0);
    setNewOrder({ 
      ...newOrder, 
      proposalId: p._id, 
      proposalNumber: p.kpNumber,
      kpAmount: kpSum,
      amount: kpSum,
      discount: '0',
      kpFiles: p.kpFiles || [],
      designFiles: p.designFiles || []
    });
    setProposalSearch(p.kpNumber);
    setProposalSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (customerSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(prev => (prev + 1) % customerSuggestions.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(prev => (prev - 1 + customerSuggestions.length) % customerSuggestions.length); }
    else if (e.key === 'Enter') { e.preventDefault(); handleSelectCustomer(customerSuggestions[selectedIndex]); }
  };

  const filteredOrders = allOrders.filter(o => {
    const currentUserId = user?.id || user?._id;
    const matchesUser = user?.role === 'super' || (user?.role === 'showroom' && o.showroom === user.showroom) || ((user?.role === 'sotuv_manager' || user?.role === 'sales_manager') && o.managerId === currentUserId);
    const matchesSearch = `${o.selectedCustomer?.firstName || ''} ${o.selectedCustomer?.lastName || ''} ${o.selectedCustomer?.companyName || ''} ${o.selectedCustomer?.agentName || ''} ${o.uniqueId || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
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
        statusUpdatedAt: new Date().toISOString(),
        timeline: [...(order.timeline || []), log] 
      });
      setAllOrders(allOrders.map(o => o._id === (order._id || orderId) ? res.data : o));
    } catch (err) {
      console.error("Drop error", err);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    const log = { 
      type: inputType === 'comment' ? 'comment' : 'task', 
      text: inputType === 'comment' ? commentText : `Vazifa: ${commentText} (Muddat: ${new Date(taskDueDate).toLocaleString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})`, 
      time: new Date().toISOString(), 
      user: user.name 
    };
    
    if (editingId) {
      try {
        const res = await api.post(`/orders/${editingId}/log`, { 
          text: log.text, 
          type: log.type 
        });

        // Agar vazifa bo'lsa, markaziy vazifalar tizimiga ham qo'shish
        if (inputType === 'task') {
          const payload = {
            title: commentText,
            dueDate: taskDueDate,
            status: 'jarayonda',
            assigneeId: user.id || user._id,
            assigneeName: user.name,
            orderId: editingId,
            orderUniqueId: res.data.uniqueId,
            priority: 'orta'
          };
          await api.post('/tasks', payload);
          loadOrderTasks(editingId); // Refresh local task list
        }

        setAllOrders(allOrders.map(o => o._id === editingId ? res.data : o));
        setNewOrder(res.data);
      } catch (err) {
        console.error("Comment/Task error", err);
        alert("Xatolik yuz berdi!");
      }
    } else {
      setNewOrder({ ...newOrder, timeline: [...(newOrder.timeline || []), log] });
    }
    setCommentText('');
    setInputType('comment');
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
      showroomPhone: user.showroomPhone || '',
      managerPhone: user.phone || '',
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

  const handleContextMenu = (e, orderId, isLocked) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      orderId,
      isLocked
    });
  };

  const confirmDelete = async (reason) => {
    if (!deleteModal.orderId) return;
    try {
      const order = allOrders.find(o => o._id === deleteModal.orderId);
      const log = { type: 'system', text: `Buyurtma o'chirildi. Sabab: ${reason}`, time: new Date().toISOString(), user: user.name };
      
      await api.delete(`/orders/${deleteModal.orderId}`, { data: { reason, log } });
      setAllOrders(allOrders.filter(o => o._id !== deleteModal.orderId));
      setDeleteModal({ isOpen: false, orderId: null, reason: '' });
    } catch (err) {
      console.error("Delete error", err);
      alert("O'chirishda xatolik yuz berdi!");
    }
  };

  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.category) {
      return alert('Kategoriyani tanlang!');
    }
    if (!expenseForm.amount || Number(expenseForm.amount) <= 0) {
      return alert('Summani kiriting!');
    }
    if (!expenseForm.neededDate) {
      return alert('Sanani tanlang!');
    }
    if (!expenseForm.orderId) {
      return alert('Buyurtmani tanlang!');
    }

    const payload = {
      category: expenseForm.category,
      orderId: expenseForm.orderId,
      amount: Number(expenseForm.amount),
      neededDate: expenseForm.neededDate,
      comment: expenseForm.comment || '',
      status: 'qoralama'
    };

    try {
      await api.post('/requests', payload);
      alert("Sotuvoldi xarajat arizasi muvaffaqiyatli yaratildi (Qoralama)!");
      setIsExpenseModalOpen(false);
      setExpenseForm({
        category: expenseCategories[0]?.name || '',
        amount: '',
        neededDate: new Date().toISOString().split('T')[0],
        orderId: '',
        comment: ''
      });
    } catch (err) {
      console.error("Expense request error", err);
      alert("Xatolik yuz berdi: " + (err.response?.data?.message || err.message));
    }
  };

  if (!user) return <div style={{ padding: '40px', textAlign: 'center' }}>Yuklanmoqda...</div>;
  const isOrderLocked = editingId && LOCKED_STAGES.includes(newOrder.status);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
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
               <button onClick={() => setIsExpenseModalOpen(true)} className="secondary-btn" style={{ height: '44px', color: '#fbbf24', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)' }}><DollarSign size={18} /> +Sotuvoldi xarajat arizasi</button>
               <button onClick={() => setCustomerModal({ isOpen: true, type: 'Agent' })} className="secondary-btn" style={{ height: '44px', color: '#8b5cf6', background: 'rgba(139,92,246,0.1)' }}><Smartphone size={18} /> Yangi Agent</button>
               <button onClick={() => setCustomerModal({ isOpen: true, type: 'B2C' })} className="secondary-btn" style={{ height: '44px' }}><UserPlus size={18} /> Yangi Mijoz</button>
               <button onClick={() => setIsKPModalOpen(true)} className="secondary-btn" style={{ height: '44px', color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}><FileText size={18} /> Tijorat Taklifi</button>
               <button onClick={() => { setEditingId(null); setNewOrder(emptyOrder); setIsOrderModalOpen(true); }} className="gold-btn" style={{ height: '44px' }}><Plus size={20} /> Yangi Buyurtma</button>
             </>
            )}

        </div>
      </div>

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
                              if (o.closedAt) return o.closedAt.split('T')[0];
                              const archLog = o.timeline?.find(l => l?.text?.includes("Arxivlandi"));
                              if (archLog?.time) return archLog.time.split('T')[0];
                              const lastLog = o.timeline?.[o.timeline.length - 1];
                              return lastLog?.time ? lastLog.time.split('T')[0] : (o.updatedAt ? o.updatedAt.split('T')[0] : '—');
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
              const currentUserId = user?.id || user?._id;
              const matchesUser = user?.role === 'super' || (user?.role === 'showroom' && o.showroom === user.showroom) || ((user?.role === 'sotuv_manager' || user?.role === 'sales_manager') && o.managerId === currentUserId);
              const matchesSearch = `${o.selectedCustomer?.firstName || ''} ${o.selectedCustomer?.lastName || ''} ${o.selectedCustomer?.companyName || ''} ${o.selectedCustomer?.agentName || ''} ${o.uniqueId || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
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
            }).sort((a,b) => {
              const timeA = a.statusUpdatedAt || a.createdAt;
              const timeB = b.statusUpdatedAt || b.createdAt;
              return new Date(timeB) - new Date(timeA);
            }); 
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
                        onContextMenu={(e) => handleContextMenu(e, order._id, isLocked)}
                        style={{ background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px', marginBottom: '16px', position: 'relative', cursor: isLocked ? 'default' : 'grab' }}
                        onClick={() => { setEditingId(order._id); setNewOrder(order); setIsOrderModalOpen(true); }}
                      >
                          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: stage.color, borderRadius: '4px 0 0 4px' }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <span style={{ fontSize: '10px', fontWeight: '900', color: 'var(--accent-gold)', background: 'rgba(212,175,55,0.1)', padding: '4px 12px', borderRadius: '8px' }}>{order.uniqueId}</span>
                              {order.amoId && <span style={{ fontSize: '10px', fontWeight: '900', color: '#8b5cf6', background: 'rgba(139,92,246,0.1)', padding: '4px 12px', borderRadius: '8px' }}>AMO LEAD</span>}
                            </div>
                            {isLocked && <div style={{ fontSize: '10px', background: 'rgba(212,175,55,0.1)', color: 'var(--accent-gold)', padding: '4px 10px', borderRadius: '8px', fontWeight: '800' }}><Lock size={12} /> LOCKED</div>}
                          </div>

                          {order.notes && order.status === 'amocrm_lead' && (
                             <div style={{ background: 'rgba(139,92,246,0.05)', border: '1px dashed rgba(139,92,246,0.3)', borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
                               <p style={{ fontSize: '10px', color: '#8b5cf6', textTransform: 'uppercase', fontWeight: '800', marginBottom: '4px' }}>Call-markaz izohi:</p>
                               <p style={{ fontSize: '12px', color: 'white', fontStyle: 'italic', lineHeight: '1.4' }}>"{order.notes}"</p>
                             </div>
                          )}

                          <h4 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '6px', color: 'white' }}>{order.selectedCustomer?.firstName} {order.selectedCustomer?.lastName}</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600' }}><Phone size={14} /> {order.selectedCustomer?.phone}</div>
                          
                          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                              <MapPin size={12} /> <span style={{ fontWeight: '800', textTransform: 'uppercase' }}>Manzil:</span>
                            </div>
                            <p style={{ fontSize: '14px', fontWeight: '700', color: '#fff', lineHeight: '1.4' }}>{order.selectedCustomer?.address || '—'}</p>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '12px' }}>
                              <Calendar size={12} /> <span style={{ fontWeight: '800', textTransform: 'uppercase' }}>Qabul:</span> <span style={{ color: '#fff', fontWeight: '700' }}>{order.orderDate}</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                              {order.checklist && Object.entries(CHECKLIST_LABELS).map(([key, label]) => {
                                if (!order.checklist[key]) return null;
                                return (
                                  <div key={key} title={label} style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(16,185,129,0.2)' }}>
                                    <Check size={12} strokeWidth={3} /> {label}
                                  </div>
                                );
                              })}
                              <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                                {order.kpFiles?.length > 0 && <FileCheck size={18} color="#10b981" />}
                                {order.designFiles?.length > 0 && <FileIcon size={18} color="var(--accent-gold)" />}
                              </div>
                          </div>
                           
                           {stage.id === 'bajarildi' && !order.smCompletionApproved && (
                             <button 
                               onClick={async (e) => {
                                 e.stopPropagation();
                                 const isFinal = order.adminCompletionApproved;
                                 try {
                                   const log = { type: 'system', text: isFinal ? "Buyurtma SM va Admin tomonidan tasdiqlandi. Arxivlandi." : "Buyurtma SM tomonidan tasdiqlandi (yakunlash)", time: new Date().toISOString(), user: user.name };
                                   const res = await api.put(`/orders/${order._id}`, { 
                                     smCompletionApproved: true, 
                                     status: isFinal ? 'yopildi' : order.status,
                                     closedAt: isFinal ? new Date().toISOString() : (order.closedAt || null),
                                     timeline: [...(order.timeline || []), log]
                                   });
                                   setAllOrders(allOrders.map(o => o._id === order._id ? res.data : o));
                                   alert(isFinal ? "Buyurtma to'liq yopildi va arxivga o'tkazildi!" : "Sizning tasdig'ingiz qabul qilindi. Showroom Admin tasdig'i kutilmoqda.");
                                 } catch (err) {
                                   alert("Xatolik yuz berdi");
                                 }
                               }}
                               style={{ width: '100%', background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', color: '#10b981', padding: '12px', borderRadius: '12px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '16px' }}
                             >
                               <CheckSquare size={16} /> Yakunlashni Tasdiqlash
                             </button>
                           )}

                           {stage.id === 'bajarildi' && order.smCompletionApproved && !order.adminCompletionApproved && (
                             <div style={{ background: 'rgba(16,185,129,0.05)', color: '#10b981', padding: '12px', borderRadius: '12px', fontSize: '12px', textAlign: 'center', border: '1px dashed #10b981', fontWeight: '700', marginBottom: '16px' }}>
                               Siz tasdiqladingiz. Showroom Admin kutilmoqda...
                             </div>
                           )}
                           
                           {/* Footer: Managers Info */}
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '16px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-gold)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '900' }}>{order.managerName?.charAt(0) || 'S'}</div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                       <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '800' }}>Sotuvchi:</span>
                                       <span style={{ fontSize: '12px', fontWeight: '900', color: 'white' }}>{order.managerName}</span>
                                    </div>
                                 </div>
                                 {order.assignedPmName && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                       <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Briefcase size={14} /></div>
                                       <div style={{ display: 'flex', flexDirection: 'column' }}>
                                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '800' }}>PM mas'ul:</span>
                                          <span style={{ fontSize: '12px', fontWeight: '900', color: '#3b82f6' }}>{order.assignedPmName}</span>
                                       </div>
                                    </div>
                                 )}
                              </div>
                              
                              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'right' }}>
                                 <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', fontWeight: '800' }}>Summa</span>
                                 <span style={{ fontSize: '18px', fontWeight: '900', color: 'white' }}>{Number(order.amount).toLocaleString()} UZS</span>
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
                    {newOrder.assignedPmName && (
                      <> • PM: <span style={{ color: '#3b82f6', fontWeight: '700' }}>{newOrder.assignedPmName}</span></>
                    )}
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
                          onFocus={() => !isOrderLocked && newOrder.customerSearch.length > 2 && setCustomerSuggestions(customers.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(newOrder.customerSearch.toLowerCase()) || c.phone.includes(newOrder.customerSearch)))}
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
                               </div>
                             </div>
                           ))}
                         </div>
                       )}
                     </div>

                      {newOrder.selectedCustomer && (
                        <div style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(251,191,36,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)' }}><Phone size={18} /></div>
                            <div>
                              <p style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Telefon raqami:</p>
                              <p style={{ fontSize: '15px', fontWeight: '800', color: 'white' }}>{newOrder.selectedCustomer.phone}</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(251,191,36,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)' }}><MapPin size={18} /></div>
                            <div>
                              <p style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>Manzil:</p>
                              <p style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>{newOrder.selectedCustomer.address || 'Manzil belgilanmagan'}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div style={{ position: 'relative', marginBottom: '24px' }}>
                        <Lbl>KP Raqami Bo'yicha Qidirish</Lbl>
                        <div style={{ position: 'relative' }}>
                          <IconInput
                            icon={Search}
                             value={proposalSearch} 
                             onChange={e => !isOrderLocked && setProposalSearch(e.target.value)}
                             placeholder="KP raqami..."
                             style={{ height: '54px' }}
                             readOnly={isOrderLocked}
                           />
                          {proposalSuggestions.length > 0 && !isOrderLocked && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: '#1a1a2e', border: '1px solid var(--border-color)', borderRadius: '12px', zIndex: 2100, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                              {proposalSuggestions.map(p => (
                                <div key={p._id} onClick={() => handleSelectProposal(p)} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                  <div style={{ fontWeight: '800', color: 'var(--accent-gold)' }}>{p.kpNumber}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{p.customer?.firstName} {p.customer?.lastName} | {p.grandTotal?.toLocaleString()} so'm</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ position: 'relative' }}>
                          <Lbl>KP Summasi</Lbl>
                          <input 
                            name="kpAmount" 
                            value={newOrder.kpAmount} 
                            onChange={e => {
                              if (isOrderLocked) return;
                              const val = e.target.value;
                              const kpVal = Number(val.replace(/\s/g, '')) || 0;
                              const disc = Number(newOrder.discount) || 0;
                              const final = kpVal - (kpVal * disc / 100);
                              setNewOrder({
                                ...newOrder, 
                                kpAmount: formatAmount(val),
                                amount: formatAmount(Math.round(final))
                              });
                            }} 
                            placeholder="0" 
                            autoComplete="off" 
                            style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0 60px 0 15px', color: 'white', fontSize: '14px' }} 
                            readOnly={isOrderLocked} 
                          />
                          <span style={{ position: 'absolute', right: '15px', top: '42px', color: 'rgba(255,255,255,0.2)', fontSize: '12px', fontWeight: '800' }}>so'm</span>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
                        <div>
                          <Lbl>Skidka (%)</Lbl>
                          <input 
                            name="discount" 
                            type="number"
                            value={newOrder.discount} 
                            onChange={e => {
                              if (isOrderLocked) return;
                              const disc = Number(e.target.value) || 0;
                              const kpVal = Number(newOrder.kpAmount.replace(/\s/g, '')) || 0;
                              const final = kpVal - (kpVal * disc / 100);
                              setNewOrder({
                                ...newOrder, 
                                discount: e.target.value,
                                amount: formatAmount(Math.round(final))
                              });
                            }} 
                            placeholder="0" 
                            autoComplete="off" 
                            style={{ width: '100%', height: '54px', background: 'var(--secondary-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0 15px', color: 'white', fontSize: '14px' }} 
                            readOnly={isOrderLocked} 
                          />
                        </div>
                        <div style={{ position: 'relative' }}>
                          <Lbl>Shartnoma Summasi</Lbl>
                          <input 
                            name="amount" 
                            value={newOrder.amount} 
                            onChange={e => {
                              if (isOrderLocked) return;
                              const val = e.target.value;
                              const finalVal = Number(val.replace(/\s/g, '')) || 0;
                              const kpVal = Number(newOrder.kpAmount.replace(/\s/g, '')) || 0;
                              let calculatedDisc = newOrder.discount;
                              if (kpVal > 0) {
                                calculatedDisc = (((kpVal - finalVal) / kpVal) * 100).toFixed(1);
                              }
                              setNewOrder({
                                ...newOrder, 
                                amount: formatAmount(val),
                                discount: calculatedDisc
                              });
                            }} 
                            placeholder="0" 
                            autoComplete="off" 
                            style={{ width: '100%', height: '54px', background: 'rgba(16,185,129,0.05)', border: '1px solid #10b981', borderRadius: '12px', padding: '0 60px 0 15px', color: '#10b981', fontSize: '16px', fontWeight: '900' }} 
                            readOnly={isOrderLocked} 
                          />
                          <span style={{ position: 'absolute', right: '15px', top: '42px', color: 'rgba(16,185,129,0.4)', fontSize: '12px', fontWeight: '800' }}>so'm</span>
                        </div>
                      </div>
                      <div>
                        <Lbl>Ishlab chiqarish summasi</Lbl>
                        <div style={{ position: 'relative' }}>
                          <input 
                            name="productionAmount" 
                            value={newOrder.productionAmount} 
                            readOnly
                            placeholder="PM tomonidan kiritiladi" 
                            autoComplete="off" 
                            style={{ width: '100%', height: '54px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0 60px 0 15px', color: 'white', fontSize: '14px', opacity: 0.7 }} 
                          />
                          <span style={{ position: 'absolute', right: '15px', top: '18px', color: 'rgba(255,255,255,0.2)', fontSize: '12px', fontWeight: '800' }}>so'm</span>
                        </div>
                      </div>
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

                      <div>
                        <Lbl>Tasdiqlatish (Checklist)</Lbl>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                          {Object.entries(CHECKLIST_LABELS).map(([key, label]) => (
                            <button 
                              key={key} 
                              type="button" 
                              onClick={() => !isOrderLocked && setNewOrder({
                                ...newOrder, 
                                checklist: { ...newOrder.checklist, [key]: !newOrder.checklist?.[key] }
                              })} 
                              style={{ 
                                height: '48px', 
                                borderRadius: '12px', 
                                background: newOrder.checklist?.[key] ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.02)', 
                                border: `1px solid ${newOrder.checklist?.[key] ? '#10b981' : 'var(--border-color)'}`, 
                                color: newOrder.checklist?.[key] ? '#10b981' : 'var(--text-secondary)',
                                display: 'flex', 
                                alignItems: 'center', 
                                padding: '0 15px',
                                gap: '10px', 
                                fontSize: '13px', 
                                fontWeight: '700',
                                transition: '0.2s'
                              }}
                            >
                              {newOrder.checklist?.[key] ? <CheckSquare size={16} /> : <div style={{ width: '16px', height: '16px', border: '1.5px solid currentColor', borderRadius: '4px' }} />}
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Lbl>Hujjatlar va Fayllar</Lbl>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <button 
                            type="button" 
                            onClick={() => setFileManager({ isOpen: true, type: 'kp', files: newOrder.kpFiles || [] })}
                            style={{ height: '54px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: '700' }}
                          >
                            <FileUp size={18} color="var(--accent-gold)" /> KP Fayllari ({newOrder.kpFiles?.length || 0})
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setFileManager({ isOpen: true, type: 'design', files: newOrder.designFiles || [] })}
                            style={{ height: '54px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: '700' }}
                          >
                            <FileIcon size={18} color="var(--accent-gold)" /> Dizayn Fayllari ({newOrder.designFiles?.length || 0})
                          </button>
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
                    </div>
                  </div>
              <div style={{ background: '#0f0f1b', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '24px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <History size={20} color="var(--accent-gold)" />
                  <h4 style={{ fontSize: '15px', fontWeight: '900', textTransform: 'uppercase' }}>XARAKATLAR TARIXI</h4>
                </div>
                
                <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }} className="no-scrollbar">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {(newOrder.timeline || []).map((item, idx) => (
                      <div key={idx} style={{ position: 'relative', paddingLeft: '40px' }}>
                          {idx !== (newOrder.timeline?.length || 0) - 1 && <div style={{ position: 'absolute', left: '10px', top: '24px', bottom: '-24px', width: '1px', background: 'rgba(255,255,255,0.05)' }} />}
                          <div style={{ position: 'absolute', left: '0', top: '4px', width: '21px', height: '21px', borderRadius: '50%', background: item.type === 'comment' ? 'var(--accent-gold)' : (item.type === 'task' ? '#3b82f6' : 'rgba(255,255,255,0.05)'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: (item.type === 'comment' || item.type === 'task') ? 'black' : 'var(--text-secondary)' }}>
                            {item.type === 'comment' ? <MessageSquare size={10} /> : (item.type === 'task' ? <CheckSquare size={10} /> : <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'currentColor' }} />)}
                          </div>
                          {item.type === 'comment' || item.type === 'task' ? (
                            <div style={{ background: item.type === 'task' ? 'rgba(59,130,246,0.05)' : 'rgba(251,191,36,0.05)', border: `1px solid ${item.type === 'task' ? 'rgba(59,130,246,0.1)' : 'rgba(251,191,36,0.1)'}`, borderRadius: '16px', padding: '16px 20px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '13px', fontWeight: '900', color: item.type === 'task' ? '#3b82f6' : 'var(--accent-gold)' }}>{item.user} {item.type === 'task' ? '(Vazifa)' : ''}</span>
                                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{new Date(item.time).toLocaleTimeString()}</span>
                              </div>
                              <p style={{ fontSize: '15px', color: '#fff', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                {(() => {
                                  const fileMatch = item.text.match(/\[(.*?)\]\((.*?)\)/);
                                  if (fileMatch) {
                                    const [full, name, url] = fileMatch;
                                    return (
                                      <button 
                                        onClick={() => window.open(url, '_blank')}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(251,191,36,0.1)', border: '1px solid var(--accent-gold)', borderRadius: '10px', color: 'var(--accent-gold)', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}
                                      >
                                        <FileText size={16} /> {name}
                                      </button>
                                    );
                                  }
                                  return item.text;
                                })()}
                              </p>
                              {item.aiAnalysis && (
                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px', marginTop: '12px', border: '1px dashed rgba(139,92,246,0.4)' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '11px', color: '#a855f7', fontWeight: '900', textTransform: 'uppercase' }}>
                                    <Activity size={14} /> AI TAHLILI (DeepSales):
                                  </div>
                                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', lineHeight: '1.5' }}>
                                    {item.aiAnalysis}
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'baseline' }}>
                              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(item.time).toLocaleTimeString()}</span>
                              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}><span style={{ fontWeight: '700' }}>{item.user}</span>: {item.text}</p>
                            </div>
                          )}
                      </div>
                    ))}
                    <div ref={timelineEndRef} />
                  </div>
                </div>

                <div style={{ padding: '24px 32px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', display: 'flex', gap: '20px', position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderRight: '1px solid rgba(255,255,255,0.05)', paddingRight: '20px' }}>
                    <button 
                      type="button"
                      onClick={() => setInputType('comment')}
                      title="Izoh qoldirish"
                      style={{ width: '48px', height: '48px', borderRadius: '14px', background: inputType === 'comment' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.03)', color: inputType === 'comment' ? 'black' : 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
                    >
                      <MessageSquare size={20} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => setInputType('task')}
                      title="Vazifa yaratish"
                      style={{ width: '48px', height: '48px', borderRadius: '14px', background: inputType === 'task' ? '#3b82f6' : 'rgba(255,255,255,0.03)', color: inputType === 'task' ? 'white' : 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
                    >
                      <CheckSquare size={20} />
                    </button>
                    <input type="file" multiple ref={commentFileInputRef} onChange={handleCommentFileChange} style={{ display: 'none' }} />
                    <button 
                      type="button"
                      onClick={() => editingId ? commentFileInputRef.current.click() : alert("Fayl yuklash uchun avval buyurtmani saqlang.")}
                      title="Fayl yuklash"
                      style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
                    >
                      <Upload size={20} />
                    </button>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {inputType === 'task' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(59,130,246,0.05)', padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.1)' }}>
                        <Calendar size={16} color="#3b82f6" />
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800' }}>VAZIFA MUDDATINI BELGILANG:</span>
                        <input 
                          type="datetime-local"
                          value={taskDueDate}
                          onChange={e => setTaskDueDate(e.target.value)}
                          style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '13px', outline: 'none', fontWeight: '700' }}
                        />
                      </div>
                    )}
                    <div style={{ position: 'relative' }}>
                      <textarea 
                        value={commentText} 
                        onChange={e => newOrder.status !== 'yopildi' && setCommentText(e.target.value)} 
                        onKeyDown={handleCommentKeyDown} 
                        placeholder={newOrder.status === 'yopildi' ? "Arxivlangan buyurtmaga izoh yozib bo'lmaydi" : inputType === 'task' ? "Vazifa (eslatma) matnini yozing..." : "Izoh qoldiring..."} 
                        style={{ width: '100%', height: '120px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '20px', color: 'white', fontSize: '15px', resize: 'none', outline: 'none' }} 
                        readOnly={newOrder.status === 'yopildi'}
                      />
                      {newOrder.status !== 'yopildi' && (
                        <button 
                          type="button"
                          onClick={handleAddComment} 
                          style={{ position: 'absolute', right: '15px', bottom: '15px', height: '48px', padding: '0 24px', borderRadius: '14px', background: inputType === 'task' ? '#3b82f6' : 'var(--accent-gold)', color: inputType === 'task' ? 'white' : 'black', fontWeight: '900', border: 'none', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
                        >
                          {inputType === 'task' ? <CheckSquare size={18} /> : <Send size={18} />} Yuborish
                        </button>
                      )}
                    </div>
                  </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}

      {customerModal.isOpen && (
        customerModal.type === 'Agent' ? (
          <AgentModal 
            onClose={() => setCustomerModal({ ...customerModal, isOpen: false })} 
            onSaved={async () => {
              const res = await api.get('/customers');
              setCustomers(res.data);
            }}
          />
        ) : (
          <CustomerModal 
            user={user} 
            initialType={customerModal.type}
            onClose={() => setCustomerModal({ ...customerModal, isOpen: false })} 
            onSaved={async () => {
              const res = await api.get('/customers');
              setCustomers(res.data);
            }} 
          />
        )
      )}
      {isKPModalOpen && <KPModal onClose={() => setIsKPModalOpen(false)} />}

      {fileManager.isOpen && (
        <FileManagerModal 
          type={fileManager.type} 
          files={fileManager.files} 
          onClose={() => setFileManager({...fileManager, isOpen: false})} 
          readOnly={isOrderLocked} 
          onRemove={async (idx) => {
            const field = fileManager.type === 'kp' ? 'kpFiles' : 'designFiles';
            const updatedFiles = [...newOrder[field]];
            updatedFiles.splice(idx, 1);
            if (editingId) {
              await api.put(`/orders/${editingId}`, { [field]: updatedFiles });
              setAllOrders(allOrders.map(o => o._id === editingId ? { ...o, [field]: updatedFiles } : o));
            }
            setNewOrder({ ...newOrder, [field]: updatedFiles });
            setFileManager({ ...fileManager, files: updatedFiles });
          }} 
          onAdd={async (files) => {
            const field = fileManager.type === 'kp' ? 'kpFiles' : 'designFiles';
            const updatedFiles = [...(newOrder[field] || []), ...files];
            if (editingId) {
              await api.put(`/orders/${editingId}`, { [field]: updatedFiles });
              setAllOrders(allOrders.map(o => o._id === editingId ? { ...o, [field]: updatedFiles } : o));
            }
            setNewOrder({ ...newOrder, [field]: updatedFiles });
            setFileManager({ ...fileManager, files: updatedFiles });
          }} 
        />
      )}

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
              if (contextMenu.isLocked) return alert("Ushbu bosqichdagi buyurtmani o'chirib bo'lmaydi.");
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
              {DEAL_STAGES.map(s => (
                <button 
                  key={s.id}
                  onClick={async () => {
                    const orderId = contextMenu.orderId;
                    const order = allOrders.find(o => o._id === orderId || o.id === orderId);
                    if (!order) return;
                    
                    const log = { type: 'stage', text: `Bosqich o'zgardi (Menyu): ${s.title}`, time: new Date().toISOString(), user: user.name };
                    try {
                      const res = await api.put(`/orders/${order._id}`, { 
                        status: s.id, 
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 6000 }}>
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
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', textAlign: 'left', cursor: 'pointer', transition: '0.2s', fontSize: '14px', fontWeight: '600' }}
                  onMouseEnter={e => { e.target.style.background = 'rgba(251,191,36,0.1)'; e.target.style.borderColor = 'var(--accent-gold)'; }}
                  onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                >
                  {reason}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setDeleteModal({ isOpen: false, orderId: null, reason: '' })}
              style={{ width: '100%', marginTop: '20px', padding: '14px', borderRadius: '12px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '700' }}
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}

      {isExpenseModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 6000, padding: '20px' }}>
          <div className="premium-card" style={{ width: '600px', maxWidth: '100%', padding: '40px', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '24px', position: 'relative', background: 'var(--secondary-bg)' }}>
            <button 
              onClick={() => setIsExpenseModalOpen(false)} 
              style={{ position: 'absolute', right: '24px', top: '24px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px', color: 'white' }}>Sotuvoldi xarajat arizasi</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>O'lchov ("zamer") yoki boshqa sotuvoldi tadbirlari uchun yo'l kira va ovqat puli so'rovi</p>

            <form onSubmit={handleSubmitExpense} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px' }}>Kategoriya</label>
                <select 
                  value={expenseForm.category} 
                  onChange={e => setExpenseForm({...expenseForm, category: e.target.value})} 
                  required
                  style={{ 
                    width: '100%', 
                    height: '50px', 
                    background: '#1e293b', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '12px', 
                    color: 'white', 
                    padding: '0 16px', 
                    fontSize: '15px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="" style={{ background: '#1e293b', color: '#fff' }}>Tanlang...</option>
                  {expenseCategories.map(cat => (
                    <option key={cat.id || cat._id || cat.code} value={cat.name} style={{ background: '#1e293b', color: '#fff' }}>
                      {cat.code} - {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px' }}>Buyurtmani (Mijozni) tanlang</label>
                <select 
                  value={expenseForm.orderId} 
                  onChange={e => setExpenseForm({...expenseForm, orderId: e.target.value})} 
                  required
                  style={{ 
                    width: '100%', 
                    height: '50px', 
                    background: '#1e293b', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '12px', 
                    color: 'white', 
                    padding: '0 16px', 
                    fontSize: '15px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="" style={{ background: '#1e293b', color: '#fff' }}>Tanlang...</option>
                  {allOrders.filter(o => {
                    const currentUserId = user?.id || user?._id;
                    return (user?.role === 'super' || (user?.role === 'showroom' && o.showroom === user.showroom) || ((user?.role === 'sotuv_manager' || user?.role === 'sales_manager') && o.managerId === currentUserId)) && o.status !== 'yopildi';
                  }).map(o => (
                    <option key={o._id} value={o.productionId || o.uniqueId} style={{ background: '#1e293b', color: '#fff' }}>
                      {o.productionId || o.uniqueId} - {o.selectedCustomer?.firstName} {o.selectedCustomer?.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px' }}>Qaysi kun uchun?</label>
                  <input 
                    type="date" 
                    value={expenseForm.neededDate} 
                    onChange={e => setExpenseForm({...expenseForm, neededDate: e.target.value})} 
                    required
                    style={{ 
                      width: '100%', 
                      height: '50px', 
                      background: 'rgba(255,255,255,0.03)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '12px', 
                      color: 'white', 
                      padding: '0 16px', 
                      fontSize: '15px',
                      colorScheme: 'dark',
                      outline: 'none'
                    }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px' }}>Summa (UZS)</label>
                  <input 
                    type="text" 
                    value={expenseForm.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} 
                    onChange={e => setExpenseForm({...expenseForm, amount: e.target.value.replace(/\s/g, '')})} 
                    required 
                    placeholder="0" 
                    style={{ 
                      width: '100%', 
                      height: '50px', 
                      background: 'rgba(255,255,255,0.03)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '12px', 
                      color: 'white', 
                      padding: '0 16px', 
                      fontSize: '16px',
                      fontWeight: '800',
                      outline: 'none'
                    }} 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px' }}>Izoh</label>
                <textarea 
                  value={expenseForm.comment} 
                  onChange={e => setExpenseForm({...expenseForm, comment: e.target.value})} 
                  placeholder="Batafsil ma'lumot (masalan: Zamer manzili, masofa)..." 
                  style={{ 
                    width: '100%', 
                    background: 'rgba(255,255,255,0.03)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '12px', 
                    color: 'white', 
                    padding: '16px', 
                    fontSize: '15px',
                    minHeight: '100px',
                    resize: 'none',
                    outline: 'none'
                  }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsExpenseModalOpen(false)} 
                  style={{ 
                    flex: 1, 
                    padding: '16px', 
                    borderRadius: '12px', 
                    border: '1px solid var(--border-color)', 
                    background: 'transparent', 
                    color: 'white', 
                    fontWeight: '700', 
                    cursor: 'pointer' 
                  }}
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  style={{ 
                    flex: 2, 
                    padding: '16px', 
                    borderRadius: '12px', 
                    border: 'none', 
                    background: 'var(--accent-gold)', 
                    color: '#000', 
                    fontWeight: '900', 
                    fontSize: '16px', 
                    cursor: 'pointer' 
                  }}
                >
                  Ariza topshirish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
