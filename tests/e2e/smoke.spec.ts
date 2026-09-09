import { expect, test } from '@playwright/test';

test('catalog links to the Lab and the playable Adventure', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'ARE' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Abrir Lab/ })).toHaveAttribute('href', './lab/');
  await expect(page.getByRole('link', { name: /Echo Station/ })).toHaveAttribute('href', './echo-station/');
});

test('Lab exposes all mechanisms as direct routes', async ({ page }) => {
  await page.goto('/lab/');

  await expect(page.getByRole('heading', { name: /Escolha um mecanismo/ })).toBeVisible();
  for (const name of ['Keypad', 'Dial', 'Signal tuner', 'Lever console', 'Cipher rotor']) {
    await expect(page.getByRole('link', { name: new RegExp(name) }).first()).toBeVisible();
  }

  await page.goto('/lab/cipher/');
  await expect(page.getByRole('heading', { name: 'Cipher rotor' })).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Aumentar rotor 1' })).toBeEnabled();
});

test('Lab input updates the shared session status', async ({ page }) => {
  await page.goto('/lab/keypad/');
  await page.keyboard.type('1984');
  await page.keyboard.press('Enter');

  await expect(page.getByText('solved', { exact: true }).first()).toBeVisible();
  await page.getByRole('link', { name: /Visão geral/ }).click();
  await expect(page.getByRole('link', { name: /Keypad/ }).first().getByText('solved')).toBeVisible();
});

test('3D mechanisms retain complete mobile fallback controls', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/lab/tuner/');

  await expect(page.getByRole('heading', { name: 'Signal tuner' })).toBeVisible();
  await page.getByRole('slider', { name: 'Frequência' }).fill('73');
  await expect(page.getByText('solved', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Diminuir frequência' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Aumentar frequência' })).toBeEnabled();

  const bodyWidth = await page.locator('body').evaluate((element) => element.scrollWidth);
  expect(bodyWidth).toBeLessThanOrEqual(390);
});

test('Echo Station completes through DOM controls without relying on WebGL input', async ({ page }) => {
  await page.goto('/echo-station/');

  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Concluir' }).click();
  await expect(page.getByRole('heading', { name: 'Echo Station' })).toBeVisible();

  await page.getByRole('slider', { name: 'Frequência do rádio' }).fill('73');
  await page.getByRole('button', { name: 'Abrir decodificador' }).click();

  for (const [rotor, steps] of [[1, 7], [2, 3], [3, 1]] as const) {
    for (let step = 0; step < steps; step += 1) {
      await page.getByRole('button', { name: `Aumentar rotor ${rotor}` }).click();
    }
  }
  await page.getByRole('button', { name: 'Restaurar arquivo' }).click();
  await expect(page.getByRole('heading', { name: 'Você não chegou tarde.' })).toBeVisible();
});
