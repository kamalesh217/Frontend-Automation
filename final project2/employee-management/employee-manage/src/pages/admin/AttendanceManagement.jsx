import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, Save, Download, BarChart2, Users } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import FloatingDock from '../../components/FloatingDock';
import Chatbot from '../../components/Chatbot';
import {
  getEmployees, getAttendance, markAttendanceBulk, getAttendanceSummary,
  exportAttendanceCSV, getAttendanceTrend,
} from '../../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';

const STATUS_OPTIONS = ['Present', 'Absent', 'Half-Day', 'Leave', 'Holiday'];
const STATUS_CONFIG = {
  Present:   { color: 'var(--success)', bg: 'var(--success-surface)', border: 'rgba(34,197,94,.3)' },
  Absent:    { color: 'var(--danger)',  bg: 'var(--danger-surface)',  border: 'rgba(239,68,68,.3)' },
  'Half-Day':{ color: 'var(--warning)', bg: 'var(--warning-surface)', border: 'rgba(245,158,11,.3)' },
  Leave:     { color: 'var(--info)',    bg: 'var(--info-surface)',    border: 'rgba(6,182,212,.3)' },
  Holiday:   { color: '#A855F7',        bg: 'rgba(168,85,247,.12)',   border: 'rgba(168,85,247,.3)' },
};
const DEPT_COLORS = { Engineering: '#6366F1', Design: '#EC4899', Marketing: '#10B981', 'Human Resources': '#F59E0B' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 14px', fontSize: '.8rem' }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map(p => <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</div>)}
    </div>
  );
};

