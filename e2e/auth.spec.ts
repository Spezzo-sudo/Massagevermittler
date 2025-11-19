import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('login page is accessible', async ({ page }) => {
    await page.goto('/customer/login');
    await expect(page.locator('text=Anmelden')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('sign up page is accessible', async ({ page }) => {
    await page.goto('/customer/register');
    await expect(page.locator('text=Registrieren')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('therapist login page exists', async ({ page }) => {
    await page.goto('/therapist/login');
    await expect(page.locator('text=Therapeut')).toBeVisible();
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/customer/login');

    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button:has-text("Anmelden")');

    // Should show error message
    await expect(page.locator('text=Fehler')).toBeVisible({ timeout: 5000 });
  });

  test('password fields are masked', async ({ page }) => {
    await page.goto('/customer/login');

    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('remember me checkbox is optional', async ({ page }) => {
    await page.goto('/customer/login');
    await expect(page.locator('text=Angemeldet bleiben')).toBeVisible();
  });

  test('can navigate between login and signup', async ({ page }) => {
    await page.goto('/customer/login');
    await page.click('text=Noch kein Konto');
    await expect(page).toHaveURL('/customer/register');

    await page.click('text=Schon registriert');
    await expect(page).toHaveURL('/customer/login');
  });
});
