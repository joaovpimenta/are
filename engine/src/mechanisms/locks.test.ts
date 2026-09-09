import { describe, expect, it } from 'vitest';
import { matchesLockInput, matchesLockSolution, normalizeLockScalar } from './locks';

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

  it('matches unordered switches independently of activation order', () => {
    expect(matchesLockInput(
      { id: 'switches', kind: 'switches', solution: ['1', '3', '5'] },
      ['5', '1', '3'],
    )).toBe(true);
  });

  it('keeps ordered switches order-sensitive', () => {
    const definition = { id: 'ordered', kind: 'ordered-switches', solution: ['2', '5', '1', '4'] } as const;
    expect(matchesLockInput(definition, ['2', '5', '1', '4'])).toBe(true);
    expect(matchesLockInput(definition, ['1', '2', '4', '5'])).toBe(false);
  });

  it('matches geolocation within the configured tolerance', () => {
    const definition = {
      id: 'map',
      kind: 'virtual-geolocation',
      solution: '-19.9245,-43.9352',
      location: { latitude: -19.9245, longitude: -43.9352, toleranceMeters: 100 },
    } as const;

    expect(matchesLockInput(definition, '-19.9246,-43.9353')).toBe(true);
    expect(matchesLockInput(definition, '-19.9345,-43.9452')).toBe(false);
  });
});
