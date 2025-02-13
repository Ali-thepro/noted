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
  
  // Filter by tag
  await page.getByRole('textbox', { name: 'Filter by tag...' }).fill('test');
  
  // Select and edit note
  await page.locator('div').filter({ hasText: /^testnote$/ }).click();
  await page.getByText('# testnoteStart writing here').click();
  await page.getByText('# testnoteStart writing here').click();
});
