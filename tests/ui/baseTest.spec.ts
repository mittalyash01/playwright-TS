import { test, expect } from '@playwright/test';


test('Has title', async ({ page }) => {
  await page.goto('https://magento.softwaretestingboard.com/');
  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Home Page/);
});

test('Shop new button', async ({ page }) => {
  await page.goto('https://magento.softwaretestingboard.com/');

  // Click the Shop New Yoga button link.
  await page.getByText('Shop New Yoga').click();

  // Expects page to have a heading with the name of "New Collection".
  await expect(page.getByRole('heading', { name: 'New Luma Yoga Collection' })).toBeVisible();
});
