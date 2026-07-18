import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Lock, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { authenticate } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function AdminLogin() {
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
    const result = await authenticate('admin', form);
    setLoading(false);
    if (result.success) {
      login(result.user);
      navigate('/admin/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="login-page" data-testid="admin-login-page">
      <div className="animated-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>
      <div className="dot-grid" />

      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
      >
        <div className="login-header">
          <motion.div
            className="login-icon login-icon-admin"
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          >
            <Shield size={28} color="#fff" />
          </motion.div>
          <h1>Admin Portal</h1>
          <p>Sign in with your administrator credentials</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <motion.div
              className="login-error"
              data-testid="login-error"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <AlertCircle size={15} /> {error}
            </motion.div>
          )}

          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="input-group">
              <User size={15} className="input-icon" />
              <input
                id="admin-username"
                data-testid="username-input"
                className="form-control input-with-icon"
                placeholder="Enter admin username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-group">
              <Lock size={15} className="input-icon" />
              <input
                id="admin-password"
                data-testid="password-input"
                type={showPass ? 'text' : 'password'}
                className="form-control input-with-icon"
                style={{ paddingRight: 42 }}
                placeholder="Enter admin password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <motion.button
            id="admin-login-btn"
            data-testid="login-button"
            type="submit"
            className="login-btn login-btn-admin"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? (
              <>
                <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .6s linear infinite', display: 'inline-block' }} />
                Signing in...
              </>
            ) : (
              <><Shield size={17} /> Sign In as Admin</>
            )}
          </motion.button>
        </form>

        <div className="accounts-hint" style={{ marginTop: 18 }}>
          <h4>🔑 Default Credentials</h4>
          <div className="account-row"><span>Username:</span><span>admin</span></div>
          <div className="account-row"><span>Password:</span><span>admin123</span></div>
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
