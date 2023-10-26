import { test, expect, type Page } from '@playwright/test';
import { DemoTodoApp } from '../../pageFactory/webpageRepository/demoTodoAppPage';
import { hasUncaughtExceptionCaptureCallback } from 'process';

let demoTodoApp: DemoTodoApp;

const TODO_ITEMS = [
  'buy some cheese',
  'feed the cat',
  'book a doctors appointment'
];

test.beforeEach(async ({ page }) => {
  demoTodoApp = new DemoTodoApp(page);
  await demoTodoApp.goto();
});

test.describe('New Todo', () => {
  test('should allow me to add todo items', async ({ page }) => {

    // Create 1st todo.
    await demoTodoApp.newTodo.fill(TODO_ITEMS[0]);
    await demoTodoApp.newTodo.press('Enter');

    // Make sure the list only has one todo item.
    await demoTodoApp.titleHasText(TODO_ITEMS[0]);

    // Create 2nd todo.
    await demoTodoApp.newTodo.fill(TODO_ITEMS[1]);
    await demoTodoApp.newTodo.press('Enter');

    // Make sure the list now has two todo items.
    await demoTodoApp.titleHasText(TODO_ITEMS[0], TODO_ITEMS[1]);

    await demoTodoApp.checkNumberOfTodosInLocalStorage(page, 2);
  });

  test('should clear text input field when an item is added', async ({ page }) => {
    // Create one todo item.
    await demoTodoApp.newTodo.fill(TODO_ITEMS[0]);
    await demoTodoApp.newTodo.press('Enter');

    // Check that input is empty.
    await expect(demoTodoApp.newTodo).toBeEmpty();
    await demoTodoApp.checkNumberOfTodosInLocalStorage(page, 1);
  });

  test('should append new items to the bottom of the list', async ({ page }) => {
    // Create 3 items.
    await demoTodoApp.createTodos(page, TODO_ITEMS);
  
    // Check test using different methods.
    await expect(page.getByText('3 items left')).toBeVisible();
    await expect(demoTodoApp.todoCount).toHaveText('3 items left');
    await expect(demoTodoApp.todoCount).toContainText('3');
    await expect(demoTodoApp.todoCount).toHaveText(/3/);

    // Check all items in one call.
    await expect(page.getByTestId('todo-title')).toHaveText(TODO_ITEMS);
    await demoTodoApp.checkNumberOfTodosInLocalStorage(page, 3);
  });
});

test.describe('Mark all as completed', () => {
  test.beforeEach(async ({ page }) => {
    await demoTodoApp.createTodos(page, TODO_ITEMS);
    await demoTodoApp.checkNumberOfTodosInLocalStorage(page, 3);
  });

  test.afterEach(async ({ page }) => {
    await demoTodoApp.checkNumberOfTodosInLocalStorage(page, 3);
  });

  test('should allow me to mark all items as completed', async ({ page }) => {
    // Complete all todos.
    await demoTodoApp.markAsDone.check();

    // Ensure all todos have 'completed' class.
    await expect(demoTodoApp.todoItems).toHaveClass(['completed', 'completed', 'completed']);
    await demoTodoApp.checkNumberOfCompletedTodosInLocalStorage(page, 3);
  });

  test('should allow me to clear the complete state of all items', async ({ page }) => {
    // Check and then immediately uncheck.
    await demoTodoApp.markAsDone.check();
    await demoTodoApp.markAsDone.uncheck();

    // Should be no completed classes.
    await expect(page.getByTestId('todo-item')).toHaveClass(['', '', '']);
    await expect(demoTodoApp.todoItems).toHaveClass(['', '', '']);
  });

  test('complete all checkbox should update state when items are completed / cleared', async ({ page }) => {
    await demoTodoApp.markAsDone.check();
    await expect(demoTodoApp.markAsDone).toBeChecked();
    await demoTodoApp.checkNumberOfCompletedTodosInLocalStorage(page, 3);

    // Uncheck first todo.
    const firstTodo = demoTodoApp.firstTodoItem;
    await firstTodo.getByRole('checkbox').uncheck();

    // Reuse toggleAll locator and make sure its not checked.
    await expect(demoTodoApp.markAsDone).not.toBeChecked();

    await firstTodo.getByRole('checkbox').check();
    await demoTodoApp.checkNumberOfCompletedTodosInLocalStorage(page, 3);

    // Assert the toggle all is checked again.
    await expect(demoTodoApp.markAsDone).toBeChecked();
  });
});

