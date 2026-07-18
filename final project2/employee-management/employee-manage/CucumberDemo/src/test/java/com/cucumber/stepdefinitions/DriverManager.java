package com.cucumber.stepdefinitions;

import org.openqa.selenium.WebDriver;

/**
 * Thread-local WebDriver manager.
 * Allows sharing a single WebDriver instance across all step definition classes
 * within the same Cucumber scenario thread.
 */
public class DriverManager {

    private static final ThreadLocal<WebDriver> driverThreadLocal = new ThreadLocal<>();

    public static void setDriver(WebDriver driver) {
        driverThreadLocal.set(driver);
    }

    public static WebDriver getDriver() {
        return driverThreadLocal.get();
    }

    public static void removeDriver() {
        driverThreadLocal.remove();
    }
}
