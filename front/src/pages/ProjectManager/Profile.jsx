import React from 'react';

const Profile = () => {
  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-1px' }}>Shaxsiy <span style={{ color: 'var(--accent-gold)' }}>Profil</span></h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Yaqinda bu yerda yangi imkoniyatlar va shaxsiy statistika paydo bo'ladi.</p>
      </div>

      <div style={{ 
        height: '400px', 
        border: '2px dashed rgba(255,255,255,0.05)', 
        borderRadius: '24px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'var(--text-secondary)',
        fontSize: '14px',
        fontStyle: 'italic'
      }}>
        Bo'lim tez kunda yangilanadi...
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Profile;
