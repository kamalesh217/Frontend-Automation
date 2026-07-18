// pages/LoginPage.js
// ─── Page Object Model — Login (Admin & Employee) ──────────────

export class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {'admin' | 'employee'} role
   */
  constructor(page, role = 'admin') {
    this.page = page;
    this.role = role;

    // ── Locators ──────────────────────────────────────────────
    this.usernameInput  = page.getByTestId('username-input');
    this.passwordInput  = page.getByTestId('password-input');
    this.loginButton    = page.getByTestId('login-button');
    this.loginError     = page.getByTestId('login-error');

    // Role-specific page root
    this.adminLoginPage    = page.getByTestId('admin-login-page');
    this.employeeLoginPage = page.getByTestId('employee-login-page');
    this.landingPage       = page.getByTestId('landing-page');
    this.adminPortalBtn    = page.getByTestId('admin-portal-btn');
    this.employeePortalBtn = page.getByTestId('employee-portal-btn');
  }

  // ── Navigation ────────────────────────────────────────────────
  async gotoLanding() {
    await this.page.goto('/');
  }

  async gotoAdminLogin() {
    await this.page.goto('/admin/login');
  }

  async gotoEmployeeLogin() {
    await this.page.goto('/employee/login');
  }

  // ── Actions ───────────────────────────────────────────────────
  /**
   * Fill and submit the login form.
   * @param {string} username
   * @param {string} password
   */
  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async adminLogin(username, password) {
    await this.gotoAdminLogin();
    await this.login(username, password);
  }

  async employeeLogin(username, password) {
    await this.gotoEmployeeLogin();
    await this.login(username, password);
  }

  async clickAdminPortal() {
    await this.adminPortalBtn.click();
  }

  async clickEmployeePortal() {
    await this.employeePortalBtn.click();
  }

  // ── Validation ────────────────────────────────────────────────
  async isAdminLoginPageVisible() {
    return this.adminLoginPage.isVisible();
  }

  async isEmployeeLoginPageVisible() {
    return this.employeeLoginPage.isVisible();
  }

  async isLandingPageVisible() {
    return this.landingPage.isVisible();
  }

  async getErrorMessage() {
    await this.loginError.waitFor({ state: 'visible' });
    return this.loginError.textContent();
  }

  async isErrorVisible() {
    try {
      await this.loginError.waitFor({ state: 'visible', timeout: 5_000 });
      return true;
    } catch {
      return false;
    }
  }

  async waitForAdminDashboard() {
    await this.page.waitForURL('**/admin/dashboard', { timeout: 10_000 });
  }

  async waitForEmployeeDashboard() {
    await this.page.waitForURL('**/employee/dashboard', { timeout: 10_000 });
  }
}
