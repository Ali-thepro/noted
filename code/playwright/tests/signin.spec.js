import { test, expect } from '@playwright/test';

test('should successfully sign in a user', async ({ page }) => {
  await page.goto('http://localhost:5173/')
  await page.getByRole('button', { name: 'Sign In' }).click()
  await page.getByPlaceholder('name@company.com').fill('a123@a.com')
  await page.getByPlaceholder('Password').fill('Hello12345')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
});
