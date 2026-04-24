import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  LogOut, 
  Package, 
  ShoppingCart,
  Settings,
  UserPlus,
  ClipboardList,
  FolderOpen,
  Trash2,
  Handshake,
  FileText,
  User,
  Wallet,
  History
} from 'lucide-react';
import logo from '../assets/logo.png';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const superAdminLinks = [
    { name: 'Bosh sahifa', path: '/super-admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Showroomlar', path: '/super-admin/showrooms', icon: <Store size={20} /> },
    { name: 'Mijozlar Bazasi', path: '/super-admin/customers', icon: <Users size={20} /> },
    { name: 'Barcha Buyurtmalar', path: '/super-admin/orders', icon: <ClipboardList size={20} /> },
    { name: 'Hamkorlar', path: '/super-admin/partners', icon: <Handshake size={20} /> },
    { name: 'Ma\'lumotlar Migratsiyasi', path: '/super-admin/migration', icon: <History size={20} /> },
    { name: 'Sozlamalar', path: '/super-admin/settings', icon: <Settings size={20} /> },
  ];

  const showroomAdminLinks = [
    { name: 'Dashboard', path: '/showroom-admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Savdo bo\'limi', path: '/showroom-admin/orders', icon: <ShoppingCart size={20} /> },
    { name: 'Xarid bo\'limi', path: '/showroom-admin/purchases', icon: <Package size={20} /> },
    { name: 'Moliya', path: '/showroom-admin/finance', icon: <Wallet size={20} /> },
    { name: 'Mijozlar', path: '/showroom-admin/customers', icon: <UserPlus size={20} /> },
    { name: 'Xodimlar', path: '/showroom-admin/staff', icon: <Users size={20} /> },
    { name: 'Hamkorlar', path: '/showroom-admin/partners', icon: <Handshake size={20} /> },
    { name: 'Karzina', path: '/showroom-admin/trash', icon: <Trash2 size={20} /> },
    { name: 'Sozlamalar', path: '/showroom-admin/settings', icon: <Settings size={20} /> },
  ];

  const kassaLinks = [
    { name: 'Kassa Dashboard', path: '/kassa/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Pul so\'rovlari', path: '/kassa/requests', icon: <ClipboardList size={20} /> },
    { name: 'Tranzaksiyalar', path: '/kassa/transactions', icon: <FileText size={20} /> },
    { name: 'Shaxsiy Bo\'lim', path: '/kassa/profile', icon: <User size={20} /> },
  ];
  const salesManagerLinks = [
    { name: 'Sotuvlar', path: '/sotuv-manager/orders', icon: <ShoppingCart size={20} /> },
    { name: 'Tijorat Takliflari', path: '/sotuv-manager/proposals', icon: <FileText size={20} /> },
    { name: 'Finans', path: '/sotuv-manager/finance', icon: <Wallet size={20} /> },
    { name: 'Buyurtmalar Arxivi', path: '/sotuv-manager/archive', icon: <History size={20} /> },
    { name: 'Karzina', path: '/sotuv-manager/trash', icon: <Trash2 size={20} /> },
    { name: 'Shaxsiy Bo\'lim', path: '/sotuv-manager/profile', icon: <User size={20} /> },
  ];

  const projectManagerLinks = [
    { name: 'Loyihalar / Varonka', path: '/proekt-manager/orders', icon: <ClipboardList size={20} /> },
    { name: 'Xarid bo\'limi', path: '/proekt-manager/purchases', icon: <Package size={20} /> },
    { name: 'Tijorat Takliflari', path: '/proekt-manager/proposals', icon: <FileText size={20} /> },
    { name: 'Finans', path: '/proekt-manager/finance', icon: <Wallet size={20} /> },
    { name: 'Buyurtmalar Arxivi', path: '/proekt-manager/archive', icon: <History size={20} /> },
    { name: 'Karzina', path: '/proekt-manager/trash', icon: <Trash2 size={20} /> },
    { name: 'Shaxsiy Bo\'lim', path: '/proekt-manager/profile', icon: <User size={20} /> },
  ];

  // Logic to determine which links to show
  let links = [];
  if (user?.role === 'super') links = superAdminLinks;
  else if (user?.role === 'showroom') links = showroomAdminLinks;
  else if (user?.role === 'sotuv_manager') links = salesManagerLinks;
  else if (user?.role === 'proekt_manager') links = projectManagerLinks;
  else if (user?.role === 'kassa') links = kassaLinks;
  else links = [{ name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> }];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ 
      width: 'var(--sidebar-width)', 
      background: 'var(--secondary-bg)', 
      height: '100vh', 
      position: 'fixed', 
      left: 0, 
      top: 0,
      borderRight: '1px solid var(--border-color)',
      padding: '30px 20px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ marginBottom: '32px', padding: '12px 16px', background: '#fff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={logo} alt="Express Mebel Logo" style={{ width: '100%', maxWidth: '160px', pointerEvents: 'none' }} />
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        padding: '12px', 
        marginBottom: '24px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ 
          width: '44px', 
          height: '44px', 
          borderRadius: '50%', 
          border: '2px solid var(--accent-gold)', 
          padding: '2px', 
          overflow: 'hidden',
          flexShrink: 0
        }}>
          {user?.photo ? (
            <img src={user.photo} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', fontSize: '14px', fontWeight: 'bold' }}>
              {user?.name?.charAt(0)}
            </div>
          )}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <p style={{ fontSize: '14px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{user?.role?.replace('_', ' ')}</p>
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 16px',
              borderRadius: '12px',
              color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
              background: isActive ? 'rgba(251, 191, 36, 0.1)' : 'transparent',
              textDecoration: 'none',
              marginBottom: '8px',
              transition: 'all 0.2s ease',
              fontWeight: isActive ? '600' : '400'
            })}
          >
            {link.icon}
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>


        <button 
          onClick={handleLogout}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            padding: '14px 16px', 
            borderRadius: '12px',
            color: '#ef4444',
            background: 'rgba(239, 68, 68, 0.05)',
            width: '100%'
          }}
        >
          <LogOut size={20} />
          <span>Tizimdan chiqish</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
