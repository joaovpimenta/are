import * as stylex from '@stylexjs/stylex';
import { DialoguePanel } from '@are/engine/components/dialogue/DialoguePanel';
import { prefersReducedMotion } from '@are/engine/core/reducedMotion';
import { createAdventureSession } from '@are/engine/session/adventureSession';
import { useModuleSnapshot } from '@are/engine/session/react';
import type { CSSProperties } from 'react';
import { lazy, Suspense, useMemo, useState } from 'react';
import { echoScenario, echoTheme, type EchoScene } from './scenario';
import { SignalArchive } from './SignalArchive';

const TunerScene = lazy(() => import('./TunerScene'));
const CipherScene = lazy(() => import('./CipherScene'));

const focusRing = {
  outlineWidth: 3,
  outlineStyle: 'solid',
  outlineColor: 'color-mix(in srgb, var(--echo-accent) 68%, transparent)',
  outlineOffset: 3,
} as const;

const styles = stylex.create({
  page: {
    minHeight: '100dvh',
    padding: {
      default: 24,
      '@media (max-width: 680px)': 12,
    },
    color: 'var(--echo-text)',
    backgroundColor: 'var(--echo-bg)',
    backgroundImage: 'radial-gradient(circle at 70% -10%, color-mix(in srgb, var(--echo-accent) 18%, transparent), transparent 38rem), linear-gradient(145deg, #05080c, #090e12 55%, #050708)',
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  },
  shell: {
    width: 'min(1120px, 100%)',
    marginInline: 'auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 18,
    paddingBlock: 8,
  },
  identity: {
    display: 'grid',
    gap: 3,
  },
  eyebrow: {
    margin: 0,
    color: 'var(--echo-accent)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  title: {
    margin: 0,
    fontSize: 'clamp(18px, 3vw, 28px)',
    letterSpacing: '-0.03em',
  },
  reset: {
    minHeight: 44,
    paddingBlock: 8,
    paddingInline: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--echo-accent) 30%, transparent)',
    borderRadius: 9,
    color: 'var(--echo-muted)',
    backgroundColor: 'var(--echo-surface)',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 800,
    ':focus-visible': focusRing,
  },
  frame: {
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--echo-accent) 22%, transparent)',
    borderRadius: {
      default: 24,
      '@media (max-width: 680px)': 16,
    },
    backgroundColor: 'color-mix(in srgb, var(--echo-surface) 92%, transparent)',
    boxShadow: '0 30px 100px rgba(0,0,0,.42)',
  },
  sceneHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    padding: {
      default: '20px 24px',
      '@media (max-width: 680px)': 15,
    },
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'color-mix(in srgb, var(--echo-accent) 14%, transparent)',
  },
  sceneLabel: {
    color: 'var(--echo-accent)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  sceneProgress: {
    color: 'var(--echo-muted)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 11,
  },
  content: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'minmax(0, 1.35fr) minmax(280px, .65fr)',
      '@media (max-width: 820px)': 'minmax(0, 1fr)',
    },
    minHeight: 520,
  },
  stage: {
    minWidth: 0,
    minHeight: {
      default: 520,
      '@media (max-width: 820px)': 360,
      '@media (max-width: 480px)': 310,
    },
    backgroundImage: 'radial-gradient(circle at 50% 45%, color-mix(in srgb, var(--echo-accent) 9%, transparent), transparent 52%)',
  },
  narrativeStage: {
    display: 'grid',
    placeItems: 'center',
    padding: {
      default: 34,
      '@media (max-width: 680px)': 16,
    },
  },
  panel: {
    display: 'grid',
    alignContent: 'center',
    gap: 18,
    padding: {
      default: 26,
      '@media (max-width: 680px)': 16,
    },
    borderLeftWidth: {
      default: 1,
      '@media (max-width: 820px)': 0,
    },
    borderLeftStyle: 'solid',
    borderLeftColor: 'color-mix(in srgb, var(--echo-accent) 14%, transparent)',
    borderTopWidth: {
      default: 0,
      '@media (max-width: 820px)': 1,
    },
    borderTopStyle: 'solid',
    borderTopColor: 'color-mix(in srgb, var(--echo-accent) 14%, transparent)',
  },
  instruction: {
    margin: 0,
    color: 'var(--echo-muted)',
    fontSize: 14,
    lineHeight: 1.6,
  },
  status: {
    margin: 0,
    color: 'var(--echo-accent)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 12,
    lineHeight: 1.5,
  },
});

