// utils/testData.js
// ─── Shared test constants for the EmpowerHR Playwright suite ───

export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
};

export const EMPLOYEE_CREDENTIALS = {
  username: 'emp001',
  password: 'pass123',
};

export const INVALID_CREDENTIALS = {
  username: 'wronguser',
  password: 'wrongpass',
};

export const ROUTES = {
  landing:            '/',
  adminLogin:         '/admin/login',
  employeeLogin:      '/employee/login',
  adminDashboard:     '/admin/dashboard',
  adminEmployees:     '/admin/employees',
  adminSalary:        '/admin/salary',
  adminAttendance:    '/admin/attendance',
  adminPayslips:      '/admin/payslips',
  adminLeaves:        '/admin/leaves',
  adminReports:       '/admin/reports',
  employeeDashboard:  '/employee/dashboard',
  employeeProfile:    '/employee/profile',
  employeeSalary:     '/employee/salary',
  employeeAttendance: '/employee/attendance',
  employeeLeave:      '/employee/leave',
};

export const NEW_EMPLOYEE = {
  name:       'Test Employee',
  role:       'QA Engineer',
  email:      'test.employee@company.com',
  phone:      '555-9999',
  salary:     '60000',
  manager:    'Admin',
  department: 'Engineering',
};

export const UPDATED_EMPLOYEE = {
  name:   'Test Employee Updated',
  role:   'Senior QA Engineer',
  email:  'test.updated@company.com',
  phone:  '555-8888',
  salary: '70000',
};

export const VIEWPORTS = {
  desktop: { width: 1280, height: 720 },
  tablet:  { width: 768,  height: 1024 },
  mobile:  { width: 375,  height: 667 },
};

export const TIMEOUTS = {
  short:    3_000,
  medium:   8_000,
  long:     15_000,
};
