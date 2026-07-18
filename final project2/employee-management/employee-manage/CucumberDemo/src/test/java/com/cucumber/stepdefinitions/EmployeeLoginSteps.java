package com.cucumber.stepdefinitions;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

import java.time.Duration;

public class EmployeeLoginSteps {

    private static final String BASE_URL = "http://localhost:5173";

    private WebDriver driver() {
        return DriverManager.getDriver();
    }

    private WebDriverWait getWait() {
        // Increased to 20s to handle 600ms artificial auth delay + React navigation
        return new WebDriverWait(driver(), Duration.ofSeconds(20));
    }

    @Given("Employee opens the employee login page")
    public void employee_opens_the_employee_login_page() {
        // Clear any stale session data (e.g. from previous admin test run)
        driver().get(BASE_URL);
        ((JavascriptExecutor) driver()).executeScript("window.localStorage.clear();");
        System.out.println("  🧹 Cleared localStorage (stale session removed).");

        driver().get(BASE_URL + "/employee/login");
        getWait().until(ExpectedConditions.presenceOfElementLocated(
            By.cssSelector("[data-testid='employee-login-page']")
        ));
        System.out.println("  ✅ Employee login page opened: " + driver().getCurrentUrl());
    }

    @When("employee enters username {string}")
    public void employee_enters_username(String username) {
        WebElement field = getWait().until(ExpectedConditions.elementToBeClickable(
            By.cssSelector("[data-testid='username-input']")
        ));
        field.clear();
        field.sendKeys(username);
        System.out.println("  ✅ Employee username entered: " + username);
    }

    @And("employee enters password {string}")
    public void employee_enters_password(String password) {
        WebElement field = getWait().until(ExpectedConditions.elementToBeClickable(
            By.cssSelector("[data-testid='password-input']")
        ));
        field.clear();
        field.sendKeys(password);
        System.out.println("  ✅ Employee password entered.");
    }

    @Then("employee clicks the login button and reaches dashboard")
    public void employee_clicks_the_login_button_and_reaches_dashboard() {
        WebElement btn = getWait().until(ExpectedConditions.elementToBeClickable(
            By.cssSelector("[data-testid='login-button']")
        ));
        btn.click();
        System.out.println("  ✅ Employee login button clicked.");

        // Wait up to 20s for redirect (covers 600ms artificial delay + page load)
        try {
            getWait().until(ExpectedConditions.urlContains("/employee/dashboard"));
        } catch (org.openqa.selenium.TimeoutException e) {
            try {
                WebElement errorEl = driver().findElement(By.cssSelector("[data-testid='login-error']"));
                System.out.println("❌ SCREENSHOT OF ERROR MESSAGE: " + errorEl.getText());
            } catch (Exception ex) {
                System.out.println("❌ No data-testid='login-error' found on screen. Page URL: " + driver().getCurrentUrl());
            }
            throw e;
        }
        
        String currentUrl = driver().getCurrentUrl();
        System.out.println("  ✅ Redirected to: " + currentUrl);

        if (!currentUrl.contains("/employee/dashboard")) {
            throw new AssertionError(
                "Expected /employee/dashboard but was: " + currentUrl
            );
        }
        System.out.println("  🎉 EMPLOYEE LOGIN SUCCESS — Dashboard reached!");
    }
}
