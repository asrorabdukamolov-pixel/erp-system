import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages (Will create these next)
import Login from './pages/Auth/Login';
import SuperDashboard from './pages/SuperAdmin/Dashboard';
import ShowroomDashboard from './pages/ShowroomAdmin/Dashboard';
import ShowroomsList from './pages/SuperAdmin/Showrooms';
import Staff from './pages/ShowroomAdmin/Staff';
import SalesOrders from './pages/SalesManager/Orders';
import ShowroomOrders from './pages/ShowroomAdmin/Orders';
import ShowroomCustomers from './pages/ShowroomAdmin/Customers';
import ShowroomTrash from './pages/ShowroomAdmin/Trash';
import ShowroomPartners from './pages/ShowroomAdmin/Partners';
import ShowroomPurchases from './pages/ShowroomAdmin/Purchases';
import ShowroomProposals from './pages/ShowroomAdmin/Proposals';
import SalesProfile from './pages/SalesManager/Profile';
import SuperOrders from './pages/SuperAdmin/Orders';
import SuperCustomerBase from './pages/SuperAdmin/CustomerBase';
import SuperPartners from './pages/SuperAdmin/Partners';
import Proposals from './pages/SalesManager/Proposals';
import SalesTrash from './pages/SalesManager/Trash';
import SalesFinance from './pages/SalesManager/Finance';
import Migration from './pages/SuperAdmin/Migration';
import CompanySettings from './pages/SuperAdmin/CompanySettings';

// Project Manager
import ProjectOrders from './pages/ProjectManager/Orders';
import ProjectProposals from './pages/ProjectManager/Proposals';
import ProjectTrash from './pages/ProjectManager/Trash';
import ProjectProfile from './pages/ProjectManager/Profile';
import ProjectFinance from './pages/ProjectManager/Finance';

// Finance / Kassa
import Finance from './pages/ShowroomAdmin/Finance';
import KassaDashboard from './pages/Kassa/Dashboard';
import KassaTransactions from './pages/Kassa/Transactions';
import KassaRequests from './pages/Kassa/MoneyRequests';

import PlaceholderPage from './components/PlaceholderPage';

// Layouts
import MainLayout from './components/MainLayout';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Yuklanmoqda...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" />;

  return children;
};

