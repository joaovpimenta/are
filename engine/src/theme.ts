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
};

export const amberTheme: AreTheme = {
  ...defaultTheme,
  accent: '#ffb84d',
  accentSoft: '#4d2c08',
  glow: '#ffc466',
  surface: '#15110b',
  surfaceRaised: '#21180d',
};

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
  } as CSSProperties;
}

export function toLabThemeStyle(theme: AreTheme): CSSProperties {
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
  } as CSSProperties;
}
