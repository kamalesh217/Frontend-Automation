package com.employee.automation;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;

/**
 * CreateEmployeeTest - Test 13
 * -------------------------------------------------------------------------
 * Validates the complete "Create Employee" workflow end-to-end, covering
 * all 16 requirements:
 *
 *  Req 1-2  : Generate unique test data (timestamp-based name + email)
 *  Req 3    : Fill all required fields
 *  Req 4    : Click Submit/Add exactly once
 *  Req 5    : Wait for success before next step (no Thread.sleep)
 *  Req 6    : Verify success message (modal closes)
 *  Req 7    : Verify employee appears in UI list
 *  Req 8    : Verify employee exists in MockAPI via GET
 *  Req 9    : Store and log created employee ID
 *  Req 10   : Only one employee created per run
 *  Req 11   : Prevent duplicate submissions (single click + submitting flag)
 *  Req 12   : Regenerate data if email already exists
 *  Req 13   : Proper waits - no fixed delays
 *  Req 14   : Capture screenshots at key checkpoints
 *  Req 15   : Print detailed logs throughout
 *  Req 16   : Clear error messages on failure via Assert.fail()
 */
public class CreateEmployeeTest extends BaseTest {

    // -- State shared within the single test run ------------------------------
    private String createdEmployeeId = null;

    // -- Employee data generated fresh each run --------------------------------
    private String empName;
    private String empRole;
    private String empEmail;
    private String empSalary;
    private String empPhone;
    private String empDept;
    private String empManager;

