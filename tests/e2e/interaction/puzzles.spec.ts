import type { Locator, Page } from '@playwright/test';
import { expect, test } from '../fixtures';
import { boxPoint } from '../helpers';

async function tap(_page: Page, locator: Locator) {
  await locator.click();
}

function mechanismStatus(page: Page, status: string) {
  return page.locator(`article [data-status="${status}"]`).first();
}

async function resetSession(page: Page) {
  await tap(page, page.getByRole('button', { name: 'Resetar sessão' }));
}

async function dispatchCompassHeading(page: Page, magneticHeading: number) {
  await page.evaluate((heading) => {
    const screenAngle = window.screen.orientation?.angle ?? 0;
    const alpha = ((360 + screenAngle - heading) % 360 + 360) % 360;
    const event = new Event('deviceorientationabsolute');
    Object.defineProperties(event, {
      alpha: { value: alpha },
      absolute: { value: true },
    });
    window.dispatchEvent(event);
  }, magneticHeading);
}

async function holdCompassHeading(page: Page, magneticHeading: number) {
  for (let sample = 0; sample < 10; sample += 1) {
    await dispatchCompassHeading(page, magneticHeading);
    if (sample < 9) await new Promise((resolve) => setTimeout(resolve, 80));
  }
}

test('Keypad: initial, invalid, repeated input, resolution, disabled and reset', async ({ page }) => {
  await page.goto('/lab/keypad/');
  const key = (label: string) => page.getByRole('button', { name: label, exact: true });
  await expect(mechanismStatus(page, 'idle')).toBeVisible();
  await expect(page.getByText('entrada=----')).toBeVisible();

  for (const digit of ['0', '0', '0', '0']) await tap(page, key(digit));
  await tap(page, key('OK'));
  await expect(mechanismStatus(page, 'error')).toBeVisible({ timeout: 600 });
  await expect(mechanismStatus(page, 'idle')).toBeVisible({ timeout: 1500 });

  await tap(page, key('1'));
  await tap(page, key('1'));
  await expect(page.getByText('entrada=11')).toBeVisible();
  await tap(page, key('C'));
  for (const digit of ['1', '9', '8', '4']) await tap(page, key(digit));
  await tap(page, key('OK'));
  await expect(mechanismStatus(page, 'solved')).toBeVisible();
  for (const label of ['1', '9', '8', '4', 'C', 'OK']) await expect(key(label)).toBeDisabled();

  await resetSession(page);
  await expect(mechanismStatus(page, 'idle')).toBeVisible();
  await expect(key('1')).toBeEnabled();
  await expect(page.getByText('entrada=----')).toBeVisible();
});

test('Dial: initial, invalid step, full solution, disabled and reset', async ({ page }) => {
  await page.goto('/lab/dial/');
  const decrease = page.getByRole('button', { name: 'Diminuir dial' });
  const increase = page.getByRole('button', { name: 'Aumentar dial' });
  const output = page.locator('article output').first();
  await expect(output).toHaveText('02');

  await tap(page, increase);
  await expect(output).toHaveText('03');
  await expect(mechanismStatus(page, 'active')).toBeVisible();
  for (let step = 0; step < 4; step += 1) await tap(page, increase);
  await expect(output).toHaveText('07');
  await expect(mechanismStatus(page, 'solved')).toBeVisible();
  await expect(increase).toBeDisabled();
  await expect(decrease).toBeDisabled();

  await resetSession(page);
  await expect(output).toHaveText('02');
  await expect(increase).toBeEnabled();
});

test('Signal Tuner: pointer input changes value, keyboard completes solution, disabled and reset', async ({ page }) => {
  await page.goto('/lab/tuner/');
  const slider = page.getByRole('slider', { name: 'Frequência' });
  const decrease = page.getByRole('button', { name: 'Diminuir frequência' });
  const increase = page.getByRole('button', { name: 'Aumentar frequência' });
  await expect(slider).toHaveValue('41');

  const center = await boxPoint(slider, 'center');
  await page.touchscreen.tap(center.x + 8, center.y);
  await expect.poll(async () => Number(await slider.inputValue())).not.toBe(41);
  await expect(mechanismStatus(page, 'active')).toBeVisible();

  await increase.focus();
  const current = Number(await slider.inputValue());
  const direction = current <= 73 ? 'ArrowRight' : 'ArrowLeft';
  for (let step = 0; step < Math.abs(73 - current); step += 1) await page.keyboard.press(direction);
  await expect(slider).toHaveValue('73');
  await expect(mechanismStatus(page, 'solved')).toBeVisible();
  await expect(slider).toBeDisabled();
  await expect(decrease).toBeDisabled();
  await expect(increase).toBeDisabled();

  await resetSession(page);
  await expect(slider).toHaveValue('41');
  await expect(slider).toBeEnabled();
});

