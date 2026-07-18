// tests/employees.spec.js
// ─── Employee List Tests ──────────────────────────────────────
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { EmployeesPage } from '../pages/EmployeesPage.js';
import { ADMIN_CREDENTIALS } from '../utils/testData.js';

async function loginAndGoToEmployees(page) {
  const lp = new LoginPage(page, 'admin');
  await lp.adminLogin(ADMIN_CREDENTIALS.username, ADMIN_CREDENTIALS.password);
  await lp.waitForAdminDashboard();
  await page.goto('/admin/employees');
}

test.describe('Employee List', () => {
  let empPage;

  test.beforeEach(async ({ page }) => {
    await loginAndGoToEmployees(page);
    empPage = new EmployeesPage(page);
    await empPage.waitForCards();
  });

  test('Employee list page loads successfully', async ({ page }) => {
    await expect(page.getByTestId('employees-page')).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/employees/);
  });

  test('Page header shows "Employee Directory"', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Employee Directory');
  });

  test('Navbar and sidebar are present', async ({ page }) => {
    await expect(page.getByTestId('navbar')).toBeVisible();
    await expect(page.getByTestId('sidebar')).toBeVisible();
  });

  test('Employee cards are displayed', async ({ page }) => {
    const cards = page.getByTestId('employee-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Each employee card shows name and role', async ({ page }) => {
    const firstCard = page.getByTestId('employee-card').first();
    await expect(firstCard.locator('.emp-card-name')).toBeVisible();
    await expect(firstCard.locator('.emp-card-role')).toBeVisible();
  });

  test('Each employee card has edit and delete buttons', async ({ page }) => {
    const firstCard = page.getByTestId('employee-card').first();
    await expect(firstCard.getByTestId('edit-employee-button')).toBeVisible();
    await expect(firstCard.getByTestId('delete-employee-button')).toBeVisible();
  });

  test('Add Employee button is visible', async ({ page }) => {
    await expect(page.getByTestId('add-employee-button')).toBeVisible();
  });

  test('Search bar is visible', async ({ page }) => {
    await expect(page.getByTestId('employee-search')).toBeVisible();
  });

  test('Department filter tabs are visible', async ({ page }) => {
    const allTab = page.locator('.tab').filter({ hasText: 'All' });
    await expect(allTab).toBeVisible();
  });

  test('Employee count label is shown', async ({ page }) => {
    const resultsLabel = page.locator('span').filter({ hasText: /results/ });
    await expect(resultsLabel).toBeVisible();
  });

  test('Logout button is accessible', async ({ page }) => {
    await expect(page.getByTestId('logout-button')).toBeVisible();
  });
});