test.describe('Item', () => {
  test('should allow me to mark items as complete', async ({ page }) => {
    // Create two items.
    for (const item of TODO_ITEMS.slice(0, 2)) {
      await demoTodoApp.newTodo.fill(item);
      await demoTodoApp.newTodo.press('Enter');
    }

    // Check first item.
    const firstTodo = demoTodoApp.firstTodoItem;
    await firstTodo.getByRole('checkbox').check();
    await expect(firstTodo).toHaveClass('completed');

    // Check second item.
    const secondTodo = demoTodoApp.secondTodoItem;
    await expect(secondTodo).not.toHaveClass('completed');
    await secondTodo.getByRole('checkbox').check();

    // Assert completed class.
    await expect(firstTodo).toHaveClass('completed');
    await expect(secondTodo).toHaveClass('completed');
  });

  test('should allow me to un-mark items as complete', async ({ page }) => {
    // Create two items.
    for (const item of TODO_ITEMS.slice(0, 2)) {
      await demoTodoApp.newTodo.fill(item);
      await demoTodoApp.newTodo.press('Enter');
    }

    const firstTodo = demoTodoApp.firstTodoItem;
    const secondTodo = demoTodoApp.secondTodoItem;
    const firstTodoCheckbox = firstTodo.getByRole('checkbox');

    await firstTodoCheckbox.check();
    await expect(firstTodo).toHaveClass('completed');
    await expect(secondTodo).not.toHaveClass('completed');
    await demoTodoApp.checkNumberOfCompletedTodosInLocalStorage(page, 1);

    await firstTodoCheckbox.uncheck();
    await expect(firstTodo).not.toHaveClass('completed');
    await expect(secondTodo).not.toHaveClass('completed');
    await demoTodoApp.checkNumberOfCompletedTodosInLocalStorage(page, 0);
  });

  test('should allow me to edit an item', async ({ page }) => {
    await demoTodoApp.createTodos(page, TODO_ITEMS);

    const secondTodo = demoTodoApp.secondTodoItem;
    await secondTodo.dblclick();
    await expect(secondTodo.getByRole('textbox', { name: 'Edit' })).toHaveValue(TODO_ITEMS[1]);
    await secondTodo.getByRole('textbox', { name: 'Edit' }).fill('buy some sausages');
    await secondTodo.getByRole('textbox', { name: 'Edit' }).press('Enter');

    // Explicitly assert the new text value.
    await expect(demoTodoApp.todoItems).toHaveText([
      TODO_ITEMS[0],
      'buy some sausages',
      TODO_ITEMS[2]
    ]);
    await demoTodoApp.checkTodosInLocalStorage(page, 'buy some sausages');
  });
});

test.describe('Editing', () => {
  test.beforeEach(async ({ page }) => {
    await demoTodoApp.createTodos(page, TODO_ITEMS);
    await demoTodoApp.checkNumberOfTodosInLocalStorage(page, 3);
  });

  test('should hide other controls when editing', async ({ page }) => {
    await demoTodoApp.secondTodoItem.dblclick();
    await expect(demoTodoApp.secondTodoItem.getByRole('checkbox')).not.toBeVisible();
    await expect(demoTodoApp.secondTodoItem.locator('label', {
      hasText: TODO_ITEMS[1],
    })).not.toBeVisible();
    await demoTodoApp.checkNumberOfTodosInLocalStorage(page, 3);
  });

  test('should save edits on blur', async ({ page }) => {
    await demoTodoApp.secondTodoItem.dblclick();
    await demoTodoApp.secondTodoItem.getByRole('textbox', { name: 'Edit' }).fill('buy some sausages');
    await demoTodoApp.secondTodoItem.getByRole('textbox', { name: 'Edit' }).dispatchEvent('blur');

    await expect(demoTodoApp.todoItems).toHaveText([
      TODO_ITEMS[0],
      'buy some sausages',
      TODO_ITEMS[2],
    ]);
    await demoTodoApp.checkTodosInLocalStorage(page, 'buy some sausages');
  });

  test('should trim entered text', async ({ page }) => {
    await demoTodoApp.secondTodoItem.dblclick();
    await demoTodoApp.secondTodoItem.getByRole('textbox', { name: 'Edit' }).fill('    buy some sausages    ');
    await demoTodoApp.secondTodoItem.getByRole('textbox', { name: 'Edit' }).press('Enter');

    await expect(demoTodoApp.todoItems).toHaveText([
      TODO_ITEMS[0],
      'buy some sausages',
      TODO_ITEMS[2],
    ]);
    await demoTodoApp.checkTodosInLocalStorage(page, 'buy some sausages');
  });

  test('should remove the item if an empty text string was entered', async ({ page }) => {
    await demoTodoApp.secondTodoItem.dblclick();
    await demoTodoApp.secondTodoItem.getByRole('textbox', { name: 'Edit' }).fill('');
    await demoTodoApp.secondTodoItem.getByRole('textbox', { name: 'Edit' }).press('Enter');

    await expect(demoTodoApp.todoItems).toHaveText([
      TODO_ITEMS[0],
      TODO_ITEMS[2],
    ]);
  });

  test('should cancel edits on escape', async ({ page }) => {
    await demoTodoApp.secondTodoItem.dblclick();
    await demoTodoApp.secondTodoItem.getByRole('textbox', { name: 'Edit' }).fill('buy some sausages');
    await demoTodoApp.secondTodoItem.getByRole('textbox', { name: 'Edit' }).press('Escape');
    await expect(demoTodoApp.todoItems).toHaveText(TODO_ITEMS);
  });
});

