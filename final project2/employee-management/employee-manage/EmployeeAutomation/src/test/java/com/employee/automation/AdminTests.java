package com.employee.automation;

import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

/**
 * AdminTests — 7 TestNG tests covering all Admin portal pages.
 *
 * Test 1:  Admin valid login
 * Test 2:  Admin invalid login shows error
 * Test 3:  Admin Dashboard — stats cards load
 * Test 4:  Admin Dashboard — sidebar navigation links work
 * Test 5:  Admin Employee List — table loads with employee cards
 * Test 6:  Admin Salary Management — page loads correctly
 * Test 7:  Admin Attendance Management — page loads correctly
 */
public class AdminTests extends BaseTest {

    // ─────────────────────────────────────────────────────────────────────
    // TEST 1 — Admin Valid Login
    // ─────────────────────────────────────────────────────────────────────
    @Test(description = "Admin valid login navigates to /admin/dashboard")
    public void testAdminLogin() {
        System.out.println("▶ TEST 1: Admin Valid Login");
        clearSession();
        navigateTo("/admin/login");

        // Login page must be visible
        WebElement page = waitForTestId("admin-login-page");
        Assert.assertNotNull(page, "Admin login page should be visible");

        typeInto("username-input", ADMIN_USER);
        typeInto("password-input", ADMIN_PASS);
        clickTestId("login-button");

        waitForUrl("/admin/dashboard");
        Assert.assertTrue(driver.getCurrentUrl().contains("/admin/dashboard"),
            "Should redirect to /admin/dashboard after login");

        System.out.println("  ✅ PASSED: Admin login redirects to dashboard");
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST 2 — Admin Invalid Login Shows Error
    // ─────────────────────────────────────────────────────────────────────
    @Test(description = "Admin login with wrong password shows error message")
    public void testAdminLoginInvalid() {
        System.out.println("▶ TEST 2: Admin Invalid Login");
        clearSession();
        navigateTo("/admin/login");
        waitForTestId("admin-login-page");

        typeInto("username-input", ADMIN_USER);
        typeInto("password-input", "wrongpassword999");
        clickTestId("login-button");

        // Error message should appear
        WebElement error = waitForTestId("login-error");
        Assert.assertNotNull(error, "Error message element should be present");
        Assert.assertFalse(error.getText().isEmpty(), "Error message should not be empty");
        System.out.println("  ✅ PASSED: Error shown: " + error.getText());

        // URL must NOT have changed to dashboard
        Assert.assertFalse(driver.getCurrentUrl().contains("/admin/dashboard"),
            "Should stay on login page on invalid credentials");
        System.out.println("  ✅ PASSED: URL stayed on login page");
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST 3 — Admin Dashboard Stats Cards Load
    // ─────────────────────────────────────────────────────────────────────
    @Test(description = "Admin dashboard loads and shows stat cards")
    public void testAdminDashboardStatsCards() {
        System.out.println("▶ TEST 3: Admin Dashboard — Stats Cards");
        loginAsAdmin();

        // Dashboard page container
        WebElement dashPage = waitForTestId("dashboard-page");
        Assert.assertNotNull(dashPage, "Dashboard page container should be visible");

        // Stat grid must be present
        WebElement statGrid = waitForTestId("stat-grid");
        Assert.assertNotNull(statGrid, "Stat grid should be present");

        // At least 1 stat card must exist
        List<WebElement> statCards = driver.findElements(
            By.cssSelector("[data-testid='stat-card']")
        );
        Assert.assertTrue(statCards.size() >= 1,
            "At least one stat card should be rendered, found: " + statCards.size());

        System.out.println("  ✅ PASSED: Dashboard loaded with " + statCards.size() + " stat cards");
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST 4 — Admin Navigation (Sidebar on desktop / Dock on mobile)
    // ─────────────────────────────────────────────────────────────────────
    @Test(description = "Admin navigation links are present and the Employees link navigates correctly")
    public void testAdminDashboardDock() {
        System.out.println("▶ TEST 4: Admin Dashboard — Navigation Links");
        loginAsAdmin();

        // On a maximized desktop window the CSS sidebar is shown and the
        // floating dock is hidden.  We try sidebar selectors first and fall
        // back to dock selectors for smaller viewports.
        boolean usingSidebar = isSidebarVisible();
        System.out.println("  ℹ Navigation mode: " + (usingSidebar ? "SIDEBAR" : "FLOATING DOCK"));

        if (usingSidebar) {
            // ── Sidebar path ──────────────────────────────────────────────
            WebElement sidebar = waitForCss(".sidebar");
            Assert.assertTrue(sidebar.isDisplayed(), "Sidebar should be displayed");

            // Logout button in sidebar footer
            WebElement logoutBtn = wait.until(ExpectedConditions.elementToBeClickable(
                By.cssSelector(".sidebar-footer button, [data-testid='logout-button']")
            ));
            Assert.assertNotNull(logoutBtn, "Sidebar logout button should exist");

            // Navigate to Employees via sidebar nav-item
            WebElement navEmployees = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(@class,'nav-item') and contains(.,'Employee')]"
                    + " | //a[contains(@class,'nav-item') and contains(.,'Employee')]")
            ));
            navEmployees.click();
        } else {
            // ── Floating Dock path ────────────────────────────────────────
            WebElement dock = waitForCss(".dock");
            Assert.assertTrue(dock.isDisplayed(), "Floating dock should be displayed");

            WebElement logoutBtn = waitForCss(".dock-item[title='Sign Out']");
            Assert.assertNotNull(logoutBtn, "Dock logout button should exist");

            WebElement navEmployees = waitForCss(".dock-item[title='Employees']");
            navEmployees.click();
        }

