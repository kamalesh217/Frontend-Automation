import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');

const app = express();
app.use(cors());
app.use(express.json());

// ── Initial Seed Data ──────────────────────────────────────────
const SEED_EMPLOYEES = [
  {
    id: 'emp001',
    password: 'pass123',
    name: 'John Smith',
    email: 'john.smith@company.com',
    phone: '+91 98765 43210',
    department: 'Engineering',
    role: 'Software Engineer',
    joinDate: '2022-03-15',
    salary: 75000,
    avatar: 'JS',
    status: 'active',
    address: '123 Tech Park, Bangalore',
    manager: 'Admin',
    employeeType: 'Full-Time',
    skills: ['React', 'Node.js', 'Python'],
    bankAccount: 'XXXX-XXXX-1234',
    pan: 'ABCDE1234F',
  },
  {
    id: 'emp002',
    password: 'pass123',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    phone: '+91 87654 32109',
    department: 'Design',
    role: 'UI/UX Designer',
    joinDate: '2021-07-20',
    salary: 65000,
    avatar: 'SJ',
    status: 'active',
    address: '456 Creative Hub, Mumbai',
    manager: 'Admin',
    employeeType: 'Full-Time',
    skills: ['Figma', 'Photoshop', 'Illustrator'],
    bankAccount: 'XXXX-XXXX-5678',
    pan: 'FGHIJ5678K',
  },
  {
    id: 'emp003',
    password: 'pass123',
    name: 'Mike Davis',
    email: 'mike.davis@company.com',
    phone: '+91 76543 21098',
    department: 'Marketing',
    role: 'Marketing Manager',
    joinDate: '2020-11-10',
    salary: 80000,
    avatar: 'MD',
    status: 'active',
    address: '789 Business Bay, Delhi',
    manager: 'Admin',
    employeeType: 'Full-Time',
    skills: ['SEO', 'Content Strategy', 'Analytics'],
    bankAccount: 'XXXX-XXXX-9012',
    pan: 'KLMNO9012P',
  },
  {
    id: 'emp004',
    password: 'pass123',
    name: 'Emily Brown',
    email: 'emily.brown@company.com',
    phone: '+91 65432 10987',
    department: 'Human Resources',
    role: 'HR Manager',
    joinDate: '2019-05-01',
    salary: 70000,
    avatar: 'EB',
    status: 'active',
    address: '321 Corporate Tower, Hyderabad',
    manager: 'Admin',
    employeeType: 'Full-Time',
    skills: ['Recruitment', 'Payroll', 'Training'],
    bankAccount: 'XXXX-XXXX-3456',
    pan: 'QRSTU3456V',
  },
];

const generateAttendance = () => {
  const records = {};
  const statuses = ['Present', 'Present', 'Present', 'Absent', 'Half-Day', 'Present', 'Present', 'Leave'];
  const today = new Date();
  SEED_EMPLOYEES.forEach(emp => {
    records[emp.id] = {};
    for (let d = 0; d < 60; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - d);
      const day = date.getDay();
      if (day === 0 || day === 6) continue; // skip weekends
      const dateStr = date.toISOString().split('T')[0];
      records[emp.id][dateStr] = statuses[Math.floor(Math.random() * statuses.length)];
    }
  });
  return records;
};

const generateSalaryHistory = () => {
  const history = {};
  SEED_EMPLOYEES.forEach(emp => {
    history[emp.id] = [
      { date: '2024-01-01', type: 'increment', amount: 5000, percentage: null, note: 'Annual increment', by: 'admin' },
      { date: '2023-07-01', type: 'increment', amount: 3000, percentage: null, note: 'Performance bonus', by: 'admin' },
    ];
  });
  return history;
};

const generateLeaves = () => {
  const leaves = [];
  const today = new Date();
  SEED_EMPLOYEES.forEach((emp, i) => {
    const from = new Date(today);
    from.setDate(today.getDate() - (i + 1) * 5);
    const to = new Date(from);
    to.setDate(from.getDate() + 1);
    leaves.push({
      id: `leave_${emp.id}_1`,
      employeeId: emp.id,
      employeeName: emp.name,
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
      reason: 'Personal work',
      type: 'Casual Leave',
      status: i % 2 === 0 ? 'Approved' : 'Pending',
      appliedOn: from.toISOString().split('T')[0],
    });
  });
  return leaves;
};

// ── DB Helpers ────────────────────────────────────────────────
async function readDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    // If not exists, initialize
    return await initDB();
  }
}

