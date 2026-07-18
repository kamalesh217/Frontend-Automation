import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, DollarSign, Calendar, FileText, BarChart3,
  User, Clock, CreditCard, Briefcase, LogOut, Zap
} from 'lucide-react';

const ADMIN_MENU = [
  { label: 'Overview', key: 'main', items: [
    { icon: LayoutDashboard, label: 'Dashboard',  path: '/admin/dashboard' },
    { icon: Users,           label: 'Employees',  path: '/admin/employees' },
  ]},
  { label: 'Payroll', key: 'payroll', items: [
    { icon: DollarSign, label: 'Salary Management', path: '/admin/salary' },
    { icon: FileText,   label: 'Pay Slips',         path: '/admin/payslips' },
  ]},
  { label: 'Workforce', key: 'workforce', items: [
    { icon: Calendar,  label: 'Attendance',     path: '/admin/attendance' },
    { icon: Briefcase, label: 'Leave Requests', path: '/admin/leaves' },
    { icon: BarChart3, label: 'Reports',        path: '/admin/reports' },
  ]},
];

const EMPLOYEE_MENU = [
  { label: 'Overview', key: 'main', items: [
    { icon: LayoutDashboard, label: 'Dashboard',  path: '/employee/dashboard' },
    { icon: User,            label: 'My Profile', path: '/employee/profile' },
  ]},
  { label: 'Payroll', key: 'payroll', items: [
    { icon: CreditCard, label: 'Salary Slip', path: '/employee/salary' },
  ]},
  { label: 'Time & Leave', key: 'time', items: [
    { icon: Clock,    label: 'My Attendance', path: '/employee/attendance' },
    { icon: Calendar, label: 'Leave Request', path: '/employee/leave' },
  ]},
];

export default function Sidebar({ role }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();

  const menu = role === 'admin' ? ADMIN_MENU : EMPLOYEE_MENU;

  const handleLogout = () => { logout(); navigate('/'); };

  const adminGrad  = 'linear-gradient(135deg, #7c3aed, #6366f1)';
  const empGrad    = 'linear-gradient(135deg, #0d9488, #0891b2)';
  const activeGrad = role === 'admin' ? adminGrad : empGrad;

  return (
    <aside className="sidebar" data-testid="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon" style={{ background: activeGrad }}>
          <Zap size={18} color="#fff" />
        </div>
        <div>
          <div className="logo-text">EmpowerHR</div>
          <div className="logo-sub">{role === 'admin' ? 'Admin Console' : 'Employee Portal'}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menu.map(section => (
          <div key={section.key}>
            <div className="nav-section-label">{section.label}</div>
            {section.items.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`nav-item${isActive ? ' active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <Icon size={17} className="nav-icon" />
                  <span>{item.label}</span>
                  {isActive && (
                    <div style={{
                      marginLeft: 'auto',
                      width: 6, height: 6,
                      borderRadius: '50%',
                      background: role === 'admin' ? '#7c3aed' : 'var(--primary)',
                      flexShrink: 0,
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar avatar-sm" style={{ background: activeGrad, border: '2px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }}>
            {user?.avatar || user?.name?.split(' ').map(n => n[0]).join('') || (role === 'admin' ? 'AD' : 'EM')}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || (role === 'admin' ? 'Administrator' : 'Employee')}
            </div>
            <div className="sidebar-user-role">{role === 'admin' ? 'Administrator' : user?.role || 'Employee'}</div>
          </div>
        </div>
        <button
          id="sidebar-logout-btn"
          data-testid="logout-button"
          className="btn btn-outline w-full"
          style={{ marginTop: 10, borderRadius: 8, justifyContent: 'center', gap: 7, fontSize: '0.82rem' }}
          onClick={handleLogout}
        >
          <LogOut size={15} /> Logout
        </button>
      </div>
    </aside>
  );
}
