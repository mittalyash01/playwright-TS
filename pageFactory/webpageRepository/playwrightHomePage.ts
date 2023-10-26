/*
This class is a page object model for the https://playwright.dev page. All locators and functions related
to this page will be stored in this file.
*/

import { expect, type Locator, type Page } from '@playwright/test';


export class PlaywrightHomePage {
  readonly page: Page;
  readonly getStartedLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.getStartedLink = page.getByRole('link', { name: 'Get started' });
  }

  async goto() {
    await this.page.goto('https://playwright.dev');
  }
}