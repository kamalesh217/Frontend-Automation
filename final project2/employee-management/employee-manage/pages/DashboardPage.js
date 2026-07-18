// pages/DashboardPage.js
// ─── Page Object Model — Admin Dashboard ──────────────────────

export class DashboardPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // ── Locators ──────────────────────────────────────────────
    this.dashboardPage = page.getByTestId('dashboard-page');
    this.statGrid      = page.getByTestId('stat-grid');
    this.statCards     = page.getByTestId('stat-card');
    this.navbar        = page.getByTestId('navbar');
    this.sidebar       = page.getByTestId('sidebar');
    this.logoutButton  = page.getByTestId('logout-button');

    // ── Sidebar nav items (by text) ───────────────────────────
    this.navDashboard  = page.locator('#nav-dashboard');
    this.navEmployees  = page.locator('#nav-employees');
    this.navSalary     = page.locator('#nav-salary-management');
    this.navAttendance = page.locator('#nav-attendance');
    this.navLeaves     = page.locator('#nav-leave-requests');
    this.navReports    = page.locator('#nav-reports');
    this.navPaySlips   = page.locator('#nav-pay-slips');

    // ── Banner ────────────────────────────────────────────────
    this.bannerTitle = page.locator('.banner-title');
  }

  // ── Navigation ────────────────────────────────────────────────
  async goto() {
    await this.page.goto('/admin/dashboard');
  }

  async navigateToEmployees() {
    await this.navEmployees.click();
    await this.page.waitForURL('**/admin/employees');
  }

  async navigateToAttendance() {
    await this.navAttendance.click();
    await this.page.waitForURL('**/admin/attendance');
  }

  async navigateToReports() {
    await this.navReports.click();
    await this.page.waitForURL('**/admin/reports');
  }

  // ── Actions ───────────────────────────────────────────────────
  async logout() {
    await this.logoutButton.click();
    await this.page.waitForURL('**/');
  }

  // ── Validation ────────────────────────────────────────────────
  async isDashboardVisible() {
    return this.dashboardPage.isVisible();
  }

  async isNavbarVisible() {
    return this.navbar.isVisible();
  }

  async isSidebarVisible() {
    return this.sidebar.isVisible();
  }

  async getStatCardCount() {
    await this.statGrid.waitFor({ state: 'visible' });
    return this.statCards.count();
  }

  async waitForLoad() {
    await this.dashboardPage.waitFor({ state: 'visible' });
    await this.statGrid.waitFor({ state: 'visible' });
  }
}