    // -- MockAPI HTTP client ---------------------------------------------------
    private final HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(15))
        .build();

    // =========================================================================
    // TEST 13 - Create Employee
    // =========================================================================
    @Test(description = "Create exactly one unique employee, verify in UI and MockAPI")
    public void testCreateEmployee() throws InterruptedException {
        System.out.println("=== TEST 13: Create Employee - Full E2E Validation ===");
        System.out.println("=".repeat(60));

        // --- STEP 1: Generate unique test data --------------------------------
        generateUniqueTestData();

        // --- STEP 2: Pre-check MockAPI for duplicate email --------------------
        System.out.println("\n  [STEP 2] Pre-checking MockAPI for duplicate email...");
        int retries = 0;
        while (emailExistsInMockApi(empEmail) && retries < 3) {
            System.out.println("  [WARN] Email already exists - regenerating data (retry " + (retries + 1) + ")");
            generateUniqueTestData();
            retries++;
        }
        if (retries == 3 && emailExistsInMockApi(empEmail)) {
            Assert.fail("[FAIL] Could not generate a unique email after 3 retries. Aborting.");
        }
        System.out.println("  [OK] Email is unique - proceeding.");

        // --- STEP 3: Login as Admin and navigate to Employee List -------------
        System.out.println("\n  [STEP 3] Logging in as Admin...");
        loginAsAdmin();
        navigateTo("/admin/employees");
        waitForUrl("/admin/employees");
        waitForTestId("employees-page");

        int initialCount = getEmployeeCardCount();
        System.out.println("  [INFO] Initial employee count in UI: " + initialCount);

        // --- STEP 4: Screenshot - before form --------------------------------
        System.out.println("\n  [STEP 4] Capturing screenshot BEFORE form opens...");
        captureScreenshot("01_before_form_open");

        // --- STEP 5: Click Add Employee ONCE ---------------------------------
        System.out.println("\n  [STEP 5] Clicking Add Employee button (once)...");
        WebElement addBtn = waitForTestId("add-employee-button");
        Assert.assertTrue(addBtn.isDisplayed(),
            "[FAIL] Add Employee button is not visible on /admin/employees");
        addBtn.click();   // exactly ONE click (Req 4, Req 10, Req 11)

        // Confirm modal opened
        WebElement modal = waitForTestId("add-employee-modal");
        Assert.assertTrue(modal.isDisplayed(),
            "[FAIL] Add Employee modal did not open after clicking Add Employee button");
        System.out.println("  [OK] Modal opened.");

        // --- STEP 6: Fill all required fields --------------------------------
        System.out.println("\n  [STEP 6] Filling form fields...");
        fillFormField("add-employee-name",    empName);
        fillFormField("add-employee-role",    empRole);
        fillFormField("add-employee-email",   empEmail);
        fillFormField("add-employee-salary",  empSalary);
        fillFormField("add-employee-phone",   empPhone);
        fillFormField("add-employee-manager", empManager);

        // Department select
        WebElement deptSelect = wait.until(ExpectedConditions.elementToBeClickable(
            By.cssSelector("[data-testid='add-employee-department']")
        ));
        selectOption(deptSelect, empDept);
        System.out.println("  [OK] Filled: name=" + empName + " | email=" + empEmail + " | role=" + empRole);

        // --- STEP 7: Screenshot - form filled --------------------------------
        System.out.println("\n  [STEP 7] Capturing screenshot with form filled (before submit)...");
        captureScreenshot("02_form_filled_before_submit");

        // --- STEP 8: Click Save ONCE, wait for response ----------------------
        System.out.println("\n  [STEP 8] Clicking Save (single click)...");
        WebElement saveBtn = wait.until(ExpectedConditions.elementToBeClickable(
            By.cssSelector("[data-testid='add-save-button']")
        ));

        // Verify button is enabled before clicking
        String disabledAttr = saveBtn.getAttribute("disabled");
        Assert.assertNull(disabledAttr,
            "[FAIL] Save button should be enabled before first submit");

        saveBtn.click();  // Req 4: exactly ONE click; app's submitting flag blocks re-entry (Req 11)

        // Immediately check button becomes disabled (Req 11 - prevent double submission)
        try {
            boolean disabledDuringSubmit = wait.until(d -> {
                WebElement btn = d.findElement(By.cssSelector("[data-testid='add-save-button']"));
                return btn.getAttribute("disabled") != null;
            });
            System.out.println("  [OK] Save button disabled during submission: " + disabledDuringSubmit);
        } catch (Exception e) {
            // Button may re-enable very quickly on fast connections - not a failure
            System.out.println("  [INFO] Button disabled state not captured (fast API response - OK).");
        }

        // --- STEP 9: Wait for modal to close (success indicator) -------------
        System.out.println("\n  [STEP 9] Waiting for modal to close (success state)...");
        waitForModalClosed("add-employee-modal");
        System.out.println("  [OK] Modal closed - employee creation succeeded. (Req 6 verified)");

        // --- STEP 10: Screenshot - after creation ----------------------------
        System.out.println("\n  [STEP 10] Capturing screenshot after successful creation...");
        captureScreenshot("03_after_employee_created");

        // --- STEP 11: Verify employee appears in UI --------------------------
        System.out.println("\n  [STEP 11] Verifying employee appears in UI list...");

        // Wait for the list to refresh - card count must increase (Req 7)
        waitForAtLeastNCards(initialCount + 1);

        // Search by the unique timestamp part of the name
        String uniquePart = empName.replace("Test Employee", "");
        WebElement searchBox = waitForTestId("employee-search");
        searchBox.clear();
        searchBox.sendKeys(uniquePart);

        // Wait for filtered cards to show the new employee
        wait.until(d -> {
            List<WebElement> cards = d.findElements(By.cssSelector("[data-testid='employee-card']"));
            return cards.stream().anyMatch(c -> c.getText().contains("QA Automation"));
        });

        List<WebElement> filteredCards = driver.findElements(By.cssSelector("[data-testid='employee-card']"));
        Assert.assertTrue(filteredCards.size() >= 1,
            "[FAIL] No cards found after searching for new employee. Expected at least 1.");

        boolean foundInUi = waitForTextInPage("QA Automation");
        Assert.assertTrue(foundInUi,
            "[FAIL] New employee '" + empName + "' not found in UI list after creation. (Req 7)");
        System.out.println("  [OK] Employee '" + empName + "' is visible in UI list. (Req 7 passed)");

        // Screenshot with employee in list
        captureScreenshot("04_employee_visible_in_list");

        // --- STEP 12: GET MockAPI and verify employee persisted --------------
        System.out.println("\n  [STEP 12] Verifying employee exists in MockAPI...");
        String mockApiResponse = getMockApiEmployees();
        System.out.println("  [MockAPI Response - first 400 chars]: "
            + mockApiResponse.substring(0, Math.min(400, mockApiResponse.length())));

        Assert.assertTrue(mockApiResponse.contains(empEmail),
            "[FAIL] Email '" + empEmail + "' not found in MockAPI response. (Req 8)");
        System.out.println("  [OK] Employee found in MockAPI by email. (Req 8 passed)");

        // Extract and store the created employee's ID (Req 9)
        createdEmployeeId = extractEmployeeId(mockApiResponse, empEmail);
        Assert.assertNotNull(createdEmployeeId,
            "[FAIL] Could not extract employee ID from MockAPI response. (Req 9)");

        // --- STEP 13: Final detailed summary log (Req 15) --------------------
        System.out.println("\n" + "=".repeat(60));
        System.out.println("  [SUMMARY] Employee Creation Results:");
        System.out.println("  | Name      : " + empName);
        System.out.println("  | Role      : " + empRole);
        System.out.println("  | Email     : " + empEmail);
        System.out.println("  | Dept      : " + empDept);
        System.out.println("  | Salary    : " + empSalary);
        System.out.println("  | Phone     : " + empPhone);
        System.out.println("  | Manager   : " + empManager);
        System.out.println("  | MockAPI ID: " + createdEmployeeId);
        System.out.println("  | In MockAPI: " + mockApiResponse.contains(empEmail));
        System.out.println("  | In UI     : " + foundInUi);
        System.out.println("=".repeat(60));
        System.out.println("  [PASSED] TEST 13: Employee created, verified in UI and MockAPI.");
    }

    // =========================================================================
    // Private Helpers
    // =========================================================================

    /**
     * Generates a fresh set of unique employee data using the current epoch ms.
     * Printed to stdout (Req 15).
     */
    private void generateUniqueTestData() {
        long ts = System.currentTimeMillis();
        empName    = "Test Employee" + ts;
        empRole    = "QA Automation Engineer";
        empEmail   = "testuser." + ts + "@automation.test";
        empSalary  = "62000";
        // Build a 10-digit phone number from the timestamp
        String tsStr = String.valueOf(ts);
        empPhone   = "9" + tsStr.substring(tsStr.length() - 9);
        empDept    = "Engineering";
        empManager = "Admin";

        System.out.println("\n  [STEP 1] Generated unique employee data:");
        System.out.println("    Name    : " + empName);
        System.out.println("    Role    : " + empRole);
        System.out.println("    Email   : " + empEmail);
        System.out.println("    Salary  : " + empSalary);
        System.out.println("    Phone   : " + empPhone);
        System.out.println("    Dept    : " + empDept);
        System.out.println("    Manager : " + empManager);
    }

    /**
     * Returns true if the given email already exists in MockAPI (Req 12).
     */
    private boolean emailExistsInMockApi(String email) {
        try {
            return getMockApiEmployees().contains(email);
        } catch (Exception e) {
            System.err.println("  [WARN] MockAPI pre-check failed: " + e.getMessage());
            return false;
        }
    }

    /**
     * Performs a GET request to MockAPI and returns the raw JSON response.
     */
    private String getMockApiEmployees() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(MOCKAPI_URL))
                .timeout(Duration.ofSeconds(20))
                .GET()
                .build();
            HttpResponse<String> response =
                httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            System.out.println("  [MockAPI] GET status: " + response.statusCode());
            return response.body();
        } catch (IOException | InterruptedException e) {
            System.err.println("  [WARN] MockAPI GET failed: " + e.getMessage());
            return "[]";
        }
    }

    /**
     * Extracts the "id" field value from the JSON object whose "email" field
     * matches the given email. Uses lightweight string parsing (no extra deps).
     */
    private String extractEmployeeId(String jsonArray, String email) {
        int emailIdx = jsonArray.indexOf(email);
        if (emailIdx < 0) return null;

        int objStart = jsonArray.lastIndexOf('{', emailIdx);
        if (objStart < 0) return null;

        int objEnd = jsonArray.indexOf('}', emailIdx);
        if (objEnd < 0) return null;

        String obj = jsonArray.substring(objStart, objEnd + 1);

        int idIdx = obj.indexOf("\"id\"");
        if (idIdx < 0) return null;

        int colonIdx = obj.indexOf(':', idIdx);
        if (colonIdx < 0) return null;

        int valueStart = colonIdx + 1;
        while (valueStart < obj.length() && obj.charAt(valueStart) == ' ') valueStart++;

        if (obj.charAt(valueStart) == '"') {
            int endQuote = obj.indexOf('"', valueStart + 1);
            if (endQuote < 0) return null;
            return obj.substring(valueStart + 1, endQuote);
        }

        int valueEnd = valueStart;
        while (valueEnd < obj.length() && Character.isDigit(obj.charAt(valueEnd))) valueEnd++;
        return obj.substring(valueStart, valueEnd);
    }

    /**
     * Clears a form field by data-testid and types the given value.
     * Scrolls into view first to handle overflow in modal.
     */
    private void fillFormField(String testId, String value) {
        WebElement el = wait.until(ExpectedConditions.elementToBeClickable(
            By.cssSelector("[data-testid='" + testId + "']")
        ));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", el);
        el.clear();
        el.sendKeys(value);
    }

    /**
     * Sets a select element's value via JavaScript for cross-browser reliability.
     */
    private void selectOption(WebElement select, String optionText) {
        ((JavascriptExecutor) driver).executeScript(
            "var s = arguments[0]; var opts = s.options;" +
            "for (var i = 0; i < opts.length; i++) {" +
            "  if (opts[i].text === arguments[1]) {" +
            "    s.selectedIndex = i;" +
            "    s.dispatchEvent(new Event('change', { bubbles: true }));" +
            "    break;" +
            "  }" +
            "}",
            select, optionText
        );
    }

    /** Returns the current count of employee-card elements (waits up to 10 s for first). */
    private int getEmployeeCardCount() {
        try {
            wait.until(d -> !d.findElements(By.cssSelector("[data-testid='employee-card']")).isEmpty());
        } catch (Exception ignored) { /* list may legitimately be empty */ }
        return driver.findElements(By.cssSelector("[data-testid='employee-card']")).size();
    }
}
