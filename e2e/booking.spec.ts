import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Island Massage/);
    await expect(page.locator('h1')).toContainText('Luxury Wellness');
  });

  test('can navigate to booking page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Jetzt Massage buchen');
    await expect(page).toHaveURL('/book');
    await expect(page.locator('h1')).toContainText('Massage buchen');
  });

  test('booking form has all required fields', async ({ page }) => {
    await page.goto('/book');

    // Service selection
    await expect(page.locator('text=Service wählen')).toBeVisible();

    // Address input
    await expect(page.locator('input[placeholder*="Adresse"]')).toBeVisible();

    // Date/Time picker
    await expect(page.locator('input[type="datetime-local"]')).toBeVisible();

    // Notes field
    await expect(page.locator('textarea[placeholder*="Notizen"]')).toBeVisible();
  });

  test('geolocation button is present', async ({ page }) => {
    await page.goto('/book');
    await expect(page.locator('button:has-text("GPS")')).toBeVisible();
  });

  test('can select a service', async ({ page }) => {
    await page.goto('/book');

    // Click on Thai Massage option
    const thaiMassage = page.locator('text=Thai Massage').first();
    await expect(thaiMassage).toBeVisible();
    await thaiMassage.click();

    // Verify selection (look for price display)
    await expect(page.locator('text=900 THB')).toBeVisible();
  });

  test('cannot submit empty booking', async ({ page }) => {
    await page.goto('/book');

    // Try to submit without filling fields
    const submitButton = page.locator('button:has-text("Buchen")');
    await submitButton.click();

    // Should see validation error
    await expect(page.locator('text=erforderlich')).toBeVisible({ timeout: 5000 });
  });

  test('displays error for address outside Ko Phangan', async ({ page }) => {
    await page.goto('/book');

    // Type Bangkok address
    await page.fill('input[placeholder*="Adresse"]', 'Bangkok, Thailand');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Should show error
    await expect(page.locator('text=Liefergebiet')).toBeVisible({ timeout: 5000 });
  });
});
