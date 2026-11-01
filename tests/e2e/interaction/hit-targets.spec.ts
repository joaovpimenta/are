import { expect, test } from '../fixtures';
import { touchPress } from '../helpers';

const keypadButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'C', 'OK'] as const;

test('the visible 3D key captions accept the same full code as the DOM keypad', async ({ page }) => {
  await page.goto('/lab/keypad/');
  const hardware = page.getByLabel('Painel de acesso 3D', { exact: true });
  await expect(hardware.locator('canvas')).toHaveAttribute('data-scene-ready', 'true');
  await page.waitForLoadState('networkidle');
  for (const [index, digit] of ['1', '9', '8', '4', 'OK'].entries()) {
    const caption = hardware.getByText(digit, { exact: true });
    await caption.scrollIntoViewIfNeeded();
    const box = await caption.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
    if (index < 4) await expect(page.getByText(`entrada=${'1984'.slice(0, index + 1)}`, { exact: true })).toBeVisible();
  }
  await expect(page.locator('article [data-status="solved"]')).toBeVisible();
});

test('every numeric 3D key and clear key respond to touch at the visible caption', async ({ page }) => {
  await page.goto('/lab/keypad/');
  const hardware = page.getByLabel('Painel de acesso 3D', { exact: true });
  await expect(hardware.locator('canvas')).toHaveAttribute('data-scene-ready', 'true');
  await page.waitForLoadState('networkidle');
  const tapCaption = async (label: string) => {
    const caption = hardware.getByText(label, { exact: true });
    await caption.scrollIntoViewIfNeeded();
    const box = await caption.boundingBox();
    expect(box).not.toBeNull();
    await page.touchscreen.tap(box!.x + box!.width / 2, box!.y + box!.height / 2);
  };
  for (const digit of ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']) {
    await tapCaption(digit);
    await expect(page.getByText(`entrada=${digit}`, { exact: true })).toBeVisible();
    await tapCaption('C');
    await expect(page.getByText('entrada=----', { exact: true })).toBeVisible();
  }
});

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
