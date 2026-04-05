import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRegistrations from './pages/admin/AdminRegistrations';
import AdminMedicines from './pages/admin/AdminMedicines';
import AdminInstitutions from './pages/admin/AdminInstitutions';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import HospitalInventory from './pages/hospital/HospitalInventory';
import HospitalExpiry from './pages/hospital/HospitalExpiry';
import HospitalRequests from './pages/hospital/HospitalRequests';
import MedicineSearch from './pages/hospital/MedicineSearch';
import Layout from './components/shared/Layout';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'CITY_ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/hospital/dashboard" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/" element={<RoleRedirect />} />
    <Route path="/dashboard" element={<RoleRedirect />} />

    {/* Admin routes */}
    <Route path="/admin" element={
      <PrivateRoute roles={['CITY_ADMIN']}>
        <Layout role="admin" />
      </PrivateRoute>
    }>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="registrations" element={<AdminRegistrations />} />
      <Route path="medicines" element={<AdminMedicines />} />
      <Route path="institutions" element={<AdminInstitutions />} />
      <Route path="audit-logs" element={<AdminAuditLogs />} />
    </Route>

    {/* Hospital/Pharmacy routes */}
    <Route path="/hospital" element={
      <PrivateRoute roles={['HOSPITAL', 'PHARMACY']}>
        <Layout role="hospital" />
      </PrivateRoute>
    }>
      <Route path="dashboard" element={<HospitalDashboard />} />
      <Route path="inventory" element={<HospitalInventory />} />
      <Route path="expiry" element={<HospitalExpiry />} />
      <Route path="requests" element={<HospitalRequests />} />
      <Route path="search" element={<MedicineSearch />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              fontFamily: 'var(--font-main)',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: 'var(--success)', secondary: 'var(--bg-card)' } },
            error: { iconTheme: { primary: 'var(--danger)', secondary: 'var(--bg-card)' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
