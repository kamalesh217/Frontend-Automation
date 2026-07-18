import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, History, X, CheckCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import FloatingDock from '../../components/FloatingDock';
import Chatbot from '../../components/Chatbot';
import { getEmployees, updateSalary, getEmployeeSalaryHistory } from '../../api/api';
import { motion, AnimatePresence } from 'framer-motion';

const DEPT_COLORS = { Engineering: '#6366F1', Design: '#EC4899', Marketing: '#10B981', 'Human Resources': '#F59E0B' };

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 22, stiffness: 300 } } };

export default function SalaryManagement() {
  const [employees, setEmployees] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ amount: '', isPercentage: false, note: '' });
  const [history, setHistory] = useState([]);
  const [historyEmp, setHistoryEmp] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => { getEmployees().then(setEmployees); }, []);

  const totalPayroll = employees.reduce((s, e) => s + e.salary, 0);

  const openModal = (type, emp) => {
    setModal({ type, emp });
    setForm({ amount: '', isPercentage: false, note: '' });
    setSuccess('');
  };

  const handleUpdate = async () => {
    if (!form.amount || isNaN(form.amount)) return;
    const updated = await updateSalary(modal.emp.id, modal.type, parseFloat(form.amount), form.isPercentage, form.note);
    setEmployees(await getEmployees());
    setSuccess(`Salary ${modal.type}ed! New salary: ₹${updated.salary.toLocaleString()}`);
    setTimeout(() => { setModal(null); setSuccess(''); }, 1800);
  };

  const viewHistory = async (emp) => {
    setHistoryEmp(emp);
    setHistory(await getEmployeeSalaryHistory(emp.id));
  };

  return (
    <div className="app-layout">
      <div className="animated-bg"><div className="blob blob-1" /><div className="blob blob-2" /></div>
      <div className="dot-grid" />
      <Navbar />
      <Sidebar role="admin" />

      <div className="main-content">
        <div className="page-content">
          <div className="page-header">
            <div><h1>Salary Management</h1><p>Manage employee compensation and track changes</p></div>
          </div>

          {/* Summary */}
          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 28 }}>
            {[
              { label: 'Total Payroll', value: `₹${totalPayroll.toLocaleString()}`, icon: '💰', color: '#6366F1', bg: 'rgba(99,102,241,.12)' },
              { label: 'Avg Salary', value: `₹${Math.round(totalPayroll / (employees.length || 1)).toLocaleString()}`, icon: '📈', color: '#10B981', bg: 'rgba(16,185,129,.12)' },
              { label: 'Employees', value: employees.length, icon: '👥', color: '#F59E0B', bg: 'rgba(245,158,11,.12)' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon" style={{ background: s.bg, color: s.color, fontSize: '1.3rem' }}>{s.icon}</div>
                <div className="stat-info">
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Salary Cards */}
          <motion.div className="emp-grid" variants={stagger} initial="hidden" animate="show">
            {employees.map(emp => {
              const color = DEPT_COLORS[emp.department] || '#6366F1';
              const pct = Math.round((emp.salary / 150000) * 100);
              return (
                <motion.div key={emp.id} variants={fadeUp} className="emp-card">
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, ${color}60)`, borderRadius: 'var(--radius) var(--radius) 0 0' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div className="avatar avatar-md" style={{ background: `linear-gradient(135deg, ${color}, ${color}80)` }}>{emp.avatar || emp.name?.slice(0, 2)}</div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{emp.name}</div>
                      <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{emp.role}</div>
                    </div>
                    <span className="chip" style={{ marginLeft: 'auto', background: `${color}18`, color, border: `1px solid ${color}30`, fontSize: '.68rem' }}>{emp.department}</span>
                  </div>

                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: '1.5rem', color, marginBottom: 6 }}>
                    ₹{emp.salary.toLocaleString()}
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '.72rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: 5 }}>/month</span>
                  </div>

                  <div className="progress-bar" style={{ marginBottom: 4 }}>
                    <motion.div className="progress-fill" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
                  </div>
                  <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', marginBottom: 14 }}>{pct}% of max band · Joined {emp.joinDate}</div>

                  <div style={{ display: 'flex', gap: 7 }}>
                    <motion.button id={`increment-${emp.id}`} className="btn btn-success btn-sm" style={{ flex: 1, justifyContent: 'center' }} whileTap={{ scale: 0.95 }} onClick={() => openModal('increment', emp)}>
                      <TrendingUp size={13} /> Increment
                    </motion.button>
                    <motion.button id={`decrement-${emp.id}`} className="btn btn-danger btn-sm" style={{ flex: 1, justifyContent: 'center' }} whileTap={{ scale: 0.95 }} onClick={() => openModal('decrement', emp)}>
                      <TrendingDown size={13} /> Decrement
                    </motion.button>
                    <motion.button id={`history-${emp.id}`} className="btn btn-outline btn-sm btn-icon" whileTap={{ scale: 0.95 }} onClick={() => viewHistory(emp)} title="History">
                      <History size={13} />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Increment/Decrement Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(null)}>
            <motion.div className="modal" initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  {modal.type === 'increment' ? <><TrendingUp size={19} color="var(--success)" /> Salary Increment</> : <><TrendingDown size={19} color="var(--danger)" /> Salary Decrement</>}
                </div>
                <button className="modal-close" onClick={() => setModal(null)}><X size={15} /></button>
              </div>

              {success ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <CheckCircle size={44} color="var(--success)" style={{ margin: '0 auto 14px', display: 'block' }} />
                  <div style={{ fontWeight: 700, color: 'var(--text)' }}>{success}</div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: 'var(--surface)', borderRadius: 'var(--radius-sm)', marginBottom: 18 }}>
                    <div className="avatar avatar-md" style={{ background: DEPT_COLORS[modal.emp.department] || '#6366F1' }}>{modal.emp.avatar || modal.emp.name?.slice(0, 2)}</div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{modal.emp.name}</div>
                      <div style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>{modal.emp.role}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                      <div style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>Current</div>
                      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>₹{modal.emp.salary.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="tabs" style={{ width: '100%', marginBottom: 16 }}>
                    <button className={`tab ${!form.isPercentage ? 'active' : ''}`} style={{ flex: 1 }} onClick={() => setForm({ ...form, isPercentage: false })}>Fixed Amount (₹)</button>
                    <button className={`tab ${form.isPercentage ? 'active' : ''}`} style={{ flex: 1 }} onClick={() => setForm({ ...form, isPercentage: true })}>Percentage (%)</button>
                  </div>

                  <div className="form-group" style={{ marginBottom: 14 }}>
                    <label className="form-label">{form.isPercentage ? 'Percentage (%)' : 'Amount (₹)'}</label>
                    <input id="salary-amount-input" className="form-control" type="number" min="0" placeholder={form.isPercentage ? 'e.g. 10 for 10%' : 'e.g. 5000'} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                    {form.amount && !isNaN(form.amount) && (
                      <div style={{ fontSize: '.78rem', color: modal.type === 'increment' ? 'var(--success)' : 'var(--danger)', marginTop: 6, fontWeight: 600 }}>
                        {modal.type === 'increment' ? '▲' : '▼'} New: ₹{Math.max(0, modal.emp.salary + (modal.type === 'increment' ? 1 : -1) * (form.isPercentage ? Math.round(modal.emp.salary * parseFloat(form.amount) / 100) : parseFloat(form.amount))).toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Note / Reason</label>
                    <input id="salary-note-input" className="form-control" placeholder="e.g. Annual increment, Performance bonus..." value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
                  </div>

                  <div className="modal-footer">
                    <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
                    <button id="confirm-salary-btn" className={`btn ${modal.type === 'increment' ? 'btn-success' : 'btn-danger'}`} onClick={handleUpdate} disabled={!form.amount}>
                      {modal.type === 'increment' ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                      Confirm {modal.type === 'increment' ? 'Increment' : 'Decrement'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {historyEmp && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setHistoryEmp(null)}>
            <motion.div className="modal" style={{ maxWidth: 560 }} initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">Salary History — {historyEmp.name}</div>
                <button className="modal-close" onClick={() => setHistoryEmp(null)}><X size={15} /></button>
              </div>
              {history.length === 0 ? (
                <div className="empty-state"><div className="empty-state-icon">📋</div><h3>No history yet</h3><p>No salary changes recorded.</p></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '60vh', overflowY: 'auto' }}>
                  {history.map((h, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '14px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', alignItems: 'center' }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: h.type === 'increment' ? 'var(--success-surface)' : 'var(--danger-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {h.type === 'increment' ? <TrendingUp size={16} color="var(--success)" /> : <TrendingDown size={16} color="var(--danger)" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '.85rem' }}>{h.note || (h.type === 'increment' ? 'Salary Increment' : 'Salary Decrement')}</div>
                        <div style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>{h.date} · by {h.by}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: h.type === 'increment' ? 'var(--success)' : 'var(--danger)' }}>
                          {h.type === 'increment' ? '+' : '-'}₹{h.amount?.toLocaleString()}{h.percentage ? ` (${h.percentage}%)` : ''}
                        </div>
                        {h.previousSalary && <div style={{ fontSize: '.68rem', color: 'var(--text-muted)' }}>₹{h.previousSalary.toLocaleString()} → ₹{h.newSalary.toLocaleString()}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <FloatingDock />
      <Chatbot />
    </div>
  );
}
