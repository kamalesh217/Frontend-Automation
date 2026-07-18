package com.employee.automation;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.text.SimpleDateFormat;
import java.time.Duration;
import java.util.Date;
import java.util.List;

/**
 * BaseTest - shared browser lifecycle and helper utilities.
 * All test classes extend this so every test gets a fresh Chrome session.
 */
public class BaseTest {

    protected static final String BASE_URL    = "http://localhost:5173";
    protected static final String ADMIN_USER  = "admin";
    protected static final String ADMIN_PASS  = "admin123";
    protected static final String EMP_USER    = "emp002";
    protected static final String EMP_USER2   = "emp003";
    protected static final String EMP_PASS    = "pass123";
    protected static final String MOCKAPI_URL =
        "https://6a4b3689f5eab0bb6b625725.mockapi.io/employee";

    /** Directory where screenshots are saved (relative to pom.xml). */
    protected static final String SCREENSHOTS_DIR = "screenshots";

    protected WebDriver driver;
    protected WebDriverWait wait;

    // -- Lifecycle ------------------------------------------------------------

    @BeforeMethod
    public void setUp() {
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        driver = new ChromeDriver(options);
        driver.manage().window().maximize();
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(5));
        wait = new WebDriverWait(driver, Duration.ofSeconds(20));
        System.out.println("\n[BROWSER] Opened.");
    }

    @AfterMethod
    public void tearDown() {
        if (driver != null) {
            driver.quit();
            System.out.println("[BROWSER] Closed.\n");
        }
    }

    // -- Navigation -----------------------------------------------------------

    protected void navigateTo(String path) {
        driver.get(BASE_URL + path);
    }

    protected void clearSession() {
        driver.get(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("window.localStorage.clear();");
        System.out.println("  [SETUP] Session cleared.");
    }

    protected void waitForUrl(String fragment) {
        wait.until(ExpectedConditions.urlContains(fragment));
    }

    // -- Element Helpers ------------------------------------------------------

    protected WebElement waitForTestId(String testId) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(
            By.cssSelector("[data-testid='" + testId + "']")
        ));
    }

    protected WebElement waitForCss(String selector) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(
            By.cssSelector(selector)
        ));
    }

    protected WebElement waitForId(String id) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(By.id(id)));
    }

    protected void typeInto(String testId, String value) {
        WebElement el = wait.until(ExpectedConditions.elementToBeClickable(
            By.cssSelector("[data-testid='" + testId + "']")
        ));
        el.clear();
        el.sendKeys(value);
    }

    protected void clickTestId(String testId) {
        wait.until(ExpectedConditions.elementToBeClickable(
            By.cssSelector("[data-testid='" + testId + "']")
        )).click();
    }

    /**
     * Wait until the given modal data-testid is no longer visible.
     * Uses explicit wait - no Thread.sleep.
     */
    protected void waitForModalClosed(String modalTestId) {
        wait.until(ExpectedConditions.invisibilityOfElementLocated(
            By.cssSelector("[data-testid='" + modalTestId + "']")
        ));
    }

    /**
     * Wait until at least minCount employee-card elements are visible.
     */
    protected void waitForAtLeastNCards(int minCount) {
        wait.until(d -> {
            List<WebElement> cards = d.findElements(
                By.cssSelector("[data-testid='employee-card']")
            );
            return cards.size() >= minCount && !cards.isEmpty() && cards.get(0).isDisplayed();
        });
    }

    /**
     * Wait until ANY element on the page contains the given text.
     * Returns true if found within the wait timeout, false otherwise.
     */
    protected boolean waitForTextInPage(String text) {
        try {
            wait.until(driver -> driver.getPageSource().contains(text));
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /** Returns true when the CSS sidebar is rendered and visible (desktop widths). */
    protected boolean isSidebarVisible() {
        try {
            List<WebElement> sidebars = driver.findElements(By.cssSelector(".sidebar"));
            return !sidebars.isEmpty() && sidebars.get(0).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    // -- Login Flows ----------------------------------------------------------

    protected void loginAsAdmin() {
        clearSession();
        navigateTo("/admin/login");
        waitForTestId("admin-login-page");
        typeInto("username-input", ADMIN_USER);
        typeInto("password-input", ADMIN_PASS);
        clickTestId("login-button");
        waitForUrl("/admin/dashboard");
        System.out.println("  [OK] Logged in as Admin.");
    }

    protected void loginAsEmployee() {
        loginAsEmployee(EMP_USER);
    }

    protected void loginAsEmployee(String username) {
        clearSession();
        navigateTo("/employee/login");
        waitForTestId("employee-login-page");
        typeInto("username-input", username);
        typeInto("password-input", EMP_PASS);
        clickTestId("login-button");
        waitForUrl("/employee/dashboard");
        System.out.println("  [OK] Logged in as Employee (" + username + ").");
    }

    // -- Screenshot Helper ----------------------------------------------------

    /**
     * Captures a PNG screenshot and saves it to the screenshots/ directory.
     * Filename: {yyyyMMdd_HHmmss_SSS}_{label}.png
     *
     * @param label short descriptive label, e.g. "before_submit"
     * @return absolute path of saved file, or null on failure
     */
    protected String captureScreenshot(String label) {
        try {
            Path dir = Paths.get(SCREENSHOTS_DIR);
            if (!Files.exists(dir)) {
                Files.createDirectories(dir);
            }
            String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss_SSS").format(new Date());
            String filename  = timestamp + "_" + label.replaceAll("[^a-zA-Z0-9_\\-]", "_") + ".png";
            Path dest = dir.resolve(filename);
            File src = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
            Files.copy(src.toPath(), dest, StandardCopyOption.REPLACE_EXISTING);
            System.out.println("  [SCREENSHOT] Saved: " + dest.toAbsolutePath());
            return dest.toAbsolutePath().toString();
        } catch (IOException e) {
            System.err.println("  [WARN] Screenshot failed: " + e.getMessage());
            return null;
        }
    }
}
