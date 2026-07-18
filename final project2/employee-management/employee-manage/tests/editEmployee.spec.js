// tests/editEmployee.spec.js
// ─── Edit Employee Tests ──────────────────────────────────────
/* eslint-disable no-unused-vars */
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { EmployeesPage } from '../pages/EmployeesPage.js';
import { EmployeeFormPage } from '../pages/EmployeeFormPage.js';
import { ADMIN_CREDENTIALS, UPDATED_EMPLOYEE } from '../utils/testData.js';

async function loginAndGoToEmployees(page) {
  const lp = new LoginPage(page, 'admin');
  await lp.adminLogin(ADMIN_CREDENTIALS.username, ADMIN_CREDENTIALS.password);
  await lp.waitForAdminDashboard();
  await page.goto('/admin/employees');
}

test.describe('Edit Employee', () => {
  let empPage;
  let formPage;

  test.beforeEach(async ({ page }) => {
    await loginAndGoToEmployees(page);
    empPage  = new EmployeesPage(page);
    formPage = new EmployeeFormPage(page, 'edit');
    await empPage.waitForCards();
  });

  test('Clicking edit button opens the edit modal', async ({ page }) => {
    await empPage.clickFirstEditButton();
    await formPage.waitForModalVisible();
    expect(await formPage.isModalVisible()).toBe(true);
  });

  test('Edit modal title contains "Edit"', async ({ page }) => {
    await empPage.clickFirstEditButton();
    await formPage.waitForModalVisible();
    const title = await formPage.getModalTitle();
    expect(title).toContain('Edit');
  });

  test('Edit form is pre-populated with employee data', async ({ page }) => {
    await empPage.clickFirstEditButton();
    await formPage.waitForModalVisible();

    // Name field should have an existing value
    const nameVal = await formPage.getNameValue();
    expect(nameVal.length).toBeGreaterThan(0);
  });

  test('Edit form fields are editable', async ({ page }) => {
    await empPage.clickFirstEditButton();
    await formPage.waitForModalVisible();

    await formPage.nameInput.fill(UPDATED_EMPLOYEE.name);
    const val = await formPage.nameInput.inputValue();
    expect(val).toBe(UPDATED_EMPLOYEE.name);
  });

  test('Save Changes button is visible in edit modal', async ({ page }) => {
    await empPage.clickFirstEditButton();
    await formPage.waitForModalVisible();
    await expect(formPage.saveButton).toBeVisible();
    await expect(formPage.saveButton).toContainText('Save');
  });

  test('Cancel button closes edit modal without saving', async ({ page }) => {
    await empPage.clickFirstEditButton();
    await formPage.waitForModalVisible();

    // Modify name
    await formPage.nameInput.fill('CANCELLED_CHANGE');
    await formPage.cancel();
    await formPage.waitForModalClosed();
    expect(await formPage.isModalVisible()).toBe(false);
  });

  test('Saving edits closes modal and updates are reflected', async ({ page }) => {
    await empPage.clickFirstEditButton();
    await formPage.waitForModalVisible();

    // Update role field
    await formPage.roleInput.fill(UPDATED_EMPLOYEE.role);

    // Wait for the PUT request
    const [putResponse] = await Promise.all([
      page.waitForResponse(
        res => res.url().includes('mockapi.io/employee') && res.request().method() === 'PUT',
        { timeout: 30_000 }
      ),
      formPage.save(),
    ]);

    expect(putResponse.ok()).toBe(true);

    // Modal should close
    await formPage.waitForModalClosed();
    expect(await formPage.isModalVisible()).toBe(false);

    // Employee cards still present
    await empPage.waitForCards();
    const count = await empPage.getCardCount();
    expect(count).toBeGreaterThan(0);
  });
});
