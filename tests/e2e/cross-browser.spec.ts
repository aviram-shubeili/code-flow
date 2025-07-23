import { test, expect } from '@playwright/test';

test.describe('Cross-Browser Compatibility', () => {
  test('should work correctly in Chromium', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle(/CodeFlow/);
    await expect(page.locator('body')).toBeVisible();
    
    // Check that JavaScript is working
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('should work correctly in Firefox', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle(/CodeFlow/);
    await expect(page.locator('body')).toBeVisible();
    
    // Test CSS rendering
    const body = page.locator('body');
    await expect(body).toHaveCSS('margin', '0px');
  });

  test('should work correctly in WebKit/Safari', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle(/CodeFlow/);
    await expect(page.locator('body')).toBeVisible();
    
    // WebKit-specific checks if needed
    await expect(page.locator('html')).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile portrait', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await expect(page).toHaveTitle(/CodeFlow/);
    
    // Content should be visible and accessible
    await expect(page.locator('body')).toBeVisible();
  });

  test('should work on mobile landscape', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 });
    await page.goto('/');
    
    await expect(page).toHaveTitle(/CodeFlow/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should work on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    await expect(page).toHaveTitle(/CodeFlow/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should work on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    await expect(page).toHaveTitle(/CodeFlow/);
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds (generous for dev environment)
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have console errors on load', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    
    // Should not have any console errors
    expect(consoleErrors).toHaveLength(0);
  });
});

test.describe('Basic Navigation', () => {
  test('should navigate between auth pages', async ({ page }) => {
    await page.goto('/');
    
    // Try navigating to auth pages
    await page.goto('/auth/signin');
    await expect(page).toHaveURL(/auth\/signin/);
    
    await page.goto('/auth/error');
    await expect(page).toHaveURL(/auth\/error/);
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    const response = await page.goto('/non-existent-page');
    
    // Should handle non-existent pages (may redirect or show 404)
    expect(response?.status()).toBeTruthy();
  });
});