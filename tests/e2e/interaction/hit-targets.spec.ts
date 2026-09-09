import { expect, test } from '../fixtures';
import { touchPress } from '../helpers';

const keypadButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'C', 'OK'] as const;

test('DOM buttons expose 44px hit targets at center and all four edges', async ({ page }) => {
  await page.goto('/lab/keypad/');
  await expect(page.getByRole('heading', { name: 'Keypad' })).toBeVisible();

  for (const label of keypadButtons) {
    const button = page.getByRole('button', { name: label, exact: true });
    await expect(button).toBeVisible();
    const result = await button.evaluate((element) => {
      element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' });
      const rect = element.getBoundingClientRect();
      const inset = 3;
      const points = [
        [rect.left + rect.width / 2, rect.top + rect.height / 2],
        [rect.left + rect.width / 2, rect.top + inset],
        [rect.left + rect.width / 2, rect.bottom - inset],
        [rect.left + inset, rect.top + rect.height / 2],
        [rect.right - inset, rect.top + rect.height / 2],
      ];
      return {
        width: rect.width,
        height: rect.height,
        hits: points.map(([x, y]) => {
          const hit = document.elementFromPoint(x, y);
          return hit === element || (hit != null && element.contains(hit));
        }),
      };
    });
    expect(result.width).toBeGreaterThanOrEqual(44);
    expect(result.height).toBeGreaterThanOrEqual(44);
    expect(result.hits).toEqual([true, true, true, true, true]);
  }
});

test('touch taps use the same visual button target', async ({ page }) => {
  await page.goto('/lab/keypad/');
  const one = page.getByRole('button', { name: '1', exact: true });
  await touchPress(page, one);
  await expect(page.getByText('entrada=1')).toBeVisible();
});
