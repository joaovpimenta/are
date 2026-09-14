import * as stylex from '@stylexjs/stylex';
import { LockPanel } from '@are/engine/components/locks/LockPanel';
import { useEffect, useState } from 'react';
import { MechanismPage } from '../harness/MechanismPage';
import type { LabRouteProps } from '../model';
import { labStyles } from '../styles';
import { LOCK_PRESETS } from './lockPresets';

const styles = stylex.create({
  stage: {
    width: 'min(1040px, calc(100% - 24px))',
    alignContent: 'start',
    gap: 16,
  },
  archiveIntro: {
    display: 'grid',
    gridTemplateColumns: { default: 'minmax(0, 1fr) minmax(240px, .7fr)', '@media (max-width: 680px)': '1fr' },
    gap: 16,
    padding: { default: '15px 17px', '@media (max-width: 560px)': 13 },
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--are-accent) 18%, transparent)',
    borderRadius: 15,
    backgroundColor: 'color-mix(in srgb, var(--are-surface) 88%, transparent)',
  },
  archiveKicker: {
    margin: '0 0 5px',
    color: 'var(--are-accent)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  archiveTitle: {
    margin: 0,
    color: 'var(--are-text)',
    fontSize: 'clamp(20px, 3vw, 30px)',
    lineHeight: 1.04,
    letterSpacing: '-0.035em',
  },
  archiveText: {
    alignSelf: 'end',
    margin: 0,
    color: 'var(--are-muted)',
    fontSize: 13,
    lineHeight: 1.55,
  },
  index: {
    position: 'sticky',
    top: 84,
    zIndex: 5,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 148px), 1fr))',
    gap: 7,
    marginBottom: 2,
    padding: 9,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--are-accent) 18%, transparent)',
    borderRadius: 14,
    backgroundColor: 'color-mix(in srgb, var(--are-bg) 90%, transparent)',
    backdropFilter: 'blur(16px)',
    boxShadow: '0 14px 34px rgba(0,0,0,.18)',
  },
  indexLink: {
    minWidth: 0,
    minHeight: 44,
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr)',
    alignItems: 'center',
    gap: 8,
    padding: '6px 8px',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderRadius: 10,
    color: 'var(--are-muted)',
    backgroundColor: 'color-mix(in srgb, var(--are-surface-raised) 82%, transparent)',
    textDecoration: 'none',
    ':hover': {
      color: 'var(--are-text)',
      borderColor: 'color-mix(in srgb, var(--are-accent) 32%, transparent)',
      backgroundColor: 'var(--are-accent-soft)',
    },
    ':focus-visible': { outlineWidth: 3, outlineStyle: 'solid', outlineColor: 'var(--are-accent)', outlineOffset: 2 },
  },
  indexNumber: {
    display: 'grid',
    placeItems: 'center',
    width: 24,
    height: 24,
    borderRadius: 7,
    color: 'var(--are-accent)',
    backgroundColor: 'color-mix(in srgb, var(--are-accent) 12%, transparent)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 10,
    fontWeight: 900,
  },
  indexCopy: {
    display: 'grid',
    minWidth: 0,
    gap: 2,
  },
  indexLabel: {
    overflow: 'hidden',
    color: 'var(--are-text)',
    fontSize: 11,
    fontWeight: 800,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  indexStatus: {
    color: 'var(--are-muted)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  indexStatusSolved: { color: 'var(--are-success)' },
  list: { display: 'grid', gap: 18 },
  example: {
    position: 'relative',
    scrollMarginTop: 138,
    display: 'grid',
    gap: 16,
    padding: { default: 20, '@media (max-width: 560px)': 13 },
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--are-accent) 20%, transparent)',
    borderRadius: 19,
    backgroundColor: 'color-mix(in srgb, var(--are-surface) 86%, transparent)',
    backgroundImage: 'linear-gradient(135deg, color-mix(in srgb, var(--are-accent) 5%, transparent), transparent 44%)',
    boxShadow: '0 18px 44px rgba(0,0,0,.16)',
  },
  exampleSolved: {
    borderColor: 'color-mix(in srgb, var(--are-success) 46%, transparent)',
  },
  exampleHeader: {
    display: 'grid',
    gridTemplateColumns: 'auto auto minmax(0, 1fr) auto',
    gap: 12,
    alignItems: 'start',
    '@media (max-width: 680px)': {
      gridTemplateColumns: 'auto auto minmax(0, 1fr)',
    },
  },
  number: {
    display: 'grid',
    placeItems: 'center',
    width: 34,
    height: 34,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--are-accent) 32%, transparent)',
    borderRadius: 9,
    color: 'var(--are-accent)',
    backgroundColor: 'var(--are-accent-soft)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 11,
    fontWeight: 900,
  },
  icon: {
    display: 'grid',
    placeItems: 'center',
    width: 42,
    height: 42,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--are-accent) 18%, transparent)',
    borderRadius: 12,
    backgroundColor: 'var(--are-accent-soft)',
    fontSize: 21,
  },
  exampleCopy: {
    display: 'grid',
    minWidth: 0,
    gap: 4,
  },
  title: { margin: 0, color: 'var(--are-text)', fontSize: 'clamp(20px, 3vw, 27px)', lineHeight: 1.06, letterSpacing: '-0.025em' },
  artifact: { margin: 0, color: 'var(--are-accent)', fontSize: 12, fontWeight: 850, letterSpacing: 0.6, textTransform: 'uppercase' },
  description: { margin: 0, color: 'var(--are-muted)', fontSize: 14, lineHeight: 1.55 },
  sourceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    flexWrap: 'wrap',
    marginTop: 1,
  },
  sourceBadge: {
    paddingBlock: 4,
    paddingInline: 7,
    borderRadius: 99,
    color: 'var(--are-accent)',
    backgroundColor: 'color-mix(in srgb, var(--are-accent) 10%, transparent)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  sourceKind: {
    color: 'var(--are-muted)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  state: {
    alignSelf: 'start',
    paddingBlock: 5,
    paddingInline: 8,
    borderRadius: 99,
    color: 'var(--are-muted)',
    backgroundColor: 'color-mix(in srgb, var(--are-bg) 74%, transparent)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    '@media (max-width: 680px)': {
      gridColumn: '3',
      justifySelf: 'start',
      marginTop: 1,
    },
  },
  stateSolved: {
    color: 'var(--are-success)',
    backgroundColor: 'color-mix(in srgb, var(--are-success) 12%, transparent)',
  },
  operation: {
    display: 'grid',
    gridTemplateColumns: { default: 'minmax(0, 1fr) minmax(220px, .7fr)', '@media (max-width: 680px)': '1fr' },
    gap: 10,
  },
  note: {
    display: 'grid',
    gap: 4,
    padding: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--are-accent) 12%, transparent)',
    borderRadius: 12,
    color: 'var(--are-text)',
    backgroundColor: 'color-mix(in srgb, var(--are-surface-raised) 78%, transparent)',
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
  noteText: {
    margin: 0,
  },
});

