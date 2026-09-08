import { Canvas } from '@react-three/fiber';
import * as stylex from '@stylexjs/stylex';
import { useMachine } from '@xstate/react';
import {
  Dial3D,
  Keypad3D,
  amberTheme,
  createKeypadMachine,
  defaultTheme,
  useGameStore,
} from '@are/engine';
import { Suspense, useEffect, useMemo, useState } from 'react';

const styles = stylex.create({
  page: {
    minHeight: '100vh',
    backgroundColor: 'var(--are-bg)',
    color: 'var(--are-text)',
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    transition: 'background-color 280ms ease, color 280ms ease',
  },
  shell: {
    width: 'min(1220px, calc(100% - 32px))',
    marginInline: 'auto',
    paddingBlock: 28,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 20,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  eyebrow: {
    margin: 0,
    color: 'var(--are-accent)',
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    margin: '6px 0 8px',
    fontSize: 'clamp(32px, 6vw, 64px)',
    lineHeight: 0.96,
    letterSpacing: -2,
  },
  subtitle: {
    maxWidth: 700,
    margin: 0,
    color: 'var(--are-muted)',
    lineHeight: 1.6,
  },
  toolbar: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
  },
  button: {
    border: '1px solid color-mix(in srgb, var(--are-accent) 34%, transparent)',
    borderRadius: 12,
    padding: '10px 14px',
    color: 'var(--are-text)',
    backgroundColor: 'var(--are-surface-raised)',
    cursor: 'pointer',
    fontWeight: 750,
    transition: 'transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease',
    ':hover': {
      transform: 'translateY(-1px)',
      borderColor: 'var(--are-accent)',
      boxShadow: '0 0 22px color-mix(in srgb, var(--are-accent) 18%, transparent)',
    },
    ':active': { transform: 'translateY(1px) scale(.985)' },
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
    gap: 18,
  },
  card: {
    overflow: 'hidden',
    border: '1px solid color-mix(in srgb, var(--are-accent) 16%, #ffffff12)',
    borderRadius: 22,
    backgroundColor: 'var(--are-surface)',
    boxShadow: '0 18px 70px rgba(0,0,0,.28)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '18px 20px 0',
  },
  cardTitle: { margin: 0, fontSize: 18 },
  badge: {
    borderRadius: 999,
    padding: '6px 9px',
    color: 'var(--are-accent)',
    backgroundColor: 'var(--are-accent-soft)',
    fontFamily: 'ui-monospace, monospace',
    fontSize: 11,
    fontWeight: 800,
    textTransform: 'uppercase',
  },
  canvas: {
    height: 430,
    marginTop: 10,
    backgroundImage: 'radial-gradient(circle at 50% 44%, color-mix(in srgb, var(--are-accent) 11%, transparent), transparent 45%)',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '0 20px 18px',
    color: 'var(--are-muted)',
    fontSize: 13,
  },
  status: {
    color: 'var(--are-text)',
    fontFamily: 'ui-monospace, monospace',
    fontWeight: 700,
  },
  statePanel: {
    marginTop: 18,
    padding: 18,
    borderRadius: 18,
    backgroundColor: 'var(--are-surface)',
    border: '1px solid rgba(255,255,255,.08)',
  },
  stateTitle: { margin: '0 0 10px', fontSize: 14 },
  stateLine: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    color: 'var(--are-muted)',
    fontFamily: 'ui-monospace, monospace',
    fontSize: 12,
  },
});

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 6, 6]} intensity={2.1} castShadow />
      <directionalLight position={[-5, 1, 3]} intensity={0.8} />
    </>
  );
}

