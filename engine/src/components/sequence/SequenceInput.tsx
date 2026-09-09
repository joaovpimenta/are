import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef, useState } from 'react';
import { createSequenceState, transitionSequence } from '../../mechanisms/sequence';
import type { AreTheme } from '../../theme';
import { toObjectThemeStyle } from '../../theme';

type SequenceInputProps = {
  symbols: readonly string[];
  solution: readonly number[];
  theme: AreTheme;
  resetKey?: number;
  onChange?: (sequence: readonly number[]) => void;
  onSolved?: () => void;
  onError?: () => void;
};

const styles = stylex.create({
  panel: {
    display: 'grid',
    gap: 13,
    padding: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--object-accent) 28%, transparent)',
    borderRadius: 18,
    backgroundColor: 'color-mix(in srgb, var(--object-surface) 92%, transparent)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 10,
    color: 'var(--object-text)',
    fontSize: 13,
    fontWeight: 800,
  },
  hint: {
    color: 'var(--object-muted)',
    fontSize: 11,
    fontWeight: 600,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 8,
  },
  tile: {
    minHeight: 52,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--object-accent) 22%, transparent)',
    borderRadius: 11,
    color: 'var(--object-text)',
    backgroundColor: 'var(--object-surface-raised)',
    cursor: 'pointer',
    fontSize: 18,
    fontWeight: 900,
    touchAction: 'manipulation',
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
  tileSelected: {
    borderColor: 'var(--object-accent)',
    color: 'var(--object-accent)',
    backgroundColor: 'var(--object-accent-soft)',
  },
  status: {
    margin: 0,
    minHeight: 18,
    color: 'var(--object-muted)',
    fontSize: 12,
  },
  success: {
    color: 'var(--object-success)',
  },
  error: {
    color: 'var(--object-danger)',
  },
});

export function SequenceInput({ symbols, solution, theme, resetKey = 0, onChange, onSolved, onError }: SequenceInputProps) {
  const [state, setState] = useState(createSequenceState);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const variables = toObjectThemeStyle(theme);
  const solutionKey = solution.join(',');

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  useEffect(() => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = null;
    setState(createSequenceState());
  }, [resetKey, solutionKey]);

  const choose = (index: number) => {
    const next = transitionSequence(state, { type: 'SELECT', index }, solution);
    if (next === state) return;
    setState(next);
    onChange?.(next.selection);
    if (next.status === 'solved') {
      onSolved?.();
      return;
    }
    if (next.status === 'error') {
      onError?.();
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => {
        const reset = transitionSequence(next, { type: 'RESET' }, solution);
        setState(reset);
        onChange?.(reset.selection);
        resetTimer.current = null;
      }, 650);
    }
  };

  const statusLabel = state.status === 'solved' ? 'Sequência correta.' : state.status === 'error' ? 'Sequência incorreta. Tente outra vez.' : 'Escolha cada símbolo uma vez.';

  return (
    <section {...stylex.props(styles.panel)} style={variables} aria-label="Entrada de sequência">
      <div {...stylex.props(styles.header)}>
        <span>Sequência</span>
        <span {...stylex.props(styles.hint)}>{state.selection.length}/{solution.length}</span>
      </div>
      <div {...stylex.props(styles.grid)}>
        {symbols.map((symbol, index) => (
          <button
            {...stylex.props(styles.tile, state.selection.includes(index) ? styles.tileSelected : undefined)}
            key={`${symbol}-${index}`}
            type="button"
            aria-label={`Símbolo ${symbol}, posição ${index + 1}`}
            aria-pressed={state.selection.includes(index)}
            disabled={state.status === 'solved'}
            onClick={() => choose(index)}
          >
            {symbol}
          </button>
        ))}
      </div>
      <p {...stylex.props(styles.status, state.status === 'solved' ? styles.success : state.status === 'error' ? styles.error : undefined)} aria-live="polite">
        {statusLabel}
      </p>
    </section>
  );
}
