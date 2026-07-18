import { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, LogIn, LogOut } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import FloatingDock from '../../components/FloatingDock';
import Chatbot from '../../components/Chatbot';
import {
  getEmployee, getAttendanceSummary, getEmployeeAttendance,
  getEmployeeLeaves, generateSalarySlip, markAttendance,
  getLeaveBalance, LEAVE_BALANCE_TOTAL,
} from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 22, stiffness: 300 } } };

function AnimatedNumber({ value, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const target = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
    const start = Date.now(), dur = 900;
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1);
      setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);
  return <>{prefix}{display.toLocaleString()}{suffix}</>;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10,
      padding: '8px 12px', boxShadow: '0 8px 32px rgba(0,0,0,.25)', fontSize: '.78rem',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [emp, setEmp] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({});
  const [slip, setSlip] = useState(null);
  const [greeting] = useState(() => {
    const h = new Date().getHours();
    return h < 12 ? '☀️ Good morning' : h < 18 ? '🌤️ Good afternoon' : '🌙 Good evening';
  });
  const [checkInStatus, setCheckInStatus] = useState(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [monthlyTrend, setMonthlyTrend] = useState([]);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user?.id) {
      Promise.all([
        getEmployee(user.id),
        getAttendanceSummary(user.id),
        getEmployeeAttendance(user.id),
        getEmployeeLeaves(user.id),
        generateSalarySlip(user.id, new Date().getMonth() + 1, new Date().getFullYear()),
        getLeaveBalance(user.id),
      ]).then(([e, a, recs, l, s, lb]) => {
        setEmp(e);
        setAttendance(a);
        setLeaves(l);
        setSlip(s);
        setLeaveBalance(lb);
        setCheckInStatus(recs[today] || null);

        // Build 6-month monthly trend
        const trend = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const label = d.toLocaleDateString('en', { month: 'short' });
          const monthRecs = Object.entries(recs).filter(([date]) => date.startsWith(monthStr));
          const present = monthRecs.filter(([, s]) => s === 'Present').length;
          const absent = monthRecs.filter(([, s]) => s === 'Absent').length;
          trend.push({ label, present, absent, total: monthRecs.length });
        }
        setMonthlyTrend(trend);
      });
    }
  }, [user]);

  const handleCheckIn = async () => {
    if (!user?.id || checkingIn) return;
    setCheckingIn(true);
    const newStatus = checkInStatus === 'Present' ? null : 'Present';
    if (newStatus) {
      await markAttendance(user.id, today, 'Present');
      setCheckInStatus('Present');
    }
    setCheckingIn(false);
  };

  if (!emp) return (
    <div className="app-layout">
      <div className="animated-bg"><div className="blob blob-1" /><div className="blob blob-2" /></div>
      <div className="dot-grid" />
      <Navbar />
      <Sidebar role="employee" />
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 40, height: 40, border: '3px solid rgba(79,70,229,.15)', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
          <div style={{ color: 'var(--text-muted)', fontSize: '.88rem', fontWeight: 600 }}>Loading your dashboard...</div>
        </div>
      </div>
      <FloatingDock />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const attPct = attendance ? Math.round((attendance.present / Math.max(attendance.total, 1)) * 100) : 0;
  const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
  const approvedLeaves = leaves.filter(l => l.status === 'Approved').length;

  // Attendance pie chart data
  const attPieData = attendance ? [
    { name: 'Present',  value: attendance.present, fill: '#10B981' },
    { name: 'Absent',   value: attendance.absent,  fill: '#EF4444' },
    { name: 'Half-Day', value: attendance.halfDay,  fill: '#F59E0B' },
    { name: 'On Leave', value: attendance.onLeave,  fill: '#06B6D4' },
  ].filter(d => d.value > 0) : [];

  const statCards = [
    { icon: '💰', label: 'Net Salary',     value: slip?.netPay || 0,  prefix: '₹', color: '#10B981', bg: 'rgba(16,185,129,.12)' },
    { icon: '✅', label: 'Attendance Rate', value: attPct,              suffix: '%', color: '#6366F1', bg: 'rgba(99,102,241,.12)' },
    { icon: '🏖️', label: 'Approved Leaves', value: approvedLeaves,                  color: '#06B6D4', bg: 'rgba(6,182,212,.12)' },
    { icon: '⏳', label: 'Pending Leaves',  value: pendingLeaves,                    color: '#F59E0B', bg: 'rgba(245,158,11,.12)' },
  ];

  const isCheckedIn = checkInStatus === 'Present';

  return (
    <div className="app-layout">
      <div className="animated-bg"><div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" /></div>
      <div className="dot-grid" />
      <Navbar />
      <Sidebar role="employee" />

      <div className="main-content">
        <div className="page-content">

          {/* Banner with Check-In */}
          <motion.div
            className="dashboard-banner dashboard-banner-employee"
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{ position: 'relative' }}
          >
            <div className="banner-content">
              <div className="banner-greeting">{greeting} 👋</div>
              <div className="banner-title">{emp.name}</div>
              <div className="banner-sub">{emp.role} · {emp.department}</div>
              <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                <motion.button
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '10px 20px', borderRadius: 'var(--radius-full)', border: 'none',
                    background: isCheckedIn ? 'rgba(16,185,129,.9)' : 'rgba(255,255,255,.15)',
                    backdropFilter: 'blur(10px)',
                    color: 'white', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
                    fontSize: '.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                    boxShadow: isCheckedIn ? '0 0 20px rgba(16,185,129,.4)' : 'none',
                    border: '1px solid rgba(255,255,255,.2)',
                  }}
                >
                  {isCheckedIn ? <><LogOut size={15} /> Checked In ✓</> : <><LogIn size={15} /> Check In for Today</>}
                </motion.button>
                {isCheckedIn && (
                  <div style={{ padding: '10px 16px', background: 'rgba(255,255,255,.1)', borderRadius: 'var(--radius-full)', border: '1px solid rgba(255,255,255,.2)', fontSize: '.78rem', color: 'rgba(255,255,255,.9)', backdropFilter: 'blur(10px)' }}>
                    📅 {new Date().toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </div>
                )}
              </div>
            </div>
            <div className="banner-emoji">👤</div>
          </motion.div>

          {/* Stat Cards */}
          <motion.div className="stat-grid" variants={stagger} initial="hidden" animate="show">
            {statCards.map(s => (
              <motion.div key={s.label} variants={fadeUp} className="stat-card">
                <div className="stat-icon" style={{ background: s.bg, fontSize: '1.4rem' }}>{s.icon}</div>
                <div className="stat-info">
                  <div className="stat-value" style={{ color: s.color }}>
                    <AnimatedNumber value={s.value} prefix={s.prefix || ''} suffix={s.suffix || ''} />
                  </div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Attendance Pie + Monthly Trend */}
          <div className="grid-2" style={{ marginBottom: 22 }}>

            {/* Attendance Pie */}
            <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="card-header">
                <div className="card-title">📊 Attendance Breakdown</div>
              </div>
              <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ flex: '0 0 150px', height: 150 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={attPieData} cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={3} dataKey="value">
                        {attPieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v + ' days', n]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ flex: 1 }}>
                  {attPieData.map(d => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: d.fill, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: '.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{d.name}</span>
                      <span style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text)' }}>{d.value} days</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(99,102,241,.1)', borderRadius: 8, textAlign: 'center' }}>
                    <span style={{ fontSize: '.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                      Overall Rate: {attPct}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 6-Month Trend */}
            <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <div className="card-header"><div className="card-title">📈 6-Month Attendance Trend</div></div>
              <div className="card-body" style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="empPresent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="present" name="Present" stroke="#6366F1" strokeWidth={2.5} fill="url(#empPresent)" dot={{ fill: '#6366F1', r: 3 }} />
                    <Area type="monotone" dataKey="absent" name="Absent" stroke="#EF4444" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="4 2" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Leave Balance */}
          <motion.div className="card" style={{ marginBottom: 22 }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="card-header">
              <div className="card-title">🏖️ Leave Balance</div>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {Object.entries(LEAVE_BALANCE_TOTAL).map(([type, total]) => {
                  const used = leaveBalance[type]?.used || 0;
                  const remaining = leaveBalance[type]?.remaining ?? total;
                  const pct = Math.round((used / total) * 100);
                  const colors = {
                    'Casual Leave': '#6366F1', 'Sick Leave': '#EC4899',
                    'Earned Leave': '#10B981', 'Emergency Leave': '#EF4444',
                    'Work From Home': '#06B6D4', 'Maternity/Paternity Leave': '#F59E0B',
                  };
                  const c = colors[type] || '#6366F1';
                  return (
                    <div key={type} style={{ padding: '14px 16px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>{type}</div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: '1.2rem', color: c }}>{remaining}</div>
                          <div style={{ fontSize: '.62rem', color: 'var(--text-muted)' }}>of {total}</div>
                        </div>
                      </div>
                      <div style={{ height: 5, background: 'var(--border)', borderRadius: 999 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: c, borderRadius: 999, transition: 'width 1s ease' }} />
                      </div>
                      <div style={{ fontSize: '.68rem', color: 'var(--text-muted)', marginTop: 5 }}>{used} used · {pct}% utilized</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Recent Leaves + Salary */}
          <div className="grid-2">
            <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <div className="card-header"><div className="card-title">Recent Leave Requests</div></div>
              <div style={{ padding: '4px 0' }}>
                {leaves.slice(0, 5).length === 0 ? (
                  <div className="empty-state" style={{ padding: 32 }}><div className="empty-state-icon">🏖️</div><h3>No leave history</h3></div>
                ) : leaves.slice(0, 5).map(l => (
                  <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '1.1rem', width: 32, textAlign: 'center', flexShrink: 0 }}>
                      {l.status === 'Approved' ? '✅' : l.status === 'Pending' ? '⏳' : '❌'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '.82rem', fontWeight: 600 }}>{l.type}</div>
                      <div style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>{l.from} → {l.to}</div>
                    </div>
                    <span className={`chip ${l.status === 'Approved' ? 'chip-success' : l.status === 'Pending' ? 'chip-warning' : 'chip-danger'}`}>{l.status}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <div className="card-header"><div className="card-title">💰 Current Month Salary</div></div>
              <div className="card-body">
                <div style={{ background: 'linear-gradient(135deg,rgba(16,185,129,.1),rgba(6,182,212,.1))', border: '1px solid rgba(16,185,129,.2)', borderRadius: 'var(--radius-md)', padding: '20px', textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>Net Take-Home</div>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 900, fontSize: '2.2rem', color: '#10B981' }}>
                    ₹{slip?.netPay?.toLocaleString() || '--'}
                  </div>
                  <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}</div>
                </div>
                {slip && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'Gross Salary',  val: `₹${slip.earnings.gross.toLocaleString()}`,                      positive: true },
                      { label: 'Provident Fund', val: `-₹${slip.deductions.pf.toLocaleString()}`,                     positive: false },
                      { label: 'ESI + Tax',      val: `-₹${(slip.deductions.esi + slip.deductions.tax).toLocaleString()}`, positive: false },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: '.82rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                          {row.positive ? <TrendingUp size={13} color="var(--success)" /> : <TrendingDown size={13} color="var(--danger)" />}
                          {row.label}
                        </div>
                        <span style={{ fontWeight: 700, color: row.positive ? 'var(--success)' : 'var(--danger)' }}>{row.val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

        </div>
      </div>
      <FloatingDock />
      <Chatbot />
    </div>
  );
}
