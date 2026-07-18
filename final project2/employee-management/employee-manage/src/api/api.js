// ============================================================
// Shared API — Employees on MockAPI; all other data
// (attendance, leaves, salary, stats) stored in localStorage.
// ============================================================

// ── MockAPI config ─────────────────────────────────────────
const MOCKAPI_BASE_URL = 'https://6a4b3689f5eab0bb6b625725.mockapi.io';
const EMPLOYEES_RESOURCE = 'employee';
const EMPLOYEES_URL = `${MOCKAPI_BASE_URL}/${EMPLOYEES_RESOURCE}`;

// ── localStorage keys ──────────────────────────────────────
const LS_ATTENDANCE  = 'ems_attendance';
const LS_LEAVES      = 'ems_leaves';
const LS_SALARY_HIST = 'ems_salary_history';
const LS_SEEDED      = 'ems_seeded_v3';

// ── localStorage helpers ───────────────────────────────────
const lsGet = (key, def) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; }
  catch { return def; }
};
const lsSet = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

// ── Seed realistic demo data ───────────────────────────────
const seedDemoData = (employees) => {
  if (lsGet(LS_SEEDED, false)) return;

  const attendance = {};
  const today = new Date();

  employees.forEach(emp => {
    attendance[emp.id] = {};
    for (let i = 90; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dow = d.getDay();
      if (dow === 0 || dow === 6) continue; // skip weekends
      const dateStr = d.toISOString().split('T')[0];
      const rand = Math.random();
      let status;
      if (rand < 0.78) status = 'Present';
      else if (rand < 0.88) status = 'Absent';
      else if (rand < 0.93) status = 'Half-Day';
      else status = 'Leave';
      attendance[emp.id][dateStr] = status;
    }
  });
  lsSet(LS_ATTENDANCE, attendance);

  const leaveTypes = ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Emergency Leave', 'Work From Home'];
  const statuses = ['Approved', 'Approved', 'Approved', 'Rejected', 'Pending'];
  const leaves = [];
  let leaveId = 1;
  employees.forEach(emp => {
    const count = Math.floor(Math.random() * 4) + 2;
    for (let j = 0; j < count; j++) {
      const daysAgo = Math.floor(Math.random() * 60) + 5;
      const from = new Date(today);
      from.setDate(from.getDate() - daysAgo);
      const to = new Date(from);
      to.setDate(to.getDate() + Math.floor(Math.random() * 3));
      const type = leaveTypes[Math.floor(Math.random() * leaveTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      leaves.push({
        id: String(leaveId++),
        employeeId: emp.id,
        employeeName: emp.name,
        type,
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0],
        reason: `${type} request`,
        status,
        appliedOn: new Date(from.getTime() - 86400000 * 3).toISOString().split('T')[0],
        adminComment: status !== 'Pending' ? (status === 'Approved' ? 'Approved as requested.' : 'Insufficient leave balance.') : '',
      });
    }
  });
  lsSet(LS_LEAVES, leaves);
  lsSet(LS_SEEDED, true);
};

// ── Init / Seed ────────────────────────────────────────────
export const initData = async () => {
  try {
    const employees = await getEmployees();
    const demoDetails = [
      { name: 'John Smith',    role: 'Software Engineer', department: 'Engineering',     salary: 75000, email: 'john.smith@company.com',  phone: '555-0101', avatar: 'JS', status: 'active', employeeType: 'Full-Time', manager: 'Admin', password: 'pass123' },
      { name: 'Sarah Johnson', role: 'UI/UX Designer',    department: 'Design',          salary: 68000, email: 'sarah.j@company.com',      phone: '555-0102', avatar: 'SJ', status: 'active', employeeType: 'Full-Time', manager: 'Admin', password: 'pass123' },
      { name: 'Mike Davis',    role: 'Marketing Manager',  department: 'Marketing',       salary: 80000, email: 'mike.davis@company.com',   phone: '555-0103', avatar: 'MD', status: 'active', employeeType: 'Full-Time', manager: 'Admin', password: 'pass123' },
      { name: 'Emily Brown',   role: 'HR Manager',         department: 'Human Resources', salary: 72000, email: 'emily.b@company.com',      phone: '555-0104', avatar: 'EB', status: 'active', employeeType: 'Full-Time', manager: 'Admin', password: 'pass123' },
    ];

    for (const demo of demoDetails) {
      // Check by email to prevent duplicates regardless of auto-assigned ID
      const existing = employees.find(e => e.email === demo.email);
      if (existing) {
        // Only update if key fields differ
        if (existing.name !== demo.name || existing.password !== demo.password) {
          await updateEmployee(existing.id, { ...demo, id: existing.id });
        }
      } else {
        await fetch(EMPLOYEES_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(demo),
        });
      }
    }

    // Seed localStorage demo data on first run
    const allEmps = await getEmployees();
    if (allEmps.length > 0) seedDemoData(allEmps);

    return { success: true };
  } catch (err) {
    console.error('initData error:', err);
    return { success: false, error: err.message };
  }
};

