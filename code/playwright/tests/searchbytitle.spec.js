import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/signin');
  
  await page.getByRole('textbox', { name: 'name@company.com' }).fill('test123@test.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('Hello12345');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByRole('textbox', { name: 'Master Password' }).fill('notedmasterpassword');
  await page.getByRole('button', { name: 'Unlock' }).click();

  await page.getByRole('textbox', { name: 'Search by keyword...' }).fill('test');
  await page.getByRole('textbox', { name: 'Search by keyword...' }).press('Enter');
  await page.waitForTimeout(2000); 
  await page.locator('div').filter({ hasText: /^test$/ }).first().click();
  await page.getByText('# testStart writing here...').click();
});