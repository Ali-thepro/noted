import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  
  await page.getByRole('textbox', { name: 'name@company.com' }).fill('test123@test.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('Hello12345');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByRole('textbox', { name: 'Master Password' }).fill('notedmasterpassword');
  await page.getByRole('button', { name: 'Unlock' }).click();
  
  await page.waitForTimeout(2000);

  const newNoteButton = await page.getByRole('button', { name: 'New Note' });
  await expect(newNoteButton).toBeVisible();
  await expect(newNoteButton).toBeEnabled();
  await newNoteButton.click();
  await page.getByRole('textbox', { name: 'Title' }).fill('test');
  await page.getByRole('button', { name: 'Create Note' }).click();
  await page.getByTestId('toolbar-upload').click();
  await page.getByRole('button', { name: 'Select Image' }).click();
  
  const fileInput = await page.locator('input[type="file"]');
  await page.waitForTimeout(2000);
  await fileInput.setInputFiles('../2025-csc1049-ahmada5-noted/code/playwright/test-data/Gantt chart.png');
  await page.waitForTimeout(2000);
});
