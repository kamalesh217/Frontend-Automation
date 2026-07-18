package com.cucumber.runner;

import org.junit.runner.RunWith;

import io.cucumber.junit.Cucumber;
import io.cucumber.junit.CucumberOptions;

@RunWith(Cucumber.class)
@CucumberOptions(
    features = "src/test/resources/features",
    glue = "com.cucumber.stepdefinitions",
    plugin = {
        "pretty",
        "html:target/cucumber-report.html",
        "json:target/cucumber-report.json"
    },
    monochrome = true
)
public class TestRunner {
    // Runs all feature files under src/test/resources/features/
    // AdminLogin.feature  -> 2 scenarios (Scenario Outline x 2)
    // EmployeeLogin.feature -> 2 scenarios (Scenario Outline x 2)
    // Total: 4 scenarios
}