test.describe('Counter', () => {
  test('should display the current number of todo items', async ({ page }) => {
    await demoTodoApp.newTodo.fill(TODO_ITEMS[0]);
    await demoTodoApp.newTodo.press('Enter');

    await expect(demoTodoApp.todoCount).toContainText('1');

    await demoTodoApp.newTodo.fill(TODO_ITEMS[1]);
    await demoTodoApp.newTodo.press('Enter');
    await expect(demoTodoApp.todoCount).toContainText('2');

    await demoTodoApp.checkNumberOfTodosInLocalStorage(page, 2);
  });
});

test.describe('Clear completed button', () => {
  test.beforeEach(async ({ page }) => {
    await demoTodoApp.createTodos(page, TODO_ITEMS);
  });

  test('should display the correct text', async ({ page }) => {
    await demoTodoApp.todoList.check();
    await expect(demoTodoApp.clearComplete).toBeVisible();
  });

  test('should remove completed items when clicked', async ({ page }) => {
    await demoTodoApp.secondTodoItem.getByRole('checkbox').check();
    await demoTodoApp.clearComplete.click();
    await expect(demoTodoApp.todoItems).toHaveCount(2);
    await expect(demoTodoApp.todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[2]]);
  });

  test('should be hidden when there are no items that are completed', async ({ page }) => {
    await demoTodoApp.todoList.check();
    await demoTodoApp.clearComplete.click();
    await expect(demoTodoApp.clearComplete).toBeHidden();
  });
});

test.describe('Persistence', () => {
  test('should persist its data', async ({ page }) => {

    for (const item of TODO_ITEMS.slice(0, 2)) {
      await demoTodoApp.newTodo.fill(item);
      await demoTodoApp.newTodo.press('Enter');
    }

    await demoTodoApp.firstTodoItemCheckBox.check();
    await expect(demoTodoApp.todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[1]]);
    await expect(demoTodoApp.firstTodoItemCheckBox).toBeChecked();
    await expect(demoTodoApp.todoItems).toHaveClass(['completed', '']);

    // Ensure there is 1 completed item.
    await demoTodoApp.checkNumberOfCompletedTodosInLocalStorage(page, 1);

    // Now reload.
    await page.reload();
    await expect(demoTodoApp.todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[1]]);
    await expect(demoTodoApp.firstTodoItemCheckBox).toBeChecked();
    await expect(demoTodoApp.todoItems).toHaveClass(['completed', '']);
  });
});

test.describe('Routing', () => {
  test.beforeEach(async ({ page }) => {
    await demoTodoApp.createTodos(page, TODO_ITEMS);
    // make sure the app had a chance to save updated todos in storage
    // before navigating to a new view, otherwise the items can get lost :(
    // in some frameworks like Durandal
    await demoTodoApp.checkTodosInLocalStorage(page, TODO_ITEMS[0]);
  });

  test('should allow me to display active items', async ({ page }) => {
    await demoTodoApp.secondTodoItemCheckBox.check();

    await demoTodoApp.checkNumberOfCompletedTodosInLocalStorage(page, 1);
    await demoTodoApp.activeLink.click();
    await expect(demoTodoApp.todoItems).toHaveCount(2);
    await expect(demoTodoApp.todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[2]]);
  });

  test('should respect the back button', async ({ page }) => {
    await demoTodoApp.secondTodoItemCheckBox.check();

    await demoTodoApp.checkNumberOfCompletedTodosInLocalStorage(page, 1);

    await test.step('Showing all items', async () => {
      await demoTodoApp.allLink.click();
      await expect(demoTodoApp.todoItems).toHaveCount(3);
    });

    await test.step('Showing active items', async () => {
      await demoTodoApp.activeLink.click();
    });

    await test.step('Showing completed items', async () => {
      await page.getByRole('link', { name: 'Completed' }).click();
    });

    await expect(demoTodoApp.todoItems).toHaveCount(1);
    await page.goBack();
    await expect(demoTodoApp.todoItems).toHaveCount(2);
    await page.goBack();
    await expect(demoTodoApp.todoItems).toHaveCount(3);
  });

  test('should allow me to display completed items', async ({ page }) => {
    await demoTodoApp.secondTodoItemCheckBox.check();
    await demoTodoApp.checkNumberOfCompletedTodosInLocalStorage(page, 1);
    await demoTodoApp.completedLink.click();
    await expect(demoTodoApp.todoItems).toHaveCount(1);
  });

  test('should allow me to display all items', async ({ page }) => {
    await demoTodoApp.secondTodoItemCheckBox.check();
    await demoTodoApp.checkNumberOfCompletedTodosInLocalStorage(page, 1);
    await demoTodoApp.activeLink.click();
    await demoTodoApp.completedLink.click();
    await demoTodoApp.allLink.click();
    await expect(demoTodoApp.todoItems).toHaveCount(3);
  });

  test('should highlight the currently applied filter', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'All' })).toHaveClass('selected');
    
    //create locators for active and completed links
    await demoTodoApp.activeLink.click();

    // Page change - active items.
    await expect(demoTodoApp.activeLink).toHaveClass('selected');
    await demoTodoApp.completedLink.click();

    // Page change - completed items.
    await expect(demoTodoApp.completedLink).toHaveClass('selected');
  });
});
