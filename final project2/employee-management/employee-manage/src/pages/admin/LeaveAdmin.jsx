import { useState, useEffect } from 'react';
import { Check, X, MessageSquare, BarChart2, List } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import FloatingDock from '../../components/FloatingDock';
import Chatbot from '../../components/Chatbot';
import { getLeaves, updateLeaveStatus, getEmployees } from '../../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const DEPT_COLORS = { Engineering: '#6366F1', Design: '#EC4899', Marketing: '#10B981', 'Human Resources': '#F59E0B' };
const LEAVE_TYPE_COLORS = {
  'Casual Leave': '#6366F1', 'Sick Leave': '#EC4899', 'Earned Leave': '#10B981',
  'Emergency Leave': '#EF4444', 'Work From Home': '#06B6D4', 'Maternity/Paternity Leave': '#F59E0B',
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 22, stiffness: 300 } } };

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 14px', fontSize: '.8rem' }}>
      <div style={{ color: payload[0].payload?.fill || payload[0].color, fontWeight: 700 }}>{payload[0].name}: {payload[0].value}</div>
    </div>
  );
};

export default function LeaveAdmin() {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filter, setFilter] = useState('All');
  const [tab, setTab] = useState('list');
  const [commentModal, setCommentModal] = useState(null); // { id, action }
  const [comment, setComment] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    Promise.all([getLeaves(), getEmployees()]).then(([lvs, emps]) => { setLeaves(lvs); setEmployees(emps); });
  }, []);

  const refreshLeaves = async () => setLeaves(await getLeaves());

  const handleStatus = async (id, status, adminComment = '') => {
    setProcessingId(id);
    await updateLeaveStatus(id, status, adminComment);
    await refreshLeaves();
    setProcessingId(null);
    setCommentModal(null);
    setComment('');
    showToast(status === 'Approved' ? '✅ Leave approved!' : '❌ Leave rejected.');
  };

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openComment = (id, action) => { setCommentModal({ id, action }); setComment(''); };

  const filtered = leaves.filter(l => filter === 'All' || l.status === filter);
  const getEmpDept = id => employees.find(e => e.id === id)?.department || '';

  const pending  = leaves.filter(l => l.status === 'Pending').length;
  const approved = leaves.filter(l => l.status === 'Approved').length;
  const rejected = leaves.filter(l => l.status === 'Rejected').length;

  // Analytics data
  const byTypePie = Object.entries(
    leaves.reduce((acc, l) => { acc[l.type] = (acc[l.type] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name: name.split(' ')[0], fullName: name, value, fill: LEAVE_TYPE_COLORS[name] || '#6366F1' }));

  const byStatusPie = [
    { name: 'Approved', value: approved, fill: '#10B981' },
    { name: 'Pending',  value: pending,  fill: '#F59E0B' },
    { name: 'Rejected', value: rejected, fill: '#EF4444' },
  ].filter(d => d.value > 0);

  const byEmployee = Object.entries(
    leaves.reduce((acc, l) => { acc[l.employeeName] = (acc[l.employeeName] || 0) + 1; return acc; }, {})
  ).map(([name, count]) => ({ name: name.split(' ')[0], count })).slice(0, 6);

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
          >{toast}</motion.div>
        )}
      </AnimatePresence>

      {/* Comment/Approve Modal */}
      <AnimatePresence>
        {commentModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCommentModal(null)}>
            <motion.div className="modal" style={{ maxWidth: 440 }} initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">{commentModal.action === 'Approved' ? '✅ Approve Leave' : '❌ Reject Leave'}</div>
                <button className="modal-close" onClick={() => setCommentModal(null)}><X size={16} /></button>
              </div>
              <div style={{ padding: '0 0 16px' }}>
                <label className="form-label">Admin Comment (optional)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder={commentModal.action === 'Approved' ? 'e.g. Approved as requested.' : 'e.g. Insufficient leave balance.'}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  style={{ resize: 'vertical', marginTop: 8 }}
                />
              </div>
              <div className="modal-footer" style={{ marginTop: 0 }}>
                <button className="btn btn-outline" onClick={() => setCommentModal(null)}>Cancel</button>
                <button
                  className={`btn ${commentModal.action === 'Approved' ? 'btn-success' : 'btn-danger'}`}
                  onClick={() => handleStatus(commentModal.id, commentModal.action, comment)}
                >
                  {commentModal.action === 'Approved' ? <><Check size={15} /> Approve</> : <><X size={15} /> Reject</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="main-content">
        <div className="page-content">
          <div className="page-header">
            <div>
              <h1>Leave Requests</h1>
              <p>{pending} pending approval{pending !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 22 }}>
            {[
              { label: 'Total',    value: leaves.length, icon: '📋', color: '#6366F1', bg: 'rgba(99,102,241,.12)' },
              { label: 'Pending',  value: pending,        icon: '⏳', color: '#F59E0B', bg: 'rgba(245,158,11,.12)' },
              { label: 'Approved', value: approved,       icon: '✅', color: '#10B981', bg: 'rgba(16,185,129,.12)' },
              { label: 'Rejected', value: rejected,       icon: '❌', color: '#EF4444', bg: 'rgba(239,68,68,.12)' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon" style={{ background: s.bg, fontSize: '1.3rem' }}>{s.icon}</div>
                <div className="stat-info">
                  <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                  <div className="stat-label">{s.label} Leaves</div>
                </div>
              </div>
            ))}
          </div>

          <div className="tabs">
            <button className={`tab ${tab === 'list' ? 'active' : ''}`} onClick={() => setTab('list')}><List size={14} /> Leave Requests</button>
            <button className={`tab ${tab === 'analytics' ? 'active' : ''}`} onClick={() => setTab('analytics')}><BarChart2 size={14} /> Analytics</button>
          </div>

          {tab === 'analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              <div className="grid-2">
                {/* By Type */}
                <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="card-header"><div className="card-title">🗂️ Leaves by Type</div></div>
                  <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: '0 0 160px', height: 160 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={byTypePie} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                            {byTypePie.map((e, i) => <Cell key={i} fill={e.fill} />)}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ flex: 1 }}>
                      {byTypePie.map(d => (
                        <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: d.fill }} />
                          <span style={{ flex: 1, fontSize: '.76rem', color: 'var(--text-secondary)' }}>{d.fullName}</span>
                          <span style={{ fontWeight: 700, fontSize: '.82rem', color: d.fill }}>{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* By Status */}
                <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <div className="card-header"><div className="card-title">📊 Status Distribution</div></div>
                  <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: '0 0 160px', height: 160 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={byStatusPie} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                            {byStatusPie.map((e, i) => <Cell key={i} fill={e.fill} />)}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ flex: 1 }}>
                      {byStatusPie.map(d => (
                        <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: d.fill }} />
                          <span style={{ flex: 1, fontSize: '.78rem' }}>{d.name}</span>
                          <span style={{ fontWeight: 700, color: d.fill }}>{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* By Employee Bar */}
              <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="card-header"><div className="card-title">👥 Leaves per Employee</div></div>
                <div className="card-body" style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byEmployee} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Leaves" fill="#6366F1" radius={[6,6,0,0]}>
                        {byEmployee.map((_, i) => <Cell key={i} fill={Object.values(DEPT_COLORS)[i % 4]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          )}

          {tab === 'list' && (
            <>
              {/* Filter Tabs */}
              <div className="tabs" style={{ marginBottom: 16 }}>
                {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
                  <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                    {f} {f !== 'All' && `(${leaves.filter(l => l.status === f).length})`}
                  </button>
                ))}
              </div>

              {filtered.length === 0 ? (
                <div className="empty-state"><div className="empty-state-icon">📭</div><h3>No {filter !== 'All' ? filter.toLowerCase() : ''} leave requests</h3><p>All caught up!</p></div>
              ) : (
                <motion.div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} variants={stagger} initial="hidden" animate="show">
                  {filtered.map(leave => {
                    const dept = getEmpDept(leave.employeeId);
                    const deptColor = DEPT_COLORS[dept] || '#6366F1';
                    const isApproved = leave.status === 'Approved';
                    const isPending  = leave.status === 'Pending';
                    const isRejected = leave.status === 'Rejected';
                    return (
                      <motion.div
                        key={leave.id}
                        variants={fadeUp}
                        className="card"
                        style={{ padding: '20px 24px', borderLeft: `3px solid ${isPending ? 'var(--warning)' : isApproved ? 'var(--success)' : 'var(--danger)'}` }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 180 }}>
                            <div className="avatar avatar-md" style={{ background: `linear-gradient(135deg, ${deptColor}, ${deptColor}80)` }}>
                              {leave.employeeName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '.9rem' }}>{leave.employeeName}</div>
                              <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{dept || leave.employeeId}</div>
                            </div>
                          </div>

                          <div style={{ flex: 1, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                            <span className="chip chip-primary">{leave.type}</span>
                            <div style={{ fontSize: '.78rem', color: 'var(--text-secondary)' }}>
                              📅 <strong>{leave.from}</strong> → <strong>{leave.to}</strong>
                            </div>
                            <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', maxWidth: 220 }}>{leave.reason}</div>
                            <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>Applied: {leave.appliedOn}</div>
                            {leave.adminComment && (
                              <div style={{ fontSize: '.75rem', color: isPending ? 'var(--text-muted)' : isApproved ? 'var(--success)' : 'var(--danger)', display: 'flex', gap: 5, alignItems: 'center' }}>
                                <MessageSquare size={11} /> {leave.adminComment}
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className={`chip ${isApproved ? 'chip-success' : isPending ? 'chip-warning' : 'chip-danger'}`}>{leave.status}</span>
                            {isPending && (
                              <div style={{ display: 'flex', gap: 7 }}>
                                <motion.button
                                  id={`approve-${leave.id}`}
                                  className="btn btn-success btn-sm"
                                  whileTap={{ scale: 0.94 }}
                                  disabled={processingId === leave.id}
                                  onClick={() => openComment(leave.id, 'Approved')}
                                >
                                  <Check size={13} /> Approve
                                </motion.button>
                                <motion.button
                                  id={`reject-${leave.id}`}
                                  className="btn btn-danger btn-sm"
                                  whileTap={{ scale: 0.94 }}
                                  disabled={processingId === leave.id}
                                  onClick={() => openComment(leave.id, 'Rejected')}
                                >
                                  <X size={13} /> Reject
                                </motion.button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
      <FloatingDock />
      <Chatbot />
    </div>
  );
}
