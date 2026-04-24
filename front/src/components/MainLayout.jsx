import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ children }) => {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', paddingBottom: 0 }}>
        <Header />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '20px 40px 100px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
