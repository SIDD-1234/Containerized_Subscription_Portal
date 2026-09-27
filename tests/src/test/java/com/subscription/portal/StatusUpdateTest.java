package com.subscription.portal;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class StatusUpdateTest extends BaseTest {

    @Test
    void activateDraftSubscriptionSuccessfully() {

        WebDriverWait wait = new WebDriverWait(
                driver,
                Duration.ofSeconds(20)
        );

        // =========================================================
        // 1. CHANGE ROLE TO ADMIN
        // =========================================================

        Select role = new Select(
                wait.until(
                        ExpectedConditions.visibilityOfElementLocated(
                                By.cssSelector("select")
                        )
                )
        );

        role.selectByVisibleText("ADMIN");

        System.out.println("Role changed to ADMIN");


        // =========================================================
        // 2. CREATE UNIQUE TEST SUBSCRIPTION
        // =========================================================

        String subscriptionName =
                "Status Test " + System.currentTimeMillis();

        String startDate = "2026-09-27";
        String renewalDate = "2026-10-27";

        System.out.println(
                "Creating status test subscription: " +
                subscriptionName
        );


        driver.findElement(By.name("name"))
                .sendKeys(subscriptionName);

        driver.findElement(By.name("provider"))
                .sendKeys("Status Test Provider");

        driver.findElement(By.name("category"))
                .sendKeys("Testing");

        driver.findElement(By.name("cost"))
                .sendKeys("299.00");


        // Currency
        new Select(
                driver.findElement(By.name("currency"))
        ).selectByVisibleText("INR");


        // Billing cycle
        new Select(
                driver.findElement(By.name("billingCycle"))
        ).selectByVisibleText("Monthly");


        // =========================================================
        // 3. FILL START DATE
        // =========================================================

        WebElement startDateField =
                driver.findElement(By.name("startDate"));

        ((org.openqa.selenium.JavascriptExecutor) driver)
                .executeScript(
                        "arguments[0].value = arguments[1];" +
                        "arguments[0].dispatchEvent(" +
                        "new Event('input', {bubbles:true})" +
                        ");" +
                        "arguments[0].dispatchEvent(" +
                        "new Event('change', {bubbles:true})" +
                        ");",
                        startDateField,
                        startDate
                );


        // =========================================================
        // 4. FILL RENEWAL DATE
        // =========================================================

        WebElement renewalDateField =
                driver.findElement(By.name("renewalDate"));

        ((org.openqa.selenium.JavascriptExecutor) driver)
                .executeScript(
                        "arguments[0].value = arguments[1];" +
                        "arguments[0].dispatchEvent(" +
                        "new Event('input', {bubbles:true})" +
                        ");" +
                        "arguments[0].dispatchEvent(" +
                        "new Event('change', {bubbles:true})" +
                        ");",
                        renewalDateField,
                        renewalDate
                );


        System.out.println(
                "Start date field: " +
                startDateField.getAttribute("value")
        );

        System.out.println(
                "Renewal date field: " +
                renewalDateField.getAttribute("value")
        );


        // =========================================================
        // 5. CREATE SUBSCRIPTION
        // =========================================================

        driver.findElement(
                By.xpath(
                        "//button[normalize-space()='Create Subscription']"
                )
        ).click();

        System.out.println(
                "Create Subscription button clicked"
        );


        // =========================================================
        // 6. WAIT FOR CREATION
        // =========================================================

        wait.until(
                ExpectedConditions.textToBePresentInElementLocated(
                        By.tagName("body"),
                        "Subscription created successfully."
                )
        );

        System.out.println(
                "Subscription creation successful"
        );


        // =========================================================
        // 7. FIND OUR SUBSCRIPTION ROW
        // =========================================================

        By subscriptionRowLocator = By.xpath(
                "//tbody/tr[td[normalize-space()='" +
                subscriptionName +
                "']]"
        );

        WebElement row = wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        subscriptionRowLocator
                )
        );

        System.out.println(
                "Subscription row found: " +
                subscriptionName
        );

        System.out.println(
                "Initial row: " +
                row.getText()
        );


        // =========================================================
        // 8. READ ONLY THE <strong> STATUS
        // =========================================================

        WebElement statusElement = row.findElement(
                By.cssSelector("td:nth-child(8) strong")
        );

        String initialStatus =
                statusElement.getText().trim();

        System.out.println(
                "Initial status: [" +
                initialStatus +
                "]"
        );


        // =========================================================
        // 9. VERIFY DRAFT
        // =========================================================

        assertEquals(
                "DRAFT",
                initialStatus,
                "New subscription should initially be DRAFT"
        );


        // =========================================================
        // 10. FIND ACTIVATE BUTTON
        // =========================================================

        WebElement activateButton = row.findElement(
                By.xpath(
                        ".//button[normalize-space()='Activate']"
                )
        );

        wait.until(
                ExpectedConditions.elementToBeClickable(
                        activateButton
                )
        );


        // =========================================================
        // 11. ACTIVATE
        // =========================================================

        System.out.println(
                "Activating subscription: " +
                subscriptionName
        );

        activateButton.click();


        // =========================================================
        // 12. WAIT FOR SUCCESS MESSAGE
        // =========================================================

        wait.until(
                ExpectedConditions.textToBePresentInElementLocated(
                        By.tagName("body"),
                        "Subscription status changed to ACTIVE."
                )
        );

        System.out.println(
                "Status update success message received"
        );


        // =========================================================
        // 13. WAIT FOR SAME ROW
        // =========================================================

        WebElement updatedRow = wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        subscriptionRowLocator
                )
        );


        // =========================================================
        // 14. READ ONLY THE <strong> STATUS AGAIN
        // =========================================================

        WebElement updatedStatusElement =
                updatedRow.findElement(
                        By.cssSelector("td:nth-child(8) strong")
                );

        String updatedStatus =
                updatedStatusElement.getText().trim();

        System.out.println(
                "Updated status: [" +
                updatedStatus +
                "]"
        );

        System.out.println("Updated row:");
        System.out.println(updatedRow.getText());


        // =========================================================
        // 15. VERIFY ACTIVE
        // =========================================================

        assertEquals(
                "ACTIVE",
                updatedStatus,
                "Subscription was not changed to ACTIVE"
        );


        System.out.println(
                "TC04 PASSED: DRAFT subscription activated successfully"
        );
    }
}