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
  await page.getByRole('textbox', { name: 'Title' }).fill('Revert Test');
  await page.getByRole('button', { name: 'Create Note' }).click();
  
  // Edit the note
  await page.getByText('# Revert TestStart writing').click();
  await page.getByRole('link', { name: 'Noted' }).click();
  await page.locator('div').filter({ hasText: /^Revert Testa few seconds ago14 Feb 2025$/ }).first().locator('button[aria-label="Edit Note"]').click();
  await page.getByRole('textbox', { name: 'Title' }).fill('Revert Test V2');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  
  // Revert changes
  await page.locator('div').filter({ hasText: /^Revert Test V2$/ }).click();
  await page.getByRole('button', { name: 'Edit View' }).click();
  await page.getByRole('button', { name: 'Revert Test v1 Feb 14, 2025 5' }).click();
  await page.getByRole('button', { name: 'Revert', exact: true }).click();
});