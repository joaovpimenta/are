import * as stylex from '@stylexjs/stylex';
import { LockPanel } from '@are/engine/components/locks/LockPanel';
import { useEffect, useState } from 'react';
import { MechanismPage } from '../harness/MechanismPage';
import type { LabRouteProps } from '../model';
import { labStyles } from '../styles';
import { LOCK_PRESETS } from './lockPresets';

const styles = stylex.create({
  stage: {
    width: 'min(940px, calc(100% - 28px))',
    alignContent: 'start',
  },
  index: {
    position: 'sticky',
    top: 84,
    zIndex: 5,
    display: 'flex',
    gap: 7,
    marginBottom: 20,
    padding: 9,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--are-accent) 18%, transparent)',
    borderRadius: 14,
    backgroundColor: 'color-mix(in srgb, var(--are-bg) 90%, transparent)',
    backdropFilter: 'blur(16px)',
    overflowX: 'auto',
    scrollbarWidth: 'thin',
  },
  indexLink: {
    flexShrink: 0,
    minHeight: 40,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 11,
    borderRadius: 999,
    color: 'var(--are-muted)',
    backgroundColor: 'var(--are-surface-raised)',
    textDecoration: 'none',
    fontSize: 12,
    fontWeight: 800,
    ':hover': { color: 'var(--are-text)' },
    ':focus-visible': { outlineWidth: 3, outlineStyle: 'solid', outlineColor: 'var(--are-accent)', outlineOffset: 2 },
  },
  list: { display: 'grid', gap: 24 },
  example: {
    scrollMarginTop: 142,
    display: 'grid',
    gap: 14,
    padding: { default: 18, '@media (max-width: 560px)': 12 },
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--are-accent) 16%, transparent)',
    borderRadius: 20,
    backgroundColor: 'color-mix(in srgb, var(--are-surface) 82%, transparent)',
  },
  exampleHeader: {
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr)',
    gap: 12,
    alignItems: 'start',
  },
  icon: {
    display: 'grid',
    placeItems: 'center',
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'var(--are-accent-soft)',
    fontSize: 21,
  },
  title: { margin: '0 0 4px', color: 'var(--are-text)', fontSize: 23, lineHeight: 1.1 },
  artifact: { margin: 0, color: 'var(--are-accent)', fontSize: 12, fontWeight: 850, letterSpacing: 0.6, textTransform: 'uppercase' },
  description: { margin: 0, color: 'var(--are-muted)', fontSize: 14, lineHeight: 1.55 },
  operation: {
    display: 'grid',
    gridTemplateColumns: { default: 'minmax(0, 1fr) minmax(220px, .7fr)', '@media (max-width: 680px)': '1fr' },
    gap: 10,
  },
  note: {
    margin: 0,
    padding: 12,
    borderRadius: 12,
    color: 'var(--are-text)',
    backgroundColor: 'var(--are-surface-raised)',
    fontSize: 13,
    lineHeight: 1.5,
  },
  noteLabel: {
    display: 'block',
    marginBottom: 4,
    color: 'var(--are-accent)',
    fontFamily: 'ui-monospace, monospace',
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export function LocksRoute({ entry, theme, resetVersion, session, snapshot }: LabRouteProps) {
  const [solved, setSolved] = useState(() => new Set<string>());
  const status = snapshot.mechanismResults.locks ?? 'pending';
  const complete = solved.size === LOCK_PRESETS.length;

  useEffect(() => setSolved(new Set()), [resetVersion]);

  const solve = (id: string) => {
    setSolved((current) => {
      if (current.has(id)) return current;
      const next = new Set(current);
      next.add(id);
      session.send({
        type: next.size === LOCK_PRESETS.length ? 'MECHANISM_SOLVED' : 'MECHANISM_ACTIVE',
        mechanismId: 'locks',
      });
      return next;
    });
  };

  return (
    <MechanismPage
      entry={entry}
      status={complete ? 'solved' : status}
      visual={
        <div {...stylex.props(labStyles.domStage, styles.stage)}>
          <nav {...stylex.props(styles.index)} aria-label="Índice dos 14 cadeados">
            {LOCK_PRESETS.map((preset) => (
              <a {...stylex.props(styles.indexLink)} key={preset.definition.id} href={`#lock-${preset.definition.id}`}>
                <span aria-hidden="true">{preset.icon}</span>
                {preset.label}{solved.has(preset.definition.id) ? ' ✓' : ''}
              </a>
            ))}
          </nav>

          <div {...stylex.props(styles.list)}>
            {LOCK_PRESETS.map((preset, index) => (
              <section
                {...stylex.props(styles.example)}
                id={`lock-${preset.definition.id}`}
                key={preset.definition.id}
                aria-labelledby={`lock-title-${preset.definition.id}`}
              >
                <header {...stylex.props(styles.exampleHeader)}>
                  <span {...stylex.props(styles.icon)} aria-hidden="true">{preset.icon}</span>
                  <div>
                    <p {...stylex.props(styles.artifact)}>Cadeado {String(index + 1).padStart(2, '0')} · {preset.artifact}</p>
                    <h2 {...stylex.props(styles.title)} id={`lock-title-${preset.definition.id}`}>{preset.label}</h2>
                    <p {...stylex.props(styles.description)}>{preset.description}</p>
                  </div>
                </header>

                <div {...stylex.props(styles.operation)}>
                  <p {...stylex.props(styles.note)}><span {...stylex.props(styles.noteLabel)}>Operação</span>{preset.instruction}</p>
                  <p {...stylex.props(styles.note)}><span {...stylex.props(styles.noteLabel)}>Solução de teste</span>{preset.solutionLabel}</p>
                </div>

                <LockPanel
                  definition={preset.definition}
                  theme={theme}
                  title={`${preset.label} · console operacional`}
                  resetKey={resetVersion}
                  onActive={() => session.send({ type: 'MECHANISM_ACTIVE', mechanismId: 'locks' })}
                  onSolved={() => solve(preset.definition.id)}
                  onError={() => session.send({ type: 'MECHANISM_ERROR', mechanismId: 'locks' })}
                />
              </section>
            ))}
          </div>
        </div>
      }
      telemetry={<span>seções resolvidas={solved.size}/{LOCK_PRESETS.length}</span>}
    />
  );
}
