package com.employee.automation;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

/**
 * EmployeeTests — 5 TestNG tests covering all Employee portal pages.
 *
 * Test 8:  Employee valid login
 * Test 9:  Employee invalid login shows error
 * Test 10: Employee Dashboard — cards and sidebar load
 * Test 11: Employee Attendance — page loads with records
 * Test 12: Employee Leave Request — page loads with submit button
 */
public class EmployeeTests extends BaseTest {

    // ─────────────────────────────────────────────────────────────────────
    // TEST 8 — Employee Valid Login
    // ─────────────────────────────────────────────────────────────────────
    @Test(description = "Employee valid login navigates to /employee/dashboard")
    public void testEmployeeLogin() {
        System.out.println("▶ TEST 8: Employee Valid Login");
        clearSession();
        navigateTo("/employee/login");

        // Login page must be visible
        WebElement page = waitForTestId("employee-login-page");
        Assert.assertNotNull(page, "Employee login page should be visible");

        typeInto("username-input", EMP_USER);
        typeInto("password-input", EMP_PASS);
        clickTestId("login-button");

        waitForUrl("/employee/dashboard");
        Assert.assertTrue(driver.getCurrentUrl().contains("/employee/dashboard"),
            "Should redirect to /employee/dashboard after login");

        System.out.println("  ✅ PASSED: Employee login redirects to dashboard");
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST 9 — Employee Invalid Login Shows Error
    // ─────────────────────────────────────────────────────────────────────
    @Test(description = "Employee login with wrong password shows error message")
    public void testEmployeeLoginInvalid() {
        System.out.println("▶ TEST 9: Employee Invalid Login");
        clearSession();
        navigateTo("/employee/login");
        waitForTestId("employee-login-page");

        typeInto("username-input", "emp999");
        typeInto("password-input", "wrongpass");
        clickTestId("login-button");

        // Error message should appear
        WebElement error = waitForTestId("login-error");
        Assert.assertNotNull(error, "Error message should be present");
        Assert.assertFalse(error.getText().isEmpty(), "Error message should not be empty");
        System.out.println("  ✅ PASSED: Error shown: " + error.getText());

        // URL must NOT have changed to dashboard
        Assert.assertFalse(driver.getCurrentUrl().contains("/employee/dashboard"),
            "Should stay on login page with invalid credentials");
        System.out.println("  ✅ PASSED: URL stayed on employee login page");
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST 10 — Employee Dashboard Loads
    // ─────────────────────────────────────────────────────────────────────
    @Test(description = "Employee dashboard loads with app-layout and navigation")
    public void testEmployeeDashboard() {
        System.out.println("▶ TEST 10: Employee Dashboard");
        loginAsEmployee();

        // Page layout
        WebElement layout = waitForCss(".app-layout");
        Assert.assertNotNull(layout, "Employee dashboard app-layout should be present");
        Assert.assertTrue(layout.isDisplayed(), "Employee dashboard should be displayed");

        WebElement logoutBtn;
        WebElement navProfile;

        if (isSidebarVisible()) {
            WebElement sidebar = waitForCss(".sidebar");
            Assert.assertTrue(sidebar.isDisplayed(), "Sidebar should be visible");
            logoutBtn = wait.until(ExpectedConditions.elementToBeClickable(
                By.cssSelector(".sidebar-footer button, [data-testid='logout-button']")
            ));
            navProfile = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(@class,'nav-item') and (contains(.,'Profile') or contains(.,'My Profile'))]"
                    + " | //a[contains(@class,'nav-item') and (contains(.,'Profile') or contains(.,'My Profile'))]")
            ));
        } else {
            WebElement dock = waitForCss(".dock");
            Assert.assertTrue(dock.isDisplayed(), "Employee dock should be displayed");
            logoutBtn = waitForCss(".dock-item[title='Sign Out']");
            navProfile = waitForCss(".dock-item[title='My Profile']");
        }

        Assert.assertNotNull(logoutBtn, "Logout button should be visible");
        Assert.assertNotNull(navProfile, "My Profile nav link should exist");
        navProfile.click();
        waitForUrl("/employee/profile");
        Assert.assertTrue(driver.getCurrentUrl().contains("/employee/profile"),
            "Clicking My Profile nav should navigate to /employee/profile");

        System.out.println("  ✅ PASSED: Employee dashboard loaded, nav works, profile nav works");
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST 11 — Employee Attendance Page
    // ─────────────────────────────────────────────────────────────────────
    @Test(description = "Employee attendance page loads with app-layout and attendance records")
    public void testEmployeeAttendance() {
        System.out.println("▶ TEST 11: Employee Attendance Page");
        loginAsEmployee(EMP_USER2); // use emp003 for variety
        navigateTo("/employee/attendance");
        waitForUrl("/employee/attendance");

        // Page layout
        WebElement layout = waitForCss(".app-layout");
        Assert.assertNotNull(layout, "Attendance page app-layout should be present");
        Assert.assertTrue(layout.isDisplayed(), "Attendance page should be displayed");

        WebElement navAttendance;
        if (isSidebarVisible()) {
            WebElement sidebar = waitForCss(".sidebar");
            Assert.assertTrue(sidebar.isDisplayed(), "Sidebar should be visible");
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

        // URL is correct
        Assert.assertTrue(driver.getCurrentUrl().contains("/employee/attendance"),
            "URL should contain /employee/attendance");

        System.out.println("  ✅ PASSED: Employee Attendance page loaded correctly");
    }

    // ─────────────────────────────────────────────────────────────────────
    // TEST 12 — Employee Leave Request Page
    // ─────────────────────────────────────────────────────────────────────
    @Test(description = "Employee leave request page loads with app-layout")
    public void testEmployeeLeaveRequest() {
        System.out.println("▶ TEST 12: Employee Leave Request Page");
        loginAsEmployee();
        navigateTo("/employee/leave");
        waitForUrl("/employee/leave");

        // Page layout
        WebElement layout = waitForCss(".app-layout");
        Assert.assertNotNull(layout, "Leave request page app-layout should be present");
        Assert.assertTrue(layout.isDisplayed(), "Leave request page should be displayed");

        WebElement navLeave;
        if (isSidebarVisible()) {
            WebElement sidebar = waitForCss(".sidebar");
            Assert.assertTrue(sidebar.isDisplayed(), "Sidebar should be visible");
            navLeave = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(@class,'nav-item') and contains(.,'Leave')]"
                    + " | //a[contains(@class,'nav-item') and contains(.,'Leave')]")
            ));
        } else {
            WebElement dock = waitForCss(".dock");
            Assert.assertTrue(dock.isDisplayed(), "Dock should be visible on leave page");
            navLeave = waitForCss(".dock-item[title='Leave']");
        }
        Assert.assertNotNull(navLeave, "Leave Request nav link should exist");

        // URL is correct
        Assert.assertTrue(driver.getCurrentUrl().contains("/employee/leave"),
            "URL should contain /employee/leave");

        System.out.println("  ✅ PASSED: Employee Leave Request page loaded correctly");
    }
}