export function LocksRoute({ entry, theme, reducedMotion, resetVersion, session, snapshot }: LabRouteProps) {
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
          <div {...stylex.props(styles.archiveIntro)}>
            <div>
              <p {...stylex.props(styles.archiveKicker)}>Crack &amp; Reveal · arquivo de testes</p>
              <h2 {...stylex.props(styles.archiveTitle)}>14 mecanismos, 14 blocos operacionais.</h2>
            </div>
            <p {...stylex.props(styles.archiveText)}>Cada puzzle conserva sua origem, instrução, solução e console no mesmo bloco. Use o índice para comparar padrões sem perder o contexto do artefato.</p>
          </div>
          <nav {...stylex.props(styles.index)} aria-label="Índice dos 14 cadeados">
            {LOCK_PRESETS.map((preset, index) => (
              <a {...stylex.props(styles.indexLink)} key={preset.definition.id} href={`#lock-${preset.definition.id}`}>
                <span {...stylex.props(styles.indexNumber)}>{String(index + 1).padStart(2, '0')}</span>
                <span {...stylex.props(styles.indexCopy)}>
                  <span {...stylex.props(styles.indexLabel)}>{preset.icon} {preset.label}</span>
                  <small {...stylex.props(styles.indexStatus, solved.has(preset.definition.id) ? styles.indexStatusSolved : undefined)}>{solved.has(preset.definition.id) ? 'solved' : 'pending'}</small>
                </span>
              </a>
            ))}
          </nav>

          <div {...stylex.props(styles.list)}>
            {LOCK_PRESETS.map((preset, index) => (
              <section
                {...stylex.props(styles.example, solved.has(preset.definition.id) ? styles.exampleSolved : undefined)}
                id={`lock-${preset.definition.id}`}
                key={preset.definition.id}
                data-puzzle-block="true"
                data-status={solved.has(preset.definition.id) ? 'solved' : 'pending'}
                aria-labelledby={`lock-title-${preset.definition.id}`}
              >
                <header {...stylex.props(styles.exampleHeader)}>
                  <span {...stylex.props(styles.number)}>{String(index + 1).padStart(2, '0')}</span>
                  <span {...stylex.props(styles.icon)} aria-hidden="true">{preset.icon}</span>
                  <div {...stylex.props(styles.exampleCopy)}>
                    <p {...stylex.props(styles.artifact)}>Cadeado {String(index + 1).padStart(2, '0')} · {preset.artifact}</p>
                    <h2 {...stylex.props(styles.title)} id={`lock-title-${preset.definition.id}`}>{preset.label}</h2>
                    <div {...stylex.props(styles.sourceRow)}>
                      <span {...stylex.props(styles.sourceBadge)}>Crack &amp; Reveal</span>
                      <span {...stylex.props(styles.sourceKind)}>{preset.definition.kind}</span>
                    </div>
                    <p {...stylex.props(styles.description)}>{preset.description}</p>
                  </div>
                  <span {...stylex.props(styles.state, solved.has(preset.definition.id) ? styles.stateSolved : undefined)}>{solved.has(preset.definition.id) ? 'solved' : 'pending'}</span>
                </header>

                <div {...stylex.props(styles.operation)}>
                  <div {...stylex.props(styles.note)}><span {...stylex.props(styles.noteLabel)}>Como testar</span><p {...stylex.props(styles.noteText)}>{preset.instruction}</p></div>
                  <div {...stylex.props(styles.note)}><span {...stylex.props(styles.noteLabel)}>Solução de teste</span><p {...stylex.props(styles.noteText)}>{preset.solutionLabel}</p></div>
                </div>

                <LockPanel
                  definition={preset.definition}
                  theme={theme}
                  title={`${preset.label} · console operacional`}
                  resetKey={resetVersion}
                  reducedMotion={reducedMotion}
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
