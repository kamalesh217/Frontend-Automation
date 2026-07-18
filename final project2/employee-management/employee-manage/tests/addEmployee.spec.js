// tests/addEmployee.spec.js
// ─── Add Employee Tests ───────────────────────────────────────
/* eslint-disable no-unused-vars */
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { EmployeesPage } from '../pages/EmployeesPage.js';
import { EmployeeFormPage } from '../pages/EmployeeFormPage.js';
import { ADMIN_CREDENTIALS, NEW_EMPLOYEE } from '../utils/testData.js';

const MOCKAPI_URL = 'https://6a4b3689f5eab0bb6b625725.mockapi.io/employee';

async function loginAndGoToEmployees(page) {
  const lp = new LoginPage(page, 'admin');
  await lp.adminLogin(ADMIN_CREDENTIALS.username, ADMIN_CREDENTIALS.password);
  await lp.waitForAdminDashboard();
  await page.goto('/admin/employees');
}

test.describe('Add Employee', () => {
  let empPage;
  let formPage;

  test.beforeEach(async ({ page }) => {
    await loginAndGoToEmployees(page);
    empPage  = new EmployeesPage(page);
    formPage = new EmployeeFormPage(page, 'add');
    await empPage.waitForCards();
  });

  test('Clicking Add Employee button opens the modal', async ({ page }) => {
    await empPage.clickAddEmployee();
    await formPage.waitForModalVisible();
    expect(await formPage.isModalVisible()).toBe(true);
  });

  test('Add Employee modal title is correct', async ({ page }) => {
    await empPage.clickAddEmployee();
    await formPage.waitForModalVisible();
    const title = await formPage.getModalTitle();
    expect(title).toContain('Add');
  });

  test('Add Employee form fields are visible', async ({ page }) => {
    await empPage.clickAddEmployee();
    await formPage.waitForModalVisible();
    await expect(formPage.nameInput).toBeVisible();
    await expect(formPage.roleInput).toBeVisible();
    await expect(formPage.emailInput).toBeVisible();
    await expect(formPage.salaryInput).toBeVisible();
    await expect(formPage.departmentSelect).toBeVisible();
    await expect(formPage.saveButton).toBeVisible();
    await expect(formPage.cancelButton).toBeVisible();
  });

  test('Cancel button closes the modal', async ({ page }) => {
    await empPage.clickAddEmployee();
    await formPage.waitForModalVisible();
    await formPage.cancel();
    await formPage.waitForModalClosed();
    expect(await formPage.isModalVisible()).toBe(false);
  });

  test('Successfully add a new employee', async ({ page, request }) => {
    // 1. Clean up any existing test employee on MockAPI
    try {
      const getRes = await request.get(MOCKAPI_URL, { timeout: 30_000 });
      if (getRes.ok()) {
        const list = await getRes.json();
        const existing = list.filter(e => e.email === NEW_EMPLOYEE.email);
        for (const emp of existing) {
          await request.delete(`${MOCKAPI_URL}/${emp.id}`, { timeout: 30_000 });
        }
      }
    } catch (e) {
      console.warn('Failed to pre-clean MockAPI:', e.message || String(e));
    }

    // Reload page to align UI state with the cleaned-up API database
    await page.reload();
    await empPage.waitForCards();

    const countBefore = await empPage.getCardCount();

    await empPage.clickAddEmployee();
    await formPage.waitForModalVisible();

    await formPage.fillForm({
      name:   NEW_EMPLOYEE.name,
      role:   NEW_EMPLOYEE.role,
      email:  NEW_EMPLOYEE.email,
      phone:  NEW_EMPLOYEE.phone,
      salary: NEW_EMPLOYEE.salary,
    });

    // Intercept the POST — ensures we wait for exactly ONE network call
    const [postResponse] = await Promise.all([
      page.waitForResponse(
        res => res.url().includes('mockapi.io/employee') && res.request().method() === 'POST',
        { timeout: 30_000 }
      ),
      formPage.save(),
    ]);

    // Verify the POST returned 200 or 201
    expect([200, 201]).toContain(postResponse.status());

    // Wait for modal to close and list to refresh
    await formPage.waitForModalClosed();
    await empPage.waitForCards();

    const countAfter = await empPage.getCardCount();
    expect(countAfter).toBeGreaterThan(countBefore);

    // 2. Verify it appears in MockAPI and no duplicates exist
    const verifyRes = await request.get(MOCKAPI_URL, { timeout: 30_000 });
    expect(verifyRes.ok()).toBe(true);
    const updatedList = await verifyRes.json();
    const matches = updatedList.filter(e => e.email === NEW_EMPLOYEE.email);

    // Exactly ONE employee with this email — no duplicates
    expect(matches.length).toBe(1);
    expect(matches[0].name).toBe(NEW_EMPLOYEE.name);
    expect(matches[0].role).toBe(NEW_EMPLOYEE.role);
    expect(matches[0].email).toBe(NEW_EMPLOYEE.email);
  });

  test('Saving without required fields does not close the modal', async ({ page }) => {
    await empPage.clickAddEmployee();
    await formPage.waitForModalVisible();

    // Leave name, email, role empty — click save
    await formPage.save();

    // Modal should still be visible (app-level validation)
    const stillVisible = await formPage.isModalVisible();
    expect(stillVisible).toBe(true);

    // Validation error message should be shown
    await expect(page.getByTestId('form-error')).toBeVisible();
  });

  test('Department select has default option', async ({ page }) => {
    await empPage.clickAddEmployee();
    await formPage.waitForModalVisible();
    const dept = await formPage.departmentSelect.inputValue();
    expect(dept).toBeTruthy();
  });

  test('Save button is disabled while submitting', async ({ page }) => {
    await empPage.clickAddEmployee();
    await formPage.waitForModalVisible();

    await formPage.fillForm({
      name:   NEW_EMPLOYEE.name,
      role:   NEW_EMPLOYEE.role,
      email:  `disabled-test-${Date.now()}@example.com`,
      salary: '55000',
    });

    const saveBtn = formPage.saveButton;
    const responsePromise = page.waitForResponse(
      res => res.url().includes('mockapi.io/employee') && res.request().method() === 'POST',
      { timeout: 30_000 }
    );

    await saveBtn.click();

    // Button must be disabled during the in-flight request
    await expect(saveBtn).toBeDisabled();

    // Wait for request to finish
    await responsePromise;

    // Best-effort cleanup
    try {
      const cleanRes = await page.request.get(MOCKAPI_URL);
      if (cleanRes.ok()) {
        const all = await cleanRes.json();
        const toDelete = all.filter(e => e.email && e.email.startsWith('disabled-test-'));
        for (const emp of toDelete) {
          await page.request.delete(`${MOCKAPI_URL}/${emp.id}`);
        }
      }
    } catch (_) { /* best-effort */ }
  });
});
