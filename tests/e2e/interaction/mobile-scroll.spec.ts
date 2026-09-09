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

test('mobile mechanism navigation wraps without becoming a horizontal scroll container', async ({ page }) => {
  await page.goto('/lab/');
  const navigation = page.getByRole('navigation', { name: 'Mecanismos do Lab' });
  const metrics = await navigation.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    overflowX: getComputedStyle(element).overflowX,
  }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
  expect(metrics.overflowX).not.toBe('auto');
  expect(metrics.overflowX).not.toBe('scroll');
});

test('Locks page remains one vertical scroll and distant Three canvases actually unmount/remount', async ({ page }) => {
  await page.goto('/lab/locks/');
  const sections = page.locator('section[id^="lock-"]');
  await expect(sections).toHaveCount(14);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  const first = sections.first();
  const last = sections.last();
  await first.scrollIntoViewIfNeeded();
  await expect(first.locator('canvas')).toHaveCount(1);

  for (let cycle = 0; cycle < 2; cycle += 1) {
    await last.scrollIntoViewIfNeeded();
    await expect(last.locator('canvas')).toHaveCount(1);
    await expect(first.locator('canvas')).toHaveCount(0);

    await first.scrollIntoViewIfNeeded();
    await expect(first.locator('canvas')).toHaveCount(1);
    await expect(last.locator('canvas')).toHaveCount(0);
  }
});
