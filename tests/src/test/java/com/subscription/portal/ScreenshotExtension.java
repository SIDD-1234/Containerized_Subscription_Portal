package com.subscription.portal;

import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.TestWatcher;

public class ScreenshotExtension implements TestWatcher {

    private static final ThreadLocal<Boolean> FAILED =
            ThreadLocal.withInitial(() -> false);

    public static boolean hasFailed() {
        return FAILED.get();
    }

    public static void reset() {
        FAILED.remove();
    }

    @Override
    public void testFailed(
            ExtensionContext context,
            Throwable cause) {

        FAILED.set(true);

        System.out.println(
                "Test failed: " + context.getDisplayName()
        );
    }
}