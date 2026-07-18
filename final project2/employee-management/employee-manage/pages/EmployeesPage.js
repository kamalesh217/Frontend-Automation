// pages/EmployeesPage.js
// ─── Page Object Model — Employee List ────────────────────────

export class EmployeesPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // ── Locators ──────────────────────────────────────────────
    this.employeesPage      = page.getByTestId('employees-page');
    this.searchInput        = page.getByTestId('employee-search');
    this.addEmployeeButton  = page.getByTestId('add-employee-button');
    this.employeeCards      = page.getByTestId('employee-card');
    this.editButtons        = page.getByTestId('edit-employee-button');
    this.deleteButtons      = page.getByTestId('delete-employee-button');
    this.deleteModal        = page.getByTestId('delete-modal');
    this.confirmDeleteButton= page.getByTestId('confirm-delete-button');
    this.deleteCancelButton = page.locator('[data-testid="delete-modal"] [data-testid="cancel-button"]');
    this.navbar             = page.getByTestId('navbar');
    this.sidebar            = page.getByTestId('sidebar');
    this.logoutButton       = page.getByTestId('logout-button');

    // ── Department filter tabs ─────────────────────────────────
    this.deptTabs = page.locator('.tab');
  }

  // ── Navigation ────────────────────────────────────────────────
  async goto() {
    await this.page.goto('/admin/employees');
  }

  // ── Actions ───────────────────────────────────────────────────
  async search(text) {
    await this.searchInput.fill(text);
  }

  async clearSearch() {
    await this.searchInput.fill('');
  }

  async clickAddEmployee() {
    await this.addEmployeeButton.click();
  }

  async clickFirstEditButton() {
    await this.editButtons.first().click();
  }

  async clickFirstDeleteButton() {
    await this.deleteButtons.first().click();
  }

  async clickEditButtonForCard(index = 0) {
    const card = this.employeeCards.nth(index);
    await card.locator('[data-testid="edit-employee-button"]').click();
  }

  async clickDeleteButtonForCard(index = 0) {
    const card = this.employeeCards.nth(index);
    await card.locator('[data-testid="delete-employee-button"]').click();
  }

  async confirmDelete() {
    await this.confirmDeleteButton.click();
  }

  async cancelDelete() {
    await this.deleteCancelButton.click();
  }

  async filterByDepartment(dept) {
    await this.page.locator(`.tab:has-text("${dept}")`).click();
  }

  async logout() {
    await this.logoutButton.click();
    await this.page.waitForURL('**/');
  }

  // ── Validation ────────────────────────────────────────────────
  async isPageVisible() {
    return this.employeesPage.isVisible();
  }

  async getCardCount() {
    await this.waitForCards();
    return this.employeeCards.count();
  }

  async isDeleteModalVisible() {
    return this.deleteModal.isVisible();
  }

  async waitForCards() {
    await this.employeesPage.waitFor({ state: 'visible' });
    // Wait for either cards or empty-state
    await this.page.waitForSelector('[data-testid="employee-card"], .empty-state', {
      timeout: 15_000,
    });
  }

  async waitForLoad() {
    await this.employeesPage.waitFor({ state: 'visible' });
  }

  async getFirstCardName() {
    const card = this.employeeCards.first();
    return card.locator('.emp-card-name').textContent();
  }
}
