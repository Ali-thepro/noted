import { test, expect } from '@playwright/test';

test('should successfully sign in a user', async ({ page }) => {
  await page.goto('http://localhost:5173/')

  // Click on the 'Sign In' button
  await page.getByRole('button', { name: 'Sign In' }).click()

  // Fill in the email field
  await page.getByPlaceholder('name@company.com').fill('a123@a.com')

  // Fill in the password field
  await page.getByPlaceholder('Password').fill('Hello12345')

  // Click on the 'Sign in' button
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
});
