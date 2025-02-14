import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  
  // Sign in
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'name@company.com' }).fill('test123@test.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('Hello12345');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  
  // Wait for the page to load after signing in
  await page.waitForTimeout(2000); // Wait for 2 seconds
  
  // Create a new note
  await page.getByRole('button', { name: 'New Note' }).click();
  await page.getByRole('textbox', { name: 'Title' }).fill('Version Control Test');
  await page.getByRole('button', { name: 'Create Note' }).click();
  
  // Edit the note
  await page.getByText('# Version Control TestStart').click();
  await page.getByRole('link', { name: 'Noted' }).click();
  await page.locator('div').filter({ hasText: /^Version Control Testa few seconds ago14 Feb 2025$/ }).getByLabel('Edit Note').click();
  await page.getByRole('textbox', { name: 'Title' }).fill('Version Control Test V2');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.locator('div').filter({ hasText: /^Version Control Test V2$/ }).first().click();
  await page.getByRole('button', { name: 'Edit View' }).click();
  await page.getByRole('button', { name: 'Revert' }).click();
  await page.waitForTimeout(5000);
  await page.getByRole('button', { name: 'Version Control Test' }).first().click();
  await page.getByRole('button', { name: 'Revert' }).click();
});