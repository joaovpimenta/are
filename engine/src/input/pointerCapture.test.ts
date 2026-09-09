import { describe, expect, it, vi } from 'vitest';
import { capturePointer, releasePointer } from './pointerCapture';

describe('pointer capture primitive', () => {
  it('captures and releases without any Three.js dependency', () => {
    const target = {
      setPointerCapture: vi.fn(),
      hasPointerCapture: vi.fn(() => true),
      releasePointerCapture: vi.fn(),
    };
    expect(capturePointer(target, 4)).toBe(true);
    expect(releasePointer(target, 4)).toBe(true);
    expect(target.setPointerCapture).toHaveBeenCalledWith(4);
    expect(target.releasePointerCapture).toHaveBeenCalledWith(4);
  });

  it('does not throw for missing or lost capture targets', () => {
    expect(capturePointer(null, 1)).toBe(false);
    expect(releasePointer({ setPointerCapture() {}, hasPointerCapture: () => false, releasePointerCapture() {} }, 1)).toBe(false);
  });
});
