import React from 'react';
import { Store, TrendingUp, Users, DollarSign } from 'lucide-react';

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
      {trend && (
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
  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Xush kelibsiz, Supper Admin!</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Bugun tizim bo'yicha umumiy holat va yangiliklar.</p>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '40px' }}>
        <DashboardCard 
          title="Umumiy Showroomlar" 
          value="12 ta" 
          icon={Store} 
          color="#fbbf24" 
          trend="+2 yangi"
        />
        <DashboardCard 
          title="Jami Sotuvlar" 
          value="245 mln so'm" 
          icon={DollarSign} 
          color="#10b981" 
          trend="+12%"
        />
        <DashboardCard 
          title="Faol Adminlar" 
          value="18 nafar" 
          icon={Users} 
          color="#3b82f6" 
        />
        <DashboardCard 
          title="Oylik O'sish" 
          value="24%" 
          icon={TrendingUp} 
          color="#8b5cf6" 
          trend="+5%"
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
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ display: 'flex', gap: '12px', paddingBottom: '16px', borderBottom: i !== 4 ? '1px solid var(--border-color)' : 'none' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--secondary-bg)', borderRadius: '10px', flexShrink: 0 }}></div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500' }}>Yangi showroom ochildi</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>2 soat oldin</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
