import { expect, test } from '@playwright/test';

test('root catalog renders and links to Lab', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'ARE' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Abrir Lab' })).toHaveAttribute('href', './lab/');
});

test('Lab shell renders', async ({ page }) => {
  await page.goto('/lab/');

  await expect(page.getByRole('heading', { name: 'ARE Lab' })).toBeVisible();
  await expect(page.getByText(/Shell inicial do laboratório/)).toBeVisible();
});
