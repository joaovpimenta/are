import { expect, test } from '../fixtures';

test('Lab has no horizontal overflow and a vertical gesture can start over canvas without global capture', async ({ page }) => {
  await page.goto('/lab/dial/');
  const canvas = page.getByLabel('Seletor de cofre 3D');
  await expect(canvas).toBeVisible();
  const overflow = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
    touchAction: getComputedStyle(document.querySelector('canvas')!).touchAction,
  }));
  expect(overflow.scroll).toBeLessThanOrEqual(overflow.viewport);
  expect(overflow.touchAction).not.toBe('none');

  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + 8, box!.y + 8);
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 420);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before);
});

test('Locks page remains one vertical scroll and lazy Three canvases can mount/unmount repeatedly', async ({ page }) => {
  await page.goto('/lab/locks/');
  await expect(page.locator('section[id^="lock-"]')).toHaveCount(14);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  const first = page.locator('section[id^="lock-"]').first();
  const last = page.locator('section[id^="lock-"]').last();
  for (let cycle = 0; cycle < 2; cycle += 1) {
    await last.scrollIntoViewIfNeeded();
    await expect(last).toBeVisible();
    await first.scrollIntoViewIfNeeded();
    await expect(first).toBeVisible();
  }
});
