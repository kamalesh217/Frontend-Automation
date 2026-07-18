import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import FloatingDock from '../../components/FloatingDock';
import Chatbot from '../../components/Chatbot';
import { getEmployees, getAttendanceSummary, getEmployeeSalaryHistory, getAdminStats } from '../../api/api';
import { motion } from 'framer-motion';

const DEPT_COLORS = { Engineering: '#6366F1', Design: '#EC4899', Marketing: '#10B981', 'Human Resources': '#F59E0B' };
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 22, stiffness: 300 } } };

export default function Reports() {
  const [employees, setEmployees] = useState([]);
  const [tab, setTab] = useState('payroll');
  const [stats, setStats] = useState(null);
  const [payrollData, setPayrollData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    Promise.all([getEmployees(), getAdminStats()]).then(async ([emps, st]) => {
      setEmployees(emps);
      setStats(st);
      const payData = await Promise.all(emps.map(async emp => {
        const history = await getEmployeeSalaryHistory(emp.id);
        return { ...emp, increments: history.filter(h => h.type === 'increment').length };
      }));
      setPayrollData(payData);
      const attData = await Promise.all(emps.map(async emp => {
        const s = await getAttendanceSummary(emp.id);
        return { ...emp, ...s, pct: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0 };
      }));
      setAttendanceData(attData);
    });
  }, []);

  const totalPayroll = employees.reduce((s, e) => s + e.salary, 0);
  const currentMonth = new Date().getMonth();

  const deptMap = employees.reduce((acc, e) => {
    if (!acc[e.department]) acc[e.department] = [];
    acc[e.department].push(e);
    return acc;
  }, {});

  return (
    <div className="app-layout">
      <div className="animated-bg"><div className="blob blob-1" /><div className="blob blob-2" /></div>
      <div className="dot-grid" />
      <Navbar />
      <Sidebar role="admin" />

      <div className="main-content">
        <div className="page-content">
          <div className="page-header">
            <div><h1>Reports & Analytics</h1><p>Comprehensive insights on payroll, attendance and workforce</p></div>
            <button className="btn btn-outline no-print" onClick={() => window.print()}><Download size={15} /> Export Report</button>
          </div>

          {/* Summary */}
          {stats && (
            <div className="stat-grid" style={{ marginBottom: 28 }}>
              {[
                { label: 'Total Employees', value: stats.totalEmployees, icon: '👥', color: '#6366F1', bg: 'rgba(99,102,241,.12)' },
                { label: 'Total Payroll', value: `₹${(totalPayroll / 1000).toFixed(0)}K`, icon: '💰', color: '#10B981', bg: 'rgba(16,185,129,.12)' },
                { label: 'Avg Attendance', value: `${Math.round(attendanceData.reduce((s, e) => s + e.pct, 0) / (attendanceData.length || 1))}%`, icon: '✅', color: '#06B6D4', bg: 'rgba(6,182,212,.12)' },
                { label: 'Departments', value: stats.departments, icon: '🏢', color: '#EC4899', bg: 'rgba(236,72,153,.12)' },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div className="stat-icon" style={{ background: s.bg, fontSize: '1.3rem' }}>{s.icon}</div>
                  <div className="stat-info">
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="tabs">
            <button className={`tab ${tab === 'payroll' ? 'active' : ''}`} onClick={() => setTab('payroll')}>💰 Payroll Report</button>
            <button className={`tab ${tab === 'attendance' ? 'active' : ''}`} onClick={() => setTab('attendance')}>📅 Attendance Report</button>
            <button className={`tab ${tab === 'dept' ? 'active' : ''}`} onClick={() => setTab('dept')}>🏢 Department Report</button>
          </div>

          {/* Payroll */}
          {tab === 'payroll' && (
            <motion.div className="emp-grid" variants={stagger} initial="hidden" animate="show">
              {payrollData.map(emp => {
                const basic = Math.round(emp.salary * 0.5);
                const pf = Math.round(basic * 0.12);
                const esi = Math.round(emp.salary * 0.0075);
                const tax = emp.salary > 50000 ? Math.round(emp.salary * 0.05) : 0;
                const net = emp.salary - pf - esi - tax;
                const color = DEPT_COLORS[emp.department] || '#6366F1';
                return (
                  <motion.div key={emp.id} variants={fadeUp} className="card" style={{ padding: 20 }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, ${color}60)`, borderRadius: 'var(--radius) var(--radius) 0 0' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                      <div className="avatar avatar-md" style={{ background: `linear-gradient(135deg, ${color}, ${color}80)` }}>{emp.avatar || emp.name?.slice(0, 2)}</div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{emp.name}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{emp.role}</div>
                      </div>
                      <span className="chip" style={{ marginLeft: 'auto', background: `${color}18`, color, border: `1px solid ${color}30` }}>{emp.department}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {[
                        { label: 'Gross Salary', val: `₹${emp.salary.toLocaleString()}`, color: '#6366F1', bold: false },
                        { label: 'PF (12%)', val: `-₹${pf.toLocaleString()}`, color: 'var(--danger)', bold: false },
                        { label: 'ESI + Tax', val: `-₹${(esi + tax).toLocaleString()}`, color: 'var(--danger)', bold: false },
                        { label: 'Net Pay', val: `₹${net.toLocaleString()}`, color: '#10B981', bold: true },
                      ].map(row => (
                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '.82rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                          <span style={{ fontWeight: row.bold ? 800 : 600, color: row.color, fontFamily: row.bold ? "'Space Grotesk',sans-serif" : 'inherit' }}>{row.val}</span>
                        </div>
                      ))}
                    </div>
                    {emp.increments > 0 && <span className="chip chip-success" style={{ marginTop: 12 }}>🎯 {emp.increments} raise{emp.increments > 1 ? 's' : ''}</span>}
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Attendance */}
          {tab === 'attendance' && (
            <motion.div className="emp-grid" variants={stagger} initial="hidden" animate="show">
              {attendanceData.map(emp => {
                const color = DEPT_COLORS[emp.department] || '#6366F1';
                const gradeColor = emp.pct >= 90 ? 'var(--success)' : emp.pct >= 70 ? 'var(--warning)' : 'var(--danger)';
                const grade = emp.pct >= 90 ? 'A' : emp.pct >= 70 ? 'B' : 'C';
                return (
                  <motion.div key={emp.id} variants={fadeUp} className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                      <div className="avatar avatar-md" style={{ background: `linear-gradient(135deg, ${color}, ${color}80)` }}>{emp.avatar || emp.name?.slice(0, 2)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700 }}>{emp.name}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{emp.role}</div>
                      </div>
                      <div style={{ textAlign: 'center', width: 38, height: 38, borderRadius: '50%', background: `${gradeColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: gradeColor, border: `2px solid ${gradeColor}40` }}>{grade}</div>
                    </div>
                    <div className="progress-bar" style={{ marginBottom: 8 }}>
                      <motion.div className="progress-fill" style={{ background: gradeColor }} initial={{ width: 0 }} animate={{ width: `${emp.pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontWeight: 800, color: gradeColor }}>{emp.pct}%</span>
                      <span style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{emp.present}/{emp.total} days</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[{ l: 'Present', v: emp.present, c: 'var(--success)' }, { l: 'Absent', v: emp.absent, c: 'var(--danger)' }, { l: 'Half', v: emp.halfDay, c: 'var(--warning)' }, { l: 'Leave', v: emp.onLeave, c: 'var(--info)' }].map(x => (
                        <div key={x.l} style={{ flex: 1, textAlign: 'center', padding: '5px', background: 'var(--surface)', borderRadius: 'var(--radius-xs)' }}>
                          <div style={{ fontWeight: 800, fontSize: '.85rem', color: x.c }}>{x.v}</div>
                          <div style={{ fontSize: '.6rem', color: 'var(--text-muted)' }}>{x.l}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Department */}
          {tab === 'dept' && (
            <motion.div className="grid-2" variants={stagger} initial="hidden" animate="show">
              {Object.entries(deptMap).map(([dept, emps]) => {
                const deptPayroll = emps.reduce((s, e) => s + e.salary, 0);
                const color = DEPT_COLORS[dept] || '#6366F1';
                const deptIcons = { Engineering: '💻', Design: '🎨', Marketing: '📣', 'Human Resources': '👥' };
                return (
                  <motion.div key={dept} variants={fadeUp} className="card">
                    <div className="card-header">
                      <div>
                        <div className="card-title" style={{ color }}>{dept}</div>
                        <div className="card-subtitle">{emps.length} employees</div>
                      </div>
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>{deptIcons[dept]}</div>
                    </div>
                    <div className="card-body">
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Total Payroll</div>
                        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: '1.4rem', color }}> ₹{deptPayroll.toLocaleString()}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Avg: ₹{Math.round(deptPayroll / emps.length).toLocaleString()}</div>
                      </div>
                      {emps.map(emp => (
                        <div key={emp.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '.82rem', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="avatar avatar-sm" style={{ background: color, width: 26, height: 26, fontSize: '.62rem' }}>{emp.avatar || emp.name?.slice(0, 2)}</div>
                            {emp.name}
                          </div>
                          <span style={{ fontWeight: 700, color }}>₹{emp.salary.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
      <FloatingDock />
      <Chatbot />
    </div>
  );
}
