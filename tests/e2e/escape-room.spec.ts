import { expect, test } from './fixtures';

test('Echo Station preserves input, gates scenes, keeps clues and offers a safe restart and gallery exit', async ({ page }) => {
  await page.goto('/are/echo-station/');
  const stages = page.getByRole('navigation', { name: 'Etapas da aventura' });
  await expect(stages.getByRole('button', { name: /Decodificador/ })).toBeDisabled();
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByRole('button', { name: 'Mensagem anterior' }).click();
  await expect(page.getByText(/Traga a banda até setenta e três/)).toBeVisible();
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByRole('button', { name: 'Concluir', exact: true }).click();
  const frequency = page.getByRole('slider', { name: 'Frequência do rádio' });
  await frequency.fill('62');
  await page.reload();
  await expect(frequency).toHaveValue('62');
  await expect(stages.getByRole('button', { name: /Rádio/ })).toHaveAttribute('aria-current', 'step');
  await expect(page.getByRole('region', { name: 'Registro de pistas' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Abrir decodificador' })).toBeDisabled();

  await page.getByRole('button', { name: 'Reiniciar sinal' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continuar jogando' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(frequency).toHaveValue('62');
  await frequency.fill('73');
  await expect(frequency).toBeDisabled();
  await page.getByRole('button', { name: 'Abrir decodificador' }).click();
  await page.getByRole('button', { name: 'Aumentar rotor 1' }).click();
  await page.reload();
  await expect(page.getByRole('status', { name: 'Rotor 1', exact: true })).toHaveText('1');
  await stages.getByRole('button', { name: /Rádio/ }).click();
  await expect(frequency).toHaveValue('73');
  await expect(frequency).toBeDisabled();
  await stages.getByRole('button', { name: /Decodificador/ }).click();
  for (const [rotor, steps] of [[1, 6], [2, 3], [3, 1]] as const) {
    for (let index = 0; index < steps; index += 1) await page.getByRole('button', { name: `Aumentar rotor ${rotor}` }).click();
  }
  await page.getByRole('button', { name: 'Restaurar arquivo' }).click();
  await expect(page.getByRole('heading', { name: 'Você não chegou tarde.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Voltar à galeria', exact: true })).toHaveAttribute('href', '../');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Você não chegou tarde.' })).toBeVisible();
  await page.getByRole('button', { name: 'Jogar novamente' }).click();
  await page.getByRole('button', { name: 'Reiniciar aventura', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Continuar', exact: true })).toBeVisible();
  await expect(stages.getByRole('button', { name: /Rádio/ })).toBeDisabled();
  await page.getByRole('link', { name: 'Galeria de aventuras', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'ARE', exact: true })).toBeVisible();
});

test('mobile Echo Station keeps controls first, targets reachable, help optional and canvas scrollable', async ({ page, browserName }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/echo-station/');
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByRole('button', { name: 'Concluir', exact: true }).click();
  const controls = page.getByRole('complementary', { name: 'Controles do rádio' });
  const canvas = page.getByLabel('Rádio de ondas curtas da Echo Station').locator('canvas');
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute('data-scene-ready', 'true');
  const controlBox = await controls.boundingBox();
  const canvasBox = await canvas.boundingBox();
  expect(controlBox!.y).toBeLessThan(canvasBox!.y);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  expect(await canvas.evaluate((element) => getComputedStyle(element).touchAction)).toBe('pan-y');
  const increaseBox = await page.getByRole('button', { name: 'Aumentar frequência' }).boundingBox();
  expect(increaseBox!.width).toBeGreaterThanOrEqual(44);
  expect(increaseBox!.height).toBeGreaterThanOrEqual(44);
  await expect(page.getByText('Ajuste a frequência para 73 e selecione Abrir decodificador.')).toHaveCount(0);
  await page.getByRole('button', { name: 'Revelar dica 1 de 3' }).click();
  await expect(page.getByText('A operadora informou uma banda na primeira mensagem.')).toBeVisible();
  await expect(page.getByText('A banda foi dita por extenso: setenta e três.')).toHaveCount(0);
  if (browserName === 'chromium') {
    await canvas.scrollIntoViewIfNeeded();
    const bounds = await canvas.boundingBox();
    const beforeScroll = await page.evaluate(() => window.scrollY);
    const touch = await page.context().newCDPSession(page);
    const x = bounds!.x + bounds!.width / 2;
    const y = Math.min(bounds!.y + bounds!.height / 2, 500);
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let distance = 20; distance <= 160; distance += 20) {
      await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - distance }] });
    }
    await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(beforeScroll + 10);
    await expect(page.getByRole('slider', { name: 'Frequência do rádio' })).toHaveValue('41');
    await touch.detach();
  }
});

test('Echo Station remains playable when WebGL is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', { value: function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      return type === 'webgl2' ? null : Reflect.apply(original, this, [type, ...args]);
    } });
  });
  await page.goto('/echo-station/');
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByRole('button', { name: 'Concluir', exact: true }).click();
  await expect(page.getByText('A visualização 3D não está disponível.', { exact: false })).toBeVisible();
  await page.getByRole('slider', { name: 'Frequência do rádio' }).fill('73');
  await page.getByRole('button', { name: 'Abrir decodificador' }).click();
  for (const [rotor, steps] of [[1, 7], [2, 3], [3, 1]] as const) {
    for (let index = 0; index < steps; index += 1) await page.getByRole('button', { name: `Aumentar rotor ${rotor}` }).click();
  }
  await page.getByRole('button', { name: 'Restaurar arquivo' }).click();
  await expect(page.getByRole('heading', { name: 'Você não chegou tarde.' })).toBeVisible();
});
