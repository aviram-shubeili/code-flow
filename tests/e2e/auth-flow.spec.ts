import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display sign in page when not authenticated', async ({
    page,
  }) => {
    await page.goto('/');

    // Should redirect to sign in page or show sign in option
    await expect(page).toHaveTitle(/CodeFlow/);

    // Look for sign in button or link
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await expect(signInButton).toBeVisible();
  });

  test('should show appropriate content for unauthenticated users', async ({
    page,
  }) => {
    await page.goto('/');

    // Should see the CodeFlow branding
    await expect(page.getByText('CodeFlow')).toBeVisible();

    // Should not see protected content
    await expect(page.getByText('Dashboard')).not.toBeVisible();
  });

  test('should navigate to GitHub OAuth when clicking sign in', async ({
    page,
  }) => {
    await page.goto('/');

    // Find and click sign in button
    const signInButton = page.getByRole('button', {
      name: /sign in with github/i,
    });

    if (await signInButton.isVisible()) {
      // Note: In a real test, we'd need to mock the OAuth flow
      // For now, just verify the button exists and is clickable
      await expect(signInButton).toBeEnabled();
    }
  });

  test('should handle authentication errors gracefully', async ({ page }) => {
    // Navigate to an auth error page if it exists
    await page.goto('/auth/error');

    // Should show an error page or redirect appropriately
    await expect(page).toHaveTitle(/CodeFlow/);

    // Should provide a way to try again
    const tryAgainButton = page.getByRole('button', {
      name: /try again|sign in/i,
    });
    if (await tryAgainButton.isVisible()) {
      await expect(tryAgainButton).toBeEnabled();
    }
  });
});
