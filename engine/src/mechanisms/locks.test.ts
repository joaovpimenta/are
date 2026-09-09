import { describe, expect, it } from 'vitest';
import { matchesLockSolution, normalizeLockScalar } from './locks';

describe('lock mechanism', () => {
  it('normalizes scalar answers', () => {
    expect(normalizeLockScalar('  Atlas ')).toBe('atlas');
    expect(matchesLockSolution(' ATLAS ', 'atlas')).toBe(true);
  });

  it('matches ordered sequences exactly', () => {
    expect(matchesLockSolution(['N', 'E', 'S', 'W'], ['N', 'E', 'S', 'W'])).toBe(true);
    expect(matchesLockSolution(['N', 'S', 'E', 'W'], ['N', 'E', 'S', 'W'])).toBe(false);
  });

  it('matches boolean arrays for switch-style locks', () => {
    expect(matchesLockSolution([true, false, true], [true, false, true])).toBe(true);
    expect(matchesLockSolution([true, true, false], [true, false, true])).toBe(false);
  });
});
