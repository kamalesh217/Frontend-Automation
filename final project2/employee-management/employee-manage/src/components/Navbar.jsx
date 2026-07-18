import { useState, useEffect } from 'react';
import { Search, Bell, Sun, Moon, Command } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

export default function Navbar({ onOpenCmd }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [time, setTime] = useState(new Date());
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2)
    : user?.role === 'admin' ? 'AD' : '?';

  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <motion.nav
      className="navbar no-print"
      data-testid="navbar"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 22, stiffness: 300 }}
    >
      <div className="navbar-left">
        <div className="navbar-brand">
          <div className="navbar-logo">
            <span style={{ fontSize: '.9rem', fontWeight: 900 }}>E</span>
          </div>
          <div>
            <div className="navbar-title">EmpowerHR</div>
            <div className="navbar-subtitle">{user?.role === 'admin' ? 'Admin Portal' : 'Employee Portal'}</div>
          </div>
        </div>
      </div>

      <div className="search-bar" style={{ display: 'flex', alignItems: 'center' }}>
        <Search size={14} className="search-icon" />
        <input
          placeholder="Search... (Ctrl+K)"
          value={searchVal}
          onFocus={() => { if (onOpenCmd) { setSearchVal(''); onOpenCmd(); } }}
          onChange={e => setSearchVal(e.target.value)}
          readOnly
          style={{ cursor: 'pointer' }}
        />
      </div>

      <div className="navbar-right">
        <div className="navbar-clock">
          <span style={{ fontWeight: 700 }}>{timeStr}</span>
          <span style={{ opacity: 0.6, marginLeft: 6 }}>{dateStr}</span>
        </div>

        {onOpenCmd && (
          <motion.button
            className="nav-icon-btn"
            onClick={onOpenCmd}
            whileTap={{ scale: 0.92 }}
            title="Command Palette (Ctrl+K)"
          >
            <Command size={15} />
          </motion.button>
        )}

        <motion.button
          className="nav-icon-btn"
          onClick={toggleTheme}
          whileTap={{ scale: 0.92, rotate: 20 }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </motion.button>

        <motion.button
          className="nav-icon-btn"
          whileTap={{ scale: 0.92 }}
          title="Notifications"
        >
          <Bell size={15} />
          <span className="nav-badge">3</span>
        </motion.button>

        <motion.div
          className="navbar-avatar"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          title={user?.name || 'User'}
        >
          {initials}
        </motion.div>
      </div>
    </motion.nav>
  );
}
