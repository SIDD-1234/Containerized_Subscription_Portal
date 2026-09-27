package com.subscription.portal;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.junit.jupiter.api.TestInfo;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

@ExtendWith(ScreenshotExtension.class)
public class BaseTest {

    protected WebDriver driver;

    @BeforeEach
    void setUp() {
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        driver.get("http://localhost");
    }

    @AfterEach
    void tearDown(TestInfo testInfo) {

        try {

            if (ScreenshotExtension.hasFailed() && driver != null) {

                File screenshotDir =
                        new File("target/screenshots");

                if (!screenshotDir.exists()) {
                    screenshotDir.mkdirs();
                }

                String fileName =
                        testInfo.getTestClass()
                                .map(Class::getSimpleName)
                                .orElse("UnknownTest")
                        + "_"
                        + testInfo.getTestMethod()
                                .map(method -> method.getName())
                                .orElse("UnknownMethod")
                        + ".png";

                File destination =
                        new File(screenshotDir, fileName);

                File screenshot =
                        ((TakesScreenshot) driver)
                                .getScreenshotAs(OutputType.FILE);

                Files.copy(
                        screenshot.toPath(),
                        destination.toPath(),
                        StandardCopyOption.REPLACE_EXISTING
                );

                System.out.println(
                        "Screenshot saved: "
                        + destination.getAbsolutePath()
                );
            }

        } catch (Exception e) {

            System.out.println(
                    "Screenshot capture failed: "
                            + e.getMessage()
            );

        } finally {

            ScreenshotExtension.reset();

            if (driver != null) {
                driver.quit();
            }
        }
    }

    private void takeScreenshot() throws Exception {
        File source = ((TakesScreenshot) driver)
                .getScreenshotAs(OutputType.FILE);

        Path destination = Path.of(
                "target",
                "screenshots",
                "failure-" + System.currentTimeMillis() + ".png"
        );

        Files.createDirectories(destination.getParent());

        Files.copy(
                source.toPath(),
                destination,
                StandardCopyOption.REPLACE_EXISTING
        );

        System.out.println("Failure screenshot saved: " + destination);
    }
}
