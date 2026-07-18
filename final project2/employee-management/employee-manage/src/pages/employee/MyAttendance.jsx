import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Flame, Award } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import FloatingDock from '../../components/FloatingDock';
import Chatbot from '../../components/Chatbot';
import { getEmployeeAttendance, getAttendanceSummary } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const STATUS_COLORS = {
  Present:   { bg: 'var(--success-surface)', color: 'var(--success)', icon: '✓' },
  Absent:    { bg: 'var(--danger-surface)',   color: 'var(--danger)',  icon: '✗' },
  'Half-Day':{ bg: 'var(--warning-surface)',  color: 'var(--warning)', icon: '½' },
  Leave:     { bg: 'var(--info-surface)',     color: 'var(--info)',    icon: 'L' },
  Holiday:   { bg: 'rgba(168,85,247,.12)',    color: '#A855F7',        icon: '★' },
};

const DAYS        = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function MyAttendance() {
  const { user } = useAuth();
  const [records, setRecords]   = useState({});
  const [summary, setSummary]   = useState(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [streak, setStreak]     = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);

  const calculateStreak = (recs) => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 90; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dow = d.getDay();
      if (dow === 0 || dow === 6) continue; // skip weekends
      const dateStr = d.toISOString().split('T')[0];
      if (recs[dateStr] === 'Present' || recs[dateStr] === 'Half-Day') streak++;
      else break;
    }
    return streak;
  };

  const buildMonthlyData = (recs) => {
    const data = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today);
      d.setMonth(d.getMonth() - i);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en', { month: 'short' });
      const monthRecs = Object.entries(recs).filter(([date]) => date.startsWith(monthStr));
      const present  = monthRecs.filter(([, s]) => s === 'Present').length;
      const absent   = monthRecs.filter(([, s]) => s === 'Absent').length;
      const halfDay  = monthRecs.filter(([, s]) => s === 'Half-Day').length;
      const total    = monthRecs.length;
      const pct      = total > 0 ? Math.round((present / total) * 100) : 0;
      data.push({ label, present, absent, halfDay, total, pct });
    }
    return data;
  };

  useEffect(() => {
    if (user?.id) {
      Promise.all([getEmployeeAttendance(user.id), getAttendanceSummary(user.id)]).then(([recs, sum]) => {
        setRecords(recs);
        setSummary(sum);
        setStreak(calculateStreak(recs));
        setMonthlyData(buildMonthlyData(recs));
      });
    }
  }, [user]);

  const year     = viewDate.getFullYear();
  const month    = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today    = new Date().toISOString().split('T')[0];

  const shiftMonth = n => {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() + n);
    setViewDate(d);
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthStr     = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthPresent = Object.entries(records).filter(([d, s]) => d.startsWith(monthStr) && s === 'Present').length;
  const monthAbsent  = Object.entries(records).filter(([d, s]) => d.startsWith(monthStr) && s === 'Absent').length;
  const monthHalf    = Object.entries(records).filter(([d, s]) => d.startsWith(monthStr) && s === 'Half-Day').length;
  const monthLeave   = Object.entries(records).filter(([d, s]) => d.startsWith(monthStr) && s === 'Leave').length;
  const monthTotal   = monthPresent + monthAbsent + monthHalf + monthLeave;
  const monthPct     = monthTotal > 0 ? Math.round((monthPresent / monthTotal) * 100) : 0;

  return (
    <div className="app-layout">
      <div className="animated-bg"><div className="blob blob-1" /><div className="blob blob-2" /></div>
      <div className="dot-grid" />
      <Navbar />
      <Sidebar role="employee" />

      <div className="main-content">
        <div className="page-content">

          <div className="page-header">
            <div>
              <h1>My Attendance</h1>
              <p>Attendance calendar and monthly summary</p>
            </div>
            {/* Streak Badge */}
            {streak > 0 && (
              <motion.div
                initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
                  background: streak >= 10 ? 'linear-gradient(135deg,rgba(245,158,11,.2),rgba(239,68,68,.15))' : 'rgba(245,158,11,.12)',
                  border: '1.5px solid rgba(245,158,11,.35)', borderRadius: 'var(--radius-full)',
                }}
              >
                <Flame size={18} color="#F59E0B" />
                <div>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#F59E0B' }}>{streak} Day Streak!</div>
                  <div style={{ fontSize: '.65rem', color: 'var(--text-muted)' }}>Keep it going 🔥</div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Overall Summary */}
          {summary && (
            <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(5,1fr)', marginBottom: 24 }}>
              {[
                { label: 'Total Days',  value: summary.total,   color: 'var(--primary)', bg: 'rgba(79,70,229,.12)', icon: '📅' },
                { label: 'Present',     value: summary.present, color: 'var(--success)', bg: 'var(--success-surface)', icon: '✅' },
                { label: 'Absent',      value: summary.absent,  color: 'var(--danger)',  bg: 'var(--danger-surface)',  icon: '❌' },
                { label: 'Half-Day',    value: summary.halfDay, color: 'var(--warning)', bg: 'var(--warning-surface)', icon: '⚡' },
                { label: 'On Leave',    value: summary.onLeave, color: 'var(--info)',    bg: 'var(--info-surface)',    icon: '🏖️' },
              ].map(s => (
                <div className="stat-card" key={s.label} style={{ '--stat-accent': s.color }}>
                  <div className="stat-icon" style={{ background: s.bg, color: s.color }}><span style={{ fontSize: '1.3rem' }}>{s.icon}</span></div>
                  <div className="stat-info">
                    <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 6-Month Bar Chart */}
          <motion.div className="card" style={{ marginBottom: 24 }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="card-header"><div className="card-title">📊 6-Month Attendance History</div></div>
            <div className="card-body" style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="present"  name="Present"  fill="#10B981" radius={[4,4,0,0]} />
                  <Bar dataKey="absent"   name="Absent"   fill="#EF4444" radius={[4,4,0,0]} />
                  <Bar dataKey="halfDay"  name="Half-Day" fill="#F59E0B" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Calendar */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="card-title">{MONTH_NAMES[month]} {year}</div>
                <div className="card-subtitle">
                  {monthPresent} present · {monthAbsent} absent · {monthHalf} half-day · {monthLeave} on leave
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ textAlign: 'center', padding: '6px 14px', background: monthPct >= 80 ? 'rgba(16,185,129,.12)' : monthPct >= 60 ? 'rgba(245,158,11,.12)' : 'rgba(239,68,68,.12)', borderRadius: 10 }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: monthPct >= 80 ? 'var(--success)' : monthPct >= 60 ? 'var(--warning)' : 'var(--danger)' }}>{monthPct}%</div>
                  <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>THIS MONTH</div>
                </div>
                <button id="prev-month-btn" className="btn btn-outline btn-icon" onClick={() => shiftMonth(-1)}><ChevronLeft size={16} /></button>
                <button id="next-month-btn" className="btn btn-outline btn-icon" onClick={() => shiftMonth(1)}><ChevronRight size={16} /></button>
              </div>
            </div>
            <div className="card-body">
              <div className="attendance-calendar" style={{ marginBottom: 8 }}>
                {DAYS.map(d => <div key={d} className="cal-header">{d}</div>)}
              </div>
              <div className="attendance-calendar">
                {cells.map((day, i) => {
                  if (!day) return <div key={`e-${i}`} className="cal-day empty" />;
                  const dateStr  = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                  const dow      = new Date(year, month, day).getDay();
                  const isWeekend= dow === 0 || dow === 6;
                  const isToday  = dateStr === today;
                  const status   = records[dateStr];
                  const sc       = STATUS_COLORS[status];
                  return (
                    <div
                      key={day}
                      className={`cal-day${isWeekend && !status ? ' weekend' : ''}${isToday ? ' today' : ''}`}
                      style={sc ? { background: sc.bg, color: sc.color, borderColor: sc.color } : {}}
                      title={status || (isWeekend ? 'Weekend' : 'No record')}
                    >
                      <span className="cal-day-num">{day}</span>
                      {sc && <span className="cal-day-status">{sc.icon}</span>}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                {Object.entries(STATUS_COLORS).map(([status, sc]) => (
                  <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.75rem' }}>
                    <div style={{ width: 14, height: 14, borderRadius: 4, background: sc.bg, border: `1.5px solid ${sc.color}` }} />
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{status}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.75rem' }}>
                  <div style={{ width: 14, height: 14, borderRadius: 4, background: 'transparent', border: '1.5px solid var(--border)' }} />
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Weekend</span>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Breakdown */}
          <div className="card">
            <div className="card-header"><div className="card-title">Monthly Breakdown</div></div>
            <div className="card-body">
              {[
                { label: 'Present',  value: monthPresent, total: monthTotal, color: 'var(--success)' },
                { label: 'Absent',   value: monthAbsent,  total: monthTotal, color: 'var(--danger)'  },
                { label: 'Half-Day', value: monthHalf,    total: monthTotal, color: 'var(--warning)' },
                { label: 'Leave',    value: monthLeave,   total: monthTotal, color: 'var(--info)'    },
              ].map(item => (
                <div key={item.label} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '.85rem', fontWeight: 600 }}>{item.label}</span>
                    <span style={{ fontSize: '.82rem', color: 'var(--text-secondary)' }}>
                      {item.value} day{item.value !== 1 ? 's' : ''} ({item.total > 0 ? Math.round((item.value / item.total) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      className="progress-fill"
                      style={{ background: item.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      <FloatingDock />
      <Chatbot />
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 14px', fontSize: '.8rem' }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map(p => <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</div>)}
    </div>
  );
};

