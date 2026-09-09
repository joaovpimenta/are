import { describe, expect, it } from 'vitest';
import { LOCK_PRESETS } from './lockPresets';

describe('lock presets', () => {
  it('keeps each Crack & Reveal mechanism in its own unique section', () => {
    expect(LOCK_PRESETS).toHaveLength(14);
    expect(new Set(LOCK_PRESETS.map((preset) => preset.definition.id)).size).toBe(14);
    expect(new Set(LOCK_PRESETS.map((preset) => preset.definition.kind)).size).toBe(14);
  });

  it('documents an objective test solution for every mechanism', () => {
    for (const preset of LOCK_PRESETS) {
      expect(preset.solutionLabel.length).toBeGreaterThan(0);
      expect(preset.instruction.length).toBeGreaterThan(0);
    }
  });

  it('defines the compass as a physical magnetic-orientation puzzle', () => {
    const compass = LOCK_PRESETS.find((preset) => preset.definition.kind === 'compass');
    expect(compass).toBeDefined();
    expect(compass?.description).toContain('norte magnético');
    expect(compass?.instruction).toContain('gire o aparelho');
    expect(compass?.instruction).toContain('registrar automaticamente');
    expect(compass?.definition.solution).toEqual(['N', 'NE', 'E', 'SE']);
  });
});
