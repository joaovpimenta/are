import type { CSSProperties } from 'react';

export type AreTheme = {
  background: string;
  surface: string;
  surfaceRaised: string;
  text: string;
  muted: string;
  accent: string;
  accentSoft: string;
  success: string;
  danger: string;
  warning: string;
  metal: string;
  metalDark: string;
  metalLight: string;
  ink: string;
  glow: string;
  typography?: Partial<ThemeTypography>;
  atmosphere?: Partial<ThemeAtmosphere>;
};

export type ThemeTypography = {
  body: string;
  display: string;
  mono: string;
};

export type ThemeAtmosphere = {
  pageBackground: string;
  surfaceTexture: string;
  stageBackground: string;
  titleShadow: string;
};

const defaultTypography: ThemeTypography = {
  body: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  display: 'Inter, ui-sans-serif, system-ui, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, monospace',
};

const defaultAtmosphere: ThemeAtmosphere = {
  pageBackground: 'radial-gradient(circle at 14% -10%, rgba(97, 218, 251, .16), transparent 34rem), linear-gradient(180deg, #0a111a, #070a0f)',
  surfaceTexture: 'linear-gradient(135deg, rgba(255,255,255,.018), transparent 48%)',
  stageBackground: 'radial-gradient(circle at 50% 45%, rgba(97, 218, 251, .13), transparent 44%), linear-gradient(180deg, #0a1119, #070a0f)',
  titleShadow: 'none',
};

export const defaultTheme: AreTheme = {
  background: '#070a0f',
  surface: '#101722',
  surfaceRaised: '#182231',
  text: '#f5f7fb',
  muted: '#91a0b4',
  accent: '#61dafb',
  accentSoft: '#143b4a',
  success: '#66f0a8',
  danger: '#ff657a',
  warning: '#ffc857',
  metal: '#9aa8b8',
  metalDark: '#26313d',
  metalLight: '#d7e1ea',
  ink: '#05090e',
  glow: '#77e4ff',
  typography: defaultTypography,
  atmosphere: defaultAtmosphere,
};

export const amberTheme: AreTheme = {
  ...defaultTheme,
  accent: '#ffb84d',
  accentSoft: '#4d2c08',
  glow: '#ffc466',
  surface: '#15110b',
  surfaceRaised: '#21180d',
  atmosphere: {
    ...defaultAtmosphere,
    pageBackground: 'radial-gradient(circle at 14% -10%, rgba(255, 184, 77, .16), transparent 34rem), linear-gradient(180deg, #181108, #0c0905)',
    stageBackground: 'radial-gradient(circle at 50% 45%, rgba(255, 184, 77, .13), transparent 44%), linear-gradient(180deg, #181108, #0c0905)',
  },
};

export const strangerThingsTheme: AreTheme = {
  ...defaultTheme,
  background: '#050203',
  surface: '#13080a',
  surfaceRaised: '#241014',
  text: '#f2e8d5',
  muted: '#aa8d88',
  accent: '#d91f36',
  accentSoft: '#410b14',
  success: '#78cf96',
  danger: '#ff4054',
  warning: '#f2bd4a',
  metal: '#897b73',
  metalDark: '#241a1b',
  metalLight: '#c9bbaa',
  ink: '#030102',
  glow: '#ff3148',
  typography: {
    body: 'Georgia, "Times New Roman", serif',
    display: 'Georgia, "Times New Roman", serif',
    mono: '"Courier New", Courier, monospace',
  },
  atmosphere: {
    pageBackground: 'radial-gradient(circle at 50% -18%, rgba(217,31,54,.42), transparent 31rem), radial-gradient(ellipse at 82% 44%, rgba(101,0,20,.18), transparent 28rem), linear-gradient(180deg, #050203 0%, #100407 48%, #030203 100%)',
    surfaceTexture: 'repeating-linear-gradient(0deg, rgba(255,255,255,.018) 0 1px, transparent 1px 4px), radial-gradient(circle at 50% 0%, rgba(217,31,54,.09), transparent 70%)',
    stageBackground: 'radial-gradient(ellipse at 50% 42%, rgba(217,31,54,.24), transparent 38%), repeating-linear-gradient(90deg, rgba(255,255,255,.012) 0 1px, transparent 1px 5px), linear-gradient(180deg, #130508, #030102)',
    titleShadow: '0 0 1px #ffe3dc, 0 0 16px rgba(255,49,72,.72), 0 0 42px rgba(111,0,17,.52)',
  },
};

export const builtInThemes = {
  cyan: defaultTheme,
  amber: amberTheme,
  'stranger-things': strangerThingsTheme,
} as const satisfies Record<string, AreTheme>;

export type AreThemeName = keyof typeof builtInThemes;

export type ThreeTheme = {
  housing: string;
  housingRaised: string;
  face: string;
  label: string;
  accent: string;
  accentSoft: string;
  success: string;
  danger: string;
  warning: string;
  metal: string;
  metalDark: string;
  metalLight: string;
  glow: string;
};

export function toThreeTheme(theme: AreTheme): ThreeTheme {
  return {
    housing: theme.surface,
    housingRaised: theme.surfaceRaised,
    face: theme.ink,
    label: theme.text,
    accent: theme.accent,
    accentSoft: theme.accentSoft,
    success: theme.success,
    danger: theme.danger,
    warning: theme.warning,
    metal: theme.metal,
    metalDark: theme.metalDark,
    metalLight: theme.metalLight,
    glow: theme.glow,
  };
}

export function toObjectThemeStyle(theme: AreTheme): CSSProperties {
  const typography = { ...defaultTypography, ...theme.typography };
  const atmosphere = { ...defaultAtmosphere, ...theme.atmosphere };
  return {
    '--object-accent': theme.accent,
    '--object-accent-soft': theme.accentSoft,
    '--object-surface': theme.surface,
    '--object-surface-raised': theme.surfaceRaised,
    '--object-text': theme.text,
    '--object-muted': theme.muted,
    '--object-success': theme.success,
    '--object-danger': theme.danger,
    '--object-warning': theme.warning,
    '--object-metal': theme.metal,
    '--object-font-body': typography.body,
    '--object-font-display': typography.display,
    '--object-font-mono': typography.mono,
    '--object-surface-texture': atmosphere.surfaceTexture,
    '--object-title-shadow': atmosphere.titleShadow,
  } as CSSProperties;
}

export function toLabThemeStyle(theme: AreTheme): CSSProperties {
  const typography = { ...defaultTypography, ...theme.typography };
  const atmosphere = { ...defaultAtmosphere, ...theme.atmosphere };
  return {
    '--are-bg': theme.background,
    '--are-surface': theme.surface,
    '--are-surface-raised': theme.surfaceRaised,
    '--are-text': theme.text,
    '--are-muted': theme.muted,
    '--are-accent': theme.accent,
    '--are-accent-soft': theme.accentSoft,
    '--are-success': theme.success,
    '--are-danger': theme.danger,
    '--are-warning': theme.warning,
    '--are-font-body': typography.body,
    '--are-font-display': typography.display,
    '--are-font-mono': typography.mono,
    '--are-page-background': atmosphere.pageBackground,
    '--are-surface-texture': atmosphere.surfaceTexture,
    '--are-stage-background': atmosphere.stageBackground,
    '--are-title-shadow': atmosphere.titleShadow,
  } as CSSProperties;
}
