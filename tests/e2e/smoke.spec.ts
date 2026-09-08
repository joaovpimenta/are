import { expect, test } from '@playwright/test';

test('root catalog renders and links to Lab', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'ARE' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Abrir Component Lab/ })).toHaveAttribute('href', './lab/');
});

test('Lab renders keypad and dial canvases', async ({ page }) => {
  await page.goto('/lab/');

  await expect(page.getByRole('heading', { name: /Puzzle hardware/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Keypad' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Dial' })).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(2);
  await expect(page.getByText('keypadSolved=false')).toBeVisible();
  await expect(page.getByText('dialSolved=false')).toBeVisible();
});

test('Lab remains usable at a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/lab/');

  await expect(page.getByRole('heading', { name: /Puzzle hardware/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Diminuir dial' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Aumentar dial' })).toBeVisible();

  const dialOutput = page.locator('output');
  await expect(dialOutput).toHaveText('02');
  await page.getByRole('button', { name: 'Aumentar dial' }).click();
  await expect(dialOutput).toHaveText('03');

  const bodyWidth = await page.locator('body').evaluate((element) => element.scrollWidth);
  expect(bodyWidth).toBeLessThanOrEqual(390);
});
