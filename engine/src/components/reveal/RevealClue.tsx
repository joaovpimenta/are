import * as stylex from '@stylexjs/stylex';
import { useEffect, useState } from 'react';
import type { AreTheme } from '../../theme';
import { toObjectThemeStyle } from '../../theme';

type RevealClueProps = {
  title: string;
  teaser: string;
  content: string;
  theme: AreTheme;
  resetKey?: number;
  onReveal?: () => void;
};

const styles = stylex.create({
  panel: {
    display: 'grid',
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--object-accent) 28%, transparent)',
    borderRadius: 18,
    backgroundColor: 'color-mix(in srgb, var(--object-surface) 92%, transparent)',
    color: 'var(--object-text)',
  },
  title: {
    margin: 0,
    fontSize: 14,
  },
  teaser: {
    margin: 0,
    color: 'var(--object-muted)',
    fontSize: 12,
    lineHeight: 1.5,
  },
  button: {
    minHeight: 44,
    paddingBlock: 9,
    paddingInline: 13,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--object-accent) 30%, transparent)',
    borderRadius: 10,
    color: 'var(--object-text)',
    backgroundColor: 'var(--object-surface-raised)',
    cursor: 'pointer',
    fontWeight: 850,
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
  content: {
    margin: 0,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftStyle: 'solid',
    borderLeftColor: 'var(--object-accent)',
    color: 'var(--object-text)',
    backgroundColor: 'var(--object-accent-soft)',
    fontSize: 13,
    lineHeight: 1.55,
  },
});

export function RevealClue({ title, teaser, content, theme, resetKey = 0, onReveal }: RevealClueProps) {
  const [revealed, setRevealed] = useState(false);
  const variables = toObjectThemeStyle(theme);

  useEffect(() => {
    setRevealed(false);
  }, [resetKey]);

  const reveal = () => {
    setRevealed(true);
    onReveal?.();
  };

  return (
    <section {...stylex.props(styles.panel)} style={variables} aria-label={title}>
      <h3 {...stylex.props(styles.title)}>{title}</h3>
      <p {...stylex.props(styles.teaser)}>{teaser}</p>
      {revealed ? (
        <p {...stylex.props(styles.content)} aria-live="polite">{content}</p>
      ) : (
        <button {...stylex.props(styles.button)} type="button" onClick={reveal} aria-expanded={revealed}>
          Revelar pista
        </button>
      )}
    </section>
  );
}
