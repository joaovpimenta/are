import type { Page } from '@playwright/test';
import { Group, PerspectiveCamera, Vector3 } from 'three';
import { expect, test } from '../fixtures';
import { latestInteractionDebug } from '../helpers';

type BoundingBox = { x: number; y: number; width: number; height: number };

const layout = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['C', '0', 'OK'],
] as const;

async function keypadCanvas(page: Page) {
  const canvas = page.getByLabel('Painel de acesso 3D').locator('canvas');
  await expect(canvas).toHaveAttribute('data-scene-ready', 'true');
  await canvas.evaluate(async (element) => {
    element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' });
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });
  const bounds = await canvas.boundingBox();
  expect(bounds).not.toBeNull();
  return bounds!;
}

/** Screen point projected from the key's actual 3D center, not from the fallback DOM keys. */
function keyPoint(bounds: BoundingBox, label: string, localX = 0, localY = 0) {
  const row = layout.findIndex((keys) => (keys as readonly string[]).includes(label));
  if (row < 0) throw new Error(`Unknown key ${label}`);
  const rowKeys: readonly string[] = layout[row];
  const column = rowKeys.indexOf(label);

  const camera = new PerspectiveCamera(38, bounds.width / bounds.height, 0.1, 1000);
  camera.position.set(0, 0.12, 7.5);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();

  const housing = new Group();
  housing.rotation.set(-0.08, 0.08, 0);
  housing.updateMatrixWorld(true);
  const projected = housing.localToWorld(new Vector3(
    (column - 1) * 0.9 + localX,
    0.72 - row * 0.72 + localY,
    0.07 + 0.34,
  )).project(camera);

  return {
    x: bounds.x + (projected.x + 1) * bounds.width / 2,
    y: bounds.y + (1 - projected.y) * bounds.height / 2,
  };
}

async function expectKeyHit(page: Page, bounds: BoundingBox, label: string, localX = 0, localY = 0) {
  const point = keyPoint(bounds, label, localX, localY);
  await page.mouse.move(point.x, point.y);
  await expect.poll(async () => {
    const last = await latestInteractionDebug(page);
    return last?.hit === `keypad-${label}-hit-target`
      && Math.abs(last.clientX - point.x) < 2
      && Math.abs(last.clientY - point.y) < 2;
  }).toBe(true);
}

test('Keypad hover and raycasting match every visible 3D key and its edges', async ({ page }) => {
  await page.goto('/lab/keypad/');
  const bounds = await keypadCanvas(page);

  for (const row of layout) {
    for (const label of row) await expectKeyHit(page, bounds, label);
  }

  // Test all four sides of the visible face, not just the central hit mesh.
  for (const [x, y] of [[-0.3, 0], [0.3, 0], [0, -0.21], [0, 0.21]] as const) {
    await expectKeyHit(page, bounds, '5', x, y);
  }

  // Resolve using only rendered keys. Fallback DOM buttons are not involved.
  for (const [label, expected] of [['1', '1'], ['9', '19'], ['8', '198'], ['4', '1984']] as const) {
    const currentBounds = await keypadCanvas(page);
    const point = keyPoint(currentBounds, label);
    await page.mouse.click(point.x, point.y);
    await expect(page.getByText(`entrada=${expected}`)).toBeVisible();
    if (label === '1') {
      const afterStatusChange = await page.getByLabel('Painel de acesso 3D').locator('canvas').boundingBox();
      expect(afterStatusChange).not.toBeNull();
      // Updating the narrow-screen status badge must not shift the instrument.
      expect(afterStatusChange!.y).toBeCloseTo(currentBounds.y, 0);
    }
  }
  const submitBounds = await keypadCanvas(page);
  const submit = keyPoint(submitBounds, 'OK');
  await page.mouse.click(submit.x, submit.y);
  await expect(page.locator('article [data-status="solved"]')).toBeVisible();
});

test('Keypad touch uses the same 3D centers for digit and clear', async ({ page }) => {
  await page.goto('/lab/keypad/');
  const bounds = await keypadCanvas(page);

  const four = keyPoint(bounds, '4');
  await page.touchscreen.tap(four.x, four.y);
  await expect(page.getByText('entrada=4')).toBeVisible();
  const clear = keyPoint(await keypadCanvas(page), 'C');
  await page.touchscreen.tap(clear.x, clear.y);
  await expect(page.getByText('entrada=----')).toBeVisible();

  const digit = keyPoint(await keypadCanvas(page), '1');
  await page.touchscreen.tap(digit.x, digit.y);
  await expect(page.getByText('entrada=1')).toBeVisible();
  const debug = await latestInteractionDebug(page);
  expect(debug?.hit).toBe('keypad-1-hit-target');
  expect(debug?.pointerType).toBe('touch');
});
