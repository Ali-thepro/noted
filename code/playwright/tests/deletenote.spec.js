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
  
  // Delete note
  await page.getByRole('button', { name: 'Delete Note' }).first().click();
});