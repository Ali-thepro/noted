import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'name@company.com' }).fill('test123@test.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('Hello12345');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  await page.waitForTimeout(2000);
  
  await page.getByRole('button', { name: 'New Note' }).click();
  await page.getByRole('textbox', { name: 'Title' }).fill('Version Control Test');
  await page.getByRole('button', { name: 'Create Note' }).click();

  await page.getByText('# Version Control TestStart').click();
  await page.getByRole('link', { name: 'Noted' }).click();
  await page.locator('div').filter({ hasText: /^Version Control Testa few seconds ago14 Feb 2025$/ }).getByLabel('Edit Note').click();
  await page.getByRole('textbox', { name: 'Title' }).fill('Version Control Test V2');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  
  await page.locator('div').filter({ hasText: /^Version Control Test V2$/ }).first().click();
  await page.waitForTimeout(2000); 
  await page.getByRole('button', { name: 'Edit View' }).click();
  await page.getByRole('button', { name: 'Version Control Test v1 Feb' }).click();
  await page.getByRole('button', { name: 'Version Control Test V2 v2' }).click();
  await page.waitForTimeout(5000); 
  await page.getByRole('button', { name: 'Compare' }).click();
  await page.waitForTimeout(2000); 
  await page.getByText('Version Control Test V2').click();
});