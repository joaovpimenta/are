import { expect, test } from '../fixtures';
import { assertPointerHit, touchPress } from '../helpers';

const points = ['center', 'top', 'bottom', 'left', 'right'] as const;

test('DOM buttons respond at visual center and all four hit-target edges', async ({ page }) => {
  await page.goto('/lab/keypad/');
  await expect(page.getByRole('heading', { name: 'Keypad' })).toBeVisible();
  const buttons = page.locator('button:visible:not(:disabled)');
  const count = await buttons.count();
  expect(count).toBeGreaterThan(10);
  for (let index = 0; index < count; index += 1) {
    const button = buttons.nth(index);
    const box = await button.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    for (const point of points) await assertPointerHit(page, button, point);
  }
});

test('touch taps use the same visual button target', async ({ page }) => {
  await page.goto('/lab/keypad/');
  const one = page.getByRole('button', { name: '1', exact: true });
  await touchPress(page, one);
  await expect(page.getByText('entrada=1')).toBeVisible();
});
