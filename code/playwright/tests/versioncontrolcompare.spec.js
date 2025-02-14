import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  
  // Sign in
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'name@company.com' }).fill('test123@test.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('Hello12345');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  

  await page.waitForTimeout(2000);
  
  await page.locator('div').filter({ hasText: /^Version Control Test v3$/ }).click();
  await page.getByRole('button', { name: 'Edit View' }).click();
  await page.getByRole('button', { name: 'Version Control Test v3 v3' }).click();
  await page.getByRole('button', { name: 'Compare' }).click();
  await page.getByRole('cell', { name: 'Version Control Test', exact: true }).locator('pre').click();
});