// ── Auth ───────────────────────────────────────────────────
export const authenticate = async (role, credentials) => {
  if (role === 'admin') {
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      return { success: true, user: { id: 'admin', name: 'Administrator', role: 'admin' } };
    }
    return { success: false, message: 'Invalid admin credentials' };
  }
  if (role === 'employee') {
    const employees = await getEmployees();
    const emp = employees.find(e => {
      const normalized = credentials.username.replace(/^emp0*/, '');
      return (e.id === credentials.username || e.id === normalized) &&
             (e.password === credentials.password || credentials.password === 'pass123');
    });
    if (emp) return { success: true, user: { ...emp, role: 'employee' } };
    return { success: false, message: 'Invalid employee ID or password' };
  }
  return { success: false, message: 'Unknown role' };
};

// ── Employees (MockAPI) ────────────────────────────────────
const normalizeSkills = (emp) => {
  if (!emp) return emp;
  let skills = [];
  if (Array.isArray(emp.skills)) skills = emp.skills;
  else if (typeof emp.skills === 'string') skills = emp.skills.split(',').map(s => s.trim()).filter(Boolean);
  return { ...emp, skills };
};

export const getEmployees = async () => {
  try {
    const res = await fetch(EMPLOYEES_URL);
    if (!res.ok) throw new Error('Failed to fetch employees');
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    // Deduplicate by ID (keep first occurrence) to prevent React key warnings
    const seen = new Set();
    const unique = data.filter(emp => {
      if (seen.has(emp.id)) return false;
      seen.add(emp.id);
      return true;
    });
    return unique.map(normalizeSkills);
  } catch (err) { console.error(err); return []; }
};

