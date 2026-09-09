import { expect, type Locator, type Page } from '@playwright/test';

export type TargetPoint = 'center' | 'top' | 'bottom' | 'left' | 'right';

export async function boxPoint(locator: Locator, point: TargetPoint, inset = 3) {
  await expect(locator).toBeVisible();
  const resolved = await locator.evaluate(async (element) => {
    const initial = element.getBoundingClientRect();
    const fullyVisible = initial.top >= 0
      && initial.left >= 0
      && initial.bottom <= window.innerHeight
      && initial.right <= window.innerWidth
      && element.contains(document.elementFromPoint(initial.x + initial.width / 2, initial.y + initial.height / 2));
    if (!fullyVisible) element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' });
    // Let scroll, sticky positioning and ResizeObserver updates settle before
    // sending physical input at viewport coordinates.
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const rect = element.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  });
  expect(resolved.width).toBeGreaterThan(0);
  expect(resolved.height).toBeGreaterThan(0);
  const centerX = resolved.x + resolved.width / 2;
  const centerY = resolved.y + resolved.height / 2;
  if (point === 'top') return { x: centerX, y: resolved.y + inset };
  if (point === 'bottom') return { x: centerX, y: resolved.y + resolved.height - inset };
  if (point === 'left') return { x: resolved.x + inset, y: centerY };
  if (point === 'right') return { x: resolved.x + resolved.width - inset, y: centerY };
  return { x: centerX, y: centerY };
}

export async function pointerPress(page: Page, locator: Locator, point: TargetPoint = 'center') {
  const position = await boxPoint(locator, point);
  await page.mouse.move(position.x, position.y);
  await page.mouse.down();
  await page.mouse.up();
}

export async function touchPress(page: Page, locator: Locator, point: TargetPoint = 'center') {
  const position = await boxPoint(locator, point);
  await page.touchscreen.tap(position.x, position.y);
}

export async function assertPointerHit(page: Page, locator: Locator, point: TargetPoint) {
  const position = await boxPoint(locator, point);
  await locator.evaluate((element) => {
    element.setAttribute('data-pointer-hit', '0');
    element.addEventListener('pointerdown', () => element.setAttribute('data-pointer-hit', '1'), { once: true });
    element.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
    }, { once: true, capture: true });
  });
  await page.mouse.move(position.x, position.y);
  await page.mouse.down();
  await page.mouse.up();
  await expect(locator).toHaveAttribute('data-pointer-hit', '1');
}

export async function latestInteractionDebug(page: Page) {
  return page.evaluate(() => (window as unknown as {
    __ARE_INTERACTION_DEBUG_STATE__?: {
      last?: {
        clientX: number;
        clientY: number;
        pointerType: string;
        pointerId: number;
        hit: string;
        ndc: { x: number; y: number };
        bounds: { left: number; top: number; width: number; height: number };
        local?: { x: number; y: number; z?: number };
      };
    };
  }).__ARE_INTERACTION_DEBUG_STATE__?.last ?? null);
}
