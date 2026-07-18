// scripts/cleanupMockApi.js
// Run: node scripts/cleanupMockApi.js
// Cleans up MockAPI and keeps only the 4 core demo employees

const MOCKAPI_BASE_URL = 'https://6a4b3689f5eab0bb6b625725.mockapi.io';
const EMPLOYEES_URL = `${MOCKAPI_BASE_URL}/employee`;

const CORE_EMPLOYEES = [
  { name: 'John Smith',    role: 'Software Engineer', department: 'Engineering',     salary: 75000, email: 'john.smith@company.com',  phone: '555-0101', avatar: 'JS', status: 'active', employeeType: 'Full-Time', manager: 'Admin', password: 'pass123' },
  { name: 'Sarah Johnson', role: 'UI/UX Designer',    department: 'Design',          salary: 68000, email: 'sarah.j@company.com',      phone: '555-0102', avatar: 'SJ', status: 'active', employeeType: 'Full-Time', manager: 'Admin', password: 'pass123' },
  { name: 'Mike Davis',    role: 'Marketing Manager', department: 'Marketing',        salary: 80000, email: 'mike.davis@company.com',   phone: '555-0103', avatar: 'MD', status: 'active', employeeType: 'Full-Time', manager: 'Admin', password: 'pass123' },
  { name: 'Emily Brown',   role: 'HR Manager',         department: 'Human Resources', salary: 72000, email: 'emily.b@company.com',      phone: '555-0104', avatar: 'EB', status: 'active', employeeType: 'Full-Time', manager: 'Admin', password: 'pass123' },
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function cleanup() {
  console.log('Fetching all employees from MockAPI...');
  
  let allEmployees = [];
  try {
    const res = await fetch(`${EMPLOYEES_URL}?limit=200`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    allEmployees = await res.json();
    console.log(`Found ${allEmployees.length} total records.`);
  } catch (err) {
    console.error('Failed to fetch employees:', err.message);
    process.exit(1);
  }

  // Delete all records
  console.log('\nDeleting all existing records...');
  let deleted = 0;
  for (const emp of allEmployees) {
    try {
      const res = await fetch(`${EMPLOYEES_URL}/${emp.id}`, { method: 'DELETE' });
      if (res.ok) {
        deleted++;
        process.stdout.write(`\rDeleted ${deleted}/${allEmployees.length}`);
      } else {
        console.warn(`\nFailed to delete ${emp.id}: HTTP ${res.status}`);
      }
      await sleep(200);
    } catch (err) {
      console.warn(`\nError deleting ${emp.id}:`, err.message);
    }
  }
  console.log(`\nDeleted ${deleted} records.`);

  // Re-create the 4 core employees
  console.log('\nCreating core seed employees...');
  for (const emp of CORE_EMPLOYEES) {
    try {
      const res = await fetch(EMPLOYEES_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emp),
      });
      if (res.ok) {
        const created = await res.json();
        console.log(`  Created: ${created.name} (id: ${created.id})`);
      } else {
        console.error(`  Failed to create ${emp.name}: HTTP ${res.status}`);
      }
      await sleep(300);
    } catch (err) {
      console.error(`  Error creating ${emp.name}:`, err.message);
    }
  }

  // Verify
  console.log('\nVerifying final state...');
  const verifyRes = await fetch(`${EMPLOYEES_URL}?limit=50`);
  const final = await verifyRes.json();
  console.log(`MockAPI now has ${final.length} employees:`);
  final.forEach(e => console.log(`  - [${e.id}] ${e.name} (${e.email})`));
  console.log('\nCleanup complete!');
}

cleanup().catch(console.error);
