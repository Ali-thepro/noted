import { test, expect } from '@playwright/test';

test.describe('User Registration', () => {
  test('should successfully create a new user account', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    await page.getByRole('link', { name: 'Sign In' }).click()
    await expect(page).toHaveURL('http://localhost:5173/signin')

    await page.getByRole('link', { name: 'Sign up' }).click()
    await expect(page).toHaveURL('http://localhost:5173/signup')

    const username = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('name@company.com').fill(username + '@example.com')
    await page.getByPlaceholder('Password').first().fill('password123')
    await page.getByPlaceholder('Confirm password').fill('password123')

    await page.getByRole('button', { name: 'Sign up' }).click()
    await expect(page).toHaveURL('http://localhost:5173/signup')
  })
})