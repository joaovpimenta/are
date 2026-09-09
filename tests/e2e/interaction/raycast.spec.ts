import type { Page } from '@playwright/test';
import { expect, test } from '../fixtures';
import { latestInteractionDebug } from '../helpers';

async function dialCanvas(page: Page) {
  const canvas = page.getByLabel('Seletor de cofre 3D');
  await expect(canvas.locator('canvas')).toHaveAttribute('data-scene-ready', 'true');
  await canvas.scrollIntoViewIfNeeded();
  await canvas.evaluate(async (element) => {
    element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' });
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });
  await expect(canvas).toBeVisible();
  return canvas;
}

async function tapCanvas(page: Page, xRatio: number, yRatio: number) {
  const canvas = await dialCanvas(page);
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

  for (const [xRatio, yRatio, xSign, ySign] of [
    [0.58, 0.42, 1, 1],
    [0.58, 0.58, 1, -1],
    [0.42, 0.58, -1, -1],
    [0.42, 0.42, -1, 1],
  ] as const) {
    // A lower-left sample can solve the dial and intentionally disable it.
    // Each quadrant must start with an interactive mechanism.
    await page.getByRole('button', { name: 'Resetar sessão' }).click();
    await expect(page.locator('article output').first()).toHaveText('02');
    const { box } = await tapCanvas(page, xRatio, yRatio);
    const debug = await latestInteractionDebug(page);
    expect(debug).not.toBeNull();
    expect(debug!.hit).toBe('dial-hit-target');
    expect(Math.sign(debug!.local?.x ?? 0)).toBe(xSign);
    expect(Math.sign(debug!.local?.y ?? 0)).toBe(ySign);
    expect(debug!.bounds.left).toBeCloseTo(box.x, 0);
    expect(debug!.bounds.top).toBeCloseTo(box.y, 0);
    const expectedNdcX = ((debug!.clientX - debug!.bounds.left) / debug!.bounds.width) * 2 - 1;
    const expectedNdcY = -(((debug!.clientY - debug!.bounds.top) / debug!.bounds.height) * 2 - 1);
    expect(debug!.ndc.x).toBeCloseTo(expectedNdcX, 6);
    expect(debug!.ndc.y).toBeCloseTo(expectedNdcY, 6);
    expect(debug!.pointerType).toBe('touch');
  }
});

test('Dial survives resize/orientation change and keeps using the resized canvas bounds', async ({ page }) => {
  await page.goto('/lab/dial/');
  const before = page.viewportSize();
  expect(before).not.toBeNull();
  await page.setViewportSize({ width: before!.height, height: before!.width });
  const { box } = await tapCanvas(page, 0.58, 0.42);
  const debug = await latestInteractionDebug(page);
  expect(debug).not.toBeNull();
  expect(debug!.bounds.width).toBeCloseTo(box.width, 0);
  expect(debug!.bounds.height).toBeCloseTo(box.height, 0);
  const dpr = Number(process.env.ARE_DEVICE_SCALE_FACTOR ?? 1);
  expect(await page.evaluate(() => window.devicePixelRatio)).toBeCloseTo(dpr, 1);
});

test('Dial crosses the 0/360 seam in both directions', async ({ page }) => {
  await page.goto('/lab/dial/');
  const canvas = await dialCanvas(page);
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  const radius = Math.min(box!.width, box!.height) * 0.1;
  const centerX = box!.x + box!.width / 2;
  const centerY = box!.y + box!.height / 2 + radius * 0.12;
  const y = centerY - radius;

  let positiveValue = '00';
  let negativeValue = '00';
  for (const factor of [0.38, 0.48, 0.58]) {
    await page.touchscreen.tap(centerX + radius * factor, y);
    positiveValue = (await page.locator('output').first().textContent()) ?? '00';
    if (positiveValue === '01') break;
  }
  for (const factor of [0.38, 0.48, 0.58]) {
    await page.touchscreen.tap(centerX - radius * factor, y);
    negativeValue = (await page.locator('output').first().textContent()) ?? '00';
    if (negativeValue === '09') break;
  }
  expect(positiveValue).toBe('01');
  expect(negativeValue).toBe('09');
});

test('Dial supports clockwise/counter-clockwise drag, pointerup outside, cancel and lost capture recovery', async ({ page }) => {
  await page.goto('/lab/dial/');
  const canvas = await dialCanvas(page);
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  const radius = Math.min(box!.width, box!.height) * 0.1;
  const cx = box!.x + box!.width / 2;
  const cy = box!.y + box!.height / 2 + radius * 0.12;

  await page.mouse.move(cx, cy - radius);
  await page.mouse.down();
  await page.mouse.move(cx + radius, cy, { steps: 5 });
  await page.mouse.move(cx, cy + radius, { steps: 5 });
  await page.mouse.up();
  await expect(page.locator('output').first()).toHaveText(/^(04|05|06)$/);

  await page.mouse.move(cx, cy + radius);
  await page.mouse.down();
  await page.mouse.move(cx + radius, cy, { steps: 5 });
  await page.mouse.move(cx, cy - radius, { steps: 5 });
  await page.mouse.up();
  await expect(page.locator('output').first()).toHaveText(/^(00|01|09)$/);

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
