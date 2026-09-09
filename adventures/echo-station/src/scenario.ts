import type { DialogueLine } from '@are/engine/components/dialogue/DialoguePanel';
import type { AreTheme } from '@are/engine/theme';

export const echoTheme: AreTheme = {
  background: '#05080c',
  surface: '#11171c',
  surfaceRaised: '#1a242b',
  text: '#f2eadf',
  muted: '#9a9b96',
  accent: '#ffad55',
  accentSoft: '#4a2910',
  success: '#7bf2bd',
  danger: '#ff6d78',
  warning: '#ffd166',
  metal: '#87949c',
  metalDark: '#202b31',
  metalLight: '#d9e0df',
  ink: '#040708',
  glow: '#ffc275',
};

export const echoScenario = {
  id: 'last-broadcast',
  title: 'Echo Station',
  location: 'Relay 04 · North Atlantic',
  targetBand: 73,
  cipher: [7, 3, 1] as const,
  dialogue: [
    {
      id: 'carrier',
      speaker: 'Operadora Vale',
      text: 'Se alguém ainda escuta: o relé está preso numa portadora fantasma. Traga a banda até setenta e três.',
    },
    {
      id: 'archive',
      speaker: 'Operadora Vale',
      text: 'Quando o ruído cessar, use os três ecos do relatório. Sete. Três. Um. Não confie na luz do corredor.',
    },
  ] satisfies readonly DialogueLine[],
} as const;

export type EchoScene = 'transmission' | 'tuner' | 'cipher' | 'archive';
