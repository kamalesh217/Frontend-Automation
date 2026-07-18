import { useState, useEffect } from 'react';
import { Plus, X, Calendar, Clock, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import FloatingDock from '../../components/FloatingDock';
import Chatbot from '../../components/Chatbot';
import { getEmployeeLeaves, submitLeave, getLeaveBalance, LEAVE_BALANCE_TOTAL } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const LEAVE_TYPES = Object.keys(LEAVE_BALANCE_TOTAL);

const TYPE_COLORS = {
  'Casual Leave': '#6366F1', 'Sick Leave': '#EC4899', 'Earned Leave': '#10B981',
  'Maternity/Paternity Leave': '#F59E0B', 'Emergency Leave': '#EF4444', 'Work From Home': '#06B6D4',
};

export default function LeaveRequest() {
  const { user } = useAuth();
  const [leaves, setLeaves]     = useState([]);
  const [balance, setBalance]   = useState({});
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter]     = useState('All');
  const [form, setForm]         = useState({ from: '', to: '', type: 'Casual Leave', reason: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]       = useState('');
  const [submitting, setSubmitting] = useState(false);

  const refreshAll = async () => {
    if (!user?.id) return;
    const [lvs, bal] = await Promise.all([getEmployeeLeaves(user.id), getLeaveBalance(user.id)]);
    setLeaves(lvs);
    setBalance(bal);
  };

  useEffect(() => { refreshAll(); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.from || !form.to || !form.reason.trim()) { setError('All fields are required.'); return; }
    if (new Date(form.to) < new Date(form.from)) { setError('End date must be after start date.'); return; }
    const remaining = balance[form.type]?.remaining ?? 0;
    const days = countDays(form.from, form.to);
    if (days > remaining && form.type !== 'Maternity/Paternity Leave') {
      setError(`Insufficient leave balance. You have ${remaining} ${form.type} day(s) remaining.`);
      return;
    }
    setSubmitting(true);
    await submitLeave(user.id, user.name, form);
    await refreshAll();
    setSubmitting(false);
    setShowForm(false);
    setSubmitted(true);
    setForm({ from: '', to: '', type: 'Casual Leave', reason: '' });
    setTimeout(() => setSubmitted(false), 4000);
  };

  const filtered = leaves.filter(l => filter === 'All' || l.status === filter);
  const countDays = (from, to) => {
    if (!from || !to) return 0;
    return Math.max(0, Math.round((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1);
  };

  // Balance pie for selected type
  const selectedBalance = balance[form.type] || { total: 0, used: 0, remaining: 0 };
  const balancePie = [
    { name: 'Used',      value: selectedBalance.used,      fill: '#EF4444' },
    { name: 'Remaining', value: selectedBalance.remaining, fill: '#10B981' },
  ].filter(d => d.value > 0);

  const topBalances = Object.entries(LEAVE_BALANCE_TOTAL).slice(0, 6);

  return (
    <div className="app-layout">
      <div className="animated-bg"><div className="blob blob-1" /><div className="blob blob-2" /></div>
      <div className="dot-grid" />
      <Navbar />
      <Sidebar role="employee" />
      <div className="main-content">
        <div className="page-content">

          <div className="page-header">
            <div className="page-header-left">
              <h1>Leave Management</h1>
              <p>Apply for leave and track your leave history</p>
            </div>
            <button id="apply-leave-btn" className="btn btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={16} /> Apply for Leave
            </button>
          </div>

          {/* Success Toast */}
          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ background: 'var(--success-surface)', border: '1.5px solid var(--success)', borderRadius: 12, padding: '14px 20px', display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}
              >
                <CheckCircle size={20} color="var(--success)" />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--success)' }}>Leave Applied Successfully!</div>
                  <div style={{ fontSize: '.82rem', color: 'var(--text-secondary)' }}>Your request is pending admin approval.</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Leave Balance Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
            {topBalances.map(([type, total]) => {
              const b = balance[type] || { used: 0, remaining: total };
              const pct = Math.round((b.used / total) * 100);
              const c = TYPE_COLORS[type] || '#6366F1';
              return (
                <motion.div
                  key={type}
                  className="card"
                  style={{ padding: '16px 18px', cursor: 'pointer', border: form.type === type && showForm ? `2px solid ${c}` : '1px solid var(--border)' }}
                  whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,.15)' }}
                  onClick={() => { setForm(f => ({ ...f, type })); if (!showForm) setShowForm(true); }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '.8rem', color: 'var(--text)', lineHeight: 1.3 }}>{type}</div>
                      <div style={{ fontSize: '.7rem', color: 'var(--text-secondary)', marginTop: 2 }}>{b.remaining} days left</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: '1.3rem', color: c }}>{b.remaining}</div>
                      <div style={{ fontSize: '.62rem', color: 'var(--text-muted)' }}>of {total}</div>
                    </div>
                  </div>
                  <div style={{ height: 5, background: 'var(--border)', borderRadius: 999 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: c, borderRadius: 999 }} />
                  </div>
                  <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', marginTop: 4 }}>{b.used} used · {pct}% utilized</div>
                </motion.div>
              );
            })}
          </div>

          {/* Filter Tabs */}
          <div className="tabs">
            {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
              <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f} {f !== 'All' ? `(${leaves.filter(l => l.status === f).length})` : `(${leaves.length})`}
              </button>
            ))}
          </div>

          {/* Leave History */}
          <div className="card">
            <div className="card-header"><div className="card-title">My Leave Applications</div></div>
            <div className="card-body" style={{ padding: '4px 0' }}>
              {filtered.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">🏖️</div>
                  <h3>No leave applications</h3>
                  <p>Click "Apply for Leave" to submit a request</p>
                </div>
              ) : filtered.map(leave => {
                const days = countDays(leave.from, leave.to);
                const c = TYPE_COLORS[leave.type] || '#6366F1';
                return (
                  <div key={leave.id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: leave.status === 'Approved' ? 'var(--success-surface)' : leave.status === 'Pending' ? 'var(--warning-surface)' : 'var(--danger-surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                    }}>
                      {leave.status === 'Approved' ? '✅' : leave.status === 'Pending' ? '⏳' : '❌'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '.9rem', color: c }}>{leave.type}</span>
                        <span className={`chip ${leave.status === 'Approved' ? 'chip-success' : leave.status === 'Pending' ? 'chip-warning' : 'chip-danger'}`}>
                          {leave.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '.8rem', color: 'var(--text-secondary)', display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span><Calendar size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />{leave.from} → {leave.to}</span>
                        <span><Clock size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />{days} day{days !== 1 ? 's' : ''}</span>
                      </div>
                      <div style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>{leave.reason}</div>
                      {leave.adminComment && (
                        <div style={{ fontSize: '.75rem', marginTop: 5, display: 'flex', gap: 5, alignItems: 'center', color: leave.status === 'Approved' ? 'var(--success)' : 'var(--danger)' }}>
                          <MessageSquare size={11} /> Admin: {leave.adminComment}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                      Applied: {leave.appliedOn}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Apply Leave Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)}>
            <motion.div
              className="modal" style={{ maxWidth: 560 }}
              initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="modal-title">Apply for Leave</div>
                <button className="modal-close" onClick={() => setShowForm(false)}><X size={16} /></button>
              </div>

              {error && (
                <div style={{ background: 'var(--danger-surface)', color: 'var(--danger)', border: '1.5px solid rgba(239,68,68,.25)', padding: '10px 14px', borderRadius: 8, display: 'flex', gap: 8, marginBottom: 16, fontSize: '.82rem' }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, marginBottom: 4 }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Leave Type</label>
                    <select id="leave-type-select" className="form-control" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                      {LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <div style={{ fontSize: '.75rem', marginTop: 5, color: balance[form.type]?.remaining === 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                      Balance: <strong>{balance[form.type]?.remaining ?? LEAVE_BALANCE_TOTAL[form.type]}</strong> days remaining
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">From Date</label>
                      <input id="leave-from-date" type="date" className="form-control" value={form.from}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => setForm({ ...form, from: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">To Date</label>
                      <input id="leave-to-date" type="date" className="form-control" value={form.to}
                        min={form.from || new Date().toISOString().split('T')[0]}
                        onChange={e => setForm({ ...form, to: e.target.value })} required />
                    </div>
                  </div>

                  {form.from && form.to && (
                    <div style={{ background: 'rgba(79,70,229,.1)', padding: '10px 14px', borderRadius: 8, fontSize: '.82rem', color: 'var(--primary)', fontWeight: 600 }}>
                      📅 Duration: {countDays(form.from, form.to)} day{countDays(form.from, form.to) !== 1 ? 's' : ''}
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Reason for Leave</label>
                    <textarea id="leave-reason" className="form-control" rows={3}
                      placeholder="Briefly describe the reason…"
                      value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
                      style={{ resize: 'vertical' }} required />
                  </div>

                  <div className="modal-footer" style={{ marginTop: 0 }}>
                    <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                    <button id="submit-leave-btn" type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Submitting…' : <><Plus size={16} /> Submit Request</>}
                    </button>
                  </div>
                </form>

                {/* Mini Pie */}
                <div style={{ width: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, paddingTop: 28 }}>
                  <div style={{ width: 100, height: 100 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={balancePie.length > 0 ? balancePie : [{ name: 'No Data', value: 1, fill: 'var(--border)' }]}
                          cx="50%" cy="50%" innerRadius={30} outerRadius={46} dataKey="value" paddingAngle={2}>
                          {balancePie.map((e, i) => <Cell key={i} fill={e.fill} />)}
                        </Pie>
                        <Tooltip formatter={(v, n) => [v + ' days', n]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '.7rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontWeight: 700, color: '#10B981', fontSize: '.85rem' }}>{selectedBalance.remaining}</div>
                    <div>remaining</div>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '.7rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontWeight: 700, color: '#EF4444', fontSize: '.85rem' }}>{selectedBalance.used}</div>
                    <div>used</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <FloatingDock />
      <Chatbot />
    </div>
  );
}
