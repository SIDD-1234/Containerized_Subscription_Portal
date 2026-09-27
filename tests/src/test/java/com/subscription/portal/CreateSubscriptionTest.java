package com.subscription.portal;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class CreateSubscriptionTest extends BaseTest {

    @Test
    void createSubscriptionSuccessfully() {

        String name = "Selenium Test " + System.currentTimeMillis();
        String provider = "Test Provider";
        String category = "Testing";
        String cost = "499.00";
        String startDate = "2026-09-24";
        String renewalDate = "2026-10-24";

        WebDriverWait wait = new WebDriverWait(
                driver,
                Duration.ofSeconds(15)
        );

        // Wait until the application is actually loaded.
        wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        By.name("name")
                )
        );

        driver.findElement(By.name("name"))
                .sendKeys(name);

        driver.findElement(By.name("provider"))
                .sendKeys(provider);

        driver.findElement(By.name("category"))
                .sendKeys(category);

        driver.findElement(By.name("cost"))
                .sendKeys(cost);

        Select currency = new Select(
                driver.findElement(By.name("currency"))
        );
        currency.selectByVisibleText("INR");

        Select billingCycle = new Select(
                driver.findElement(By.name("billingCycle"))
        );
        billingCycle.selectByVisibleText("Monthly");

        WebElement startDateField = driver.findElement(By.name("startDate"));
        ((org.openqa.selenium.JavascriptExecutor) driver).executeScript(
                "arguments[0].value = arguments[1];" +
                "arguments[0].dispatchEvent(new Event('input', {bubbles:true}));" +
                "arguments[0].dispatchEvent(new Event('change', {bubbles:true}));",
                startDateField,
                startDate
        );

        WebElement renewalDateField = driver.findElement(By.name("renewalDate"));
        ((org.openqa.selenium.JavascriptExecutor) driver).executeScript(
                "arguments[0].value = arguments[1];" +
                "arguments[0].dispatchEvent(new Event('input', {bubbles:true}));" +
                "arguments[0].dispatchEvent(new Event('change', {bubbles:true}));",
                renewalDateField,
                renewalDate
        );

        System.out.println("Start date field: " +
        startDateField.getAttribute("value"));

        System.out.println("Renewal date field: " +
                renewalDateField.getAttribute("value"));

        System.out.println("Creating subscription: " + name);

        driver.findElement(
                By.xpath("//button[normalize-space()='Create Subscription']")
        ).click();

        // Wait for React to finish the POST + reload cycle.
        wait.until(
                ExpectedConditions.textToBePresentInElementLocated(
                        By.tagName("body"),
                        "Subscription created successfully."
                )
        );

        // Wait specifically for the newly created subscription.
        By subscriptionRow = By.xpath(
                "//tbody/tr[td[normalize-space()='" + name + "']]"
        );

        WebElement row = wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        subscriptionRow
                )
        );

        String rowText = row.getText();

        System.out.println("Created row:");
        System.out.println(rowText);

        assertTrue(
                rowText.contains(name),
                "Created subscription was not displayed"
        );

        assertTrue(
                rowText.contains("DRAFT"),
                "Created subscription is not in DRAFT status"
        );

        System.out.println(
                "TC02 PASSED: Subscription created successfully as DRAFT"
        );
    }
}
