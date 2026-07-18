import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, User, Lock, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { authenticate } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const DEMO_ACCOUNTS = [
  { id: 'emp001', name: 'John Smith', role: 'Software Engineer', dept: 'Engineering', color: '#6366F1' },
  { id: 'emp002', name: 'Sarah Johnson', role: 'UI/UX Designer', dept: 'Design', color: '#EC4899' },
  { id: 'emp003', name: 'Mike Davis', role: 'Marketing Manager', dept: 'Marketing', color: '#10B981' },
  { id: 'emp004', name: 'Emily Brown', role: 'HR Manager', dept: 'Human Resources', color: '#F59E0B' },
];

export default function EmployeeLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = await authenticate('employee', form);
    setLoading(false);
    if (result.success) {
      login(result.user);
      navigate('/employee/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="login-page" data-testid="employee-login-page">
      <div className="animated-bg">
        <div className="blob blob-1" style={{ background: '#06B6D4' }} />
        <div className="blob blob-2" style={{ background: '#3B82F6' }} />
        <div className="blob blob-3" style={{ background: '#4F46E5' }} />
      </div>
      <div className="dot-grid" />

      <motion.div
        className="login-card"
        style={{ maxWidth: 480 }}
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
      >
        <div className="login-header">
          <motion.div
            className="login-icon login-icon-employee"
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          >
            <Users size={28} color="#fff" />
          </motion.div>
          <h1>Employee Portal</h1>
          <p>Sign in with your employee ID and password</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <motion.div className="login-error" data-testid="login-error" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <AlertCircle size={15} /> {error}
            </motion.div>
          )}

          <div className="form-group">
            <label className="form-label">Employee ID</label>
            <div className="input-group">
              <User size={15} className="input-icon" />
              <input id="emp-username" data-testid="username-input" className="form-control input-with-icon" placeholder="e.g. emp001" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-group">
              <Lock size={15} className="input-icon" />
              <input id="emp-password" data-testid="password-input" type={showPass ? 'text' : 'password'} className="form-control input-with-icon" style={{ paddingRight: 42 }} placeholder="Enter your password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <motion.button id="emp-login-btn" data-testid="login-button" type="submit" className="login-btn login-btn-employee" disabled={loading} whileTap={{ scale: 0.97 }}>
            {loading ? (
              <><span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .6s linear infinite', display: 'inline-block' }} />Signing in...</>
            ) : (
              <><Users size={17} /> Sign In as Employee</>
            )}
          </motion.button>
        </form>

        <div className="accounts-hint" style={{ marginTop: 18 }}>
          <h4>👥 Quick Login — Click to fill</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 8 }}>
            {DEMO_ACCOUNTS.map(acc => (
              <motion.div
                key={acc.id}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--surface)', borderRadius: 'var(--radius-xs)', cursor: 'pointer', border: '1px solid var(--border)' }}
                whileHover={{ scale: 1.02, borderColor: acc.color }}
                onClick={() => setForm({ username: acc.id, password: 'pass123' })}
              >
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: acc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '.7rem', fontWeight: 800, flexShrink: 0 }}>
                  {acc.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--text)' }}>{acc.name}</div>
                  <div style={{ fontSize: '.67rem', color: 'var(--text-muted)' }}>{acc.role}</div>
                </div>
                <div style={{ fontSize: '.67rem', fontWeight: 700, color: acc.color }}>{acc.id}</div>
              </motion.div>
            ))}
            <p style={{ fontSize: '.67rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 3 }}>Password: pass123 for all accounts</p>
          </div>
        </div>

        <div className="login-back">
          <a href="#" onClick={e => { e.preventDefault(); navigate('/'); }}>
            <ArrowLeft size={13} /> Back to Portal Selection
          </a>
        </div>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
