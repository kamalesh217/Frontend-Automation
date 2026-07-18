// tests/navigation.spec.js
// ─── Navigation & Protected Routes Tests ─────────────────────
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { ADMIN_CREDENTIALS, ROUTES, VIEWPORTS } from '../utils/testData.js';

async function loginAsAdmin(page) {
  const lp = new LoginPage(page, 'admin');
  await lp.adminLogin(ADMIN_CREDENTIALS.username, ADMIN_CREDENTIALS.password);
  await lp.waitForAdminDashboard();
}

test.describe('Protected Routes', () => {
  test('Accessing admin dashboard without auth redirects to admin login', async ({ page }) => {
    await page.goto(ROUTES.adminDashboard);
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('Accessing admin employees without auth redirects to admin login', async ({ page }) => {
    await page.goto(ROUTES.adminEmployees);
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('Accessing employee dashboard without auth redirects to employee login', async ({ page }) => {
    await page.goto(ROUTES.employeeDashboard);
    await expect(page).toHaveURL(/\/employee\/login/);
  });

  test('Unknown route redirects to landing page', async ({ page }) => {
    await page.goto('/some/unknown/route');
    await expect(page).toHaveURL(ROUTES.landing);
    await expect(page.getByTestId('landing-page')).toBeVisible();
  });
});

test.describe('Navbar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('Navbar is visible after login', async ({ page }) => {
    await expect(page.getByTestId('navbar')).toBeVisible();
  });

  test('Navbar contains the brand name', async ({ page }) => {
    const navbar = page.getByTestId('navbar');
    await expect(navbar).toContainText('EmpowerHR');
  });

  test('Sidebar Dashboard link navigates correctly', async ({ page }) => {
    await page.locator('#nav-dashboard').click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  test('Sidebar Employees link navigates to employee list', async ({ page }) => {
    await page.locator('#nav-employees').click();
    await expect(page).toHaveURL(/\/admin\/employees/);
    await expect(page.getByTestId('employees-page')).toBeVisible();
  });

  test('Sidebar Attendance link navigates to attendance page', async ({ page }) => {
    await page.locator('#nav-attendance').click();
    await expect(page).toHaveURL(/\/admin\/attendance/);
  });

  test('Sidebar Reports link navigates to reports page', async ({ page }) => {
    await page.locator('#nav-reports').click();
    await expect(page).toHaveURL(/\/admin\/reports/);
  });

  test('Sidebar Leave Requests link navigates to leaves page', async ({ page }) => {
    await page.locator('#nav-leave-requests').click();
    await expect(page).toHaveURL(/\/admin\/leaves/);
  });
});

test.describe('Responsive Viewports', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('Desktop (1280×720) — Dashboard visible and complete', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    await expect(page.getByTestId('navbar')).toBeVisible();
  });

  test('Tablet (768×1024) — Dashboard content visible', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.tablet);
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    await expect(page.getByTestId('navbar')).toBeVisible();
  });

  test('Mobile (375×667) — Dashboard content still visible', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    await expect(page.getByTestId('navbar')).toBeVisible();
  });

  test('Employee list is accessible on tablet viewport', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.tablet);
    await page.goto(ROUTES.adminEmployees);
    await expect(page.getByTestId('employees-page')).toBeVisible();
  });

  test('Employee list is accessible on mobile viewport', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto(ROUTES.adminEmployees);
    await expect(page.getByTestId('employees-page')).toBeVisible();
  });

  test('Landing page responsive on mobile', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto(ROUTES.landing);
    await expect(page.getByTestId('landing-page')).toBeVisible();
    await expect(page.getByTestId('admin-portal-btn')).toBeVisible();
    await expect(page.getByTestId('employee-portal-btn')).toBeVisible();
  });
});
