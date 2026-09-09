import { describe, expect, it } from 'vitest';
import { createSwitchValues, matchesSwitchSolution, toggleSwitch } from './switches';

describe('switch mechanism', () => {
  it('toggles one position without mutating the previous state', () => {
    const initial = createSwitchValues([true, false]);
    const next = toggleSwitch(initial, 0);
    expect(initial).toEqual([false, false]);
    expect(next).toEqual([true, false]);
  });

  it('requires the full solution length and values', () => {
    expect(matchesSwitchSolution([true], [true, false])).toBe(false);
    expect(matchesSwitchSolution([true, false], [true, false])).toBe(true);
  });
});

