package com.employee.automation;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.annotations.AfterTest;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import io.github.bonigarcia.wdm.WebDriverManager;

public class TestNG_report {
     WebDriver driver;

@BeforeTest
public void beforetest(){
        WebDriverManager.chromedriver().setup();
        // Launch a new Chrome browser
        driver = new ChromeDriver();
        // Open your  application
        String url = "http://www.facebook.com/";
        driver.get(url);

}

@Test(dataProvider = "loginInfo")
public void test(String username,String password) throws InterruptedException{
   
        driver.manage().window().maximize();
        WebElement uname =driver.findElement(By.id("_R_1h6kqsqppb6amH1_"));
        // uname.clear();
        WebElement pass=driver.findElement(By.id("_R_1hmkqsqppb6amH1_"));
        // pass.clear();
        // Thread.sleep(5000);
        uname.sendKeys(username);
        pass.sendKeys(password);
        driver.navigate().refresh();
        Thread.sleep(5000);   
        
        }


@DataProvider(name="loginInfo")
public Object[][] login(){
    return new Object[][]{

        { "rahul@gmail.com", "rahul"},
        { "manager@gmail.com", "Manager"},
        { "sales@gmail.com", "Sales"}
    
    };



    
}


@AfterTest
public void aftertest(){

    driver.quit();

}
}