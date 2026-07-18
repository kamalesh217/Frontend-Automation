import { useState, useEffect } from 'react';
import { Search, Plus, X, Edit2, Trash2, ChevronDown, ChevronUp, Mail, Phone, MapPin } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import FloatingDock from '../../components/FloatingDock';
import Chatbot from '../../components/Chatbot';
import { getEmployees, updateEmployee, addEmployee, deleteEmployee } from '../../api/api';
import { motion, AnimatePresence } from 'framer-motion';

const DEPT_COLORS = {
  Engineering: '#6366F1', Design: '#EC4899',
  Marketing: '#10B981', 'Human Resources': '#F59E0B',
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 22, stiffness: 300 } } };

function EmployeeCard({ emp, onView, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const color = DEPT_COLORS[emp.department] || '#6366F1';

  return (
    <motion.div variants={fadeUp} className="emp-card" data-testid="employee-card" layout>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, ${color}80)`, borderRadius: 'var(--radius) var(--radius) 0 0' }} />

      <div className="emp-card-header">
        <div className="avatar avatar-md" style={{ background: `linear-gradient(135deg, ${color}, ${color}80)` }}>
          {emp.avatar || emp.name?.slice(0, 2)}
        </div>
        <div style={{ flex: 1 }}>
          <div className="emp-card-name">{emp.name}</div>
          <div className="emp-card-role">{emp.role}</div>
        </div>
        <span className={`chip ${emp.status === 'active' ? 'chip-success' : 'chip-danger'}`}>
          {emp.status}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        <span className="emp-card-dept" style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
          {emp.department}
        </span>
        <span className="chip chip-muted">{emp.employeeType || 'Full-Time'}</span>
        <span className="chip chip-muted">{emp.id}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: '1.05rem', color }}>
          ₹{emp.salary?.toLocaleString()}
          <span style={{ fontSize: '.65rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: 4 }}>/mo</span>
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <motion.button className="btn btn-outline btn-sm btn-icon" whileTap={{ scale: 0.92 }} onClick={() => setExpanded(v => !v)} title="Expand">
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </motion.button>
          <motion.button id={`edit-${emp.id}`} data-testid="edit-employee-button" className="btn btn-outline btn-sm btn-icon" whileTap={{ scale: 0.92 }} onClick={() => onEdit(emp)} title="Edit">
            <Edit2 size={13} />
          </motion.button>
          <motion.button id={`delete-${emp.id}`} data-testid="delete-employee-button" className="btn btn-sm btn-icon" whileTap={{ scale: 0.92 }} onClick={() => onDelete(emp)} style={{ background: 'var(--danger-surface)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,.25)' }} title="Delete">
            <Trash2 size={13} />
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingTop: 14, marginTop: 14, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: <Mail size={12} />, val: emp.email },
                { icon: <Phone size={12} />, val: emp.phone },
                { icon: <MapPin size={12} />, val: emp.address },
              ].map((row, i) => row.val && (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.78rem', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{row.icon}</span>
                  <span style={{ wordBreak: 'break-all' }}>{row.val}</span>
                </div>
              ))}
              <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Joined: {emp.joinDate} · Manager: {emp.manager}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', role: '', department: 'Engineering', phone: '', email: '', salary: 50000, address: '', employeeType: 'Full-Time', manager: 'Admin', skills: '', bankAccount: '', pan: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    getEmployees().then(e => { setEmployees(e); setLoading(false); });
  }, []);

  const depts = ['All', ...new Set(employees.map(e => e.department))];
  const filtered = employees.filter(e =>
    (deptFilter === 'All' || e.department === deptFilter) &&
    (e.name.toLowerCase().includes(search.toLowerCase()) ||
     e.id.toLowerCase().includes(search.toLowerCase()) ||
     e.role.toLowerCase().includes(search.toLowerCase()))
  );

  const saveEdit = async () => {
    await updateEmployee(editForm.id, editForm);
    setEmployees(await getEmployees());
    setEditModal(null);
  };

  const closeAddModal = () => {
    setAddModal(false);
    setFormError('');
    setAddForm({ name: '', role: '', department: 'Engineering', phone: '', email: '', salary: 50000, address: '', employeeType: 'Full-Time', manager: 'Admin', skills: '', bankAccount: '', pan: '' });
  };

  const saveAdd = async () => {
    if (submitting) return; // prevent double-submission
    if (!addForm.name.trim() || !addForm.email.trim() || !addForm.role.trim() || !addForm.salary) {
      setFormError('Please fill in all required fields: Name, Role, Email and Salary.');
      return;
    }
    // Basic email format check
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(addForm.email.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }
    setFormError('');
    setSubmitting(true);
    try {
      const formattedSkills = addForm.skills ? addForm.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
      await addEmployee({ ...addForm, skills: formattedSkills });
      setEmployees(await getEmployees());
      closeAddModal();
    } catch (err) {
      console.error('Failed to add employee:', err);
      setFormError('Failed to save employee. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteEmployee(deleteConfirm.id);
      setEmployees(await getEmployees());
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="app-layout" data-testid="employees-page">
      <div className="animated-bg"><div className="blob blob-1" /><div className="blob blob-2" /></div>
      <div className="dot-grid" />
      <Navbar />
      <Sidebar role="admin" />

      <div className="main-content">
        <div className="page-content">

          <div className="page-header">
            <div>
              <h1>Employee Directory</h1>
              <p>{employees.length} employees across {Object.keys(DEPT_COLORS).length} departments</p>
            </div>
            <motion.button id="add-employee-btn" data-testid="add-employee-button" className="btn btn-primary" onClick={() => setAddModal(true)} whileTap={{ scale: 0.95 }}>
              <Plus size={16} /> Add Employee
            </motion.button>
          </div>

          {/* Filters */}
          <motion.div className="card" style={{ marginBottom: 22, padding: '16px 20px' }} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="search-bar" style={{ flex: 1, minWidth: 220 }}>
                <Search size={14} className="search-icon" />
                <input id="emp-search" data-testid="employee-search" placeholder="Search by name, ID or role..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="tabs" style={{ margin: 0, border: 'none', background: 'transparent', gap: 6 }}>
                {depts.map(d => (
                  <button key={d} className={`tab ${deptFilter === d ? 'active' : ''}`} onClick={() => setDeptFilter(d)}>{d}</button>
                ))}
              </div>
              <span style={{ fontSize: '.78rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{filtered.length} results</span>
            </div>
          </motion.div>

          {/* Employee Cards Grid */}
          {loading ? (
            <div className="emp-grid">
              {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton skeleton-card" style={{ height: 180 }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No employees found</h3>
              <p>Try adjusting your search or filter</p>
            </div>
          ) : (
            <motion.div className="emp-grid" variants={stagger} initial="hidden" animate="show">
              {filtered.map(emp => (
                <EmployeeCard
                  key={emp.id}
                  emp={emp}
                  onEdit={emp => { setEditForm({ ...emp }); setEditModal(emp); }}
                  onDelete={emp => setDeleteConfirm(emp)}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditModal(null)}>
            <motion.div data-testid="edit-employee-modal" className="modal" initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 10 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">Edit Employee</div>
                <button className="modal-close" onClick={() => setEditModal(null)}><X size={15} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '60vh', overflowY: 'auto' }}>
                {[
                  { label: 'Full Name', key: 'name' }, { label: 'Role', key: 'role' },
                  { label: 'Email', key: 'email' }, { label: 'Phone', key: 'phone' },
                  { label: 'Salary', key: 'salary', type: 'number' }, { label: 'Address', key: 'address' },
                ].map(f => (
                  <div key={f.key} className="form-group">
                    <label className="form-label">{f.label}</label>
                    <input id={`edit-${f.key}`} data-testid={`edit-employee-${f.key}`} className="form-control" type={f.type || 'text'} value={editForm[f.key] || ''} onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })} />
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline" data-testid="edit-cancel-button" onClick={() => setEditModal(null)}>Cancel</button>
                <button id="save-edit-btn" data-testid="edit-save-button" className="btn btn-primary" onClick={saveEdit}>Save Changes</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {addModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { if (!submitting) closeAddModal(); }}>
            <motion.div data-testid="add-employee-modal" className="modal" style={{ maxWidth: 580 }} initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">Add New Employee</div>
                <button className="modal-close" onClick={() => { if (!submitting) closeAddModal(); }} disabled={submitting}><X size={15} /></button>
              </div>

              {/* Validation error banner */}
              {formError && (
                <div data-testid="form-error" style={{ margin: '0 0 12px', padding: '10px 14px', background: 'var(--danger-surface)', color: 'var(--danger)', borderRadius: 'var(--radius-xs)', fontSize: '.82rem', fontWeight: 600, border: '1px solid rgba(239,68,68,.25)' }}>
                  ⚠ {formError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, maxHeight: '60vh', overflowY: 'auto' }}>
                {[
                  { label: 'Full Name *',  key: 'name',    type: 'text'   },
                  { label: 'Role *',       key: 'role',    type: 'text'   },
                  { label: 'Email *',      key: 'email',   type: 'email'  },
                  { label: 'Phone',        key: 'phone',   type: 'tel'    },
                  { label: 'Salary *',     key: 'salary',  type: 'number' },
                  { label: 'Manager',      key: 'manager', type: 'text'   },
                  { label: 'Bank Account', key: 'bankAccount', type: 'text' },
                  { label: 'PAN',          key: 'pan',     type: 'text'   },
                ].map(f => (
                  <div key={f.key} className="form-group">
                    <label className="form-label">{f.label}</label>
                    <input
                      id={`add-${f.key}`}
                      data-testid={`add-employee-${f.key}`}
                      className="form-control"
                      type={f.type}
                      value={addForm[f.key] || ''}
                      onChange={e => setAddForm({ ...addForm, [f.key]: e.target.value })}
                      disabled={submitting}
                    />
                  </div>
                ))}
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select id="add-department" data-testid="add-employee-department" className="form-control" value={addForm.department} onChange={e => setAddForm({ ...addForm, department: e.target.value })} disabled={submitting}>
                    {Object.keys(DEPT_COLORS).map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Employee Type</label>
                  <select id="add-type" className="form-control" value={addForm.employeeType} onChange={e => setAddForm({ ...addForm, employeeType: e.target.value })} disabled={submitting}>
                    {['Full-Time', 'Part-Time', 'Contract', 'Intern'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Skills (comma-separated)</label>
                  <input id="add-skills" className="form-control" placeholder="e.g. React, Node.js, Python" value={addForm.skills} onChange={e => setAddForm({ ...addForm, skills: e.target.value })} disabled={submitting} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Address</label>
                  <input id="add-address" className="form-control" value={addForm.address} onChange={e => setAddForm({ ...addForm, address: e.target.value })} disabled={submitting} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline" data-testid="add-cancel-button" onClick={() => { if (!submitting) closeAddModal(); }} disabled={submitting}>Cancel</button>
                <button
                  id="save-add-btn"
                  data-testid="add-save-button"
                  className="btn btn-primary"
                  onClick={saveAdd}
                  disabled={submitting}
                  style={{ opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {submitting ? (
                    <><span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .6s linear infinite', display: 'inline-block' }} /> Saving...</>
                  ) : (
                    <><Plus size={15} /> Add Employee</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirm(null)}>
            <motion.div className="modal" data-testid="delete-modal" style={{ maxWidth: 400, textAlign: 'center' }} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: '2.5rem', marginBottom: 14 }}>⚠️</div>
              <div className="modal-title" style={{ marginBottom: 10 }}>Delete Employee</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '.875rem', marginBottom: 24 }}>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button className="btn btn-outline" data-testid="cancel-button" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button id="confirm-delete-btn" data-testid="confirm-delete-button" className="btn btn-danger" onClick={handleDelete}><Trash2 size={15} /> Delete</button>
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
