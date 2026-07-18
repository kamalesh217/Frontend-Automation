// tests/auth.spec.js
// ─── Authentication Tests ─────────────────────────────────────
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import {
  ADMIN_CREDENTIALS,
  EMPLOYEE_CREDENTIALS,
  INVALID_CREDENTIALS,
  ROUTES,
} from '../utils/testData.js';

test.describe('Authentication — Admin Portal', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page, 'admin');
    await loginPage.gotoAdminLogin();
  });

  test('Admin login page renders correctly', async ({ page }) => {
    await expect(page.getByTestId('admin-login-page')).toBeVisible();
    await expect(page.getByTestId('username-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('login-button')).toBeVisible();
    await expect(page.getByTestId('login-button')).toContainText('Sign In');
  });

  test('Valid admin login redirects to dashboard', async ({ page }) => {
    await loginPage.login(ADMIN_CREDENTIALS.username, ADMIN_CREDENTIALS.password);
    await loginPage.waitForAdminDashboard();
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
  });

  test('Invalid admin credentials shows error message', async ({ page }) => {
    await loginPage.login(INVALID_CREDENTIALS.username, INVALID_CREDENTIALS.password);
    await expect(page.getByTestId('login-error')).toBeVisible();
    const errText = await loginPage.getErrorMessage();
    expect(errText).toBeTruthy();
    // Should stay on login page
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('Empty credentials shows browser validation', async ({ page }) => {
    await page.getByTestId('login-button').click();
    // HTML5 required prevents form submission — still on login page
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('Password field is masked by default', async ({ page }) => {
    const pwdInput = page.getByTestId('password-input');
    await expect(pwdInput).toHaveAttribute('type', 'password');
  });
});

test.describe('Authentication — Employee Portal', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page, 'employee');
    await loginPage.gotoEmployeeLogin();
  });

  test('Employee login page renders correctly', async ({ page }) => {
    await expect(page.getByTestId('employee-login-page')).toBeVisible();
    await expect(page.getByTestId('username-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('login-button')).toBeVisible();
  });

  test('Valid employee login redirects to employee dashboard', async ({ page }) => {
    await loginPage.login(EMPLOYEE_CREDENTIALS.username, EMPLOYEE_CREDENTIALS.password);
    await loginPage.waitForEmployeeDashboard();
    await expect(page).toHaveURL(/\/employee\/dashboard/);
  });

  test('Invalid employee credentials shows error', async ({ page }) => {
    await loginPage.login('bad_id', 'badpassword');
    await expect(page.getByTestId('login-error')).toBeVisible();
    await expect(page).toHaveURL(/\/employee\/login/);
  });
});

test.describe('Authentication — Logout', () => {
  test('Admin can logout and is redirected to landing', async ({ page }) => {
    const loginPage = new LoginPage(page, 'admin');
    await loginPage.adminLogin(ADMIN_CREDENTIALS.username, ADMIN_CREDENTIALS.password);
    await loginPage.waitForAdminDashboard();

    const dashboard = new DashboardPage(page);
    await dashboard.logout();

    await expect(page).toHaveURL(ROUTES.landing);
    await expect(page.getByTestId('landing-page')).toBeVisible();
  });

  test('After logout protected route redirects to login', async ({ page }) => {
    // Login then logout
    const loginPage = new LoginPage(page, 'admin');
    await loginPage.adminLogin(ADMIN_CREDENTIALS.username, ADMIN_CREDENTIALS.password);
    await loginPage.waitForAdminDashboard();

    const dashboard = new DashboardPage(page);
    await dashboard.logout();

    // Try to access protected route directly
    await page.goto(ROUTES.adminDashboard);
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

test.describe('Authentication — Landing Page', () => {
  test('Landing page shows both portal options', async ({ page }) => {
    await page.goto(ROUTES.landing);
    await expect(page.getByTestId('landing-page')).toBeVisible();
    await expect(page.getByTestId('admin-portal-btn')).toBeVisible();
    await expect(page.getByTestId('employee-portal-btn')).toBeVisible();
  });

  test('Admin portal card navigates to admin login', async ({ page }) => {
    await page.goto(ROUTES.landing);
    await page.getByTestId('admin-portal-btn').click();
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('Employee portal card navigates to employee login', async ({ page }) => {
    await page.goto(ROUTES.landing);
    await page.getByTestId('employee-portal-btn').click();
    await expect(page).toHaveURL(/\/employee\/login/);
  });
});
