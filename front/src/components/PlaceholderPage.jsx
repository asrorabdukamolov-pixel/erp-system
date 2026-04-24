import React from 'react';

const PlaceholderPage = ({ title, description }) => {
  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>{title}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{description}</p>
      </div>

      <div className="premium-card" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-color)', borderRadius: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Bu bo'lim hozircha tayyorlanmoqda...</p>
          <p style={{ fontSize: '14px', color: 'rgba(148, 163, 184, 0.5)' }}>Tez orada bu yerda {title.toLowerCase()} funksiyalari paydo bo'ladi.</p>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
