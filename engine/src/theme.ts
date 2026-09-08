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
  metal: string;
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
  metal: '#9aa8b8',
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
