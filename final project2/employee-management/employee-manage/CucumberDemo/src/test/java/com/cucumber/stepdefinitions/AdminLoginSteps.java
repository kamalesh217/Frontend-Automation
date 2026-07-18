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

public class AdminLoginSteps {

    private static final String BASE_URL = "http://localhost:5173";

    private WebDriver driver() {
        return DriverManager.getDriver();
    }

    private WebDriverWait getWait() {
        // 20s to cover 600ms artificial auth delay + React navigation
        return new WebDriverWait(driver(), Duration.ofSeconds(20));
    }

    @Given("Admin opens the admin login page")
    public void admin_opens_the_admin_login_page() {
        // Clear any stale session before starting
        driver().get(BASE_URL);
        ((JavascriptExecutor) driver()).executeScript("window.localStorage.clear();");
        System.out.println("  🧹 Cleared localStorage (stale session removed).");

        driver().get(BASE_URL + "/admin/login");
        getWait().until(ExpectedConditions.presenceOfElementLocated(
            By.cssSelector("[data-testid='admin-login-page']")
        ));
        System.out.println("  ✅ Admin login page opened: " + driver().getCurrentUrl());
    }

    @When("admin enters username {string}")
    public void admin_enters_username(String username) {
        WebElement field = getWait().until(ExpectedConditions.elementToBeClickable(
            By.cssSelector("[data-testid='username-input']")
        ));
        field.clear();
        field.sendKeys(username);
        System.out.println("  ✅ Admin username entered: " + username);
    }

    @And("admin enters password {string}")
    public void admin_enters_password(String password) {
        WebElement field = getWait().until(ExpectedConditions.elementToBeClickable(
            By.cssSelector("[data-testid='password-input']")
        ));
        field.clear();
        field.sendKeys(password);
        System.out.println("  ✅ Admin password entered.");
    }

    @Then("admin clicks the login button and reaches dashboard")
    public void admin_clicks_the_login_button_and_reaches_dashboard() {
        WebElement btn = getWait().until(ExpectedConditions.elementToBeClickable(
            By.cssSelector("[data-testid='login-button']")
        ));
        btn.click();
        System.out.println("  ✅ Admin login button clicked.");

        // Wait up to 20s for redirect (covers 600ms artificial delay + page load)
        try {
            getWait().until(ExpectedConditions.urlContains("/admin/dashboard"));
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

        if (!currentUrl.contains("/admin/dashboard")) {
            throw new AssertionError(
                "Expected /admin/dashboard but was: " + currentUrl
            );
        }
        System.out.println("  🎉 ADMIN LOGIN SUCCESS — Dashboard reached!");
    }
}
