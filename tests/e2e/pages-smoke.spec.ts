import { readFile } from 'node:fs/promises';
import { expect, test } from './fixtures';

const labRoutes = JSON.parse(await readFile(new URL('../../lab/routes.json', import.meta.url), 'utf8')) as string[];
const base = process.env.ARE_PAGES_BASE_PATH ?? '/are/';

function pagePath(relative = '') {
  return `${base}${relative}`.replace(/\/+/g, '/');
}

test('Pages base serves the exact production build without asset 404s', async ({ page }) => {
  const response = await page.goto(pagePath());
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'ARE' })).toBeVisible();
  await page.waitForLoadState('networkidle');
});

test('all direct lazy Lab routes survive direct refresh under the Pages base', async ({ page }) => {
  for (const route of labRoutes) {
    const response = await page.goto(pagePath(`lab/${route}/`));
    expect(response?.status(), route).toBe(200);
    await expect(page.locator('main')).toBeVisible();
    await page.reload();
    await expect(page.locator('main')).toBeVisible();
    await page.waitForLoadState('networkidle');
  }
});

test('Adventure direct route and assets work under the Pages base', async ({ page }) => {
  const response = await page.goto(pagePath('echo-station/'));
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('button', { name: 'Continuar' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Continuar' })).toBeVisible();
  await page.waitForLoadState('networkidle');
});
