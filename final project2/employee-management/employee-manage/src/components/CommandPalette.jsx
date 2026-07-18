import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const ADMIN_COMMANDS = [
  { icon: '🏠', label: 'Dashboard', path: '/admin/dashboard', shortcut: 'D' },
  { icon: '👥', label: 'Employees', path: '/admin/employees', shortcut: 'E' },
  { icon: '💰', label: 'Salary Management', path: '/admin/salary', shortcut: 'S' },
  { icon: '📅', label: 'Attendance', path: '/admin/attendance', shortcut: 'A' },
  { icon: '📄', label: 'Pay Slips', path: '/admin/payslips', shortcut: 'P' },
  { icon: '🏖️', label: 'Leave Requests', path: '/admin/leaves', shortcut: 'L' },
  { icon: '📊', label: 'Reports', path: '/admin/reports', shortcut: 'R' },
];

const EMPLOYEE_COMMANDS = [
  { icon: '🏠', label: 'My Dashboard', path: '/employee/dashboard', shortcut: 'D' },
  { icon: '📅', label: 'My Attendance', path: '/employee/attendance', shortcut: 'A' },
  { icon: '💰', label: 'Salary Slip', path: '/employee/salary', shortcut: 'S' },
  { icon: '👤', label: 'My Profile', path: '/employee/profile', shortcut: 'P' },
  { icon: '🏖️', label: 'Leave Request', path: '/employee/leave', shortcut: 'L' },
];

export default function CommandPalette({ open, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const commands = user?.role === 'admin' ? ADMIN_COMMANDS : EMPLOYEE_COMMANDS;
  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = useCallback((cmd) => {
    navigate(cmd.path);
    onClose();
    setQuery('');
  }, [navigate, onClose]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) { setQuery(''); setActiveIndex(0); return; }
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') setActiveIndex(i => Math.min(i + 1, filtered.length - 1));
      if (e.key === 'ArrowUp') setActiveIndex(i => Math.max(i - 1, 0));
      if (e.key === 'Enter' && filtered[activeIndex]) handleSelect(filtered[activeIndex]);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, filtered, activeIndex, handleSelect, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="cmd-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="cmd-palette"
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: 'spring', damping: 24, stiffness: 400 }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <Search size={18} color="var(--text-muted)" />
              <input
                className="cmd-input"
                style={{ flex: 1, border: 'none', padding: 0, background: 'transparent', fontSize: '1rem' }}
                autoFocus
                placeholder="Search pages and actions..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <span style={{ padding: '3px 8px', background: 'var(--surface)', borderRadius: 6, fontSize: '.7rem', fontWeight: 700, color: 'var(--text-muted)', border: '1px solid var(--border)' }}>ESC</span>
            </div>

            <div className="cmd-list">
              {filtered.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.85rem' }}>
                  No results for "{query}"
                </div>
              ) : filtered.map((cmd, i) => (
                <div
                  key={cmd.path}
                  className={`cmd-item ${i === activeIndex ? 'active' : ''}`}
                  onClick={() => handleSelect(cmd)}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  <div className="cmd-icon" style={{ fontSize: '1rem' }}>{cmd.icon}</div>
                  <span style={{ flex: 1 }}>{cmd.label}</span>
                  <span style={{ padding: '2px 6px', background: 'var(--surface)', borderRadius: 4, fontSize: '.65rem', fontWeight: 700, border: '1px solid var(--border)', opacity: i === activeIndex ? 0.8 : 0.4 }}>{cmd.shortcut}</span>
                </div>
              ))}
            </div>

            <div className="cmd-hint">
              <span><kbd className="cmd-key">↑↓</kbd> Navigate</span>
              <span><kbd className="cmd-key">Enter</kbd> Select</span>
              <span><kbd className="cmd-key">Esc</kbd> Close</span>
              <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Command size={11} /> K to open
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
