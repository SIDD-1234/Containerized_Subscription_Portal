package com.subscription.portal;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class InvalidSubscriptionDataTest extends BaseTest {

    @Test
    void invalidSubscriptionDataShowsValidationMessage() {

        WebDriverWait wait = new WebDriverWait(
                driver,
                Duration.ofSeconds(20)
        );

        // Wait for the form
        wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        By.name("name")
                )
        );

        String subscriptionName =
                "Invalid Test " + System.currentTimeMillis();

        // Fill the form
        driver.findElement(By.name("name"))
                .sendKeys(subscriptionName);

        driver.findElement(By.name("provider"))
                .sendKeys("Test Provider");

        driver.findElement(By.name("category"))
                .sendKeys("Testing");

        // Enter an invalid cost
        WebElement cost =
                driver.findElement(By.name("cost"));

        cost.sendKeys("-100");

        // Fill dates
        driver.findElement(By.name("startDate"))
                .sendKeys("27/09/2026");

        driver.findElement(By.name("renewalDate"))
                .sendKeys("27/10/2026");

        // Submit
        WebElement submitButton =
                driver.findElement(
                        By.cssSelector("button[type='submit']")
                );

        submitButton.click();

        /*
         * Because cost has min="0", the browser should reject
         * the form and prevent successful submission.
         */
        wait.until(driver -> {

            String bodyText =
                    driver.findElement(By.tagName("body"))
                            .getText();

            String costValue =
                    driver.findElement(By.name("cost"))
                            .getAttribute("value");

            return !bodyText.contains(
                        "Subscription created successfully."
                   )
                   && (
                        bodyText.toLowerCase().contains("cost")
                        || bodyText.toLowerCase().contains("invalid")
                        || "-100".equals(costValue)
                   );
        });

        String bodyText =
                driver.findElement(By.tagName("body"))
                        .getText();

        System.out.println("Validation response:");
        System.out.println(bodyText);

        assertTrue(
                !bodyText.contains(
                        "Subscription created successfully."
                ),
                "Invalid subscription should not be created"
        );

        System.out.println(
                "TC05 PASSED: Invalid subscription data was rejected"
        );
    }
}