async function writeDB(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

async function initDB() {
  const initialData = {
    employees: SEED_EMPLOYEES,
    attendance: generateAttendance(),
    salaryHistory: generateSalaryHistory(),
    leaves: generateLeaves(),
  };
  await writeDB(initialData);
  return initialData;
}

// Ensure database is initialized at start
await readDB();

// ── Endpoints ────────────────────────────────────────────────
app.post('/api/init', async (req, res) => {
  const db = await initDB();
  res.json({ success: true, message: 'Database reset to seed data' });
});

// Employees Endpoints
app.get('/api/employees', async (req, res) => {
  const db = await readDB();
  res.json(db.employees);
});

app.get('/api/employees/:id', async (req, res) => {
  const db = await readDB();
  const employee = db.employees.find(e => e.id === req.params.id);
  if (employee) {
    res.json(employee);
  } else {
    res.status(404).json({ error: 'Employee not found' });
  }
});

app.post('/api/employees', async (req, res) => {
  const db = await readDB();
  const empData = req.body;

  // Calculate new ID based on current max ID numeric suffix
  const numericIds = db.employees
    .map(e => parseInt(e.id.replace('emp', ''), 10))
    .filter(n => !isNaN(n));
  const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
  const newId = `emp${String(maxId + 1).padStart(3, '0')}`;

  const newEmp = {
    id: newId,
    password: 'pass123', // default employee password
    avatar: empData.name ? empData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'EE',
    status: 'active',
    joinDate: new Date().toISOString().split('T')[0],
    skills: [],
    ...empData,
  };

  db.employees.push(newEmp);

  // Initialize empty attendance record for consistency
  if (!db.attendance) db.attendance = {};
  db.attendance[newId] = {};

  // Initialize salary history
  if (!db.salaryHistory) db.salaryHistory = {};
  db.salaryHistory[newId] = [
    {
      date: newEmp.joinDate,
      type: 'increment',
      amount: newEmp.salary,
      percentage: null,
      note: 'Initial joining salary',
      by: 'admin',
    }
  ];

  await writeDB(db);
  res.status(201).json(newEmp);
});

app.put('/api/employees/:id', async (req, res) => {
  const db = await readDB();
  const idx = db.employees.findIndex(e => e.id === req.params.id);
  if (idx !== -1) {
    db.employees[idx] = { ...db.employees[idx], ...req.body };
    await writeDB(db);
    res.json(db.employees[idx]);
  } else {
    res.status(404).json({ error: 'Employee not found' });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  const db = await readDB();
  const id = req.params.id;
  
  db.employees = db.employees.filter(e => e.id !== id);

  // Clean up attendance records
  if (db.attendance && db.attendance[id]) {
    delete db.attendance[id];
  }

  // Clean up salary history
  if (db.salaryHistory && db.salaryHistory[id]) {
    delete db.salaryHistory[id];
  }

  // Clean up leave requests
  if (db.leaves) {
    db.leaves = db.leaves.filter(l => l.employeeId !== id);
  }

  await writeDB(db);
  res.json({ success: true, message: `Employee ${id} deleted` });
});

// Salary Endpoints
app.get('/api/salary-history', async (req, res) => {
  const db = await readDB();
  res.json(db.salaryHistory || {});
});

app.post('/api/salary-history', async (req, res) => {
  const { employeeId, type, amount, isPercentage, note } = req.body;
  const db = await readDB();
  const idx = db.employees.findIndex(e => e.id === employeeId);
  if (idx === -1) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  const currentSalary = db.employees[idx].salary;
  let delta = isPercentage ? Math.round((currentSalary * amount) / 100) : amount;
  if (type === 'decrement') delta = -Math.abs(delta);

  db.employees[idx].salary = Math.max(0, currentSalary + delta);

  if (!db.salaryHistory) db.salaryHistory = {};
  if (!db.salaryHistory[employeeId]) db.salaryHistory[employeeId] = [];

  db.salaryHistory[employeeId].unshift({
    date: new Date().toISOString().split('T')[0],
    type,
    amount: Math.abs(delta),
    percentage: isPercentage ? amount : null,
    previousSalary: currentSalary,
    newSalary: db.employees[idx].salary,
    note,
    by: 'admin',
  });

  await writeDB(db);
  res.json(db.employees[idx]);
});

// Attendance Endpoints
app.get('/api/attendance', async (req, res) => {
  const db = await readDB();
  res.json(db.attendance || {});
});

app.post('/api/attendance', async (req, res) => {
  const { employeeId, date, status } = req.body;
  const db = await readDB();

  if (!db.attendance) db.attendance = {};
  if (!db.attendance[employeeId]) db.attendance[employeeId] = {};

  db.attendance[employeeId][date] = status;
  await writeDB(db);
  res.json({ success: true });
});

// Leaves Endpoints
app.get('/api/leaves', async (req, res) => {
  const db = await readDB();
  res.json(db.leaves || []);
});

app.post('/api/leaves', async (req, res) => {
  const { employeeId, employeeName, leaveData } = req.body;
  const db = await readDB();

  const newLeave = {
    id: `leave_${employeeId}_${Date.now()}`,
    employeeId,
    employeeName,
    ...leaveData,
    status: 'Pending',
    appliedOn: new Date().toISOString().split('T')[0],
  };

  if (!db.leaves) db.leaves = [];
  db.leaves.push(newLeave);
  await writeDB(db);
  res.status(201).json(newLeave);
});

app.put('/api/leaves/:id', async (req, res) => {
  const leaveId = req.params.id;
  const { status } = req.body;
  const db = await readDB();

  if (!db.leaves) db.leaves = [];
  const idx = db.leaves.findIndex(l => l.id === leaveId);
  if (idx !== -1) {
    db.leaves[idx].status = status;
    await writeDB(db);
    res.json(db.leaves[idx]);
  } else {
    res.status(404).json({ error: 'Leave not found' });
  }
});

// Admin Stats
app.get('/api/stats', async (req, res) => {
  const db = await readDB();
  const employees = db.employees || [];
  const attendance = db.attendance || {};
  const leaves = db.leaves || [];
  const today = new Date().toISOString().split('T')[0];

  let presentToday = 0;
  employees.forEach(emp => {
    if (attendance[emp.id] && attendance[emp.id][today] === 'Present') presentToday++;
  });

  const totalPayroll = employees.reduce((sum, e) => sum + e.salary, 0);
  const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;

  res.json({
    totalEmployees: employees.length,
    totalPayroll,
    presentToday,
    pendingLeaves,
    departments: [...new Set(employees.map(e => e.department))].length,
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