const AppContent = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Super Admin Routes */}
      <Route path="/super-admin" element={
        <ProtectedRoute allowedRoles={['super']}>
          <MainLayout><SuperDashboard /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/super-admin/showrooms" element={
        <ProtectedRoute allowedRoles={['super']}>
          <MainLayout><ShowroomsList /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/super-admin/customers" element={
        <ProtectedRoute allowedRoles={['super']}>
          <MainLayout><SuperCustomerBase /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/super-admin/orders" element={
        <ProtectedRoute allowedRoles={['super']}>
          <MainLayout><SuperOrders /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/super-admin/partners" element={
        <ProtectedRoute allowedRoles={['super']}>
          <MainLayout><SuperPartners /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/super-admin/migration" element={
        <ProtectedRoute allowedRoles={['super']}>
          <MainLayout><Migration /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/super-admin/company-settings" element={
        <ProtectedRoute allowedRoles={['super']}>
          <MainLayout><CompanySettings /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/super-admin/settings" element={
        <ProtectedRoute allowedRoles={['super']}>
          <MainLayout><PlaceholderPage title="Sozlamalar" description="Global tizim sozlamalari." /></MainLayout>
        </ProtectedRoute>
      } />

      {/* Showroom Admin Routes */}
      <Route path="/showroom-admin" element={
        <ProtectedRoute allowedRoles={['showroom']}>
          <MainLayout><ShowroomDashboard /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/showroom-admin/staff" element={
        <ProtectedRoute allowedRoles={['showroom']}>
          <MainLayout><Staff /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/showroom-admin/customers" element={
        <ProtectedRoute allowedRoles={['showroom']}>
          <MainLayout><ShowroomCustomers /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/showroom-admin/orders" element={
        <ProtectedRoute allowedRoles={['showroom']}>
          <MainLayout><ShowroomOrders /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/showroom-admin/proposals" element={
        <ProtectedRoute allowedRoles={['showroom']}>
          <MainLayout><ShowroomProposals /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/showroom-admin/purchases" element={
        <ProtectedRoute allowedRoles={['showroom']}>
          <MainLayout><ShowroomPurchases /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/showroom-admin/finance" element={
        <ProtectedRoute allowedRoles={['showroom']}>
          <MainLayout><Finance /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/showroom-admin/partners" element={
        <ProtectedRoute allowedRoles={['showroom']}>
          <MainLayout><ShowroomPartners /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/showroom-admin/trash" element={
        <ProtectedRoute allowedRoles={['showroom']}>
          <MainLayout><ShowroomTrash /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/showroom-admin/settings" element={
        <ProtectedRoute allowedRoles={['showroom']}>
          <MainLayout><PlaceholderPage title="Sozlamalar" description="Filial sozlamalari." /></MainLayout>
        </ProtectedRoute>
      } />

      {/* Sales Manager Routes */}
      <Route path="/sotuv-manager/orders" element={
        <ProtectedRoute allowedRoles={['sotuv_manager']}>
          <MainLayout><SalesOrders /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/sotuv-manager/archive" element={
        <ProtectedRoute allowedRoles={['sotuv_manager']}>
          <MainLayout><SalesOrders /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/sotuv-manager/proposals" element={
        <ProtectedRoute allowedRoles={['sotuv_manager']}>
          <MainLayout><Proposals /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/sotuv-manager/trash" element={
        <ProtectedRoute allowedRoles={['sotuv_manager']}>
          <MainLayout><SalesTrash /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/sotuv-manager/finance" element={
        <ProtectedRoute allowedRoles={['sotuv_manager']}>
          <MainLayout><SalesFinance /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/sotuv-manager/inventory" element={
        <ProtectedRoute allowedRoles={['sotuv_manager']}>
          <MainLayout><PlaceholderPage title="Ombor" description="Mavjud mahsulotlar." /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/sotuv-manager/profile" element={
        <ProtectedRoute allowedRoles={['sotuv_manager']}>
          <MainLayout><SalesProfile /></MainLayout>
        </ProtectedRoute>
      } />

      {/* Project Manager Routes */}
      <Route path="/proekt-manager/orders" element={
        <ProtectedRoute allowedRoles={['proekt_manager']}>
          <MainLayout><ProjectOrders /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/proekt-manager/archive" element={
        <ProtectedRoute allowedRoles={['proekt_manager']}>
          <MainLayout><ProjectOrders /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/proekt-manager/proposals" element={
        <ProtectedRoute allowedRoles={['proekt_manager']}>
          <MainLayout><ProjectProposals /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/proekt-manager/trash" element={
        <ProtectedRoute allowedRoles={['proekt_manager']}>
          <MainLayout><ProjectTrash /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/proekt-manager/purchases" element={
        <ProtectedRoute allowedRoles={['proekt_manager']}>
          <MainLayout><ShowroomPurchases /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/proekt-manager/finance" element={
        <ProtectedRoute allowedRoles={['proekt_manager']}>
          <MainLayout><ProjectFinance /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/proekt-manager/profile" element={
        <ProtectedRoute allowedRoles={['proekt_manager']}>
          <MainLayout><ProjectProfile /></MainLayout>
        </ProtectedRoute>
      } />

      {/* Kassa Routes */}
      <Route path="/kassa/dashboard" element={
        <ProtectedRoute allowedRoles={['kassa']}>
          <MainLayout><KassaDashboard /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/kassa/requests" element={
        <ProtectedRoute allowedRoles={['kassa']}>
          <MainLayout><KassaRequests /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/kassa/transactions" element={
        <ProtectedRoute allowedRoles={['kassa']}>
          <MainLayout><KassaTransactions /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/kassa/profile" element={
        <ProtectedRoute allowedRoles={['kassa']}>
          <MainLayout><PlaceholderPage title="Shaxsiy Bo'lim" description="Kassa xodimi profili." /></MainLayout>
        </ProtectedRoute>
      } />

      {/* Root handling */}
      <Route path="/" element={
        user ? (
          user.role === 'super' ? <Navigate to="/super-admin" /> : 
          user.role === 'showroom' ? <Navigate to="/showroom-admin" /> : 
          user.role === 'kassa' ? <Navigate to="/kassa/dashboard" /> :
          <Navigate to={`/${user.role.replace('_', '-')}/orders`} />
        ) : <Navigate to="/login" />
      } />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
