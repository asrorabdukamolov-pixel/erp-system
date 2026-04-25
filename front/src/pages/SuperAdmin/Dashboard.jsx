import React, { useState, useEffect } from 'react';
import { Store, TrendingUp, Users, DollarSign, RotateCw } from 'lucide-react';
import api from '../../utils/api';

const DashboardCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="premium-card" style={{ flex: 1, minWidth: '240px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
      <div style={{ 
        background: `${color}20`, 
        color: color, 
        padding: '12px', 
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Icon size={24} />
      </div>
      {trend && trend !== '0' && (
        <span style={{ 
          fontSize: '12px', 
          color: trend.startsWith('+') ? 'var(--success)' : 'var(--error)',
          background: trend.startsWith('+') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          padding: '4px 8px',
          borderRadius: '20px',
          height: 'fit-content'
        }}>
          {trend}
        </span>
      )}
    </div>
    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>{title}</p>
    <h3 style={{ fontSize: '24px', fontWeight: '700' }}>{value}</h3>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    showroomsCount: 0,
    activeAdminsCount: 0,
    totalSales: 0,
    monthlyGrowth: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // sekundda

    if (diff < 60) return 'Hozirgina';
    if (diff < 3600) return `${Math.floor(diff / 60)} daqiqa oldin`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`;
    return date.toLocaleDateString();
  };

  const fetchStats = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await api.get('/stats/superadmin');
      setStats(res.data);
    } catch (err) {
      console.error('Stats loading error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <div style={{ padding: '20px', color: 'white' }}>Yuklanmoqda...</div>;

  return (
    <div>
      <div style={{ 
        marginBottom: '32px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start' 
      }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Xush kelibsiz, Supper Admin!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Bugun tizim bo'yicha umumiy holat va yangiliklar.</p>
        </div>
        <button 
          onClick={() => fetchStats(true)}
          disabled={refreshing}
          className="gold-btn"
          style={{ 
            padding: '10px 20px', 
            fontSize: '14px',
            gap: '10px',
            opacity: refreshing ? 0.7 : 1
          }}
        >
          <RotateCw size={18} className={refreshing ? 'spin-animation' : ''} />
          Yangilash
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '40px' }}>
        <DashboardCard 
          title="Umumiy Showroomlar" 
          value={`${stats.showroomsCount} ta`} 
          icon={Store} 
          color="#fbbf24" 
        />
        <DashboardCard 
          title="Jami Sotuvlar" 
          value={`${stats.totalSales.toLocaleString()} so'm`} 
          icon={DollarSign} 
          color="#10b981" 
        />
        <DashboardCard 
          title="Faol Adminlar" 
          value={`${stats.activeAdminsCount} nafar`} 
          icon={Users} 
          color="#3b82f6" 
        />
        <DashboardCard 
          title="Oylik O'sish" 
          value={`${stats.monthlyGrowth}%`} 
          icon={TrendingUp} 
          color="#8b5cf6" 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="premium-card">
          <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>Showroomlar Faolligi</h3>
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
            Grafik (Chart) bu yerda bo'ladi
          </div>
        </div>
        <div className="premium-card">
          <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>Oxirgi Amallar</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {stats.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((activity, i) => (
                <div key={activity.id} style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  paddingBottom: '16px', 
                  borderBottom: i !== stats.recentActivities.length - 1 ? '1px solid var(--border-color)' : 'none' 
                }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    background: activity.type === 'user' ? '#3b82f620' : '#fbbf2420', 
                    color: activity.type === 'user' ? '#3b82f6' : '#fbbf24',
                    borderRadius: '10px', 
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {activity.type === 'user' ? <Users size={20} /> : <Store size={20} />}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500' }}>{activity.title}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{formatTime(activity.time)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                Hozircha harakatlar yo'q
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
