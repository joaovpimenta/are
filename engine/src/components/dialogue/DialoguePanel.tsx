import * as stylex from '@stylexjs/stylex';
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import type { AreTheme } from '../../theme';

export type DialogueLine = {
  id: string;
  speaker: string;
  text: string;
};

export type DialogueChoice = {
  id: string;
  label: string;
};

type DialoguePanelProps = {
  lines: readonly DialogueLine[];
  choices?: readonly DialogueChoice[];
  theme: AreTheme;
  resetKey?: number;
  onChoose?: (choice: DialogueChoice) => void;
  onComplete?: () => void;
};

const styles = stylex.create({
  panel: {
    display: 'grid',
    gap: 14,
    padding: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--object-accent) 28%, transparent)',
    borderRadius: 18,
    backgroundColor: 'color-mix(in srgb, var(--object-surface) 92%, transparent)',
    color: 'var(--object-text)',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  speaker: {
    color: 'var(--object-accent)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  progress: {
    color: 'var(--object-muted)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 11,
  },
  text: {
    minHeight: 56,
    margin: 0,
    fontSize: 15,
    lineHeight: 1.55,
  },
  controls: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  button: {
    minHeight: 42,
    paddingBlock: 9,
    paddingInline: 13,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--object-accent) 28%, transparent)',
    borderRadius: 10,
    color: 'var(--object-text)',
    backgroundColor: 'var(--object-surface-raised)',
    cursor: 'pointer',
    fontWeight: 800,
    ':hover': {
      borderColor: 'var(--object-accent)',
    },
    ':focus-visible': {
      outlineWidth: 3,
      outlineStyle: 'solid',
      outlineColor: 'var(--object-accent)',
      outlineOffset: 2,
    },
  },
  choice: {
    flexGrow: 1,
    textAlign: 'left',
  },
  complete: {
    color: 'var(--object-success)',
  },
});

export function DialoguePanel({ lines, choices = [], theme, resetKey = 0, onChoose, onComplete }: DialoguePanelProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const variables = {
    '--object-accent': theme.accent,
    '--object-surface': theme.surface,
    '--object-surface-raised': theme.surfaceRaised,
    '--object-text': theme.text,
    '--object-muted': theme.muted,
    '--object-success': theme.success,
  } as CSSProperties;

  useEffect(() => {
    setLineIndex(0);
    setCompleted(false);
  }, [resetKey, lines]);

  if (lines.length === 0) {
    return null;
  }

  const current = lines[Math.min(lineIndex, lines.length - 1)];
  const atEnd = lineIndex >= lines.length - 1;

  const advance = () => {
    if (!atEnd) {
      setLineIndex((value) => value + 1);
      return;
    }

    setCompleted(true);
    onComplete?.();
  };

  return (
    <section {...stylex.props(styles.panel)} style={variables} aria-label="Diálogo">
      <div {...stylex.props(styles.meta)}>
        <span {...stylex.props(styles.speaker)}>{current.speaker}</span>
        <span {...stylex.props(styles.progress)}>{lineIndex + 1}/{lines.length}</span>
      </div>
      <p {...stylex.props(styles.text)}>{current.text}</p>
      {completed ? (
        <strong {...stylex.props(styles.complete)}>Conversa concluída.</strong>
      ) : (
        <div {...stylex.props(styles.controls)}>
          {choices.map((choice) => (
            <button
              {...stylex.props(styles.button, styles.choice)}
              key={choice.id}
              type="button"
              onClick={() => onChoose?.(choice)}
            >
              {choice.label}
            </button>
          ))}
          <button {...stylex.props(styles.button)} type="button" onClick={advance}>
            {atEnd ? 'Concluir' : 'Continuar'}
          </button>
        </div>
      )}
    </section>
  );
}
