import { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { initData } from './api/api';
import CommandPalette from './components/CommandPalette';

// Pages
import LandingPage         from './pages/LandingPage';
import AdminLogin          from './pages/AdminLogin';
import EmployeeLogin       from './pages/EmployeeLogin';

// Admin Pages
import AdminDashboard      from './pages/admin/AdminDashboard';
import EmployeeList        from './pages/admin/EmployeeList';
import SalaryManagement    from './pages/admin/SalaryManagement';
import AttendanceManagement from './pages/admin/AttendanceManagement';
import PaySlipAdmin        from './pages/admin/PaySlipAdmin';
import LeaveAdmin          from './pages/admin/LeaveAdmin';
import Reports             from './pages/admin/Reports';

// Employee Pages
import EmployeeDashboard   from './pages/employee/EmployeeDashboard';
import MyAttendance        from './pages/employee/MyAttendance';
import MySalarySlip        from './pages/employee/MySalarySlip';
import MyProfile           from './pages/employee/MyProfile';
import LeaveRequest        from './pages/employee/LeaveRequest';

function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user || user.role !== 'admin') return <Navigate to="/admin/login" replace />;
  return children;
}

function RequireEmployee({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user || user.role !== 'employee') return <Navigate to="/employee/login" replace />;
  return children;
}

function LoadingScreen() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--bg)',
      flexDirection: 'column', gap: 20,
    }}>
      <div style={{
        width: 52, height: 52,
        border: '3px solid rgba(79,70,229,.15)',
        borderTopColor: '#4F46E5',
        borderRadius: '50%',
        animation: 'spin .7s linear infinite',
      }} />
      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.88rem', letterSpacing: '.05em' }}>
        LOADING EMPOWERHR
      </div>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}

function AppInit() {
  useEffect(() => { initData(); }, []);
  return null;
}

function GlobalCommandPalette() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (user) setOpen(v => !v);
    }
  }, [user]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!user) return null;
  return <CommandPalette open={open} onClose={() => setOpen(false)} />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"                  element={<LandingPage />} />
      <Route path="/admin/login"       element={<AdminLogin />} />
      <Route path="/employee/login"    element={<EmployeeLogin />} />

      <Route path="/admin/dashboard"   element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
      <Route path="/admin/employees"   element={<RequireAdmin><EmployeeList /></RequireAdmin>} />
      <Route path="/admin/salary"      element={<RequireAdmin><SalaryManagement /></RequireAdmin>} />
      <Route path="/admin/attendance"  element={<RequireAdmin><AttendanceManagement /></RequireAdmin>} />
      <Route path="/admin/payslips"    element={<RequireAdmin><PaySlipAdmin /></RequireAdmin>} />
      <Route path="/admin/leaves"      element={<RequireAdmin><LeaveAdmin /></RequireAdmin>} />
      <Route path="/admin/reports"     element={<RequireAdmin><Reports /></RequireAdmin>} />

      <Route path="/employee/dashboard" element={<RequireEmployee><EmployeeDashboard /></RequireEmployee>} />
      <Route path="/employee/attendance" element={<RequireEmployee><MyAttendance /></RequireEmployee>} />
      <Route path="/employee/salary"    element={<RequireEmployee><MySalarySlip /></RequireEmployee>} />
      <Route path="/employee/profile"   element={<RequireEmployee><MyProfile /></RequireEmployee>} />
      <Route path="/employee/leave"     element={<RequireEmployee><LeaveRequest /></RequireEmployee>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppInit />
          <GlobalCommandPalette />
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
