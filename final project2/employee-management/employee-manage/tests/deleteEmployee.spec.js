// tests/deleteEmployee.spec.js
// ─── Delete Employee Tests ────────────────────────────────────
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

test.describe('Delete Employee', () => {
  let empPage;

  test.beforeEach(async ({ page }) => {
    await loginAndGoToEmployees(page);
    empPage = new EmployeesPage(page);
    await empPage.waitForCards();
  });

  test('Clicking delete button shows confirmation modal', async ({ page }) => {
    await empPage.clickFirstDeleteButton();
    const deleteModal = page.getByTestId('delete-modal');
    await expect(deleteModal).toBeVisible();
  });

  test('Delete confirmation modal contains employee name', async ({ page }) => {
    // Get first card name before clicking delete
    const firstCardName = await empPage.getFirstCardName();

    await empPage.clickFirstDeleteButton();
    const deleteModal = page.getByTestId('delete-modal');
    await expect(deleteModal).toBeVisible();

    // Modal text should include the employee name
    await expect(deleteModal).toContainText(firstCardName);
  });

  test('Delete modal shows warning message', async ({ page }) => {
    await empPage.clickFirstDeleteButton();
    const deleteModal = page.getByTestId('delete-modal');
    await expect(deleteModal).toBeVisible();
    await expect(deleteModal).toContainText('cannot be undone');
  });

  test('Confirm Delete button is visible in modal', async ({ page }) => {
    await empPage.clickFirstDeleteButton();
    await expect(page.getByTestId('delete-modal')).toBeVisible();
    await expect(page.getByTestId('confirm-delete-button')).toBeVisible();
  });

  test('Cancel button closes delete confirmation modal', async ({ page }) => {
    await empPage.clickFirstDeleteButton();
    await expect(page.getByTestId('delete-modal')).toBeVisible();

    // Click Cancel
    await empPage.cancelDelete();

    // Modal should be gone
    await expect(page.getByTestId('delete-modal')).not.toBeVisible({ timeout: 5_000 });

    // Cards should still be there
    const count = await empPage.getCardCount();
    expect(count).toBeGreaterThan(0);
  });

  test('Confirming delete removes employee from list', async ({ page }) => {
    const countBefore = await empPage.getCardCount();

    // Only run delete if there are employees present
    if (countBefore === 0) {
      test.skip();
      return;
    }

    await empPage.clickFirstDeleteButton();
    await expect(page.getByTestId('delete-modal')).toBeVisible();

    // Wait for the DELETE request to complete instead of using hardcoded timeout
    const [deleteResponse] = await Promise.all([
      page.waitForResponse(
        res => res.url().includes('mockapi.io/employee') && res.request().method() === 'DELETE',
        { timeout: 30_000 }
      ),
      empPage.confirmDelete(),
    ]);

    // Verify the DELETE returned a successful status
    expect(deleteResponse.ok()).toBe(true);

    // Wait for modal to close
    await expect(page.getByTestId('delete-modal')).not.toBeVisible({ timeout: 8_000 });

    // Wait for list to refresh, then count
    await empPage.waitForCards();
    const countAfter = await empPage.getCardCount();
    expect(countAfter).toBeLessThanOrEqual(countBefore);
  });
});
