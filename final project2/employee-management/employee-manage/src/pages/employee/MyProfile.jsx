import { useState, useEffect } from 'react';
import { Edit2, Save, X, Mail, Phone, MapPin, Briefcase, CreditCard, User } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import FloatingDock from '../../components/FloatingDock';
import Chatbot from '../../components/Chatbot';
import { getEmployee, updateEmployee } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const DEPT_COLORS = { Engineering:'#6366F1', Design:'#EC4899', Marketing:'#10B981', 'Human Resources':'#F59E0B' };

export default function MyProfile() {
  const { user, login } = useAuth();
  const [emp, setEmp]     = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm]   = useState({});
  const [saved, setSaved]  = useState(false);

  useEffect(() => {
    if (user?.id) {
      getEmployee(user.id).then(e => {
        setEmp(e);
        setForm(e || {});
      });
    }
  }, [user]);

  const handleSave = async () => {
    await updateEmployee(user.id, { phone: form.phone, address: form.address, email: form.email });
    const updated = await getEmployee(user.id);
    setEmp(updated);
    login({ ...user, ...updated });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!emp) return null;

  const deptColor = DEPT_COLORS[emp.department] || 'var(--primary)';

  const INFO_SECTIONS = [
    {
      title: 'Personal Information',
      icon: <User size={18} />,
      fields: [
        { label:'Full Name',    val:emp.name,          icon:<User size={14} />,        editable:false },
        { label:'Email',        val:emp.email,         icon:<Mail size={14} />,        editable:true, key:'email' },
        { label:'Phone',        val:emp.phone,         icon:<Phone size={14} />,       editable:true, key:'phone' },
        { label:'Address',      val:emp.address,       icon:<MapPin size={14} />,      editable:true, key:'address' },
      ],
    },
    {
      title: 'Employment Details',
      icon: <Briefcase size={18} />,
      fields: [
        { label:'Employee ID',  val:emp.id,            editable:false },
        { label:'Department',   val:emp.department,    editable:false },
        { label:'Role',         val:emp.role,          editable:false },
        { label:'Manager',      val:emp.manager,       editable:false },
        { label:'Join Date',    val:emp.joinDate,      editable:false },
        { label:'Type',         val:emp.employeeType,  editable:false },
      ],
    },
    {
      title: 'Financial Details',
      icon: <CreditCard size={18} />,
      fields: [
        { label:'Bank Account', val:emp.bankAccount,   editable:false },
        { label:'PAN',          val:emp.pan,           editable:false },
        { label:'Current Salary', val:`₹${emp.salary?.toLocaleString()} / month`, editable:false },
      ],
    },
  ];

  return (
    <div className="app-layout">
      <div className="animated-bg"><div className="blob blob-1" /><div className="blob blob-2" /></div>
      <div className="dot-grid" />
      <Navbar />
      <Sidebar role="employee" />
      <div className="main-content">
        <div className="page-content">

          {/* Profile Header Card */}
          <div className="card mb-24">
            <div className="card-body" style={{ display:'flex', alignItems:'center', gap:28, flexWrap:'wrap' }}>
              {/* Avatar */}
              <div style={{ position:'relative' }}>
                <div className="avatar avatar-xl" style={{ background:`linear-gradient(135deg, ${deptColor}, #EC4899)` }}>
                  {emp.avatar || emp.name?.slice(0,2)}
                </div>
                <div style={{
                  position:'absolute', bottom:-4, right:-4,
                  width:20, height:20, borderRadius:'50%',
                  background:'var(--success)', border:'3px solid var(--bg)',
                }} title="Active" />
              </div>

              {/* Name & Info */}
              <div style={{ flex:1 }}>
                <h2 style={{ fontSize:'1.6rem', fontWeight:800, color:'var(--text)', marginBottom:4 }}>{emp.name}</h2>
                <p style={{ color:'var(--text-secondary)', marginBottom:12 }}>{emp.role} · {emp.department}</p>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  <span className="chip chip-primary">{emp.id}</span>
                  <span className="chip chip-success">Active</span>
                  <span className="chip chip-info">{emp.employeeType}</span>
                  <span className="chip chip-muted">Since {emp.joinDate}</span>
                </div>
              </div>

              {/* Edit Button */}
              <div>
                {saved && (
                  <div style={{ marginBottom:10, fontSize:'.82rem', color:'var(--success)', fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
                    ✓ Profile updated!
                  </div>
                )}
                {editing ? (
                  <div style={{ display:'flex', gap:8 }}>
                    <button id="save-profile-btn" className="btn btn-success" onClick={handleSave}>
                      <Save size={16} /> Save Changes
                    </button>
                    <button className="btn btn-outline" onClick={() => { setEditing(false); setForm(emp); }}>
                      <X size={16} /> Cancel
                    </button>
                  </div>
                ) : (
                  <button id="edit-profile-btn" className="btn btn-primary" onClick={() => setEditing(true)}>
                    <Edit2 size={16} /> Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Gradient Stats */}
          <div className="stat-grid" style={{ gridTemplateColumns:'repeat(4,1fr)', marginBottom:24 }}>
            {[
              { icon:'💰', label:'Monthly Salary', val:`₹${emp.salary?.toLocaleString()}`, color:'var(--success)', bg:'var(--success-surface)' },
              { icon:'📧', label:'Email',           val:emp.email.split('@')[0],          color:'var(--primary)', bg:'rgba(79,70,229,.12)' },
              { icon:'🏢', label:'Department',      val:emp.department,                   color:'var(--secondary)', bg:'rgba(6,182,212,.12)' },
              { icon:'📅', label:'Tenure',          val:getTenure(emp.joinDate),          color:'var(--accent)', bg:'rgba(245,158,11,.12)' },
            ].map(s => (
              <div className="stat-card" key={s.label} style={{ '--stat-accent':s.color }}>
                <div className="stat-icon" style={{ background:s.bg, color:s.color }}><span style={{ fontSize:'1.3rem' }}>{s.icon}</span></div>
                <div className="stat-info">
                  <div className="stat-value" style={{ fontSize:'1.1rem', lineHeight:1.3, color:s.color }}>{s.val}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Sections */}
          <div className="grid-2" style={{ gap:20 }}>
            {INFO_SECTIONS.map(section => (
              <div key={section.title} className="card">
                <div className="card-header">
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:34, height:34, borderRadius:10, background:'rgba(79,70,229,.12)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--primary)' }}>
                      {section.icon}
                    </div>
                    <div className="card-title">{section.title}</div>
                  </div>
                </div>
                <div className="card-body" style={{ padding:'8px 24px 20px' }}>
                  {section.fields.map(field => (
                    <div key={field.label} style={{ padding:'10px 0', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
                      <div style={{ display:'flex', gap:8, alignItems:'center', color:'var(--text-secondary)', fontSize:'.82rem', minWidth:120 }}>
                        {field.icon} {field.label}
                      </div>
                      {editing && field.editable ? (
                        <input
                          id={`profile-${field.key}`}
                          className="form-control"
                          style={{ maxWidth:220, padding:'6px 10px', fontSize:'.82rem' }}
                          value={form[field.key] || ''}
                          onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                        />
                      ) : (
                        <div style={{ fontWeight:600, fontSize:'.875rem', textAlign:'right', wordBreak:'break-word' }}>
                          {field.val}
                          {field.editable && !editing && (
                            <span style={{ fontSize:'.65rem', color:'var(--primary)', marginLeft:6 }}>editable</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Skills Card */}
            <div className="card">
              <div className="card-header">
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:34, height:34, borderRadius:10, background:'rgba(6,182,212,.12)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--secondary)' }}>
                    ⚡
                  </div>
                  <div className="card-title">Skills & Expertise</div>
                </div>
              </div>
              <div className="card-body">
                <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                  {(emp.skills || []).map(skill => (
                    <span key={skill} style={{
                      padding:'8px 16px', borderRadius:99,
                      background:`linear-gradient(135deg, ${deptColor}20, ${deptColor}10)`,
                      color: deptColor, fontWeight:700, fontSize:'.82rem',
                      border:`1.5px solid ${deptColor}40`,
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <FloatingDock />
      <Chatbot />
    </div>
  );
}

function getTenure(joinDate) {
  const start = new Date(joinDate);
  const now   = new Date();
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  const years  = Math.floor(months / 12);
  const rem    = months % 12;
  if (years === 0) return `${rem}mo`;
  return rem > 0 ? `${years}yr ${rem}mo` : `${years} yr${years > 1 ? 's' : ''}`;
}