export function App() {
  const [themeName, setThemeName] = useState<'cyan' | 'amber'>('cyan');
  const theme = themeName === 'cyan' ? defaultTheme : amberTheme;
  const machine = useMemo(() => createKeypadMachine('1984'), []);
  const [keypad, send] = useMachine(machine);
  const [dialValue, setDialValue] = useState(2);
  const flags = useGameStore((state) => state.flags);
  const setFlag = useGameStore((state) => state.setFlag);
  const resetStore = useGameStore((state) => state.reset);
  const keypadStatus = keypad.value as 'idle' | 'typing' | 'error' | 'solved';

  useEffect(() => {
    if (keypadStatus === 'solved') setFlag('keypadSolved');
  }, [keypadStatus, setFlag]);

  useEffect(() => {
    setFlag('dialSolved', dialValue === 7);
  }, [dialValue, setFlag]);

  const cssVars = {
    '--are-bg': theme.background,
    '--are-surface': theme.surface,
    '--are-surface-raised': theme.surfaceRaised,
    '--are-text': theme.text,
    '--are-muted': theme.muted,
    '--are-accent': theme.accent,
    '--are-accent-soft': theme.accentSoft,
  } as React.CSSProperties;

  const reset = () => {
    send({ type: 'RESET' });
    setDialValue(2);
    resetStore();
  };

  return (
    <main {...stylex.props(styles.page)} style={cssVars}>
      <div {...stylex.props(styles.shell)}>
        <header {...stylex.props(styles.header)}>
          <div>
            <p {...stylex.props(styles.eyebrow)}>ARE / Component Lab</p>
            <h1 {...stylex.props(styles.title)}>Puzzle hardware,<br />rendered in 3D.</h1>
            <p {...stylex.props(styles.subtitle)}>
              Primeiro vertical slice do engine: componentes reutilizáveis em Three.js/R3F, composição React, UI em StyleX, máquina de comportamento XState e estado compartilhado em Zustand.
            </p>
          </div>
          <div {...stylex.props(styles.toolbar)}>
            <button {...stylex.props(styles.button)} type="button" onClick={() => setThemeName((value) => value === 'cyan' ? 'amber' : 'cyan')}>
              Tema: {themeName === 'cyan' ? 'Cyan' : 'Amber'}
            </button>
            <button {...stylex.props(styles.button)} type="button" onClick={reset}>Reset</button>
          </div>
        </header>

        <section {...stylex.props(styles.grid)} aria-label="Componentes 3D">
          <article {...stylex.props(styles.card)}>
            <div {...stylex.props(styles.cardHeader)}>
              <h2 {...stylex.props(styles.cardTitle)}>Keypad</h2>
              <span {...stylex.props(styles.badge)}>{keypadStatus}</span>
            </div>
            <div {...stylex.props(styles.canvas)}>
              <Canvas shadows camera={{ position: [0, 0.25, 7.5], fov: 38 }} dpr={1}>
                <Suspense fallback={null}>
                  <SceneLighting />
                  <Keypad3D
                    value={keypad.context.value}
                    status={keypadStatus}
                    theme={theme}
                    onDigit={(digit) => send({ type: 'PRESS', digit })}
                    onClear={() => send({ type: 'CLEAR' })}
                    onSubmit={() => send({ type: 'SUBMIT' })}
                  />
                </Suspense>
              </Canvas>
            </div>
            <div {...stylex.props(styles.footer)}>
              <span>Código de teste: <strong>1984</strong></span>
              <span {...stylex.props(styles.status)}>{keypad.context.value || '----'}</span>
            </div>
          </article>

          <article {...stylex.props(styles.card)}>
            <div {...stylex.props(styles.cardHeader)}>
              <h2 {...stylex.props(styles.cardTitle)}>Dial</h2>
              <span {...stylex.props(styles.badge)}>{dialValue === 7 ? 'solved' : 'active'}</span>
            </div>
            <div {...stylex.props(styles.canvas)}>
              <Canvas shadows camera={{ position: [0, 0.1, 7.6], fov: 38 }} dpr={1}>
                <Suspense fallback={null}>
                  <SceneLighting />
                  <Dial3D value={dialValue} target={7} theme={theme} onChange={setDialValue} />
                </Suspense>
              </Canvas>
            </div>
            <div {...stylex.props(styles.footer)}>
              <span>Clique nos lados ou use o scroll. Alvo: <strong>07</strong></span>
              <span {...stylex.props(styles.status)}>{String(dialValue).padStart(2, '0')}</span>
            </div>
          </article>
        </section>

        <aside {...stylex.props(styles.statePanel)}>
          <h2 {...stylex.props(styles.stateTitle)}>Shared game state / Zustand</h2>
          <div {...stylex.props(styles.stateLine)}>
            <span>keypadSolved={String(Boolean(flags.keypadSolved))}</span>
            <span>dialSolved={String(Boolean(flags.dialSolved))}</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
