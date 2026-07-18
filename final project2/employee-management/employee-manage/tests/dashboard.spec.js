// tests/dashboard.spec.js
// ─── Admin Dashboard Tests ────────────────────────────────────
/* eslint-disable no-unused-vars */
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { ADMIN_CREDENTIALS } from '../utils/testData.js';

// Helper: perform admin login before each test
async function loginAsAdmin(page) {
  const lp = new LoginPage(page, 'admin');
  await lp.adminLogin(ADMIN_CREDENTIALS.username, ADMIN_CREDENTIALS.password);
  await lp.waitForAdminDashboard();
}

test.describe('Admin Dashboard', () => {
  let dashboard;

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    dashboard = new DashboardPage(page);
  });

  test('Dashboard page loads successfully', async ({ page }) => {
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  test('Navbar is visible on dashboard', async ({ page }) => {
    await expect(page.getByTestId('navbar')).toBeVisible();
  });

  test('Sidebar is visible on dashboard', async ({ page }) => {
    await expect(page.getByTestId('sidebar')).toBeVisible();
  });

  test('Dashboard banner shows welcome message', async ({ page }) => {
    const banner = page.locator('.dashboard-banner-admin');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Admin Dashboard');
  });

  test('Stat cards are visible after data loads', async ({ page }) => {
    const statGrid = page.getByTestId('stat-grid');
    await expect(statGrid).toBeVisible();

    // Wait for at least one stat card to appear
    await page.waitForSelector('[data-testid="stat-card"]', { timeout: 15_000 });
    const cards = page.getByTestId('stat-card');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('Stat cards contain expected labels', async ({ page }) => {
    await page.waitForSelector('[data-testid="stat-card"]', { timeout: 15_000 });
    const cards = page.getByTestId('stat-card');
    const count = await cards.count();

    const labels = [];
    for (let i = 0; i < count; i++) {
      const label = await cards.nth(i).locator('.stat-label').textContent();
      labels.push(label);
    }

    // At least one expected label present
    const hasKnownLabel = labels.some(l =>
      l.includes('Employee') || l.includes('Payroll') || l.includes('Present') || l.includes('Leave')
    );
    expect(hasKnownLabel).toBe(true);
  });

  test('Logout button is accessible from sidebar', async ({ page }) => {
    const logoutBtn = page.getByTestId('logout-button');
    await expect(logoutBtn).toBeVisible();
  });

  test('Sidebar navigation links are present', async ({ page }) => {
    await expect(page.locator('#nav-dashboard')).toBeVisible();
    await expect(page.locator('#nav-employees')).toBeVisible();
  });

  test('Quick Actions section is visible', async ({ page }) => {
    const quickActions = page.locator('.card-title').filter({ hasText: 'Quick Actions' });
    await expect(quickActions).toBeVisible();
  });

  test('Attendance trend chart section is visible', async ({ page }) => {
    const chartSection = page.locator('.card-title').filter({ hasText: 'Attendance Trend' });
    await expect(chartSection).toBeVisible();
  });
});