test('Lever Console: invalid routing, solution, disabled and reset', async ({ page }) => {
  await page.goto('/lab/levers/');
  const lever = (name: string) => page.getByRole('button', { name: new RegExp(`Alavanca ${name}:`) });
  for (const name of ['N', 'E', 'S', 'W']) await expect(lever(name)).toHaveAttribute('aria-pressed', 'false');

  await tap(page, lever('E'));
  await expect(lever('E')).toHaveAttribute('aria-pressed', 'true');
  await expect(mechanismStatus(page, 'active')).toBeVisible();
  await tap(page, lever('E'));
  await tap(page, lever('N'));
  await tap(page, lever('S'));
  await expect(mechanismStatus(page, 'solved')).toBeVisible();
  for (const name of ['N', 'E', 'S', 'W']) await expect(lever(name)).toBeDisabled();

  await resetSession(page);
  for (const name of ['N', 'E', 'S', 'W']) {
    await expect(lever(name)).toBeEnabled();
    await expect(lever(name)).toHaveAttribute('aria-pressed', 'false');
  }
});

test('Cipher Rotor: invalid step, complete solution, disabled, navigation return and reset', async ({ page }) => {
  await page.goto('/lab/cipher/');
  const plus = (rotor: number) => page.getByRole('button', { name: `Aumentar rotor ${rotor}` });
  const minus = (rotor: number) => page.getByRole('button', { name: `Diminuir rotor ${rotor}` });
  const rotor = (index: number) => page.getByRole('status', { name: `Rotor ${index}`, exact: true });
  await expect(rotor(1)).toHaveText('0');

  await tap(page, plus(1));
  await expect(rotor(1)).toHaveText('1');
  await expect(mechanismStatus(page, 'active')).toBeVisible();
  for (let step = 0; step < 6; step += 1) await tap(page, plus(1));
  for (let step = 0; step < 3; step += 1) await tap(page, plus(2));
  await tap(page, plus(3));
  await expect(page.getByText('rotors=731')).toBeVisible();
  await expect(mechanismStatus(page, 'solved')).toBeVisible();
  for (const index of [1, 2, 3]) {
    await expect(plus(index)).toBeDisabled();
    await expect(minus(index)).toBeDisabled();
  }

  await page.getByRole('link', { name: /Dial/ }).first().click();
  await expect(page.getByRole('heading', { name: 'Dial' })).toBeVisible();
  await page.getByRole('link', { name: /Cipher rotor/ }).first().click();
  await expect(page.getByRole('heading', { name: 'Cipher rotor' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Cipher rotor/ }).first().getByText('solved')).toBeVisible();

  await resetSession(page);
  await expect(rotor(1)).toHaveText('0');
  await expect(plus(1)).toBeEnabled();
});

test('Compass lock: device orientation registers eight-way headings without clicking direction controls', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'DeviceOrientationEvent', {
      configurable: true,
      value: class SyntheticDeviceOrientationEvent extends Event {},
    });
  });

  await page.goto('/lab/locks/');
  const section = page.locator('#lock-compass');
  await section.scrollIntoViewIfNeeded();
  const console = section.getByRole('group', { name: 'Bússola · console operacional' });
  await expect(console.locator('canvas')).toHaveCount(1);
  await expect(console.getByText(/AGUARDANDO NORTE MAGNÉTICO/)).toBeVisible();

  const current = console.getByLabel('Entrada atual');
  await expect(current.locator('span')).toHaveText(['Nenhuma posição selecionada.']);

  const headings = [0, 45, 90, 135] as const;
  const expected = ['N', 'NE', 'E', 'SE'];
  for (let index = 0; index < headings.length; index += 1) {
    await holdCompassHeading(page, headings[index]);
    await expect(current.locator('span')).toHaveText(expected.slice(0, index + 1));
  }

  await expect(console.getByRole('status')).toHaveText('Cadeado aberto. Solução confirmada.');
});
