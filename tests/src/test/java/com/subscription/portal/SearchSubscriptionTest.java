package com.subscription.portal;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class SearchSubscriptionTest extends BaseTest {

    @Test
    void searchSubscriptionSuccessfully() {

        WebDriverWait wait = new WebDriverWait(
                driver,
                Duration.ofSeconds(15)
        );

        // Wait for the search box to appear
        WebElement searchBox = wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        By.cssSelector(
                                "input[placeholder='Search by name or provider...']"
                        )
                )
        );

        // Search for an existing subscription
        String searchTerm = "Netflix";

        System.out.println("Searching for: " + searchTerm);

        searchBox.sendKeys(searchTerm);

        // Wait until at least one matching subscription is displayed
        WebElement netflixRow = wait.until(
                ExpectedConditions.visibilityOfElementLocated(
                        By.xpath(
                                "//tbody/tr[td[contains(normalize-space(), 'Netflix')]]"
                        )
                )
        );

        String rowText = netflixRow.getText();

        System.out.println("Search result:");
        System.out.println(rowText);

        assertTrue(
                rowText.contains("Netflix"),
                "Netflix subscription was not found in search results"
        );

        System.out.println(
                "TC03 PASSED: Subscription search works successfully"
        );
    }
}
