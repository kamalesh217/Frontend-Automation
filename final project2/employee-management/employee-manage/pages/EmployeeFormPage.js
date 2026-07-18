// pages/EmployeeFormPage.js
// ─── Page Object Model — Add / Edit Employee Modal ────────────

export class EmployeeFormPage {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {'add' | 'edit'} mode  – determines which modal's locators to scope to
   */
  constructor(page, mode = 'add') {
    this.page = page;
    this.mode = mode;

    // ── Add modal field locators (prefixed add-employee-*) ────
    this.addNameInput       = page.getByTestId('add-employee-name');
    this.addRoleInput       = page.getByTestId('add-employee-role');
    this.addEmailInput      = page.getByTestId('add-employee-email');
    this.addPhoneInput      = page.getByTestId('add-employee-phone');
    this.addSalaryInput     = page.getByTestId('add-employee-salary');
    this.addDepartmentSelect= page.getByTestId('add-employee-department');
    this.addSaveButton      = page.getByTestId('add-save-button');
    this.addCancelButton    = page.getByTestId('add-cancel-button');
    this.addModal           = page.getByTestId('add-employee-modal');

    // ── Edit modal field locators (prefixed edit-employee-*) ──
    this.editNameInput      = page.getByTestId('edit-employee-name');
    this.editRoleInput      = page.getByTestId('edit-employee-role');
    this.editEmailInput     = page.getByTestId('edit-employee-email');
    this.editPhoneInput     = page.getByTestId('edit-employee-phone');
    this.editSalaryInput    = page.getByTestId('edit-employee-salary');
    this.editSaveButton     = page.getByTestId('edit-save-button');
    this.editCancelButton   = page.getByTestId('edit-cancel-button');
    this.editModal          = page.getByTestId('edit-employee-modal');

    // ── Convenience aliases based on mode ────────────────────
    this.nameInput        = mode === 'edit' ? this.editNameInput        : this.addNameInput;
    this.roleInput        = mode === 'edit' ? this.editRoleInput        : this.addRoleInput;
    this.emailInput       = mode === 'edit' ? this.editEmailInput       : this.addEmailInput;
    this.phoneInput       = mode === 'edit' ? this.editPhoneInput       : this.addPhoneInput;
    this.salaryInput      = mode === 'edit' ? this.editSalaryInput      : this.addSalaryInput;
    this.departmentSelect = mode === 'edit' ? null                      : this.addDepartmentSelect;
    this.saveButton       = mode === 'edit' ? this.editSaveButton       : this.addSaveButton;
    this.cancelButton     = mode === 'edit' ? this.editCancelButton     : this.addCancelButton;
    this.modal            = mode === 'edit' ? this.editModal            : this.addModal;

    // ── Generic modal title (first visible) ──────────────────
    this.modalTitle = page.locator('.modal-title');
  }

  // ── Actions ───────────────────────────────────────────────────
  /**
   * Fill the Add Employee form with the given data object.
   * @param {{ name?:string, role?:string, email?:string, phone?:string, salary?:string, department?:string }} data
   */
  async fillForm(data = {}) {
    if (data.name       !== undefined) await this.nameInput.fill(data.name);
    if (data.role       !== undefined) await this.roleInput.fill(data.role);
    if (data.email      !== undefined) await this.emailInput.fill(data.email);
    if (data.phone      !== undefined) await this.phoneInput.fill(data.phone);
    if (data.salary     !== undefined) {
      await this.salaryInput.clear();
      await this.salaryInput.fill(String(data.salary));
    }
    if (data.department !== undefined && this.departmentSelect) {
      await this.departmentSelect.selectOption(data.department);
    }
  }

  async clearForm() {
    await this.nameInput.fill('');
    await this.roleInput.fill('');
    await this.emailInput.fill('');
  }

  async save() {
    await this.saveButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  // ── Validation ────────────────────────────────────────────────
  async isModalVisible() {
    try {
      await this.modal.waitFor({ state: 'visible', timeout: 5_000 });
      return true;
    } catch {
      return false;
    }
  }

  async isModalClosed() {
    try {
      await this.modal.waitFor({ state: 'hidden', timeout: 5_000 });
      return true;
    } catch {
      return false;
    }
  }

  async getModalTitle() {
    // Get the first visible modal title
    const titles = this.modalTitle;
    const count = await titles.count();
    for (let i = 0; i < count; i++) {
      if (await titles.nth(i).isVisible()) {
        return titles.nth(i).textContent();
      }
    }
    return titles.first().textContent();
  }

  async waitForModalVisible() {
    await this.modal.waitFor({ state: 'visible', timeout: 10_000 });
  }

  async waitForModalClosed() {
    await this.modal.waitFor({ state: 'hidden', timeout: 10_000 });
  }

  // ── Edit-specific helpers ─────────────────────────────────────
  async getNameValue() {
    return this.nameInput.inputValue();
  }

  async getEmailValue() {
    return this.emailInput.inputValue();
  }
}
