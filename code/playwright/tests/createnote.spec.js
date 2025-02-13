const { test, expect } = require('@playwright/test');

// Skip tests if the browser is WebKit
test.skip(({ browserName }) => browserName === 'webkit', 'Skipping tests for WebKit');

test('should successfully sign in a user', async ({ page }) => {
  await page.goto('http://localhost:5173/');


  // Sign in
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'name@company.com' }).fill('test123@test.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('Hello12345');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForTimeout(2000);
  // Create a new note
  const newNoteButton = await page.getByRole('button', { name: 'New Note' });
  await expect(newNoteButton).toBeVisible();
  await expect(newNoteButton).toBeEnabled();
  await newNoteButton.click();
  await page.getByRole('textbox', { name: 'Title' }).fill('test');
  await page.getByRole('button', { name: 'Create Note' }).click();
  await page.getByText('# testStart writing here...').click();
});