import * as stylex from '@stylexjs/stylex';
import { useEffect, useMemo, useState } from 'react';
import { matchesLockSolution, type LockDefinition } from '../../mechanisms/locks';
import type { AreTheme } from '../../theme';
import { toObjectThemeStyle } from '../../theme';

type LockPanelProps = {
  definition: LockDefinition;
  theme: AreTheme;
  resetKey?: number;
  onSolved?: () => void;
  onActive?: () => void;
  onError?: () => void;
};

const styles = stylex.create({
  shell: {
    width: 'min(100%, 560px)',
    display: 'grid',
    gap: 14,
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--object-accent) 26%, transparent)',
    backgroundColor: 'color-mix(in srgb, var(--object-surface) 94%, transparent)',
    boxShadow: '0 18px 50px rgba(0,0,0,.28)',
  },
  header: { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' },
  title: { margin: 0, color: 'var(--object-text)', fontSize: 15, fontWeight: 900 },
  status: { color: 'var(--object-muted)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 },
  input: {
    width: '100%', minHeight: 48, paddingInline: 13, borderRadius: 12, borderWidth: 1, borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--object-accent) 25%, transparent)', backgroundColor: 'var(--object-surface-raised)',
    color: 'var(--object-text)', fontSize: 16, fontWeight: 800,
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(64px, 1fr))', gap: 8 },
  cell: {
    minHeight: 52, borderRadius: 12, borderWidth: 1, borderStyle: 'solid', borderColor: 'color-mix(in srgb, var(--object-accent) 22%, transparent)',
    backgroundColor: 'var(--object-surface-raised)', color: 'var(--object-text)', cursor: 'pointer', fontWeight: 900, touchAction: 'manipulation',
  },
  active: { borderColor: 'var(--object-accent)', color: 'var(--object-accent)', backgroundColor: 'var(--object-accent-soft)' },
  controls: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  submit: { minHeight: 44, paddingInline: 16, borderRadius: 999, borderWidth: 0, backgroundColor: 'var(--object-accent)', color: 'var(--object-surface)', fontWeight: 900, cursor: 'pointer' },
  reset: { minHeight: 44, paddingInline: 16, borderRadius: 999, borderWidth: 1, borderStyle: 'solid', borderColor: 'color-mix(in srgb, var(--object-accent) 28%, transparent)', backgroundColor: 'transparent', color: 'var(--object-text)', fontWeight: 800, cursor: 'pointer' },
});

const optionsByKind: Partial<Record<LockDefinition['kind'], readonly string[]>> = {
  pattern: ['1','2','3','4','5','6','7','8','9'],
  direction: ['↑','→','↓','←'],
  compass: ['N','NE','E','SE','S','SW','W','NW'],
  colors: ['Vermelho','Azul','Verde','Amarelo','Roxo','Laranja'],
  musical: ['C','D','E','F','G','A','B'],
  switches: ['1','2','3','4','5','6'],
  'ordered-switches': ['1','2','3','4','5','6'],
  'grid-4x4': Array.from({ length: 16 }, (_, i) => String(i + 1)),
  'grid-5x5': Array.from({ length: 25 }, (_, i) => String(i + 1)),
};

export function LockPanel({ definition, theme, resetKey = 0, onSolved, onActive, onError }: LockPanelProps) {
  const [text, setText] = useState('');
  const [sequence, setSequence] = useState<string[]>([]);
  const [status, setStatus] = useState<'pending' | 'active' | 'solved' | 'error'>('pending');
  const variables = toObjectThemeStyle(theme);
  const options = useMemo(() => optionsByKind[definition.kind] ?? [], [definition.kind]);

  useEffect(() => {
    setText('');
    setSequence([]);
    setStatus('pending');
  }, [resetKey, definition.id]);

  const markActive = () => {
    if (status === 'pending') setStatus('active');
    onActive?.();
  };

  const choose = (value: string) => {
    if (status === 'solved') return;
    markActive();
    if (definition.kind === 'switches') {
      setSequence((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
      return;
    }
    if (definition.kind === 'grid-4x4' || definition.kind === 'grid-5x5') {
      setSequence((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
      return;
    }
    setSequence((current) => [...current, value]);
  };

  const submit = () => {
    const input = options.length ? sequence : text;
    if (matchesLockSolution(input, definition.solution)) {
      setStatus('solved');
      onSolved?.();
    } else {
      setStatus('error');
      onError?.();
    }
  };

  const clear = () => {
    setText('');
    setSequence([]);
    setStatus('pending');
  };

  const textMode = options.length === 0;
  const label = definition.kind.replaceAll('-', ' ');

  return (
    <section {...stylex.props(styles.shell)} style={variables} aria-label={`Cadeado ${label}`}>
      <div {...stylex.props(styles.header)}>
        <h2 {...stylex.props(styles.title)}>{label}</h2>
        <span {...stylex.props(styles.status)} aria-live="polite">{status}</span>
      </div>

      {textMode ? (
        <input
          {...stylex.props(styles.input)}
          value={text}
          inputMode={definition.kind === 'numeric' ? 'numeric' : undefined}
          autoCapitalize="none"
          autoCorrect="off"
          placeholder={definition.kind === 'login' ? 'usuario:senha' : 'Digite a resposta'}
          onChange={(event) => { markActive(); setText(event.currentTarget.value); }}
          onKeyDown={(event) => { if (event.key === 'Enter') submit(); }}
        />
      ) : (
        <div {...stylex.props(styles.grid)}>
          {options.map((option) => {
            const selected = sequence.includes(option);
            return (
              <button
                {...stylex.props(styles.cell, selected ? styles.active : undefined)}
                type="button"
                key={option}
                aria-pressed={selected}
                disabled={status === 'solved'}
                onClick={() => choose(option)}
              >{option}</button>
            );
          })}
        </div>
      )}

      <div {...stylex.props(styles.controls)}>
        <button {...stylex.props(styles.submit)} type="button" onClick={submit} disabled={status === 'solved'}>Validar</button>
        <button {...stylex.props(styles.reset)} type="button" onClick={clear}>Limpar</button>
      </div>
    </section>
  );
}
