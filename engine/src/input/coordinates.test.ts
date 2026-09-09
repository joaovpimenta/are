import { describe, expect, it } from 'vitest';
import { clientPointToCanvasPoint, clientPointToNdc } from './coordinates';

describe('canvas pointer coordinates', () => {
  const bounds = { left: 37, top: 420, width: 320, height: 240 };

  it('uses canvas bounds rather than window dimensions', () => {
    expect(clientPointToCanvasPoint(197, 540, bounds)).toEqual({ x: 160, y: 120 });
    expect(clientPointToNdc(197, 540, bounds)).toEqual({ x: 0, y: -0 });
  });

  it('maps all four canvas edges to NDC', () => {
    expect(clientPointToNdc(37, 420, bounds)).toEqual({ x: -1, y: 1 });
    expect(clientPointToNdc(357, 420, bounds)).toEqual({ x: 1, y: 1 });
    expect(clientPointToNdc(37, 660, bounds)).toEqual({ x: -1, y: -1 });
    expect(clientPointToNdc(357, 660, bounds)).toEqual({ x: 1, y: -1 });
  });
});
