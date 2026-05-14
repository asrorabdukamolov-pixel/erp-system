import React from 'react';

const AIAssistant = () => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)',
      color: 'black',
      padding: '12px 24px',
      borderRadius: '30px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
      fontWeight: 'bold',
      cursor: 'pointer',
      zIndex: 9999
    }}>
      ✨ AI Assistant
    </div>
  );
};

export default AIAssistant;
