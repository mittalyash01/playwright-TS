import { test, expect } from '@playwright/test';
import { PlaywrightHomePage } from '../../pageFactory/webpageRepository/playwrightHomePage';

let playwrightDev: PlaywrightHomePage;

test.beforeEach(async ({ page }) => {
  playwrightDev = new PlaywrightHomePage(page);
  await playwrightDev.goto();
});

test.describe('Home page', () => {

  test('has title', async ({ page }) => {
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Playwright/);
  });

  test('get started link', async ({ page }) => {
    // Click the get started link.
    await playwrightDev.getStartedLink.click();

    // Expects the URL to contain intro.
    await expect(page).toHaveURL(/.*intro/);
  });
});
