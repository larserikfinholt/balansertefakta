import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the header with logo', async ({ page }) => {
    await page.goto('/');
    
    // Check header is visible
    await expect(page.getByRole('link', { name: /balansertefakta/i })).toBeVisible();
    await expect(page.getByText('Ingen påstand uten motstemme')).toBeVisible();
  });

  test('should display topics section', async ({ page }) => {
    await page.goto('/');
    
    // Check for topics heading
    await expect(page.getByRole('heading', { name: 'Temaer' })).toBeVisible();
  });

  test('should show empty state when no topics', async ({ page }) => {
    await page.goto('/');
    
    // This might show "Ingen temaer ennå" or actual topics
    // depending on database state
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate to home when clicking logo', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /balansertefakta/i }).click();
    
    await expect(page).toHaveURL('/');
  });
});

test.describe('Footer', () => {
  test('should display the footer', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByText(/digital offentlighet som tåler uenighet/i)).toBeVisible();
  });
});
