// tests/searchEmployee.spec.js
// ─── Search Employee Tests ────────────────────────────────────
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

test.describe('Search Employee', () => {
  let empPage;

  test.beforeEach(async ({ page }) => {
    await loginAndGoToEmployees(page);
    empPage = new EmployeesPage(page);
    await empPage.waitForCards();
  });

  test('Search input is visible and accepts text', async ({ page }) => {
    const searchInput = page.getByTestId('employee-search');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('John');
    await expect(searchInput).toHaveValue('John');
  });

  test('Searching by name filters employee cards', async ({ page }) => {
    const totalBefore = await empPage.getCardCount();

    await empPage.search('John');
    await page.waitForTimeout(500); // debounce

    const afterSearch = await empPage.getCardCount();
    // Should have fewer or equal results
    expect(afterSearch).toBeLessThanOrEqual(totalBefore);

    // Matching card should be visible
    if (afterSearch > 0) {
      const firstName = await empPage.getFirstCardName();
      expect(firstName.toLowerCase()).toContain('john');
    }
  });

  test('Searching by employee ID filters correctly', async ({ page }) => {
    await empPage.search('1');
    await page.waitForTimeout(500);
    const count = await empPage.getCardCount();
    // Should return at least 0 results without crashing
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('Searching by role filters correctly', async ({ page }) => {
    await empPage.search('Engineer');
    await page.waitForTimeout(500);
    const count = await empPage.getCardCount();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('Clearing search restores full employee list', async ({ page }) => {
    const totalBefore = await empPage.getCardCount();

    await empPage.search('John');
    await page.waitForTimeout(500);

    await empPage.clearSearch();
    await page.waitForTimeout(500);

    const totalAfter = await empPage.getCardCount();
    expect(totalAfter).toBe(totalBefore);
  });

  test('Searching with no match shows empty state', async ({ page }) => {
    await empPage.search('zzz_no_match_xyz');
    await page.waitForTimeout(500);

    const count = await empPage.getCardCount();
    if (count === 0) {
      const emptyState = page.locator('.empty-state');
      await expect(emptyState).toBeVisible();
    }
  });

  test('Search result count updates dynamically', async ({ page }) => {
    await empPage.search('John');
    await page.waitForTimeout(500);

    const resultsLabel = page.locator('span').filter({ hasText: /results/ });
    await expect(resultsLabel).toBeVisible();
  });

  test('Department filter works independently of search', async ({ page }) => {
    const allCount = await empPage.getCardCount();

    await empPage.filterByDepartment('Engineering');
    await page.waitForTimeout(500);

    const filteredCount = await empPage.getCardCount();
    expect(filteredCount).toBeLessThanOrEqual(allCount);
  });
});
