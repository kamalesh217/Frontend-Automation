import { useState, useEffect, useRef } from 'react';
import { Download, Printer, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import FloatingDock from '../../components/FloatingDock';
import Chatbot from '../../components/Chatbot';
import { generateSalarySlip } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function MySalarySlip() {
  const { user } = useAuth();
  const [month, setMonth]   = useState(new Date().getMonth() + 1);
  const [year, setYear]     = useState(new Date().getFullYear());
  const [slip, setSlip]     = useState(null);
  const slipRef             = useRef(null);

  useEffect(() => {
    if (user?.id) {
      generateSalarySlip(user.id, month, year).then(setSlip);
    }
  }, [user, month, year]);

  const shiftMonth = (n) => {
    let m = month + n, y = year;
    if (m > 12) { m = 1;  y += 1; }
    if (m < 1)  { m = 12; y -= 1; }
    setMonth(m);
    setYear(y);
  };

  const handlePrint = () => {
    if (!slipRef.current) return;
    const printContent = slipRef.current.innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
      <head>
        <title>Salary Slip — ${slip?.employee?.name} — ${slip?.monthName} ${slip?.year}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; padding: 30px; color: #0F172A; }
          .slip-header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #4F46E5; margin-bottom: 20px; }
          .slip-company { font-size: 22px; font-weight: 900; color: #4F46E5; }
          .slip-company-sub { font-size: 12px; color: #64748B; margin-top: 4px; }
          .slip-title { font-size: 14px; font-weight: 700; margin-top: 14px; text-transform: uppercase; letter-spacing: .08em; color: #4F46E5; }
          .slip-period { font-size: 12px; color: #64748B; }
          .slip-employee-info { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: #F1F5F9; padding: 14px; border-radius: 8px; margin-bottom: 20px; }
          .slip-info-row { display: flex; gap: 8px; font-size: 12px; }
          .slip-info-label { color: #64748B; min-width: 110px; }
          .slip-info-value { font-weight: 700; color: #0F172A; }
          .tables-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #4F46E5; color: #fff; padding: 8px 12px; text-align: left; font-size: 12px; }
          th:last-child { text-align: right; }
          td { padding: 8px 12px; border-bottom: 1px solid #E2E8F0; font-size: 12px; color: #334155; }
          td:last-child { text-align: right; font-weight: 600; }
          tr.total-row td { font-weight: 800; background: #F1F5F9; border-bottom: none; color: #0F172A; }
          .slip-net { background: linear-gradient(135deg, #4F46E5, #06B6D4); color: #fff; padding: 16px 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
          .slip-net-label { font-size: 13px; font-weight: 600; }
          .slip-net-value { font-size: 22px; font-weight: 900; }
          .slip-footer { text-align: center; font-size: 11px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 12px; margin-top: 16px; }
        </style>
      </head>
      <body>${printContent}</body>
      </html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 300);
  };

  if (!slip) return (
    <div className="app-layout">
      <div className="animated-bg"><div className="blob blob-1" /><div className="blob blob-2" /></div>
      <div className="dot-grid" />
      <Navbar />
      <Sidebar role="employee" />
      <div className="main-content">
        <div className="page-content" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:400 }}>
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <h3>Loading...</h3>
          </div>
        </div>
      </div>
      <FloatingDock />
    </div>
  );

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
              <h1>My Salary Slip</h1>
              <p>Detailed salary breakdown for {slip.monthName} {slip.year}</p>
            </div>
            <div style={{ display:'flex', gap:12 }}>
              <button id="download-slip-btn" className="btn btn-primary" onClick={handlePrint}>
                <Download size={16} /> Download PDF
              </button>
              <button id="print-slip-btn" className="btn btn-outline" onClick={handlePrint}>
                <Printer size={16} /> Print
              </button>
            </div>
          </div>

          {/* Month Navigator */}
          <div className="card mb-24">
            <div className="card-body" style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <button id="prev-slip-month" className="btn btn-outline btn-icon" onClick={() => shiftMonth(-1)}>
                <ChevronLeft size={18} />
              </button>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:'1.2rem', fontWeight:800, color:'var(--primary)' }}>
                  {MONTHS[month - 1]} {year}
                </div>
                <div style={{ fontSize:'.78rem', color:'var(--text-secondary)' }}>Salary Period</div>
              </div>
              <button id="next-slip-month" className="btn btn-outline btn-icon" onClick={() => shiftMonth(1)}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Quick Summary Cards */}
          <div className="stat-grid" style={{ gridTemplateColumns:'repeat(4,1fr)', marginBottom:24 }}>
            {[
              { label:'Gross Salary',   value:`₹${slip.earnings.gross.toLocaleString()}`,  color:'var(--primary)', bg:'rgba(79,70,229,.12)', icon:'💼' },
              { label:'Deductions',     value:`₹${slip.deductions.total.toLocaleString()}`, color:'var(--danger)', bg:'var(--danger-surface)', icon:'📉' },
              { label:'Net Pay',        value:`₹${slip.netPay.toLocaleString()}`,           color:'var(--success)', bg:'var(--success-surface)', icon:'💰' },
              { label:'Days Worked',    value:`${slip.presentDays}/${slip.workingDays}`,    color:'var(--accent)', bg:'rgba(245,158,11,.12)', icon:'📅' },
            ].map(s => (
              <div className="stat-card" key={s.label} style={{ '--stat-accent':s.color }}>
                <div className="stat-icon" style={{ background:s.bg, color:s.color }}><span style={{ fontSize:'1.3rem' }}>{s.icon}</span></div>
                <div className="stat-info">
                  <div className="stat-value" style={{ fontSize:'1.3rem', color:s.color }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Printable Salary Slip */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="salary-slip" ref={slipRef} style={{ width: '100%', maxWidth: '700px' }}>

              {/* Header */}
              <div className="slip-header">
                <div className="slip-company">🏢 EmpowerHR Solutions Pvt. Ltd.</div>
                <div className="slip-company-sub">
                  123 Business Park, Bangalore — 560001 &nbsp;|&nbsp; hr@empowerhr.com &nbsp;|&nbsp; +91 1800-000-EMPOWER
                </div>
                <div className="slip-title">Salary Slip</div>
                <div className="slip-period">For the month of {slip.monthName} {slip.year}</div>
              </div>

              {/* Employee Info Grid */}
              <div className="slip-employee-info">
                {[
                  { label:'Employee Name',  val: slip.employee.name },
                  { label:'Employee ID',    val: slip.employee.id },
                  { label:'Designation',    val: slip.employee.role },
                  { label:'Department',     val: slip.employee.department },
                  { label:'Date of Joining',val: slip.employee.joinDate },
                  { label:'Employee Type',  val: slip.employee.employeeType },
                  { label:'Bank Account',   val: slip.employee.bankAccount },
                  { label:'PAN Number',     val: slip.employee.pan },
                  { label:'Working Days',   val: slip.workingDays },
                  { label:'Days Present',   val: slip.presentDays },
                ].map(({ label, val }) => (
                  <div key={label} className="slip-info-row">
                    <span className="slip-info-label">{label}:</span>
                    <span className="slip-info-value">{val}</span>
                  </div>
                ))}
              </div>

              {/* Earnings & Deductions Side by Side */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }} className="tables-row">
                <table className="slip-table">
                  <thead>
                    <tr><th>Earnings Component</th><th>Amount (₹)</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>Basic Salary (50%)</td><td>₹{slip.earnings.basic.toLocaleString()}</td></tr>
                    <tr><td>House Rent Allowance</td><td>₹{slip.earnings.hra.toLocaleString()}</td></tr>
                    <tr><td>Conveyance Allowance</td><td>₹{slip.earnings.conveyance.toLocaleString()}</td></tr>
                    <tr><td>Medical Allowance</td><td>₹{slip.earnings.medical.toLocaleString()}</td></tr>
                    <tr><td>Special Allowance</td><td>₹{slip.earnings.special.toLocaleString()}</td></tr>
                    <tr className="total-row"><td><strong>Gross Earnings</strong></td><td><strong>₹{slip.earnings.gross.toLocaleString()}</strong></td></tr>
                  </tbody>
                </table>

                <table className="slip-table">
                  <thead>
                    <tr><th>Deductions</th><th>Amount (₹)</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>Provident Fund (12% of Basic)</td><td>₹{slip.deductions.pf.toLocaleString()}</td></tr>
                    <tr><td>ESI (0.75% of Gross)</td><td>₹{slip.deductions.esi.toLocaleString()}</td></tr>
                    <tr><td>Professional Tax</td><td>₹{slip.deductions.tax.toLocaleString()}</td></tr>
                    <tr className="total-row"><td><strong>Total Deductions</strong></td><td><strong>₹{slip.deductions.total.toLocaleString()}</strong></td></tr>
                  </tbody>
                </table>
              </div>

              {/* Net Pay */}
              <div className="slip-net">
                <div>
                  <div className="slip-net-label">Net Pay (Take Home Salary)</div>
                  <div style={{ fontSize:'.8rem', opacity:.75, marginTop:4 }}>
                    Gross ₹{slip.earnings.gross.toLocaleString()} − Deductions ₹{slip.deductions.total.toLocaleString()}
                  </div>
                </div>
                <div className="slip-net-value">₹{slip.netPay.toLocaleString()}</div>
              </div>

              {/* Amount in Words */}
              <div style={{ background:'var(--surface)', border: '1px solid var(--border)', borderRadius:10, padding:'12px 16px', marginBottom:20, fontSize:'.82rem' }}>
                <span style={{ color:'var(--text-secondary)' }}>Net Pay in Words: </span>
                <span style={{ fontWeight:700, color:'var(--text-primary)' }}>
                  Rupees {numberToWords(slip.netPay)} Only
                </span>
              </div>

              {/* Footer Info */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:20 }} className="info-pair">
                {[
                  { label:'Payment Mode', val:'Bank Transfer' },
                  { label:'Payment Date', val:`${slip.year}-${String(slip.month).padStart(2,'0')}-28` },
                  { label:'Generated On', val: slip.generatedOn },
                ].map(({ label, val }) => (
                  <div key={label} style={{ textAlign:'center', padding:'10px', background:'var(--surface)', border: '1px solid var(--border)', borderRadius:8 }}>
                    <div style={{ fontSize:'.7rem', color:'var(--text-muted)', marginBottom:4 }}>{label}</div>
                    <div style={{ fontWeight:700, fontSize:'.82rem' }}>{val}</div>
                  </div>
                ))}
              </div>

              {/* Signatures */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:40, marginBottom:20, paddingTop:20 }}>
                <div style={{ borderTop:'1.5px dashed var(--border)', paddingTop:10, textAlign:'center', fontSize:'.78rem', color:'var(--text-muted)' }}>
                  Employee Signature
                </div>
                <div style={{ borderTop:'1.5px dashed var(--border)', paddingTop:10, textAlign:'center', fontSize:'.78rem', color:'var(--text-muted)' }}>
                  Authorized Signatory
                </div>
              </div>

              <div className="slip-footer">
                <p>This is a computer-generated salary slip and does not require a physical signature.</p>
                <p>For any discrepancies, please contact HR at hr@empowerhr.com within 7 days of receipt.</p>
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

// Simple number to words (for amounts up to lakhs)
function numberToWords(n) {
  if (n === 0) return 'Zero';
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  const convert = (num) => {
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num/10)] + (num%10 ? ' ' + ones[num%10] : '');
    if (num < 1000) return ones[Math.floor(num/100)] + ' Hundred' + (num%100 ? ' ' + convert(num%100) : '');
    if (num < 100000) return convert(Math.floor(num/1000)) + ' Thousand' + (num%1000 ? ' ' + convert(num%1000) : '');
    return convert(Math.floor(num/100000)) + ' Lakh' + (num%100000 ? ' ' + convert(num%100000) : '');
  };
  return convert(Math.round(n));
}
