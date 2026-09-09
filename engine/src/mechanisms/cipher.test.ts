import { describe, expect, it } from 'vitest';
import { createCipherState, stepCipherRotor } from './cipher';

describe('cipher mechanism', () => {
  it('wraps rotors and solves only the complete code', () => {
    let state = createCipherState(2);
    state = stepCipherRotor(state, 0, -1, [9, 1]);
    expect(state.values).toEqual([9, 0]);
    state = stepCipherRotor(state, 1, 1, [9, 1]);
    expect(state).toEqual({ values: [9, 1], solved: true });
  });
});