function sceneNumber(scene: EchoScene): number {
  return ['transmission', 'tuner', 'cipher', 'archive'].indexOf(scene) + 1;
}

export function App() {
  const session = useMemo(() => createAdventureSession({
    adventureId: 'echo-station',
    requiredMechanisms: ['dialogue', 'tuner', 'cipher'],
    initialSceneId: 'transmission',
  }), []);
  const snapshot = useModuleSnapshot(session);
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);
  const [scene, setScene] = useState<EchoScene>('transmission');
  const [resetKey, setResetKey] = useState(0);

  const variables = {
    '--echo-bg': echoTheme.background,
    '--echo-surface': echoTheme.surface,
    '--echo-surface-raised': echoTheme.surfaceRaised,
    '--echo-text': echoTheme.text,
    '--echo-muted': echoTheme.muted,
    '--echo-accent': echoTheme.accent,
    '--echo-success': echoTheme.success,
  } as CSSProperties;

  const go = (next: EchoScene) => {
    setScene(next);
    session.send({ type: 'SCENE_CHANGED', sceneId: next });
  };

  const reset = () => {
    session.reset();
    setScene('transmission');
    setResetKey((value) => value + 1);
  };

  return (
    <main {...stylex.props(styles.page)} style={variables}>
      <div {...stylex.props(styles.shell)}>
        <header {...stylex.props(styles.header)}>
          <div {...stylex.props(styles.identity)}>
            <p {...stylex.props(styles.eyebrow)}>{echoScenario.location}</p>
            <h1 {...stylex.props(styles.title)}>{echoScenario.title}</h1>
          </div>
          <button {...stylex.props(styles.reset)} type="button" onClick={reset}>Reiniciar sinal</button>
        </header>

        <section {...stylex.props(styles.frame)} aria-label="Console da Echo Station">
          <header {...stylex.props(styles.sceneHeader)}>
            <span {...stylex.props(styles.sceneLabel)}>Protocolo {scene}</span>
            <span {...stylex.props(styles.sceneProgress)}>0{sceneNumber(scene)} / 04 · rev {snapshot.revision}</span>
          </header>

          {scene === 'transmission' && (
            <div {...stylex.props(styles.content)}>
              <div {...stylex.props(styles.stage, styles.narrativeStage)}>
                <DialoguePanel
                  lines={echoScenario.dialogue}
                  theme={echoTheme}
                  resetKey={resetKey}
                  onComplete={() => {
                    session.send({ type: 'MECHANISM_SOLVED', mechanismId: 'dialogue' });
                    go('tuner');
                  }}
                />
              </div>
              <aside {...stylex.props(styles.panel)}>
                <p {...stylex.props(styles.eyebrow)}>Incoming carrier</p>
                <p {...stylex.props(styles.instruction)}>Mantenha o canal aberto até a mensagem terminar. O registro de voz contém as duas chaves seguintes.</p>
                <p {...stylex.props(styles.status)}>SIGNAL / DEGRADED<br />SOURCE / UNKNOWN<br />BUFFER / 02 FRAGMENTS</p>
              </aside>
            </div>
          )}

          {scene === 'tuner' && (
            <Suspense fallback={<div {...stylex.props(styles.stage, styles.narrativeStage)}>Inicializando rádio…</div>}>
              <TunerScene
                reducedMotion={reducedMotion}
                onStatus={(solved) => session.send({ type: solved ? 'MECHANISM_SOLVED' : 'MECHANISM_ACTIVE', mechanismId: 'tuner' })}
                onComplete={() => go('cipher')}
              />
            </Suspense>
          )}

          {scene === 'cipher' && (
            <Suspense fallback={<div {...stylex.props(styles.stage, styles.narrativeStage)}>Inicializando decodificador…</div>}>
              <CipherScene
                onStatus={(solved) => session.send({ type: solved ? 'MECHANISM_SOLVED' : 'MECHANISM_ACTIVE', mechanismId: 'cipher' })}
                onComplete={() => go('archive')}
              />
            </Suspense>
          )}

          {scene === 'archive' && (
            <div {...stylex.props(styles.stage, styles.narrativeStage)}>
              <SignalArchive />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
