import { expect, test as base, type Page } from '@playwright/test';

const failures = new WeakMap<Page, string[]>();
const assetPattern = /\.(?:js|mjs|css|png|jpe?g|webp|svg|woff2?|glb|gltf|bin)(?:\?|$)/i;

export const test = base;
export { expect };

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  failures.set(page, errors);
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console.error: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('response', (response) => {
    if (response.status() === 404 && assetPattern.test(response.url())) errors.push(`asset 404: ${response.url()}`);
  });
  await page.addInitScript(() => {
    (window as unknown as { __ARE_UNHANDLED_REJECTIONS__?: string[] }).__ARE_UNHANDLED_REJECTIONS__ = [];
    window.addEventListener('unhandledrejection', (event) => {
      const value = event.reason instanceof Error ? event.reason.message : String(event.reason);
      (window as unknown as { __ARE_UNHANDLED_REJECTIONS__?: string[] }).__ARE_UNHANDLED_REJECTIONS__?.push(value);
    });
  });
});

test.afterEach(async ({ page }) => {
  const rejections = await page.evaluate(() => (window as unknown as { __ARE_UNHANDLED_REJECTIONS__?: string[] }).__ARE_UNHANDLED_REJECTIONS__ ?? []).catch(() => [] as string[]);
  const errors = [...(failures.get(page) ?? []), ...rejections.map((value) => `unhandledrejection: ${value}`)];
  expect(errors, errors.join('\n')).toEqual([]);
});
