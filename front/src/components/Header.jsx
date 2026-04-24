import React, { useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, User as UserIcon } from 'lucide-react';

const Header = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert('Rasm hajmi juda katta (maks: 1MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateUser({ photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      className="header-reveal-container"
      style={{
        position: 'fixed',
        top: 0,
        left: '280px', // Sidebar kengligini hisobga olgan holda (agar sidebar bo'lsa)
        right: 0,
        zIndex: 2000,
        padding: '10px 40px',
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: 'translateY(-85%)',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(0)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(-85%)'}
    >
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'rgba(15, 23, 42, 0.8)',
        padding: '12px 24px',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Qidiruv..." 
            style={{ width: '100%', paddingLeft: '44px', paddingRight: '16px', height: '40px', fontSize: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '10px', color: '#fff' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button style={{ position: 'relative', background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}>
            <Bell size={22} />
            <span style={{ 
              position: 'absolute', 
              top: '2px', 
              right: '2px', 
              background: '#ef4444', 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%',
              border: '2px solid #0f172a'
            }}></span >
          </button>

          <div style={{ height: '24px', width: '1px', background: 'var(--border-color)' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: 0 }}>{user?.name}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'capitalize', margin: 0 }}>
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
            <div 
              onClick={() => fileInputRef.current.click()}
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                background: 'var(--accent-gold)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--primary-bg)',
                cursor: 'pointer',
                overflow: 'hidden',
                transition: 'transform 0.2s',
                boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {user?.photo ? (
                <img src={user.photo} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <UserIcon size={22} />
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoUpload} 
              style={{ display: 'none' }} 
              accept="image/*" 
            />
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
