import { expect, test } from '../fixtures';

test('reduced motion keeps the Dial functional without intermediate animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/lab/dial/');
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('output').first()).toHaveText('03');
});

test('keyboard fallbacks cover Tab, Enter, Space and arrows where applicable', async ({ page }) => {
  await page.goto('/lab/keypad/');
  await page.keyboard.press('Tab');
  await page.keyboard.type('1984');
  await page.keyboard.press('Enter');
  await expect(page.getByText('solved', { exact: true }).first()).toBeVisible();

  await page.goto('/lab/levers/');
  const north = page.getByRole('button', { name: /Alavanca N:/ });
  await north.focus();
  await page.keyboard.press('Space');
  await expect(north).toHaveAttribute('aria-pressed', 'true');

  await page.goto('/lab/tuner/');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('slider', { name: 'Frequência' })).toHaveValue('42');
});
