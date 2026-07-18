import { useState, useEffect, useRef } from 'react';
import { Download, Printer, FileText } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import FloatingDock from '../../components/FloatingDock';
import Chatbot from '../../components/Chatbot';
import { getEmployees, generateSalarySlip } from '../../api/api';
import { motion } from 'framer-motion';

const DEPT_COLORS = { Engineering: '#6366F1', Design: '#EC4899', Marketing: '#10B981', 'Human Resources': '#F59E0B' };
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function PaySlipAdmin() {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [slip, setSlip] = useState(null);
  const slipRef = useRef(null);

  useEffect(() => { getEmployees().then(setEmployees); }, []);

  const generate = async () => {
    if (!selected) return;
    const s = await generateSalarySlip(selected, month, year);
    setSlip(s);
  };

  const handlePrint = () => {
    const printContent = slipRef.current?.innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Salary Slip</title><style>
      *{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;padding:30px;color:#0F172A}
      .slip-header{text-align:center;padding-bottom:18px;border-bottom:2px solid #4F46E5;margin-bottom:18px}
      .slip-company{font-size:22px;font-weight:900;color:#4F46E5}.slip-company-sub{font-size:12px;color:#64748B;margin-top:3px}
      .slip-title{font-size:13px;font-weight:700;margin-top:12px;text-transform:uppercase;letter-spacing:.08em;color:#4F46E5}
      .slip-period{font-size:12px;color:#94A3B8}.slip-employee-info{display:grid;grid-template-columns:1fr 1fr;gap:8px;background:#F1F5F9;padding:14px;border-radius:8px;margin-bottom:18px}
      .slip-info-row{display:flex;gap:6px;font-size:12px}.slip-info-label{color:#94A3B8;min-width:110px}.slip-info-value{font-weight:600}
      .tables-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
      table{width:100%;border-collapse:collapse}th{background:#4F46E5;color:#fff;padding:9px 14px;font-size:11px;text-align:left}th:last-child{text-align:right}
      td{padding:8px 14px;border-bottom:1px solid #E2E8F0;font-size:12px}td:last-child{text-align:right;font-weight:600}tr:last-child td{font-weight:700;background:#F1F5F9;border-bottom:none}
      .slip-net{background:linear-gradient(135deg,#4F46E5,#06B6D4);color:#fff;padding:18px 22px;border-radius:8px;display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
      .net-label{font-size:13px;font-weight:600}.net-value{font-size:22px;font-weight:900}
      .slip-footer{text-align:center;font-size:11px;color:#94A3B8;border-top:1px solid #E2E8F0;padding-top:12px;margin-top:16px}
    </style></head><body>${printContent}</body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 300);
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
            <div><h1>Pay Slip Generator</h1><p>Generate detailed salary slips for any employee</p></div>
            {slip && (
              <div style={{ display: 'flex', gap: 10 }}>
                <button id="download-payslip-btn" className="btn btn-primary" onClick={handlePrint}><Download size={15} /> Download PDF</button>
                <button id="print-payslip-btn" className="btn btn-outline" onClick={handlePrint}><Printer size={15} /> Print</button>
              </div>
            )}
          </div>

          {/* Generator Form */}
          <div className="card" style={{ marginBottom: 22 }}>
            <div className="card-header"><div className="card-title">Generate Salary Slip</div></div>
            <div className="card-body">
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
                  <label className="form-label">Select Employee</label>
                  <select id="payslip-employee-select" className="form-control" value={selected} onChange={e => { setSelected(e.target.value); setSlip(null); }}>
                    <option value="">-- Choose Employee --</option>
                   {employees.map(e => <option style={{ color: 'black' }} key={e.id} value={e.id}>{e.name} ({e.id})</option>)} 
                  </select>
                </div>
                <div className="form-group" style={{ minWidth: 150 }}>
                  <label className="form-label">Month</label>
                  <select id="payslip-month-select" className="form-control" value={month} onChange={e => { setMonth(Number(e.target.value)); setSlip(null); }}>
                    {MONTHS.map((m, i) => <option style={{ color: 'black' }} key={m} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ minWidth: 110 }}>
                  <label className="form-label">Year</label>
                  <select id="payslip-year-select" className="form-control" value={year} onChange={e => { setYear(Number(e.target.value)); setSlip(null); }}>
                    {[2024, 2025, 2026].map(y => <option style={{ color: 'black' }} key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <motion.button id="generate-payslip-btn" className="btn btn-primary" onClick={generate} disabled={!selected} whileTap={{ scale: 0.95 }}>
                  <FileText size={15} /> Generate
                </motion.button>
              </div>
            </div>
          </div>

          {/* Quick Select */}
          <div className="card" style={{ marginBottom: 22 }}>
            <div className="card-header"><div className="card-title">Quick Select</div></div>
            <div className="card-body" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {employees.map(emp => (
                <motion.div
                  key={emp.id}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    border: selected === emp.id ? `2px solid var(--primary)` : '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    background: selected === emp.id ? 'rgba(79,70,229,.1)' : 'var(--surface)',
                    transition: 'var(--transition)',
                  }}
                  onClick={() => { setSelected(emp.id); setSlip(null); }}
                >
                  <div className="avatar avatar-sm" style={{ background: DEPT_COLORS[emp.department] || 'var(--primary)' }}>{emp.avatar || emp.name?.slice(0, 2)}</div>
                  <div>
                    <div style={{ fontSize: '.8rem', fontWeight: 700 }}>{emp.name}</div>
                    <div style={{ fontSize: '.68rem', color: 'var(--text-muted)' }}>{emp.role}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Salary Slip */}
          {slip && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Summary Stats */}
              <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 22 }}>
                {[
                  { label: 'Gross Salary', value: `₹${slip.earnings.gross.toLocaleString()}`, icon: '💼', color: '#6366F1', bg: 'rgba(99,102,241,.12)' },
                  { label: 'Deductions', value: `₹${slip.deductions.total.toLocaleString()}`, icon: '📉', color: '#EF4444', bg: 'rgba(239,68,68,.12)' },
                  { label: 'Net Pay', value: `₹${slip.netPay.toLocaleString()}`, icon: '💰', color: '#10B981', bg: 'rgba(16,185,129,.12)' },
                  { label: 'Days Worked', value: `${slip.presentDays}/${slip.workingDays}`, icon: '📅', color: '#F59E0B', bg: 'rgba(245,158,11,.12)' },
                ].map(s => (
                  <div key={s.label} className="stat-card">
                    <div className="stat-icon" style={{ background: s.bg, fontSize: '1.2rem' }}>{s.icon}</div>
                    <div className="stat-info">
                      <div className="stat-value" style={{ fontSize: '1.2rem', color: s.color }}>{s.value}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="salary-slip" ref={slipRef}>
                <div className="slip-header">
                  <div className="slip-company">🏢 EmpowerHR Solutions Pvt. Ltd.</div>
                  <div className="slip-company-sub">123 Business Park, Bangalore — 560001 | hr@empowerhr.com</div>
                  <div className="slip-title">Salary Slip</div>
                  <div className="slip-period">For the month of {slip.monthName} {slip.year}</div>
                </div>
                <div className="slip-employee-info">
                  {[
                    { label: 'Employee Name', val: slip.employee.name }, { label: 'Employee ID', val: slip.employee.id },
                    { label: 'Designation', val: slip.employee.role }, { label: 'Department', val: slip.employee.department },
                    { label: 'Join Date', val: slip.employee.joinDate }, { label: 'Bank Account', val: slip.employee.bankAccount },
                    { label: 'PAN', val: slip.employee.pan }, { label: 'Days Worked', val: `${slip.presentDays}/${slip.workingDays}` },
                  ].map(({ label, val }) => (
                    <div key={label} className="slip-info-row">
                      <span className="slip-info-label">{label}:</span>
                      <span className="slip-info-value">{val}</span>
                    </div>
                  ))}
                </div>
                <div className="tables-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                  <table className="slip-table">
                    <thead><tr><th>Earnings</th><th>Amount (₹)</th></tr></thead>
                    <tbody>
                      <tr><td>Basic Salary</td><td>₹{slip.earnings.basic.toLocaleString()}</td></tr>
                      <tr><td>HRA</td><td>₹{slip.earnings.hra.toLocaleString()}</td></tr>
                      <tr><td>Conveyance</td><td>₹{slip.earnings.conveyance.toLocaleString()}</td></tr>
                      <tr><td>Medical</td><td>₹{slip.earnings.medical.toLocaleString()}</td></tr>
                      <tr><td>Special Allowance</td><td>₹{slip.earnings.special.toLocaleString()}</td></tr>
                      <tr><td><strong>Gross Salary</strong></td><td>₹{slip.earnings.gross.toLocaleString()}</td></tr>
                    </tbody>
                  </table>
                  <table className="slip-table">
                    <thead><tr><th>Deductions</th><th>Amount (₹)</th></tr></thead>
                    <tbody>
                      <tr><td>Provident Fund (12%)</td><td>₹{slip.deductions.pf.toLocaleString()}</td></tr>
                      <tr><td>ESI (0.75%)</td><td>₹{slip.deductions.esi.toLocaleString()}</td></tr>
                      <tr><td>Professional Tax</td><td>₹{slip.deductions.tax.toLocaleString()}</td></tr>
                      <tr><td><strong>Total Deductions</strong></td><td>₹{slip.deductions.total.toLocaleString()}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="slip-net">
                  <div>
                    <div className="slip-net-label">Net Pay (Take Home)</div>
                    <div style={{ fontSize: '.78rem', opacity: .8 }}>After all deductions</div>
                  </div>
                  <div className="slip-net-value">₹{slip.netPay.toLocaleString()}</div>
                </div>
                <div className="slip-footer">
                  <p>This is a computer-generated salary slip and does not require a signature.</p>
                  <p>For queries, contact: hr@empowerhr.com | Generated on: {slip.generatedOn}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <FloatingDock />
      <Chatbot />
    </div>
  );
}
