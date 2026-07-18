import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, DollarSign, CalendarCheck,
  FileText, Umbrella, BarChart3, LogOut,
  User, Calendar, Receipt, ClipboardList
} from 'lucide-react';
import { useState } from 'react';

const ADMIN_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Users, label: 'Employees', path: '/admin/employees' },
  { icon: DollarSign, label: 'Salary', path: '/admin/salary' },
  { icon: CalendarCheck, label: 'Attendance', path: '/admin/attendance' },
  { icon: Receipt, label: 'Pay Slips', path: '/admin/payslips' },
  { icon: Umbrella, label: 'Leaves', path: '/admin/leaves' },
  { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
];

const EMPLOYEE_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/employee/dashboard' },
  { icon: Calendar, label: 'Attendance', path: '/employee/attendance' },
  { icon: FileText, label: 'Salary Slip', path: '/employee/salary' },
  { icon: User, label: 'My Profile', path: '/employee/profile' },
  { icon: ClipboardList, label: 'Leave', path: '/employee/leave' },
];

export default function FloatingDock() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);

  const items = user?.role === 'admin' ? ADMIN_ITEMS : EMPLOYEE_ITEMS;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dock-wrapper no-print">
      <motion.div
        className="dock"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300, delay: 0.15 }}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <div
              key={item.path}
              style={{ position: 'relative' }}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {hoveredItem === item.path && (
                <motion.div
                  className="dock-tooltip"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                >
                  {item.label}
                </motion.div>
              )}
              <motion.button
                className={`dock-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
                whileTap={{ scale: 0.92 }}
                title={item.label}
              >
                <Icon size={18} />
                <span className="dock-label">{item.label}</span>
              </motion.button>
            </div>
          );
        })}

        <div style={{ width: 1, height: 32, background: 'var(--border)', margin: '0 4px', flexShrink: 0 }} />

        <div
          style={{ position: 'relative' }}
          onMouseEnter={() => setHoveredItem('logout')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          {hoveredItem === 'logout' && (
            <motion.div
              className="dock-tooltip"
              style={{ color: 'var(--danger)' }}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Sign Out
            </motion.div>
          )}
          <motion.button
            className="dock-item"
            style={{ color: 'var(--danger)' }}
            onClick={handleLogout}
            whileTap={{ scale: 0.92 }}
            title="Sign Out"
          >
            <LogOut size={18} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
