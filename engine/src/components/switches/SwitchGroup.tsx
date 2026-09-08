import * as stylex from '@stylexjs/stylex';
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import type { AreTheme } from '../../theme';

type SwitchGroupProps = {
  labels?: readonly string[];
  solution: readonly boolean[];
  theme: AreTheme;
  resetKey?: number;
  onChange?: (values: readonly boolean[]) => void;
  onSolved?: () => void;
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
  list: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(92px, 1fr))',
    gap: 8,
  },
  switch: {
    display: 'grid',
    gap: 7,
    justifyItems: 'center',
    minHeight: 74,
    padding: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--object-accent) 22%, transparent)',
    borderRadius: 12,
    color: 'var(--object-text)',
    backgroundColor: 'var(--object-surface-raised)',
    cursor: 'pointer',
    fontSize: 11,
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
  lever: {
    display: 'flex',
    alignItems: 'center',
    width: 34,
    height: 18,
    padding: 2,
    borderRadius: 999,
    backgroundColor: 'var(--object-muted)',
    transitionProperty: 'background-color, transform',
    transitionDuration: '140ms',
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0.01ms',
    },
  },
  leverOn: {
    backgroundColor: 'var(--object-accent)',
    transform: 'rotate(-8deg)',
  },
  knob: {
    width: 14,
    height: 14,
    borderRadius: '50%',
    backgroundColor: 'var(--object-surface)',
    transitionProperty: 'transform',
    transitionDuration: '140ms',
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0.01ms',
    },
  },
  knobOn: {
    transform: 'translateX(16px)',
  },
  solved: {
    borderColor: 'var(--object-success)',
  },
});

export function SwitchGroup({ labels, solution, theme, resetKey = 0, onChange, onSolved }: SwitchGroupProps) {
  const [values, setValues] = useState(() => solution.map(() => false));
  const [solved, setSolved] = useState(false);
  const variables = {
    '--object-accent': theme.accent,
    '--object-surface': theme.surface,
    '--object-surface-raised': theme.surfaceRaised,
    '--object-text': theme.text,
    '--object-muted': theme.muted,
    '--object-success': theme.success,
  } as CSSProperties;

  useEffect(() => {
    setValues(solution.map(() => false));
    setSolved(false);
  }, [resetKey, solution]);

  const toggle = (index: number) => {
    if (solved) return;
    const next = values.map((value, position) => position === index ? !value : value);
    setValues(next);
    onChange?.(next);

    if (next.every((value, position) => value === solution[position])) {
      setSolved(true);
      onSolved?.();
    }
  };

  return (
    <section {...stylex.props(styles.panel)} style={variables} aria-label="Grupo de interruptores">
      <div {...stylex.props(styles.header)}>
        <span>Interruptores</span>
        <span>{solved ? 'alinhados' : 'ajuste a combinação'}</span>
      </div>
      <div {...stylex.props(styles.list)}>
        {solution.map((value, index) => (
          <button
            {...stylex.props(styles.switch, solved ? styles.solved : undefined)}
            key={index}
            type="button"
            aria-label={`${labels?.[index] ?? `Interruptor ${index + 1}`}: ${values[index] ? 'ligado' : 'desligado'}`}
            aria-pressed={values[index]}
            onClick={() => toggle(index)}
          >
            <span {...stylex.props(styles.lever, values[index] ? styles.leverOn : undefined)} aria-hidden="true">
              <span {...stylex.props(styles.knob, values[index] ? styles.knobOn : undefined)} />
            </span>
            {labels?.[index] ?? `SW-${index + 1}`}
          </button>
        ))}
      </div>
    </section>
  );
}
