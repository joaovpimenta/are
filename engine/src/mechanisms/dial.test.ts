import { describe, expect, it } from 'vitest';
import { dialRotation, dialValueFromClockPoint, normalizeDialValue, stepDialValue } from './dial';

const range = { min: 0, max: 9 };

describe('dial mechanism', () => {
  it('wraps values in both directions', () => {
    expect(stepDialValue(9, 1, range)).toBe(0);
    expect(stepDialValue(0, -1, range)).toBe(9);
    expect(normalizeDialValue(22, range)).toBe(2);
  });

  it('reads pointer positions clockwise from twelve o’clock', () => {
    expect(dialValueFromClockPoint(0, 1, { min: 0, max: 3 })).toBe(0);
    expect(dialValueFromClockPoint(1, 0, { min: 0, max: 3 })).toBe(1);
    expect(dialValueFromClockPoint(0, -1, { min: 0, max: 3 })).toBe(2);
    expect(dialValueFromClockPoint(-1, 0, { min: 0, max: 3 })).toBe(3);
  });

  it('derives stable visual rotation from the normalized value', () => {
    expect(dialRotation(0, { min: 0, max: 3 })).toBeCloseTo(0);
    expect(dialRotation(1, { min: 0, max: 3 })).toBeCloseTo(-Math.PI / 2);
  });
});

