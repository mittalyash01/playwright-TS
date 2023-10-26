/*
This class is a page object model for the https://demo.playwright.dev/todomvc page. All locators and functions related
to this page will be stored in this file.
*/

import { expect, type Locator, type Page } from '@playwright/test';


export class DemoTodoApp {
  readonly page: Page;
  readonly newTodo: Locator;
  readonly title: Locator;
  readonly todoCount: Locator;
  readonly markAsDone: Locator;
  readonly todoItems: Locator;
  readonly firstTodoItem: Locator;
  readonly firstTodoItemCheckBox: Locator;
  readonly secondTodoItem: Locator;
  readonly secondTodoItemCheckBox: Locator;
  readonly todoList: Locator;
  readonly clearComplete: Locator
  readonly activeLink: Locator
  readonly allLink: Locator
  readonly completedLink: Locator

  constructor(page: Page) {
    this.page = page;
    this.newTodo = page.getByPlaceholder('What needs to be done?');
    this.title = page.getByTestId('todo-title');
    this.todoCount = page.getByTestId('todo-count');
    this.markAsDone = page.getByLabel('Mark all as complete');
    this.todoItems = page.getByTestId('todo-item');
    this.firstTodoItem = this.todoItems.nth(0);
    this.firstTodoItemCheckBox = this.todoItems.nth(0).getByRole('checkbox');
    this.secondTodoItem = this.todoItems.nth(1);
    this.secondTodoItemCheckBox = this.todoItems.nth(1).getByRole('checkbox');
    this.todoList = page.locator('.todo-list li .toggle').first();
    this.clearComplete = page.getByRole('button', { name: 'Clear completed' });
    this.activeLink = page.getByRole('link', { name: 'Active' });
    this.allLink = page.getByRole('link', { name: 'All' });
    this.completedLink = page.getByRole('link', { name: 'Completed' });
  }

  async goto() {
    await this.page.goto('https://demo.playwright.dev/todomvc');
  }

  async titleHasText(...todo: string[]) {
    await expect(this.title).toHaveText([
      ...todo
    ]);
  }

  async checkNumberOfTodosInLocalStorage(page: Page, expected: number) {
    return await page.waitForFunction(e => {
      return JSON.parse(localStorage['react-todos']).length === e;
    }, expected);
  }

  async createTodos(page: Page, todos: string[]) {
    // create a new todo locator
    const newTodo = page.getByPlaceholder('What needs to be done?');
  
    for (const item of todos) {
      await newTodo.fill(item);
      await newTodo.press('Enter');
    }
  }

  async checkNumberOfCompletedTodosInLocalStorage(page: Page, expected: number) {
    return await page.waitForFunction(e => {
      return JSON.parse(localStorage['react-todos']).filter((todo: any) => todo.completed).length === e;
    }, expected);
  }

  async checkTodosInLocalStorage(page: Page, title: string) {
    return await page.waitForFunction(t => {
      return JSON.parse(localStorage['react-todos']).map((todo: any) => todo.title).includes(t);
    }, title);
  }
}