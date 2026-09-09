import { expect, test } from '../fixtures';
import { assertPointerHit, touchPress } from '../helpers';

const points = ['center', 'top', 'bottom', 'left', 'right'] as const;
const keypadButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'C', 'OK'] as const;

test('DOM buttons respond at visual center and all four hit-target edges', async ({ page }) => {
  await page.goto('/lab/keypad/');
  await expect(page.getByRole('heading', { name: 'Keypad' })).toBeVisible();
  expect(keypadButtons.length).toBeGreaterThan(10);
  for (const label of keypadButtons) {
    const button = page.getByRole('button', { name: label, exact: true });
    await expect(button).toBeVisible();
    const size = await button.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    expect(size.width).toBeGreaterThanOrEqual(44);
    expect(size.height).toBeGreaterThanOrEqual(44);
    for (const point of points) await assertPointerHit(page, button, point);
  }
});

test('touch taps use the same visual button target', async ({ page }) => {
  await page.goto('/lab/keypad/');
  const one = page.getByRole('button', { name: '1', exact: true });
  await touchPress(page, one);
  await expect(page.getByText('entrada=1')).toBeVisible();
});
