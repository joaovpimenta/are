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
import { dialStyles, labStyles } from './styles';

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

  const stepDial = (direction: number) => {
    setDialValue((value) => {
      const next = value + direction;
      if (next > 9) return 0;
      if (next < 0) return 9;
      return next;
    });
  };

  const reset = () => {
    send({ type: 'RESET' });
    setDialValue(2);
    resetStore();
  };

  return (
    <main {...stylex.props(labStyles.page)} style={cssVars}>
      <div {...stylex.props(labStyles.shell)}>
        <header {...stylex.props(labStyles.header)}>
          <div {...stylex.props(labStyles.intro)}>
            <p {...stylex.props(labStyles.eyebrow)}>ARE / Component Lab</p>
            <h1 {...stylex.props(labStyles.title)}>Puzzle hardware,<br />rendered in 3D.</h1>
            <p {...stylex.props(labStyles.subtitle)}>
              Primeiro vertical slice do engine: componentes reutilizáveis em Three.js/R3F, composição React, UI em StyleX, máquina de comportamento XState e estado compartilhado em Zustand.
            </p>
          </div>
          <div {...stylex.props(labStyles.toolbar)}>
            <button
              {...stylex.props(labStyles.interactiveButton, labStyles.button)}
              type="button"
              onClick={() => setThemeName((value) => value === 'cyan' ? 'amber' : 'cyan')}
            >
              Tema: {themeName === 'cyan' ? 'Cyan' : 'Amber'}
            </button>
            <button {...stylex.props(labStyles.interactiveButton, labStyles.button)} type="button" onClick={reset}>
              Reset
            </button>
          </div>
        </header>

        <section {...stylex.props(labStyles.grid)} aria-label="Componentes 3D">
          <article {...stylex.props(labStyles.card)}>
            <div {...stylex.props(labStyles.cardHeader)}>
              <h2 {...stylex.props(labStyles.cardTitle)}>Keypad</h2>
              <span {...stylex.props(labStyles.badge)}>{keypadStatus}</span>
            </div>
            <div {...stylex.props(labStyles.canvas)}>
              <Canvas shadows camera={{ position: [0, 0.25, 7.5], fov: 38 }} dpr={[1, 1.5]}>
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
            <div {...stylex.props(labStyles.cardFooter)}>
              <span>Código de teste: <strong>1984</strong></span>
              <span {...stylex.props(labStyles.status)}>{keypad.context.value || '----'}</span>
            </div>
          </article>

          <article {...stylex.props(labStyles.card)}>
            <div {...stylex.props(labStyles.cardHeader)}>
              <h2 {...stylex.props(labStyles.cardTitle)}>Dial</h2>
              <span {...stylex.props(labStyles.badge)}>{dialValue === 7 ? 'solved' : 'active'}</span>
            </div>
            <div {...stylex.props(labStyles.canvas)}>
              <Canvas shadows camera={{ position: [0, 0.1, 7.6], fov: 38 }} dpr={[1, 1.5]}>
                <Suspense fallback={null}>
                  <SceneLighting />
                  <Dial3D value={dialValue} target={7} theme={theme} onChange={setDialValue} />
                </Suspense>
              </Canvas>
            </div>
            <div {...stylex.props(labStyles.cardFooter, dialStyles.footer)}>
              <span>Gire o aro com arraste ou toque. Alvo: <strong>07</strong></span>
              <div {...stylex.props(dialStyles.controls)} aria-label="Controles do dial">
                <button
                  {...stylex.props(labStyles.interactiveButton, dialStyles.stepButton)}
                  type="button"
                  aria-label="Diminuir dial"
                  onClick={() => stepDial(-1)}
                >
                  −
                </button>
                <output {...stylex.props(labStyles.status)} aria-live="polite">
                  {String(dialValue).padStart(2, '0')}
                </output>
                <button
                  {...stylex.props(labStyles.interactiveButton, dialStyles.stepButton)}
                  type="button"
                  aria-label="Aumentar dial"
                  onClick={() => stepDial(1)}
                >
                  +
                </button>
              </div>
            </div>
          </article>
        </section>

        <aside {...stylex.props(labStyles.statePanel)}>
          <h2 {...stylex.props(labStyles.stateTitle)}>Shared game state / Zustand</h2>
          <div {...stylex.props(labStyles.stateLine)}>
            <span>keypadSolved={String(Boolean(flags.keypadSolved))}</span>
            <span>dialSolved={String(Boolean(flags.dialSolved))}</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
