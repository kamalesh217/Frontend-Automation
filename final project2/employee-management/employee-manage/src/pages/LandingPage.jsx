import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Users, Zap, BarChart3, Lock, ArrowRight } from 'lucide-react';

const features = [
  { icon: '👥', label: 'Team Management' },
  { icon: '📊', label: 'Analytics' },
  { icon: '💰', label: 'Payroll' },
  { icon: '📅', label: 'Attendance' },
  { icon: '🏖️', label: 'Leave Tracking' },
  { icon: '📄', label: 'Pay Slips' },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 22, stiffness: 300 } },
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page" data-testid="landing-page">
      {/* Animated background */}
      <div className="animated-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>
      <div className="dot-grid" />

      {/* Header */}
      <motion.div
        className="landing-header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#4F46E5,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', boxShadow: '0 8px 24px rgba(79,70,229,.35)' }}>⚡</div>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-secondary)' }}>EmpowerHR</span>
        </div>

        <h1 className="landing-title">
          <span style={{ background: 'linear-gradient(135deg,#818CF8,#06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Modern HR</span>
          <br />Management Platform
        </h1>
        <p className="landing-subtitle">Everything your team needs — payroll, attendance, leaves, and more.</p>

        <motion.div
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 24 }}
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {features.map(f => (
            <motion.span
              key={f.label}
              variants={fadeUp}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                background: 'var(--glass)', backdropFilter: 'blur(12px)',
                border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-full)',
                fontSize: '.78rem', fontWeight: 600, color: 'var(--text-secondary)',
              }}
            >
              {f.icon} {f.label}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>

      {/* Portal Cards */}
      <motion.div
        className="portal-cards"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Admin Card */}
        <motion.div
          variants={fadeUp}
          className="portal-card glass-glow"
          data-testid="admin-portal-btn"
          onClick={() => navigate('/admin/login')}
        >
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(79,70,229,.4)' }}>
            <Shield size={28} color="#fff" />
          </div>
          <h2>Admin Portal</h2>
          <p>Manage employees, run payroll, track attendance, review leaves, and generate reports.</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
            {['Payroll', 'Reports', 'Analytics'].map(t => (
              <span key={t} style={{ padding: '4px 10px', background: 'rgba(79,70,229,.15)', color: '#818CF8', borderRadius: 'var(--radius-full)', fontSize: '.7rem', fontWeight: 700, border: '1px solid rgba(79,70,229,.25)' }}>{t}</span>
            ))}
          </div>
          <motion.button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Enter Admin Portal <ArrowRight size={16} />
          </motion.button>
        </motion.div>

        {/* Employee Card */}
        <motion.div
          variants={fadeUp}
          className="portal-card"
          data-testid="employee-portal-btn"
          style={{ '--hover-glow': 'rgba(6,182,212,.25)' }}
          onClick={() => navigate('/employee/login')}
        >
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg,#06B6D4,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(6,182,212,.4)' }}>
            <Users size={28} color="#fff" />
          </div>
          <h2>Employee Portal</h2>
          <p>View your profile, check salary slips, apply for leave, and track your attendance history.</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
            {['Profile', 'Payslip', 'Leaves'].map(t => (
              <span key={t} style={{ padding: '4px 10px', background: 'rgba(6,182,212,.15)', color: '#22D3EE', borderRadius: 'var(--radius-full)', fontSize: '.7rem', fontWeight: 700, border: '1px solid rgba(6,182,212,.25)' }}>{t}</span>
            ))}
          </div>
          <motion.button
            className="btn"
            style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg,#06B6D4,#3B82F6)', color: '#fff', boxShadow: '0 4px 14px rgba(6,182,212,.3)' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Enter Employee Portal <ArrowRight size={16} />
          </motion.button>
        </motion.div>
      </motion.div>

      <motion.div
        style={{ marginTop: 48, display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {[
          { icon: <Zap size={15} />, text: 'Real-time updates' },
          { icon: <Lock size={15} />, text: 'Secure & private' },
          { icon: <BarChart3 size={15} />, text: 'Advanced analytics' },
        ].map(item => (
          <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-muted)', fontSize: '.8rem', fontWeight: 500 }}>
            {item.icon} {item.text}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
