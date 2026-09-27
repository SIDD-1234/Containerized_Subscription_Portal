package com.subscription.portal;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class UpdateSubscriptionTest extends BaseTest {

    @Test
    void updateSubscriptionSuccessfully() {

        WebDriverWait wait = new WebDriverWait(
                driver,
                Duration.ofSeconds(15)
        );

        // Wait for subscriptions table to load
        wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        By.cssSelector("tbody tr")
                )
        );

        // Select the first subscription row
        WebElement firstRow = driver.findElement(
                By.cssSelector("tbody tr")
        );

        String originalName = firstRow
                .findElement(By.cssSelector("td:first-child"))
                .getText();

        System.out.println("Updating subscription: " + originalName);

        // Click Edit for the first subscription
        firstRow.findElement(
                By.xpath(".//button[normalize-space()='Edit']")
        ).click();

        // Verify edit mode
        wait.until(
                ExpectedConditions.textToBePresentInElementLocated(
                        By.tagName("body"),
                        "Update Subscription"
                )
        );

        // Change the category
        WebElement category = wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        By.name("category")
                )
        );

        category.clear();
        category.sendKeys("Updated Testing");

        // Change the cost
        WebElement cost = driver.findElement(
                By.name("cost")
        );

        cost.clear();
        cost.sendKeys("599.00");

        System.out.println("New category: Updated Testing");
        System.out.println("New cost: 599.00");

        // Click Update Subscription
        driver.findElement(
                By.xpath("//button[normalize-space()='Update Subscription']")
        ).click();

        // Verify success message
        wait.until(
                ExpectedConditions.textToBePresentInElementLocated(
                        By.tagName("body"),
                        "Subscription updated successfully."
                )
        );

        // Find the original subscription again
        WebElement updatedRow = wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        By.xpath(
                                "//tbody/tr[td[normalize-space()='" +
                                originalName +
                                "']]"
                        )
                )
        );

        String rowText = updatedRow.getText();

        System.out.println("Updated row:");
        System.out.println(rowText);

        // Verify updated values
        assertTrue(
                rowText.contains("Updated Testing"),
                "Category was not updated"
        );

        assertTrue(
                rowText.contains("INR 599"),
                "Cost was not updated"
        );

        System.out.println(
                "TC03 PASSED: Subscription updated successfully"
        );
    }
}
