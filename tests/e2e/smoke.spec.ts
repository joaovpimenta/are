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

test('Lock archive separates and operates all 14 examples', async ({ page }) => {
  await page.goto('/lab/locks/');

  await expect(page.getByRole('heading', { name: '14 cadeados Three.js' })).toBeVisible();
  await expect(page.locator('section[id^="lock-"]')).toHaveCount(14);
  await expect(page.getByRole('heading', { name: 'Numérico', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Geoloc. real', exact: true })).toBeAttached();

  await expect(page.locator('[data-three-lock]')).toHaveCount(14);
  const numericCanvas = page.locator('#lock-numeric canvas');
  await expect(numericCanvas).toHaveCount(1);
  expect(await numericCanvas.evaluate((element) => Boolean((element as HTMLCanvasElement).getContext('webgl2')))).toBe(true);

  const finalSection = page.locator('#lock-real-geolocation');
  await finalSection.scrollIntoViewIfNeeded();
  await expect(finalSection.locator('canvas')).toHaveCount(1);

  await page.locator('#lock-numeric').scrollIntoViewIfNeeded();
  await page.locator('#lock-numeric summary').click();
  await page.getByLabel('Código numérico').fill('1234');
  await page.locator('#lock-numeric').getByRole('button', { name: 'Validar' }).click();
  await expect(page.locator('#lock-numeric').getByText('Cadeado aberto. Solução confirmada.')).toBeVisible();
});

test('Lab input updates the shared session status', async ({ page }) => {
  await page.goto('/lab/keypad/');
  await expect(page.getByRole('heading', { name: 'Keypad' })).toBeVisible();
  await page.keyboard.type('1984');
  await page.keyboard.press('Enter');

  await expect(page.getByText('solved', { exact: true }).first()).toBeVisible();
  await page.getByRole('link', { name: /Visão geral/ }).click();
  await expect(page.getByRole('link', { name: /Keypad/ }).first().getByText('solved')).toBeVisible();
});

test('3D mechanisms retain complete mobile fallback controls', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/lab/tuner/');

  const decrease = page.getByRole('button', { name: 'Diminuir frequência' });
  const increase = page.getByRole('button', { name: 'Aumentar frequência' });
  const slider = page.getByRole('slider', { name: 'Frequência' });
  await expect(page.getByRole('heading', { name: 'Signal tuner' })).toBeVisible();
  await slider.fill('73');
  await expect(page.getByText('solved', { exact: true }).first()).toBeVisible();
  await expect(decrease).toBeDisabled();
  await expect(increase).toBeDisabled();

  await page.getByRole('button', { name: 'Resetar sessão' }).click();
  await expect(slider).toHaveValue('41');
  await expect(decrease).toBeEnabled();
  await expect(increase).toBeEnabled();

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
