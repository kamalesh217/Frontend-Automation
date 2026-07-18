package com.cucumber.stepdefinitions;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.github.bonigarcia.wdm.WebDriverManager;

import java.time.Duration;

/**
 * Shared Cucumber Hooks — opens and closes Chrome for every scenario.
 * The WebDriver instance is stored in DriverManager so all step classes can share it.
 */
public class Hooks {

    @Before
    public void setUp() {
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        WebDriver driver = new ChromeDriver(options);
        driver.manage().window().maximize();
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
        DriverManager.setDriver(driver);
        System.out.println("\n🚀 Browser launched for scenario.");
    }

    @After
    public void tearDown() {
        WebDriver driver = DriverManager.getDriver();
        if (driver != null) {
            driver.quit();
            DriverManager.removeDriver();
            System.out.println("🛑 Browser closed after scenario.\n");
        }
    }
}
