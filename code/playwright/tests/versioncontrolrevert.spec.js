import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  
  await page.getByRole('textbox', { name: 'name@company.com' }).fill('test123@test.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('Hello12345');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByRole('textbox', { name: 'Master Password' }).fill('notedmasterpassword');
  await page.getByRole('button', { name: 'Unlock' }).click();
  
  // Wait for the page to load after signing in
  await page.waitForTimeout(2000); // Wait for 2 seconds
  
  // Create a new note
  await page.getByRole('button', { name: 'New Note' }).click();
  await page.getByRole('textbox', { name: 'Title' }).fill('Revert Test');
  await page.getByRole('button', { name: 'Create Note' }).click();
  
  // Edit the note
  await page.waitForSelector('div:has-text("Revert Test")');
  await page.locator('div:has-text("Revert Test")').first().click();
  await page.getByRole('link', { name: 'Noted' }).click();
  await page.locator('div:has-text("Revert Test")').first().locator('button[aria-label="Edit Note"]').first().click();
  await page.getByRole('textbox', { name: 'Title' }).fill('Revert Test V2');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.waitForTimeout(2000); 
  // Revert changes
  await page.locator('div').filter({ hasText: /^Revert Test V2$/ }).first().click();
  await page.getByRole('button', { name: 'Edit View' }).click();
  await page.waitForTimeout(5000); 
  await page.getByRole('button', { name: 'Revert Test v2' }).click();
  await page.getByRole('button', { name: 'Revert', exact: true }).click();
});