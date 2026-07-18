import { useState, useEffect, useRef } from 'react';
import { TrendingUp, Users, DollarSign, Clock, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import FloatingDock from '../../components/FloatingDock';
import Chatbot from '../../components/Chatbot';
import { getAdminStats, getEmployees, getLeaves, getAttendanceTrend } from '../../api/api';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const DEPT_COLORS = {
  Engineering: '#6366F1', Design: '#EC4899',
  Marketing: '#10B981', 'Human Resources': '#F59E0B',
  Operations: '#06B6D4', Finance: '#8B5CF6',
};
const PIE_COLORS = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#06B6D4', '#8B5CF6'];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 22, stiffness: 300 } } };

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const target = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
    const start = Date.now(), dur = 1000;
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1);
      setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);
  return <>{display.toLocaleString()}</>;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10,
      padding: '10px 14px', boxShadow: '0 8px 32px rgba(0,0,0,.25)', fontSize: '.8rem',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, fontWeight: 600, marginBottom: 2 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10,
      padding: '8px 14px', boxShadow: '0 8px 32px rgba(0,0,0,.25)', fontSize: '.8rem',
    }}>
      <div style={{ color: payload[0].payload.fill || payload[0].color, fontWeight: 700 }}>
        {payload[0].name}: {payload[0].value} ({payload[0].payload.pct}%)
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [trend, setTrend] = useState([]);
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    Promise.all([getAdminStats(), getEmployees(), getLeaves(), getAttendanceTrend(21)]).then(([s, e, l, t]) => {
      setStats(s);
      setEmployees(e);
      setLeaves(l);
      setTrend(t);
    });
  }, []);

  const totalPayroll = employees.reduce((s, e) => s + (e.salary || 0), 0);
  const deptMap = employees.reduce((acc, e) => {
    acc[e.department] = (acc[e.department] || 0) + 1;
    return acc;
  }, {});

  const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;

  const recentActivities = leaves.slice(0, 6).map(l => ({
    icon: l.status === 'Approved' ? '✅' : l.status === 'Rejected' ? '❌' : '⏳',
    text: `${l.employeeName} — ${l.type}`,
    time: l.appliedOn,
    status: l.status,
  }));

  const statCards = stats ? [
    { icon: Users,       label: 'Total Employees', value: stats.totalEmployees, change: `${stats.activeEmployees} active`,  up: true,  accent: '#6366F1', bg: 'rgba(99,102,241,.12)' },
    { icon: DollarSign,  label: 'Monthly Payroll',  value: `₹${(totalPayroll/1000).toFixed(0)}K`,  change: 'Stable',              up: true,  accent: '#10B981', bg: 'rgba(16,185,129,.12)' },
    { icon: Clock,       label: 'Present Today',    value: stats.presentToday,  change: `${stats.totalEmployees - stats.presentToday} absent`, up: stats.presentToday > stats.totalEmployees / 2, accent: '#06B6D4', bg: 'rgba(6,182,212,.12)' },
    { icon: Activity,    label: 'Pending Leaves',   value: pendingLeaves,        change: 'Requires review',  up: false, accent: '#F59E0B', bg: 'rgba(245,158,11,.12)' },
  ] : [];

  // Pie chart data
  const deptPieData = Object.entries(deptMap).map(([name, value], i) => ({
    name, value, pct: employees.length > 0 ? Math.round((value / employees.length) * 100) : 0,
    fill: Object.values(DEPT_COLORS)[i] || PIE_COLORS[i % PIE_COLORS.length],
  }));

  const leavePieData = stats ? [
    { name: 'Approved', value: stats.leaveStats?.approved || 0, pct: 0, fill: '#10B981' },
    { name: 'Pending',  value: stats.leaveStats?.pending  || 0, pct: 0, fill: '#F59E0B' },
    { name: 'Rejected', value: stats.leaveStats?.rejected || 0, pct: 0, fill: '#EF4444' },
  ].map(d => ({ ...d, pct: stats.leaveStats?.total > 0 ? Math.round((d.value / stats.leaveStats.total) * 100) : 0 })) : [];

  // Bar chart — salary by dept
  const salaryByDept = Object.entries(
    employees.reduce((acc, e) => {
      if (!acc[e.department]) acc[e.department] = 0;
      acc[e.department] += e.salary || 0;
      return acc;
    }, {})
  ).map(([dept, total]) => ({ dept: dept.split(' ')[0], total: Math.round(total / 1000) }));

  return (
    <div className="app-layout" data-testid="dashboard-page">
      <div className="animated-bg"><div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" /></div>
      <div className="dot-grid" />
      <Navbar onOpenCmd={() => setCmdOpen(true)} />
      <Sidebar role="admin" />

      <div className="main-content">
        <div className="page-content">

          {/* Hero Banner */}
          <motion.div
            className="dashboard-banner dashboard-banner-admin"
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          >
            <div className="banner-content">
              <div className="banner-greeting">Welcome back 👋</div>
              <div className="banner-title">Admin Dashboard</div>
              <div className="banner-sub">Here's what's happening with your team today</div>
            </div>
            <div className="banner-emoji" style={{ fontSize: '4rem' }}>🏢</div>
          </motion.div>

          {/* Stat Cards */}
          <motion.div className="stat-grid" data-testid="stat-grid" variants={stagger} initial="hidden" animate="show">
            {statCards.map(s => {
              const Icon = s.icon;
              return (
                <motion.div key={s.label} variants={fadeUp} className="stat-card" data-testid="stat-card" style={{ '--stat-accent': s.accent }}>
                  <div className="stat-icon" style={{ background: s.bg, color: s.accent }}><Icon size={22} /></div>
                  <div className="stat-info">
                    <div className="stat-value"><AnimatedNumber value={s.value} /></div>
                    <div className="stat-label">{s.label}</div>
                    <div className={`stat-change ${s.up ? 'up' : 'down'}`}>
                      {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {s.change}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Attendance Trend Chart */}
          <motion.div className="card" style={{ marginBottom: 22 }} variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }}>
            <div className="card-header">
              <div>
                <div className="card-title">📈 Attendance Trend — Last 21 Working Days</div>
                <div className="card-subtitle">Daily present vs absent breakdown</div>
              </div>
            </div>
            <div className="card-body" style={{ height: 260 }}>
              {trend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradPresent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="gradAbsent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} interval={2} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: 8 }} />
                    <Area type="monotone" dataKey="present" name="Present" stroke="#10B981" strokeWidth={2.5} fill="url(#gradPresent)" dot={false} />
                    <Area type="monotone" dataKey="absent"  name="Absent"  stroke="#EF4444" strokeWidth={2}   fill="url(#gradAbsent)"  dot={false} />
                    <Area type="monotone" dataKey="halfDay" name="Half-Day" stroke="#F59E0B" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="4 2" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state" style={{ height: '100%' }}><div className="empty-state-icon">📊</div><h3>Loading chart…</h3></div>
              )}
            </div>
          </motion.div>

          {/* Pie Charts Row */}
          <div className="grid-2" style={{ marginBottom: 22 }}>
            {/* Department Pie */}
            <motion.div className="card" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.3 }}>
              <div className="card-header">
                <div className="card-title">🏢 Department Distribution</div>
              </div>
              <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ flex: '0 0 160px', height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={deptPieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                        {deptPieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  {deptPieData.map((d) => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: d.fill, flexShrink: 0 }} />
                      <div style={{ flex: 1, fontSize: '.78rem', fontWeight: 600, color: 'var(--text)' }}>{d.name}</div>
                      <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>{d.value} · {d.pct}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Leave Status Pie */}
            <motion.div className="card" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.35 }}>
              <div className="card-header">
                <div className="card-title">🏖️ Leave Status Overview</div>
              </div>
              <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ flex: '0 0 160px', height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={leavePieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                        {leavePieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  {leavePieData.map((d) => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: d.fill, flexShrink: 0 }} />
                      <div style={{ flex: 1, fontSize: '.78rem', fontWeight: 600, color: 'var(--text)' }}>{d.name}</div>
                      <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>{d.value} · {d.pct}%</div>
                    </div>
                  ))}
                  <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--surface)', borderRadius: 10, fontSize: '.78rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total requests: </span>
                    <strong style={{ color: 'var(--text)' }}>{stats?.leaveStats?.total || 0}</strong>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Payroll Bar + Today's Attendance */}
          <div className="grid-2" style={{ marginBottom: 22 }}>
            {/* Payroll by Department */}
            <motion.div className="card" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.4 }}>
              <div className="card-header">
                <div className="card-title">💰 Payroll by Department (₹K/month)</div>
              </div>
              <div className="card-body" style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salaryByDept} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="dept" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="total" name="Total ₹K" radius={[6, 6, 0, 0]}>
                      {salaryByDept.map((entry, i) => (
                        <Cell key={i} fill={Object.values(DEPT_COLORS)[i] || PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Today's Attendance Donut */}
            <motion.div className="card" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.45 }}>
              <div className="card-header"><div className="card-title">📅 Today's Attendance</div></div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                {stats && (
                  <>
                    <div style={{ position: 'relative', width: 140, height: 140 }}>
                      <svg width="140" height="140" viewBox="0 0 140 140">
                        <circle cx="70" cy="70" r="54" fill="none" stroke="var(--surface)" strokeWidth="16" />
                        <motion.circle
                          cx="70" cy="70" r="54"
                          fill="none" stroke="url(#grad1)" strokeWidth="16"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 54}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 54 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 54 * (1 - stats.presentToday / Math.max(stats.totalEmployees, 1)) }}
                          transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
                          transform="rotate(-90 70 70)"
                        />
                        <defs>
                          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#4F46E5" />
                            <stop offset="100%" stopColor="#06B6D4" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: '1.6rem', color: 'var(--text)' }}>
                          {stats.totalEmployees ? Math.round((stats.presentToday / stats.totalEmployees) * 100) : 0}%
                        </div>
                        <div style={{ fontSize: '.62rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Present</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 24 }}>
                      {[
                        { label: 'Present', val: stats.presentToday, color: '#10B981' },
                        { label: 'Absent', val: stats.totalEmployees - stats.presentToday, color: '#EF4444' },
                      ].map(x => (
                        <div key={x.label} style={{ textAlign: 'center' }}>
                          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: '1.3rem', color: x.color }}>{x.val}</div>
                          <div style={{ fontSize: '.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>{x.label}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>

          {/* Bottom: Recent Activity + Quick Actions */}
          <div className="grid-2">
            <motion.div className="card" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.5 }}>
              <div className="card-header"><div className="card-title">Recent Activity</div></div>
              <div style={{ padding: '4px 0' }}>
                {recentActivities.length === 0 ? (
                  <div className="empty-state" style={{ padding: 32 }}><div className="empty-state-icon">📋</div><h3>No recent activity</h3></div>
                ) : recentActivities.map((act, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                      {act.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--text)' }}>{act.text}</div>
                      <div style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>{act.time}</div>
                    </div>
                    <span className={`chip ${act.status === 'Approved' ? 'chip-success' : act.status === 'Pending' ? 'chip-warning' : 'chip-danger'}`}>
                      {act.status}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div className="card" variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.55 }}>
              <div className="card-header"><div className="card-title">Quick Actions</div></div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Add Employee',    emoji: '👤', path: '/admin/employees',  color: '#6366F1' },
                    { label: 'Mark Attendance', emoji: '📅', path: '/admin/attendance', color: '#10B981' },
                    { label: 'View Reports',    emoji: '📊', path: '/admin/reports',    color: '#06B6D4' },
                    { label: 'Review Leaves',   emoji: '🏖️', path: '/admin/leaves',     color: '#F59E0B' },
                    { label: 'Generate Payslip',emoji: '💰', path: '/admin/payslips',   color: '#EC4899' },
                    { label: 'Manage Salary',   emoji: '💼', path: '/admin/salary',     color: '#8B5CF6' },
                  ].map(a => (
                    <motion.button
                      key={a.label}
                      onClick={() => window.location.href = a.path}
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      style={{
                        padding: '14px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                        background: `${a.color}12`, cursor: 'pointer', textAlign: 'left',
                        display: 'flex', flexDirection: 'column', gap: 6,
                      }}
                    >
                      <span style={{ fontSize: '1.3rem' }}>{a.emoji}</span>
                      <div style={{ fontSize: '.76rem', fontWeight: 700, color: a.color }}>{a.label}</div>
                    </motion.button>
                  ))}
                </div>
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
