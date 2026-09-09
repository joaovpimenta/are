import { describe, expect, it } from 'vitest';
import { amberTheme, defaultTheme, toLabThemeStyle, toObjectThemeStyle, toThreeTheme } from './theme';

describe('theme adapters', () => {
  it('maps every semantic state to DOM variables', () => {
    expect(toObjectThemeStyle(defaultTheme)).toMatchObject({
      '--object-accent': defaultTheme.accent,
      '--object-success': defaultTheme.success,
      '--object-danger': defaultTheme.danger,
      '--object-warning': defaultTheme.warning,
    });
    expect(toLabThemeStyle(amberTheme)).toMatchObject({
      '--are-accent': amberTheme.accent,
      '--are-bg': amberTheme.background,
    });
  });

  it('provides a complete Three.js material palette without renderer literals', () => {
    expect(toThreeTheme(defaultTheme)).toEqual(expect.objectContaining({
      housing: defaultTheme.surface,
      face: defaultTheme.ink,
      metalDark: defaultTheme.metalDark,
      metalLight: defaultTheme.metalLight,
      glow: defaultTheme.glow,
    }));
  });
});

