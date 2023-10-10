import { test,expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Runs before each test and signs in each page.
  await page.goto('https://magento.softwaretestingboard.com/customer/account/login/referer/aHR0cHM6Ly9tYWdlbnRvLnNvZnR3YXJldGVzdGluZ2JvYXJkLmNvbS8%2C/');
  await page.getByTitle('Email').fill('useremail@gmail.com');
  await page.getByTitle('Password').fill('Password123');
  await page.getByRole('button', { name: 'Sign In' }).click();
});

test('Check Successful login', async ({ page }) => {
    // page is signed in.
    // Expect welcome substring.
    await page.isVisible("text='Welcome'")
  });
  
  