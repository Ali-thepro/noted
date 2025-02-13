import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'name@company.com' }).click();
  await page.getByRole('textbox', { name: 'name@company.com' }).fill('test123@test.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Password' }).fill('H');
  await page.getByRole('textbox', { name: 'Password' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Password' }).fill('Hello12345');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search by keyword...' }).click();
  await page.getByRole('textbox', { name: 'Search by keyword...' }).fill('test');
  await page.getByRole('textbox', { name: 'Search by keyword...' }).press('Enter');
  await page.locator('div').filter({ hasText: /^test$/ }).first().click();
  await page.getByText('# testStart writing here...').click();
  await page.getByText('# testStart writing here...').click();
});
