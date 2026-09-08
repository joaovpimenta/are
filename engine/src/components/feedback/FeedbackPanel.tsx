import * as stylex from '@stylexjs/stylex';
import type { CSSProperties } from 'react';
import type { AreTheme } from '../../theme';

export type FeedbackStatus = 'idle' | 'success' | 'error';

type FeedbackPanelProps = {
  status: FeedbackStatus;
  title?: string;
  message?: string;
  theme: AreTheme;
  onReset?: () => void;
};

const styles = stylex.create({
  panel: {
    display: 'grid',
    gap: 8,
    padding: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--object-accent) 28%, transparent)',
    borderRadius: 18,
    backgroundColor: 'color-mix(in srgb, var(--object-surface) 92%, transparent)',
    color: 'var(--object-text)',
  },
  panelSuccess: {
    borderColor: 'var(--object-success)',
    boxShadow: '0 0 26px color-mix(in srgb, var(--object-success) 22%, transparent)',
  },
  panelError: {
    borderColor: 'var(--object-danger)',
    boxShadow: '0 0 26px color-mix(in srgb, var(--object-danger) 22%, transparent)',
  },
  eyebrow: {
    margin: 0,
    color: 'var(--object-muted)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    margin: 0,
    fontSize: 15,
  },
  message: {
    margin: 0,
    color: 'var(--object-muted)',
    fontSize: 12,
    lineHeight: 1.5,
  },
  successText: {
    color: 'var(--object-success)',
  },
  errorText: {
    color: 'var(--object-danger)',
  },
  button: {
    justifySelf: 'start',
    minHeight: 40,
    paddingBlock: 8,
    paddingInline: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--object-accent) 26%, transparent)',
    borderRadius: 9,
    color: 'var(--object-text)',
    backgroundColor: 'var(--object-surface-raised)',
    cursor: 'pointer',
    fontWeight: 800,
    ':focus-visible': {
      outlineWidth: 3,
      outlineStyle: 'solid',
      outlineColor: 'var(--object-accent)',
      outlineOffset: 2,
    },
  },
});

export function FeedbackPanel({ status, title, message, theme, onReset }: FeedbackPanelProps) {
  const variables = {
    '--object-accent': theme.accent,
    '--object-surface': theme.surface,
    '--object-surface-raised': theme.surfaceRaised,
    '--object-text': theme.text,
    '--object-muted': theme.muted,
    '--object-success': theme.success,
    '--object-danger': theme.danger,
  } as CSSProperties;
  const label = status === 'success' ? 'sucesso' : status === 'error' ? 'erro' : 'aguardando';
  const fallbackTitle = status === 'success' ? 'Mecanismo desbloqueado' : status === 'error' ? 'Sinal rejeitado' : 'Aguardando ação';
  const fallbackMessage = status === 'success' ? 'A resposta foi confirmada pelo sistema.' : status === 'error' ? 'A configuração ainda não corresponde ao padrão.' : 'Interaja com um objeto para receber feedback.';

  return (
    <section
      {...stylex.props(styles.panel, status === 'success' ? styles.panelSuccess : status === 'error' ? styles.panelError : undefined)}
      style={variables}
      aria-live="polite"
    >
      <p {...stylex.props(styles.eyebrow)}>{label}</p>
      <h3 {...stylex.props(styles.title, status === 'success' ? styles.successText : status === 'error' ? styles.errorText : undefined)}>
        {title ?? fallbackTitle}
      </h3>
      <p {...stylex.props(styles.message)}>{message ?? fallbackMessage}</p>
      {onReset ? (
        <button {...stylex.props(styles.button)} type="button" onClick={onReset}>
          Resetar objeto
        </button>
      ) : null}
    </section>
  );
}
