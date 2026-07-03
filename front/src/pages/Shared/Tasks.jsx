import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, X, Eye, EyeOff, Check, AlertTriangle, 
  Calendar, Clock, ArrowRight, ShieldCheck, CheckSquare, MessageSquare, 
  Trash, Users, Filter, Loader2, Send, Bookmark, AlertCircle, FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../utils/api';

const Tasks = () => {
  const { user } = useAuth();
  const { refreshNotifications } = useNotifications();
  const isRestricted = ['sotuv_manager', 'proekt_manager', 'showroom'].includes(user?.role);
  const [tasks, setTasks] = useState([]);
  const [showrooms, setShowrooms] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters and tabs
  const [activeTab, setActiveTab] = useState('all'); // all, overdue, new, pending, completed
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showroomFilter, setShowroomFilter] = useState('all');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // add, edit
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Comment Modal
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  // Form Data for add/edit
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigneeId: '',
    assigneeName: '',
    dueDate: '',
    priority: 'orta',
    showroom: '',
    status: 'yangi'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksRes, showroomRes, usersRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/showrooms'),
        api.get('/users')
      ]);
      setTasks(tasksRes.data);
      setShowrooms(showroomRes.data);
      setUsersList(usersRes.data);
      if (refreshNotifications) refreshNotifications();
    } catch (err) {
      console.error("Error loading task data", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (mode, task = null) => {
    setModalMode(mode);
    if (mode === 'edit' && task) {
      setSelectedTask(task);
      setFormData({
        title: task.title || '',
        description: task.description || '',
        assigneeId: task.assigneeId || '',
        assigneeName: task.assigneeName || '',
        dueDate: task.dueDate ? task.dueDate.substring(0, 16) : '',
        priority: task.priority || 'orta',
        showroom: task.showroom || '',
        status: task.status || 'yangi'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        assigneeId: user?.role === 'showroom' ? 'all_employees' : '',
        assigneeName: '',
        dueDate: '',
        priority: 'orta',
        showroom: user?.showroom || '',
        status: 'yangi'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add' && formData.assigneeId === 'all_employees') {
        const promises = usersList.map(u => {
          const payload = {
            ...formData,
            assigneeId: u._id,
            assigneeName: `${u.name} ${u.surname}`
          };
          return api.post('/tasks', payload);
        });
        await Promise.all(promises);
      } else {
        const selectedAssignee = usersList.find(u => u._id === formData.assigneeId);
        const assigneeName = selectedAssignee ? `${selectedAssignee.name} ${selectedAssignee.surname}` : '';
        
        const payload = {
          ...formData,
          assigneeName
        };

        if (modalMode === 'add') {
          await api.post('/tasks', payload);
        } else {
          await api.put(`/tasks/${selectedTask._id}`, payload);
        }
      }
      
      loadData();
      setIsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.msg || "Xatolik yuz berdi");
    }
  };

  const handleQuickStatusChange = async (task, newStatus) => {
    try {
      await api.put(`/tasks/${task._id}`, { status: newStatus });
      loadData();
    } catch (err) {
      alert("Vazifa holatini o'zgartirishda xatolik yuz berdi");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Haqiqatdan ham ushbu vazifani o'chirmoqchimisiz?")) {
      try {
        await api.delete(`/tasks/${id}`);
        loadData();
      } catch (err) {
        alert("O'chirishda xatolik yuz berdi");
      }
    }
  };

  const handleOpenCommentModal = (task) => {
    setSelectedTask(task);
    setIsCommentModalOpen(true);
    setCommentText('');
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      const res = await api.post(`/tasks/${selectedTask._id}/comment`, { text: commentText });
      setSelectedTask(res.data);
      setCommentText('');
      // Refresh tasks list
      setTasks(tasks.map(t => t._id === selectedTask._id ? res.data : t));
    } catch (err) {
      alert("Izoh qo'shishda xatolik yuz berdi");
    }
    setCommentLoading(false);
  };

  // Helper: check if a task is overdue
  const isOverdue = (task) => {
    if (task.status === 'bajarildi') return false;
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date();
  };

  // Filter tasks based on activeTab, searchQuery, priorityFilter, showroomFilter
  const filteredTasks = tasks.filter(t => {
    // 1. Tab filtering
    if (activeTab === 'overdue' && !isOverdue(t)) return false;
    if (activeTab === 'new' && t.status !== 'yangi') return false;
    if (activeTab === 'pending' && t.status !== 'jarayonda') return false;
    if (activeTab === 'completed' && t.status !== 'bajarildi') return false;

    // 2. Search query filtering
    const searchString = `${t.title} ${t.description} ${t.assigneeName} ${t.creatorName} ${t.orderUniqueId || ''}`.toLowerCase();
    if (searchQuery && !searchString.includes(searchQuery.toLowerCase())) return false;

    // 3. Priority filtering
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

    // 4. Showroom filtering
    if (showroomFilter !== 'all') {
      if (showroomFilter === 'global' && t.showroom !== '') return false;
      if (showroomFilter === 'fabrika' && t.showroom !== 'fabrika') return false;
      if (showroomFilter !== 'global' && showroomFilter !== 'fabrika' && t.showroom !== showroomFilter) return false;
    }

    return true;
  });

  // Calculate metrics
  const totalCount = tasks.length;
  const overdueCount = tasks.filter(t => isOverdue(t)).length;
  const newCount = tasks.filter(t => t.status === 'yangi').length;
  const pendingCount = tasks.filter(t => t.status === 'jarayonda').length;
  const completedCount = tasks.filter(t => t.status === 'bajarildi').length;

  const getPriorityBadgeStyle = (priority) => {
    switch (priority) {
      case 'yuqori': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', text: 'Yuqori' };
      case 'orta': return { bg: 'rgba(251, 191, 36, 0.1)', color: 'var(--accent-gold)', border: '1px solid rgba(251, 191, 36, 0.2)', text: 'O\'rta' };
      case 'past': return { bg: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', text: 'Past' };
      default: return { bg: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', text: 'O\'rta' };
    }
  };

  const getStatusBadgeStyle = (task) => {
    if (isOverdue(task)) {
      return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', text: 'Bajarilmadi', icon: <AlertTriangle size={12} className="animate-pulse" /> };
    }
    switch (task.status) {
      case 'yangi': return { bg: 'rgba(251, 191, 36, 0.1)', color: 'var(--accent-gold)', text: 'Yangi', icon: <Clock size={12} /> };
      case 'jarayonda': return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', text: 'Jarayonda', icon: <Clock size={12} /> };
      case 'bajarildi': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', text: 'Bajarildi', icon: <ShieldCheck size={12} /> };
      default: return { bg: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', text: 'Yangi', icon: <Clock size={12} /> };
    }
  };

  if (loading) {
    return (
      <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={48} color="var(--accent-gold)" />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '40px', padding: '30px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Vazifalar Boshqaruvi</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Buyurtmalar va mijozlar bo'yicha biriktirilgan faol vazifalar ro'yxati.</p>
        </div>
        {user?.role === 'showroom' && (
          <button className="gold-btn" onClick={() => handleOpenModal('add')}>
            <Plus size={20} />
            Yangi Vazifa
          </button>
        )}
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="premium-card" style={{ padding: '20px', textAlign: 'center', cursor: 'pointer', border: activeTab === 'all' ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)' }} onClick={() => setActiveTab('all')}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Jami vazifalar</p>
          <p style={{ fontSize: '28px', fontWeight: '800', color: 'white' }}>{totalCount}</p>
        </div>
        <div className="premium-card" style={{ padding: '20px', textAlign: 'center', cursor: 'pointer', border: activeTab === 'overdue' ? '1px solid #ef4444' : '1px solid var(--border-color)', background: 'rgba(239, 68, 68, 0.02)' }} onClick={() => setActiveTab('overdue')}>
          <p style={{ color: '#ef4444', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><AlertCircle size={14} /> Bajarilmadi</p>
          <p style={{ fontSize: '28px', fontWeight: '800', color: '#ef4444' }}>{overdueCount}</p>
        </div>
        <div className="premium-card" style={{ padding: '20px', textAlign: 'center', cursor: 'pointer', border: activeTab === 'new' ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)' }} onClick={() => setActiveTab('new')}>
          <p style={{ color: 'var(--accent-gold)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Yangi</p>
          <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--accent-gold)' }}>{newCount}</p>
        </div>
        <div className="premium-card" style={{ padding: '20px', textAlign: 'center', cursor: 'pointer', border: activeTab === 'pending' ? '1px solid #3b82f6' : '1px solid var(--border-color)' }} onClick={() => setActiveTab('pending')}>
          <p style={{ color: '#3b82f6', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Jarayonda</p>
          <p style={{ fontSize: '28px', fontWeight: '800', color: '#3b82f6' }}>{pendingCount}</p>
        </div>
        <div className="premium-card" style={{ padding: '20px', textAlign: 'center', cursor: 'pointer', border: activeTab === 'completed' ? '1px solid #10b981' : '1px solid var(--border-color)' }} onClick={() => setActiveTab('completed')}>
          <p style={{ color: '#10b981', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Bajarilgan</p>
          <p style={{ fontSize: '28px', fontWeight: '800', color: '#10b981' }}>{completedCount}</p>
        </div>
      </div>

      {/* Filter and Tab Section */}
      <div className="premium-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Tab buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => setActiveTab('all')} className={activeTab === 'all' ? 'gold-btn' : 'secondary-btn'} style={{ padding: '8px 16px', fontSize: '13px' }}>Hammasi</button>
            <button onClick={() => setActiveTab('overdue')} className={activeTab === 'overdue' ? 'gold-btn' : 'secondary-btn'} style={{ padding: '8px 16px', fontSize: '13px', background: activeTab === 'overdue' ? '#ef4444' : 'transparent', color: activeTab === 'overdue' ? 'white' : 'var(--text-secondary)' }}>Bajarilmadi</button>
            <button onClick={() => setActiveTab('new')} className={activeTab === 'new' ? 'gold-btn' : 'secondary-btn'} style={{ padding: '8px 16px', fontSize: '13px' }}>Yangi</button>
            <button onClick={() => setActiveTab('pending')} className={activeTab === 'pending' ? 'gold-btn' : 'secondary-btn'} style={{ padding: '8px 16px', fontSize: '13px' }}>Jarayonda</button>
            <button onClick={() => setActiveTab('completed')} className={activeTab === 'completed' ? 'gold-btn' : 'secondary-btn'} style={{ padding: '8px 16px', fontSize: '13px' }}>Bajarilgan</button>
          </div>

          {/* Search and Filters */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end', minWidth: '300px' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                placeholder="Vazifalarni qidirish..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', paddingLeft: '36px', fontSize: '13px', paddingY: '8px' }}
              />
            </div>
            
            <select style={{ fontSize: '13px', width: '150px' }} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="all">Barcha darajalar</option>
              <option value="yuqori">Yuqori</option>
              <option value="orta">O'rta</option>
              <option value="past">Past</option>
            </select>

            {(user?.role === 'super' || user?.role === 'showroom') && (
              <select style={{ fontSize: '13px', width: '180px' }} value={showroomFilter} onChange={(e) => setShowroomFilter(e.target.value)}>
                <option value="all">Barcha showroomlar</option>
                <option value="global">Global / Fabrika</option>
                {showrooms.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Tasks Listing */}
      {filteredTasks.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredTasks.map(task => {
            const priorityBadge = getPriorityBadgeStyle(task.priority);
            const statusBadge = getStatusBadgeStyle(task);
            const isTaskOverdue = isOverdue(task);
            
            return (
              <div 
                key={task._id} 
                className="premium-card" 
                style={{ 
                  padding: '24px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  border: isTaskOverdue ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color)',
                  transition: 'all 0.2s ease',
                  background: isTaskOverdue ? 'rgba(239, 68, 68, 0.01)' : 'var(--secondary-bg)'
                }}
              >
                <div>
                  {/* Task Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ 
                      fontSize: '11px', 
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      ...priorityBadge
                    }}>
                      {priorityBadge.text} Daraja
                    </span>
                    <span style={{ 
                      fontSize: '11px', 
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      background: statusBadge.bg,
                      color: statusBadge.color,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: '700'
                    }}>
                      {statusBadge.icon}
                      {statusBadge.text}
                    </span>
                  </div>

                  {/* Showroom & Order Badge */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    {task.orderUniqueId && (
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FileText size={10} /> Buyurtma: {task.orderUniqueId}
                      </span>
                    )}
                    {task.showroom && (
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                        Showroom: {showrooms.find(s => s._id === task.showroom)?.name || (task.showroom === 'fabrika' ? 'Fabrika' : 'Global')}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', lineHeight: '1.4' }}>
                    {task.title}
                  </h4>
                  {task.description && (
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Footer details */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Kimga:</span>
                      <span style={{ fontWeight: '600', color: 'white' }}>{task.assigneeName || 'Biriktirilmagan'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Kimdan:</span>
                      <span>{task.creatorName || 'Avtomatik'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Muddat:</span>
                      <span style={{ 
                        fontWeight: '700', 
                        color: isTaskOverdue ? '#ef4444' : 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px' 
                      }}>
                        <Calendar size={12} /> {task.dueDate ? new Date(task.dueDate).toLocaleString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Kiritilmagan'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {task.status !== 'bajarildi' ? (
                        <button 
                          onClick={() => handleQuickStatusChange(task, 'bajarildi')}
                          className="gold-btn" 
                          style={{ padding: '6px 12px', fontSize: '11px', background: '#10b981', color: 'white', borderColor: 'transparent' }}
                          title="Bajarildi deb belgilash"
                        >
                          <Check size={14} /> Bajarildi
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleQuickStatusChange(task, 'jarayonda')}
                          className="secondary-btn" 
                          style={{ padding: '6px 12px', fontSize: '11px' }}
                          title="Qayta faollashtirish"
                        >
                          Qayta ochish
                        </button>
                      )}
                      
                      {!isRestricted && (
                        <button 
                          onClick={() => handleOpenCommentModal(task)}
                          className="secondary-btn" 
                          style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
                          title="Izoh va yozishmalar"
                        >
                          <MessageSquare size={12} /> 
                          Izohlar ({task.comments?.length || 0})
                        </button>
                      )}
                    </div>

                    {!isRestricted && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button 
                          onClick={() => handleOpenModal('edit', task)}
                          style={{ padding: '6px', color: 'var(--text-secondary)', background: 'transparent' }}
                          title="Tahrirlash"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(task._id)}
                          style={{ padding: '6px', color: '#ef4444', background: 'transparent' }}
                          title="O'chirish"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="premium-card" style={{ padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ 
            width: '80px', height: '80px', background: 'rgba(251, 191, 36, 0.05)', 
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', border: '1px dashed var(--accent-gold)'
          }}>
            <CheckSquare size={40} color="var(--accent-gold)" style={{ opacity: 0.5 }} />
          </div>
          <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Hozircha vazifalar mavjud emas</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', margin: '0 auto' }}>
            Belgilangan filtrlarga mos keluvchi vazifalar topilmadi. Buyurtma kartochkasi orqali yoki yuqoridagi "Yangi Vazifa" tugmasini bosib vazifa qo'shishingiz mumkin.
          </p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="premium-card" style={{ width: '550px', maxWidth: '90%', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800' }}>{modalMode === 'add' ? 'Yangi Vazifa Yaratish' : 'Vazifani Tahrirlash'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', color: 'var(--text-secondary)' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} autoComplete="off">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Sarlavha (Mavzu)</label>
                  <input 
                    style={{ width: '100%' }} 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    required 
                    placeholder="Masalan: Mijoz bilan shartnomani imzolash"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Tafsilotlar (Izoh)</label>
                  <textarea 
                    style={{ width: '100%', height: '80px', resize: 'vertical' }} 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    placeholder="Vazifa bo'yicha batafsil ma'lumot qoldiring..."
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Mas'ul Xodim</label>
                    <select 
                      style={{ width: '100%' }} 
                      value={formData.assigneeId} 
                      onChange={e => setFormData({...formData, assigneeId: e.target.value})} 
                      required
                    >
                      {user?.role !== 'showroom' && (
                        <option value="">Xodimni tanlang</option>
                      )}
                      {modalMode === 'add' && (
                        <option value="all_employees">Barcha xodimlar</option>
                      )}
                      {usersList.map(u => (
                        <option key={u._id} value={u._id}>{u.name} {u.surname} ({u.role?.replace('_', ' ')})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Muddat (Deadline)</label>
                    <input 
                      type="datetime-local" 
                      style={{ width: '100%' }} 
                      value={formData.dueDate} 
                      onChange={e => setFormData({...formData, dueDate: e.target.value})} 
                      required 
                    />
                  </div>
                </div>

                {user?.role !== 'showroom' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Daraja (Priority)</label>
                      <select 
                        style={{ width: '100%' }} 
                        value={formData.priority} 
                        onChange={e => setFormData({...formData, priority: e.target.value})}
                      >
                        <option value="yuqori">Yuqori</option>
                        <option value="orta">O'rta</option>
                        <option value="past">Past</option>
                      </select>
                    </div>
                    
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Showroom (Filial)</label>
                      <select 
                        style={{ width: '100%' }} 
                        value={formData.showroom} 
                        onChange={e => setFormData({...formData, showroom: e.target.value})}
                      >
                        <option value="">Global</option>
                        <option value="fabrika">Fabrika</option>
                        {showrooms.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {modalMode === 'edit' && (
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Holati</label>
                    <select 
                      style={{ width: '100%' }} 
                      value={formData.status} 
                      onChange={e => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="yangi">Yangi</option>
                      <option value="jarayonda">Jarayonda</option>
                      <option value="bajarildi">Bajarildi (Yopilgan)</option>
                    </select>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="secondary-btn" style={{ flex: 1 }}>Bekor qilish</button>
                <button type="submit" className="gold-btn" style={{ flex: 1, justifyContent: 'center' }}>Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comment & Discussion Modal */}
      {isCommentModalOpen && selectedTask && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="premium-card" style={{ width: '600px', maxWidth: '95%', padding: '32px', height: '80vh', display: 'flex', flexDirection: 'column' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>Vazifa Muhokamasi</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Mavzu: {selectedTask.title}</span>
              </div>
              <button onClick={() => setIsCommentModalOpen(false)} style={{ background: 'transparent', color: 'var(--text-secondary)' }}><X size={20} /></button>
            </div>

            {/* Discussion Thread */}
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Task Details Card inside Comments for context */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '8px', fontSize: '13px' }}>
                <span style={{ fontWeight: '700', color: 'white', display: 'block', marginBottom: '6px' }}>Vazifa tavsifi:</span>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>{selectedTask.description || "Tavsif kiritilmagan."}</p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '10px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <span>Muddat: {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleString('uz-UZ') : 'Yo\'q'}</span>
                  <span>|</span>
                  <span>Mas'ul: {selectedTask.assigneeName}</span>
                </div>
              </div>

              {/* Real comments */}
              {selectedTask.comments && selectedTask.comments.length > 0 ? (
                selectedTask.comments.map((c, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      alignSelf: c.user === user.name ? 'flex-end' : 'flex-start',
                      background: c.user === user.name ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.04)',
                      border: c.user === user.name ? '1px solid rgba(212,175,55,0.2)' : '1px solid var(--border-color)',
                      padding: '12px 16px', 
                      borderRadius: '12px',
                      maxWidth: '85%',
                      minWidth: '200px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '11px' }}>
                      <span style={{ fontWeight: '700', color: c.user === user.name ? 'var(--accent-gold)' : 'white' }}>{c.user}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>{new Date(c.time).toLocaleString('uz-UZ')}</span>
                    </div>
                    <p style={{ fontSize: '13px', lineHeight: '1.4', whiteSpace: 'pre-wrap', color: 'white' }}>{c.text}</p>
                  </div>
                ))
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={32} style={{ opacity: 0.2 }} />
                  <p style={{ fontSize: '13px' }}>Hozircha yozishmalar mavjud emas. Birinchi bo'lib fikr bildiring!</p>
                </div>
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', gap: '12px' }}>
              <input 
                placeholder="Xabar yoki izoh qoldiring..." 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={{ flex: 1, padding: '12px 16px', fontSize: '13px' }}
                disabled={commentLoading}
                required
              />
              <button 
                type="submit" 
                className="gold-btn" 
                style={{ padding: '12px 20px', width: 'auto', minWidth: '60px', justifyContent: 'center' }}
                disabled={commentLoading}
              >
                {commentLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={16} />}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
