import { describe, expect, it } from 'vitest';
import { interactiveRectContainsVisual, overlappingHitPairs, type HitRect } from './hitTarget';

function rect(id: string, centerX: number, centerY: number, width: number, height: number): HitRect {
  return { id, centerX, centerY, width, height };
}

describe('3D hit target geometry', () => {
  it('keeps Keypad hit meshes larger than their visuals without overlap', () => {
    const interactive: HitRect[] = [];
    const visual: HitRect[] = [];
    for (let row = 0; row < 4; row += 1) {
      for (let column = 0; column < 3; column += 1) {
        const id = `${row}-${column}`;
        const x = (column - 1) * 0.9;
        const y = 0.72 - row * 0.72;
        interactive.push(rect(id, x, y, 0.82, 0.64));
        visual.push(rect(id, x, y, 0.72, 0.54));
      }
    }
    expect(overlappingHitPairs(interactive)).toEqual([]);
    interactive.forEach((target, index) => expect(interactiveRectContainsVisual(target, visual[index])).toBe(true));
  });

  it('keeps Lever hit meshes inside their own column', () => {
    const targets = Array.from({ length: 4 }, (_, index) => rect(
      `lever-${index}`,
      (index - 1.5) * 1.08,
      0.35,
      0.82,
      1.74,
    ));
    expect(overlappingHitPairs(targets)).toEqual([]);
  });

  it('keeps Cipher increase/decrease targets separated per rotor and between rotors', () => {
    const targets: HitRect[] = [];
    for (let index = 0; index < 3; index += 1) {
      const x = (index - 1) * 1.2;
      targets.push(rect(`rotor-${index}-increase`, x, 0.72, 0.62, 0.5));
      targets.push(rect(`rotor-${index}-decrease`, x, -0.72, 0.62, 0.5));
    }
    expect(overlappingHitPairs(targets)).toEqual([]);
  });

  it('reports an overlap regression instead of silently accepting it', () => {
    const pairs = overlappingHitPairs([
      rect('left', 0, 0, 1, 1),
      rect('right', 0.8, 0, 1, 1),
    ]);
    expect(pairs).toEqual([['left', 'right']]);
  });
});
