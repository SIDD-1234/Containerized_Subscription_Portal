package com.subscription.portal;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class SmokeTest extends BaseTest {

    @Test
    void portalLoadsSuccessfully() throws InterruptedException {

        String title = driver.getTitle();

        System.out.println("Page title: " + title);
        System.out.println("Current URL: " + driver.getCurrentUrl());

        assertTrue(
                driver.getCurrentUrl().contains("localhost"),
                "Subscription Portal did not load"
        );

        Thread.sleep(5000);
    }
}