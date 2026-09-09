import type { Page } from '@playwright/test';
import { expect, test } from '../fixtures';
import { latestInteractionDebug } from '../helpers';

async function tapCanvas(page: Page, xRatio: number, yRatio: number) {
  const canvas = page.getByLabel('Seletor de cofre 3D');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  const x = box!.x + box!.width * xRatio;
  const y = box!.y + box!.height * yRatio;
  await page.touchscreen.tap(x, y);
  return { box: box!, x, y };
}

test('Dial raycasting reports canvas-relative NDC and local quadrants after page offset/scroll', async ({ page }) => {
  await page.goto('/lab/dial/');
  await expect(page.getByLabel('Seletor de cofre 3D')).toBeVisible();
  await page.evaluate(() => {
    const spacer = document.createElement('div');
    spacer.id = 'interaction-offset-spacer';
    spacer.style.height = '420px';
    document.body.prepend(spacer);
  });
  await page.getByLabel('Seletor de cofre 3D').scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -80));

  for (const [xRatio, yRatio, xSign, ySign] of [
    [0.62, 0.38, 1, 1],
    [0.62, 0.62, 1, -1],
    [0.38, 0.62, -1, -1],
    [0.38, 0.38, -1, 1],
  ] as const) {
    const { box, x, y } = await tapCanvas(page, xRatio, yRatio);
    const debug = await latestInteractionDebug(page);
    expect(debug).not.toBeNull();
    expect(debug!.hit).toBe('dial-hit-target');
    expect(Math.sign(debug!.local?.x ?? 0)).toBe(xSign);
    expect(Math.sign(debug!.local?.y ?? 0)).toBe(ySign);
    expect(debug!.bounds.left).toBeCloseTo(box.x, 0);
    expect(debug!.bounds.top).toBeCloseTo(box.y, 0);
    expect(debug!.ndc.x).toBeCloseTo(((x - box.x) / box.width) * 2 - 1, 2);
    expect(debug!.ndc.y).toBeCloseTo(-(((y - box.y) / box.height) * 2 - 1), 2);
    expect(debug!.pointerType).toBe('touch');
  }
});

test('Dial survives resize/orientation change and keeps using the resized canvas bounds', async ({ page }) => {
  await page.goto('/lab/dial/');
  const before = page.viewportSize();
  expect(before).not.toBeNull();
  await page.setViewportSize({ width: before!.height, height: before!.width });
  const { box } = await tapCanvas(page, 0.62, 0.38);
  const debug = await latestInteractionDebug(page);
  expect(debug?.bounds.width).toBeCloseTo(box.width, 0);
  expect(debug?.bounds.height).toBeCloseTo(box.height, 0);
  const dpr = Number(process.env.ARE_DEVICE_SCALE_FACTOR ?? 1);
  expect(await page.evaluate(() => window.devicePixelRatio)).toBeCloseTo(dpr, 1);
});

test('Dial crosses the 0/360 seam in both directions', async ({ page }) => {
  await page.goto('/lab/dial/');
  const canvas = page.getByLabel('Seletor de cofre 3D');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  const radius = Math.min(box!.width, box!.height) * 0.22;
  const centerX = box!.x + box!.width / 2;
  const centerY = box!.y + box!.height / 2;
  const y = centerY - radius * 0.86;
  await page.touchscreen.tap(centerX + radius * 0.5, y);
  await expect(page.locator('output').first()).toHaveText('01');
  await page.touchscreen.tap(centerX - radius * 0.5, y);
  await expect(page.locator('output').first()).toHaveText('09');
});

test('Dial supports clockwise/counter-clockwise drag, pointerup outside, cancel and lost capture recovery', async ({ page }) => {
  await page.goto('/lab/dial/');
  const canvas = page.getByLabel('Seletor de cofre 3D');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  const radius = Math.min(box!.width, box!.height) * 0.22;
  const cx = box!.x + box!.width / 2;
  const cy = box!.y + box!.height / 2;

  await page.mouse.move(cx, cy - radius);
  await page.mouse.down();
  await page.mouse.move(cx + radius, cy, { steps: 5 });
  await page.mouse.move(cx, cy + radius, { steps: 5 });
  await page.mouse.up();
  await expect(page.locator('output').first()).toHaveText('05');

  await page.mouse.move(cx, cy + radius);
  await page.mouse.down();
  await page.mouse.move(cx + radius, cy, { steps: 5 });
  await page.mouse.move(cx, cy - radius, { steps: 5 });
  await page.mouse.up();
  await expect(page.locator('output').first()).toHaveText('00');

  await page.mouse.move(cx, cy - radius);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width + 30, cy, { steps: 4 });
  await page.mouse.up();

  await canvas.dispatchEvent('pointercancel', { pointerId: 77, pointerType: 'touch', clientX: cx, clientY: cy });
  await canvas.dispatchEvent('lostpointercapture', { pointerId: 77, pointerType: 'touch', clientX: cx, clientY: cy });
  await page.touchscreen.tap(cx + radius, cy);
  const debug = await latestInteractionDebug(page);
  expect(debug?.hit).toBe('dial-hit-target');
});
