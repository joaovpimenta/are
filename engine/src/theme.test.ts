import { describe, expect, it } from 'vitest';
import {
  amberTheme,
  builtInThemes,
  defaultTheme,
  strangerThingsTheme,
  toLabThemeStyle,
  toObjectThemeStyle,
  toThreeTheme,
} from './theme';

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

  it('exposes reusable built-in themes and maps optional typography and atmosphere tokens', () => {
    expect(Object.keys(builtInThemes)).toEqual(['cyan', 'amber', 'stranger-things']);
    expect(builtInThemes['stranger-things']).toBe(strangerThingsTheme);
    expect(toLabThemeStyle(strangerThingsTheme)).toMatchObject({
      '--are-accent': strangerThingsTheme.accent,
      '--are-font-display': strangerThingsTheme.typography?.display,
      '--are-page-background': strangerThingsTheme.atmosphere?.pageBackground,
      '--are-title-shadow': strangerThingsTheme.atmosphere?.titleShadow,
    });
    expect(toObjectThemeStyle(strangerThingsTheme)).toMatchObject({
      '--object-accent': strangerThingsTheme.accent,
      '--object-font-mono': strangerThingsTheme.typography?.mono,
      '--object-surface-texture': strangerThingsTheme.atmosphere?.surfaceTexture,
    });
    expect(toThreeTheme(strangerThingsTheme).glow).toBe(strangerThingsTheme.glow);
  });

  it('keeps legacy themes working when optional presentation tokens are absent or partial', () => {
    const legacyTheme = { ...amberTheme, typography: undefined, atmosphere: undefined };
    expect(toLabThemeStyle(legacyTheme)).toMatchObject({
      '--are-font-body': 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      '--are-font-mono': 'ui-monospace, SFMono-Regular, Menlo, monospace',
      '--are-title-shadow': 'none',
    });
    expect(toLabThemeStyle(legacyTheme)).toMatchObject({
      '--are-page-background': expect.stringContaining('color-mix(in srgb, #ffb84d 18%, transparent)'),
    });
    expect(toObjectThemeStyle({ ...legacyTheme, typography: { mono: 'custom-mono' } })).toMatchObject({
      '--object-font-mono': 'custom-mono',
      '--object-font-body': 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    });
  });
});

