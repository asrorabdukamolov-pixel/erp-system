import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Pages (Will create these next)
import Login from './pages/Auth/Login';
import SuperDashboard from './pages/SuperAdmin/Dashboard';
import ShowroomDashboard from './pages/ShowroomAdmin/Dashboard';
import ShowroomsList from './pages/SuperAdmin/Showrooms';
import Departments from './pages/SuperAdmin/Departments';
import CostCenters from './pages/SuperAdmin/CostCenters';
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
import Fabrika from './pages/SuperAdmin/Fabrika';
import SuperPartners from './pages/SuperAdmin/Partners';
import Proposals from './pages/SalesManager/Proposals';
import SalesTrash from './pages/SalesManager/Trash';
import SalesFinance from './pages/SalesManager/Finance';
import CompanySettings from './pages/SuperAdmin/CompanySettings';
import SuperSettings from './pages/SuperAdmin/Settings';
import SuperAdminStaff from './pages/SuperAdmin/Staff';
import DistributorDashboard from './pages/Fabrika/Distributor';
import Suppliers from './pages/Shared/Suppliers';
import Tasks from './pages/Shared/Tasks';
import AIInsights from './pages/SuperAdmin/AIInsights';

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
import FabrikaOrders from './pages/Fabrika/Orders';

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
      <Route path="/super-admin/departments" element={
        <ProtectedRoute allowedRoles={['super']}>
          <MainLayout><Departments /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/super-admin/cost-centers" element={
        <ProtectedRoute allowedRoles={['super']}>
          <MainLayout><CostCenters /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/super-admin/fabrika" element={
        <ProtectedRoute allowedRoles={['super']}>
          <MainLayout><Fabrika /></MainLayout>
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
      <Route path="/super-admin/partners" element={<Navigate to="/super-admin/settings" replace />} />
      <Route path="/super-admin/company-settings" element={<Navigate to="/super-admin/settings" replace />} />
      <Route path="/super-admin/staff" element={
        <ProtectedRoute allowedRoles={['super']}>
          <MainLayout><SuperAdminStaff /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/fabrika/distributor" element={
        <ProtectedRoute allowedRoles={['distributor', 'super']}>
          <MainLayout><DistributorDashboard /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/super-admin/suppliers" element={
        <ProtectedRoute allowedRoles={['super']}>
          <MainLayout><Suppliers /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/super-admin/settings" element={
        <ProtectedRoute allowedRoles={['super']}>
          <MainLayout><SuperSettings /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/super-admin/ai-insights" element={
        <ProtectedRoute allowedRoles={['super']}>
          <MainLayout><AIInsights /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/super-admin/tasks" element={
        <ProtectedRoute allowedRoles={['super']}>
          <MainLayout><Tasks /></MainLayout>
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
      <Route path="/showroom-admin/suppliers" element={
        <ProtectedRoute allowedRoles={['showroom']}>
          <MainLayout><Suppliers /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/showroom-admin/partners" element={<Navigate to="/showroom-admin/suppliers" replace />} />
      <Route path="/showroom-admin/trash" element={
        <ProtectedRoute allowedRoles={['showroom']}>
          <MainLayout><ShowroomTrash /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/showroom-admin/tasks" element={
        <ProtectedRoute allowedRoles={['showroom']}>
          <MainLayout><Tasks /></MainLayout>
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
      <Route path="/sotuv-manager/tasks" element={
        <ProtectedRoute allowedRoles={['sotuv_manager']}>
          <MainLayout><Tasks /></MainLayout>
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
      <Route path="/proekt-manager/tasks" element={
        <ProtectedRoute allowedRoles={['proekt_manager']}>
          <MainLayout><Tasks /></MainLayout>
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

      {/* Fabrika Routes */}
      <Route path="/fabrika" element={
        <ProtectedRoute allowedRoles={['fabrika']}>
          <MainLayout><PlaceholderPage title="Fabrika Dashboard" description="Ishlab chiqarish umumiy ko'rinishi." /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/fabrika/orders" element={
        <ProtectedRoute allowedRoles={['fabrika']}>
          <MainLayout><FabrikaOrders /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/fabrika/finance" element={
        <ProtectedRoute allowedRoles={['fabrika']}>
          <MainLayout><PlaceholderPage title="Moliya" description="Fabrika moliyaviy oqimi." /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/fabrika/staff" element={
        <ProtectedRoute allowedRoles={['fabrika']}>
          <MainLayout><PlaceholderPage title="Xodimlar" description="Fabrika ishchi-xodimlari." /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/fabrika/inventory" element={
        <ProtectedRoute allowedRoles={['fabrika']}>
          <MainLayout><PlaceholderPage title="Sklad" description="Xom-ashyo zaxirasi." /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/fabrika/purchases" element={
        <ProtectedRoute allowedRoles={['fabrika']}>
          <MainLayout><PlaceholderPage title="Xarid bo'limi" description="Fabrika uchun xaridlar." /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/fabrika/warehouse" element={
        <ProtectedRoute allowedRoles={['fabrika']}>
          <MainLayout><PlaceholderPage title="Ombor" description="Tayyor mahsulotlar ombori." /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/fabrika/logistics" element={
        <ProtectedRoute allowedRoles={['fabrika']}>
          <MainLayout><PlaceholderPage title="Logistika" description="Yetkazib berish va o'rnatish." /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/fabrika/settings" element={
        <ProtectedRoute allowedRoles={['fabrika']}>
          <MainLayout><PlaceholderPage title="Sozlamalar" description="Fabrika sozlamalari." /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/fabrika/trash" element={
        <ProtectedRoute allowedRoles={['fabrika']}>
          <MainLayout><PlaceholderPage title="Karzina" description="O'chirilgan ma'lumotlar." /></MainLayout>
        </ProtectedRoute>
      } />

      {/* Root handling */}
      <Route path="/" element={
        user ? (
          user.role === 'super' ? <Navigate to="/super-admin" /> : 
          user.role === 'showroom' ? <Navigate to="/showroom-admin" /> : 
          user.role === 'kassa' ? <Navigate to="/kassa/dashboard" /> :
          user.role === 'fabrika' ? <Navigate to="/fabrika" /> :
          <Navigate to={`/${user.role.replace('_', '-')}/orders`} />
        ) : <Navigate to="/login" />
      } />
      <Route path="*" element={<PlaceholderPage title="404" description="Sahifa topilmadi." />} />
    </Routes>
  );
};



import AIAssistant from './components/AIAssistant';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppContent />
          <AIAssistant />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