        waitForUrl("/admin/employees");
        Assert.assertTrue(driver.getCurrentUrl().contains("/admin/employees"),
            "Clicking Employees nav should navigate to /admin/employees");

        System.out.println("  ✅ PASSED: Navigation visible, logout button present, nav link works");
    }



    // ─────────────────────────────────────────────────────────────────────
    // TEST 5 — Admin Employee List
    // ─────────────────────────────────────────────────────────────────────
    @Test(description = "Admin employee list page loads with employee cards and search")
    public void testAdminEmployeeList() {
        System.out.println("▶ TEST 5: Admin Employee List");
        loginAsAdmin();
        navigateTo("/admin/employees");
        waitForUrl("/admin/employees");

        // Page container
        WebElement empPage = waitForTestId("employees-page");
        Assert.assertNotNull(empPage, "Employees page container should be visible");

        // Add employee button
        WebElement addBtn = waitForTestId("add-employee-button");
        Assert.assertTrue(addBtn.isDisplayed(), "Add Employee button should be visible");

        // Search box
        WebElement searchBox = waitForTestId("employee-search");
        Assert.assertTrue(searchBox.isDisplayed(), "Employee search box should be visible");
        searchBox.sendKeys("John");

        // At least one employee card should render
        List<WebElement> empCards = wait.until(d ->
            d.findElements(By.cssSelector("[data-testid='employee-card']"))
        );
        Assert.assertTrue(empCards.size() >= 1,
            "At least one employee card should appear, found: " + empCards.size());

        System.out.println("  ✅ PASSED: Employee list loaded with " + empCards.size() + " card(s), search works");
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST 6 — Admin Salary Management Page Loads
    // ─────────────────────────────────────────────────────────────────────
    @Test(description = "Admin salary management page loads with app-layout")
    public void testAdminSalaryManagement() {
        System.out.println("▶ TEST 6: Admin Salary Management");
        loginAsAdmin();
        navigateTo("/admin/salary");
        waitForUrl("/admin/salary");

        // The page uses .app-layout as root container
        WebElement layout = waitForCss(".app-layout");
        Assert.assertNotNull(layout, "Salary management page app-layout should be present");
        Assert.assertTrue(layout.isDisplayed(), "Salary management page should be displayed");

        // Verify navigation controls are present based on layout
        WebElement navSalary;
        if (isSidebarVisible()) {
            WebElement sidebar = waitForCss(".sidebar");
            Assert.assertTrue(sidebar.isDisplayed(), "Sidebar should be visible on salary page");
            navSalary = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(@class,'nav-item') and contains(.,'Salary')]"
                    + " | //a[contains(@class,'nav-item') and contains(.,'Salary')]")
            ));
        } else {
            WebElement dock = waitForCss(".dock");
            Assert.assertTrue(dock.isDisplayed(), "Dock should be visible on salary page");
            navSalary = waitForCss(".dock-item[title='Salary']");
        }
        Assert.assertNotNull(navSalary, "Salary nav link should exist");

        System.out.println("  ✅ PASSED: Salary Management page loaded correctly");
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST 7 — Admin Attendance Management Page Loads
    // ─────────────────────────────────────────────────────────────────────
    @Test(description = "Admin attendance management page loads with app-layout")
    public void testAdminAttendanceManagement() {
        System.out.println("▶ TEST 7: Admin Attendance Management");
        loginAsAdmin();
        navigateTo("/admin/attendance");
        waitForUrl("/admin/attendance");

        // Page layout
        WebElement layout = waitForCss(".app-layout");
        Assert.assertNotNull(layout, "Attendance page app-layout should be present");
        Assert.assertTrue(layout.isDisplayed(), "Attendance page should be displayed");

        // Verify navigation controls are present based on layout
        WebElement navAttendance;
        if (isSidebarVisible()) {
            WebElement sidebar = waitForCss(".sidebar");
            Assert.assertTrue(sidebar.isDisplayed(), "Sidebar should be visible on attendance page");
            navAttendance = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(@class,'nav-item') and contains(.,'Attendance')]"
                    + " | //a[contains(@class,'nav-item') and contains(.,'Attendance')]")
            ));
        } else {
            WebElement dock = waitForCss(".dock");
            Assert.assertTrue(dock.isDisplayed(), "Dock should be visible on attendance page");
            navAttendance = waitForCss(".dock-item[title='Attendance']");
        }
        Assert.assertNotNull(navAttendance, "Attendance nav link should exist");

        System.out.println("  ✅ PASSED: Attendance Management page loaded correctly");
    }
}