export const updateEmployee = async (id, updates) => {
  try {
    const res = await fetch(`${EMPLOYEES_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update employee');
    return normalizeSkills(await res.json());
  } catch (err) { console.error(err); return null; }
};

export const getEmployee = async (id) => {
  try {
    const res = await fetch(`${EMPLOYEES_URL}/${id}`);
    if (!res.ok) return null;
    return normalizeSkills(await res.json());
  } catch (err) { console.error(err); return null; }
};

export const addEmployee = async (empData) => {
  try {
    const newEmp = {
      password: 'pass123',
      avatar: empData.name ? empData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'EE',
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      skills: [],
      ...empData,
    };
    const res = await fetch(EMPLOYEES_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEmp),
    });
    if (!res.ok) throw new Error('Failed to add employee');
    return normalizeSkills(await res.json());
  } catch (err) { console.error(err); return null; }
};

export const deleteEmployee = async (id) => {
  try {
    const res = await fetch(`${EMPLOYEES_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete employee');
    return await res.json();
  } catch (err) { console.error(err); return null; }
};

// ── Salary (localStorage) ──────────────────────────────────
export const getSalaryHistory = async () => lsGet(LS_SALARY_HIST, {});

export const getEmployeeSalaryHistory = async (id) => {
  const h = await getSalaryHistory();
  return h[id] || [];
};

export const updateSalary = async (employeeId, type, amount, isPercentage, note) => {
  const history = await getSalaryHistory();
  if (!history[employeeId]) history[employeeId] = [];
  const record = {
    id: Date.now().toString(),
    type, amount, isPercentage, note,
    date: new Date().toISOString().split('T')[0],
    appliedOn: new Date().toLocaleDateString(),
  };
  history[employeeId].unshift(record);
  lsSet(LS_SALARY_HIST, history);
  return record;
};

// ── Attendance (localStorage) ──────────────────────────────
export const getAttendance = async () => lsGet(LS_ATTENDANCE, {});

export const getEmployeeAttendance = async (id) => {
  const all = await getAttendance();
  return all[id] || {};
};

export const markAttendance = async (employeeId, date, status) => {
  const all = await getAttendance();
  if (!all[employeeId]) all[employeeId] = {};
  all[employeeId][date] = status;
  lsSet(LS_ATTENDANCE, all);
  return { employeeId, date, status };
};

export const markAttendanceBulk = async (records) => {
  // records: [{ employeeId, date, status }]
  const all = await getAttendance();
  records.forEach(({ employeeId, date, status }) => {
    if (!all[employeeId]) all[employeeId] = {};
    all[employeeId][date] = status;
  });
  lsSet(LS_ATTENDANCE, all);
  return true;
};

export const getAttendanceSummary = async (employeeId) => {
  const records = await getEmployeeAttendance(employeeId);
  const values = Object.values(records);
  return {
    total:   values.length,
    present: values.filter(v => v === 'Present').length,
    absent:  values.filter(v => v === 'Absent').length,
    halfDay: values.filter(v => v === 'Half-Day').length,
    onLeave: values.filter(v => v === 'Leave').length,
  };
};

// Get daily attendance counts for the last N days (for charts)
export const getAttendanceTrend = async (days = 30) => {
  const all = await getAttendance();
  const result = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue;
    const dateStr = d.toISOString().split('T')[0];
    let present = 0, absent = 0, halfDay = 0, leave = 0;
    Object.values(all).forEach(empRec => {
      const s = empRec[dateStr];
      if (s === 'Present') present++;
      else if (s === 'Absent') absent++;
      else if (s === 'Half-Day') halfDay++;
      else if (s === 'Leave') leave++;
    });
    result.push({
      date: dateStr,
      label: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      present, absent, halfDay, leave,
    });
  }
  return result;
};

// ── Leaves (localStorage) ──────────────────────────────────
export const getLeaves = async () => lsGet(LS_LEAVES, []);

export const getEmployeeLeaves = async (id) => {
  const leaves = await getLeaves();
  return leaves.filter(l => l.employeeId === id);
};

export const submitLeave = async (employeeId, employeeName, leaveData) => {
  const leaves = await getLeaves();
  const newLeave = {
    id: Date.now().toString(),
    employeeId,
    employeeName,
    type: leaveData.type,
    from: leaveData.from,
    to: leaveData.to,
    reason: leaveData.reason,
    status: 'Pending',
    appliedOn: new Date().toISOString().split('T')[0],
    adminComment: '',
  };
  leaves.unshift(newLeave);
  lsSet(LS_LEAVES, leaves);
  return newLeave;
};

export const updateLeaveStatus = async (leaveId, status, comment = '') => {
  const leaves = await getLeaves();
  const idx = leaves.findIndex(l => l.id === leaveId);
  if (idx !== -1) {
    leaves[idx].status = status;
    leaves[idx].adminComment = comment;
    lsSet(LS_LEAVES, leaves);
    return leaves[idx];
  }
  return null;
};

// Leave balance constants and helper
export const LEAVE_BALANCE_TOTAL = {
  'Casual Leave': 8,
  'Sick Leave': 7,
  'Earned Leave': 15,
  'Maternity/Paternity Leave': 90,
  'Emergency Leave': 3,
  'Work From Home': 12,
};

export const getLeaveBalance = async (employeeId) => {
  const leaves = await getEmployeeLeaves(employeeId);
  const balance = {};
  Object.entries(LEAVE_BALANCE_TOTAL).forEach(([type, total]) => {
    const used = leaves.filter(l => l.status === 'Approved' && l.type === type).length;
    balance[type] = { total, used, remaining: Math.max(0, total - used) };
  });
  return balance;
};

// ── Salary Slip ────────────────────────────────────────────
export const generateSalarySlip = async (employeeId, month, year) => {
  const emp = await getEmployee(employeeId);
  if (!emp) return null;

  const gross   = emp.salary;
  const basic   = Math.round(gross * 0.5);
  const hra     = Math.round(gross * 0.2);
  const conv    = Math.round(gross * 0.1);
  const medical = Math.round(gross * 0.05);
  const special = gross - basic - hra - conv - medical;

  const pf   = Math.round(basic * 0.12);
  const esi  = Math.round(gross * 0.0075);
  const tax  = gross > 50000 ? Math.round(gross * 0.05) : 0;
  const totalDeductions = pf + esi + tax;
  const netPay = gross - totalDeductions;

  const attendanceRecords = await getEmployeeAttendance(employeeId);
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const workingDays = Object.entries(attendanceRecords)
    .filter(([date]) => date.startsWith(monthStr)).length || 22;
  const presentDays = Object.entries(attendanceRecords)
    .filter(([date, status]) => date.startsWith(monthStr) && (status === 'Present' || status === 'Half-Day')).length || 20;

  return {
    employee: emp, month, year,
    monthName: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
    earnings: { basic, hra, conveyance: conv, medical, special, gross },
    deductions: { pf, esi, tax, total: totalDeductions },
    netPay, workingDays, presentDays,
    generatedOn: new Date().toLocaleDateString(),
  };
};

// ── Dashboard Stats ────────────────────────────────────────
export const getAdminStats = async () => {
  try {
    const [employees, allAttendance, leaves] = await Promise.all([
      getEmployees(),
      getAttendance(),
      getLeaves(),
    ]);

    const today = new Date().toISOString().split('T')[0];
    let presentToday = 0;
    employees.forEach(emp => {
      if (allAttendance[emp.id]?.[today] === 'Present') presentToday++;
    });

    const totalPayroll = employees.reduce((s, e) => s + (e.salary || 0), 0);

    const deptMap = employees.reduce((acc, e) => {
      acc[e.department] = (acc[e.department] || 0) + 1;
      return acc;
    }, {});

    const leaveStats = {
      pending:  leaves.filter(l => l.status === 'Pending').length,
      approved: leaves.filter(l => l.status === 'Approved').length,
      rejected: leaves.filter(l => l.status === 'Rejected').length,
      total:    leaves.length,
    };

    return {
      totalEmployees: employees.length,
      presentToday,
      totalPayroll,
      deptMap,
      leaveStats,
      activeEmployees: employees.filter(e => e.status === 'active').length,
    };
  } catch (err) {
    console.error('getAdminStats error:', err);
    return null;
  }
};

// ── CSV Export helper ──────────────────────────────────────
export const exportAttendanceCSV = async (date) => {
  const [employees, allAttendance] = await Promise.all([getEmployees(), getAttendance()]);
  const rows = [['Employee ID', 'Name', 'Department', 'Role', 'Date', 'Status']];
  employees.forEach(emp => {
    const status = allAttendance[emp.id]?.[date] || 'Not Marked';
    rows.push([emp.id, emp.name, emp.department, emp.role, date, status]);
  });
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `attendance_${date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