export default function AttendanceManagement() {
  const [employees, setEmployees] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [pendingChanges, setPendingChanges] = useState({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('mark');
  const [summaries, setSummaries] = useState({});
  const [trend, setTrend] = useState([]);
  const [filter, setFilter] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    getEmployees().then(emps => {
      setEmployees(emps);
      loadAttendance(date, emps);
    });
    getAttendanceTrend(14).then(setTrend);
  }, []);

  useEffect(() => {
    if (employees.length > 0) {
      Promise.all(employees.map(async e => ({ id: e.id, summary: await getAttendanceSummary(e.id) })))
        .then(results => {
          const m = {};
          results.forEach(r => { m[r.id] = r.summary; });
          setSummaries(m);
        });
    }
  }, [employees, saved]);

  const loadAttendance = async (d, emps) => {
    const { getAttendance } = await import('../../api/api');
    const all = await getAttendance();
    const day = {};
    (emps || employees).forEach(e => { day[e.id] = all[e.id]?.[d] || ''; });
    setAttendance(day);
    setPendingChanges({});
  };

  const changeDate = async d => { setDate(d); await loadAttendance(d, employees); setSaved(false); };
  const setStatus = (id, s) => {
    setAttendance(p => ({ ...p, [id]: s }));
    setPendingChanges(p => ({ ...p, [id]: s }));
    setSaved(false);
  };
  const markAll = s => {
    const u = {};
    employees.forEach(e => { u[e.id] = s; });
    setAttendance(u);
    setPendingChanges(u);
    setSaved(false);
  };

  const saveAll = async () => {
    setSaving(true);
    const records = employees.map(e => ({ employeeId: e.id, date, status: attendance[e.id] || 'Present' }));
    await markAttendanceBulk(records);
    setSaved(true);
    setSaving(false);
    setPendingChanges({});
    showToast('✅ Attendance saved successfully!');
    setTimeout(() => setSaved(false), 3000);
    // Refresh summaries
    const results = await Promise.all(employees.map(async e => ({ id: e.id, summary: await getAttendanceSummary(e.id) })));
    const m = {};
    results.forEach(r => { m[r.id] = r.summary; });
    setSummaries(m);
    getAttendanceTrend(14).then(setTrend);
  };

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const shiftDate = n => { const d = new Date(date); d.setDate(d.getDate() + n); changeDate(d.toISOString().split('T')[0]); };
  const handleExport = async () => { await exportAttendanceCSV(date); showToast('📥 CSV exported!'); };

  const presentCount = Object.values(attendance).filter(v => v === 'Present').length;
  const absentCount  = Object.values(attendance).filter(v => v === 'Absent').length;
  const halfCount    = Object.values(attendance).filter(v => v === 'Half-Day').length;
  const leaveCount   = Object.values(attendance).filter(v => v === 'Leave').length;
  const changesCount = Object.keys(pendingChanges).length;

  const filteredEmps = filter
    ? employees.filter(e => e.name.toLowerCase().includes(filter.toLowerCase()) || e.department.toLowerCase().includes(filter.toLowerCase()))
    : employees;

  // Summary pie chart
  const summaryPieData = [
    { name: 'Present',  value: presentCount, fill: '#10B981' },
    { name: 'Absent',   value: absentCount,  fill: '#EF4444' },
    { name: 'Half-Day', value: halfCount,     fill: '#F59E0B' },
    { name: 'Leave',    value: leaveCount,    fill: '#06B6D4' },
  ].filter(d => d.value > 0);

  return (
    <div className="app-layout">
      <div className="animated-bg"><div className="blob blob-1" /><div className="blob blob-2" /></div>
      <div className="dot-grid" />
      <Navbar />
      <Sidebar role="admin" />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 80, right: 24, zIndex: 9999,
              background: 'var(--card)', border: '1.5px solid var(--success)',
              borderRadius: 12, padding: '12px 20px', fontSize: '.85rem',
              fontWeight: 600, color: 'var(--success)', boxShadow: '0 8px 32px rgba(0,0,0,.2)',
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="main-content">
        <div className="page-content">
          <div className="page-header">
            <div><h1>Attendance Management</h1><p>Mark and monitor employee attendance records</p></div>
            <button className="btn btn-outline" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Download size={15} /> Export CSV
            </button>
          </div>

          <div className="tabs">
            <button className={`tab ${tab === 'mark' ? 'active' : ''}`} onClick={() => setTab('mark')}><Users size={14} /> Mark Attendance</button>
            <button className={`tab ${tab === 'summary' ? 'active' : ''}`} onClick={() => setTab('summary')}><BarChart2 size={14} /> Summary & Analytics</button>
          </div>

          {tab === 'mark' && (
            <>
              {/* Date + Controls */}
              <motion.div className="card" style={{ marginBottom: 22 }} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <motion.button className="btn btn-outline btn-icon" whileTap={{ scale: 0.92 }} onClick={() => shiftDate(-1)}><ChevronLeft size={17} /></motion.button>
                    <input id="attendance-date" type="date" className="form-control" style={{ width: 'auto' }} value={date}
                      max={new Date().toISOString().split('T')[0]} onChange={e => changeDate(e.target.value)} />
                    <motion.button className="btn btn-outline btn-icon" whileTap={{ scale: 0.92 }} onClick={() => shiftDate(1)}><ChevronRight size={17} /></motion.button>
                  </div>

                  {/* Live stats */}
                  <div style={{ display: 'flex', gap: 20 }}>
                    {[
                      { label: 'Present',  val: presentCount, color: 'var(--success)' },
                      { label: 'Absent',   val: absentCount,  color: 'var(--danger)'  },
                      { label: 'Half-Day', val: halfCount,     color: 'var(--warning)' },
                      { label: 'Total',    val: employees.length, color: 'var(--primary)' },
                    ].map(s => (
                      <div key={s.label} style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: '1.4rem', color: s.color }}>{s.val}</div>
                        <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn btn-success btn-sm" onClick={() => markAll('Present')}>✓ All Present</button>
                    <button className="btn btn-danger btn-sm" onClick={() => markAll('Absent')}>✗ All Absent</button>
                    <button className="btn btn-outline btn-sm" onClick={() => markAll('Holiday')}>🎉 Holiday</button>
                    <motion.button
                      id="save-attendance-btn"
                      className={`btn btn-sm ${saved ? 'btn-success' : 'btn-primary'}`}
                      onClick={saveAll}
                      whileTap={{ scale: 0.95 }}
                      disabled={saving}
                    >
                      {saved ? <><Check size={14} /> Saved!</> : saving ? <>Saving…</> : <><Save size={14} /> Save{changesCount > 0 ? ` (${changesCount})` : ' All'}</>}
                    </motion.button>
                  </div>
                </div>

                {/* Search */}
                <div style={{ padding: '0 20px 16px' }}>
                  <input
                    type="text" className="form-control" placeholder="🔍 Filter by name or department…"
                    value={filter} onChange={e => setFilter(e.target.value)}
                    style={{ maxWidth: 340 }}
                  />
                </div>
              </motion.div>

              {/* Attendance Cards */}
              <div className="emp-grid">
                {filteredEmps.map(emp => {
                  const status = attendance[emp.id] || '';
                  const sc = STATUS_CONFIG[status] || { color: 'var(--text-muted)', bg: 'var(--surface)', border: 'var(--border)' };
                  const color = DEPT_COLORS[emp.department] || '#6366F1';
                  const isPending = pendingChanges[emp.id] !== undefined;
                  return (
                    <motion.div key={emp.id} className="card"
                      style={{ padding: 20, borderLeft: `3px solid ${sc.color}`, position: 'relative' }}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    >
                      {isPending && (
                        <div style={{ position: 'absolute', top: 10, right: 10, width: 7, height: 7, borderRadius: '50%', background: '#F59E0B' }} title="Unsaved change" />
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                        <div className="avatar avatar-md" style={{ background: `linear-gradient(135deg, ${color}, ${color}80)` }}>
                          {emp.avatar || emp.name?.slice(0, 2)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '.88rem' }}>{emp.name}</div>
                          <span className="chip" style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>{emp.department}</span>
                        </div>
                        <span className="chip" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                          {status || 'Not Marked'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {STATUS_OPTIONS.map(s => (
                          <button
                            key={s}
                            id={`mark-${emp.id}-${s.toLowerCase().replace(' ', '-')}`}
                            onClick={() => setStatus(emp.id, s)}
                            style={{
                              padding: '4px 10px', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
                              fontFamily: 'inherit', fontSize: '.72rem', fontWeight: 600, transition: 'var(--transition)',
                              background: status === s ? STATUS_CONFIG[s]?.bg : 'var(--surface)',
                              color: status === s ? STATUS_CONFIG[s]?.color : 'var(--text-secondary)',
                              outline: status === s ? `2px solid ${STATUS_CONFIG[s]?.color}` : 'none',
                            }}
                          >{s}</button>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}

          {tab === 'summary' && (
            <>
              {/* Charts Row */}
              <div className="grid-2" style={{ marginBottom: 22 }}>
                {/* Today's Pie */}
                <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="card-header"><div className="card-title">📅 {date} — Distribution</div></div>
                  <div className="card-body" style={{ height: 220, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: '0 0 160px', height: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={summaryPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                            {summaryPieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                          </Pie>
                          <Tooltip formatter={(v, n) => [v, n]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ flex: 1 }}>
                      {summaryPieData.map(d => (
                        <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 3, background: d.fill }} />
                          <span style={{ flex: 1, fontSize: '.8rem' }}>{d.name}</span>
                          <span style={{ fontWeight: 700, color: d.fill }}>{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* 14-Day Trend */}
                <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <div className="card-header"><div className="card-title">📈 14-Day Attendance Trend</div></div>
                  <div className="card-body" style={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trend} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} interval={2} />
                        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="present" name="Present" fill="#10B981" radius={[4,4,0,0]} />
                        <Bar dataKey="absent"  name="Absent"  fill="#EF4444" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>

              {/* Employee Summary Cards */}
              <div className="emp-grid">
                {employees.map(emp => {
                  const s = summaries[emp.id] || { total: 0, present: 0, absent: 0, halfDay: 0, onLeave: 0 };
                  const pct = s.total > 0 ? Math.round((s.present / s.total) * 100) : 0;
                  const color = DEPT_COLORS[emp.department] || '#6366F1';
                  const grade = pct >= 90 ? 'A' : pct >= 70 ? 'B' : 'C';
                  const gradeColor = pct >= 90 ? 'var(--success)' : pct >= 70 ? 'var(--warning)' : 'var(--danger)';
                  return (
                    <div key={emp.id} className="card" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                        <div className="avatar avatar-md" style={{ background: `linear-gradient(135deg, ${color}, ${color}80)` }}>
                          {emp.avatar || emp.name?.slice(0, 2)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '.88rem' }}>{emp.name}</div>
                          <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{emp.role}</div>
                        </div>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${gradeColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', color: gradeColor, border: `2px solid ${gradeColor}40` }}>{grade}</div>
                      </div>
                      <div className="progress-bar" style={{ marginBottom: 8 }}>
                        <motion.div className="progress-fill" style={{ background: gradeColor }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: '.88rem', color: gradeColor }}>{pct}% Attendance</span>
                        <span style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{s.present}/{s.total} days</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {[{ l: 'Present', v: s.present, c: 'var(--success)' }, { l: 'Absent', v: s.absent, c: 'var(--danger)' }, { l: 'Half-Day', v: s.halfDay, c: 'var(--warning)' }, { l: 'Leave', v: s.onLeave, c: 'var(--info)' }].map(x => (
                          <div key={x.l} style={{ textAlign: 'center', padding: '4px 8px', background: 'var(--surface)', borderRadius: 'var(--radius-xs)', flex: 1 }}>
                            <div style={{ fontWeight: 800, fontSize: '.85rem', color: x.c }}>{x.v}</div>
                            <div style={{ fontSize: '.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>{x.l}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
      <FloatingDock />
      <Chatbot />
    </div>
  );
}
