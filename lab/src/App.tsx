import { Canvas } from '@react-three/fiber';
import * as stylex from '@stylexjs/stylex';
import { useMachine } from '@xstate/react';
import {
  Dial3D,
  DialoguePanel,
  FeedbackPanel,
  InventoryPanel,
  Keypad3D,
  RevealClue,
  SequenceInput,
  SwitchGroup,
  amberTheme,
  createKeypadMachine,
  defaultTheme,
  useGameStore,
} from '@are/engine';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { dialStyles, labStyles, objectStyles } from './styles';

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
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(null);
  const [sequenceSolved, setSequenceSolved] = useState(false);
  const [switchesSolved, setSwitchesSolved] = useState(false);
  const [dialogueCompleted, setDialogueCompleted] = useState(false);
  const [clueRevealed, setClueRevealed] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [resetVersion, setResetVersion] = useState(0);
  const flags = useGameStore((state) => state.flags);
  const inventory = useGameStore((state) => state.inventory);
  const addItem = useGameStore((state) => state.addItem);
  const setFlag = useGameStore((state) => state.setFlag);
  const resetStore = useGameStore((state) => state.reset);
  const keypadStatus = keypad.value as 'idle' | 'typing' | 'error' | 'solved';
  const inventoryItems = useMemo(() => [
    { id: 'brass-key', label: 'Chave de latão', description: 'Pequena e pesada.', symbol: '⌁', collected: inventory.includes('brass-key') },
    { id: 'film-reel', label: 'Rolo de filme', description: 'Tem uma etiqueta: 07.', symbol: '◉', collected: inventory.includes('film-reel') },
    { id: 'blueprint', label: 'Planta dobrada', description: 'Mostra quatro símbolos.', symbol: '▧', collected: inventory.includes('blueprint') },
  ], [inventory]);
  const dialogueLines = useMemo(() => [
    { id: 'line-1', speaker: 'Operadora', text: 'A sala responde apenas a quem observa antes de tocar.' },
    { id: 'line-2', speaker: 'Operadora', text: 'Procure a sequência escondida e não descarte os objetos encontrados.' },
  ], []);
  const sequenceSymbols = useMemo(() => ['△', '◼', '○', '✦', '◇', '⬡'], []);
  const sequenceSolution = useMemo(() => [1, 4, 0, 3], []);
  const switchSolution = useMemo(() => [true, false, true, false], []);
  const allObjectsSolved = sequenceSolved && switchesSolved && dialogueCompleted && clueRevealed;

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

  useEffect(() => {
    if (allObjectsSolved) setFeedbackStatus('success');
  }, [allObjectsSolved]);

  const reset = () => {
    send({ type: 'RESET' });
    setDialValue(2);
    setSelectedInventoryId(null);
    setSequenceSolved(false);
    setSwitchesSolved(false);
    setDialogueCompleted(false);
    setClueRevealed(false);
    setFeedbackStatus('idle');
    setResetVersion((value) => value + 1);
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
              <span>Gire o aro como um relógio: arraste ou toque. Alvo: <strong>07</strong></span>
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

        <section {...stylex.props(labStyles.grid)} aria-label="Objetos de puzzle">
          <article {...stylex.props(labStyles.card)}>
            <div {...stylex.props(labStyles.cardHeader)}>
              <h2 {...stylex.props(labStyles.cardTitle)}>Inventory</h2>
              <span {...stylex.props(labStyles.badge)}>{inventory.length}/3</span>
            </div>
            <div {...stylex.props(objectStyles.body)}>
              <InventoryPanel
                items={inventoryItems}
                selectedId={selectedInventoryId}
                theme={theme}
                onSelect={(item) => {
                  setSelectedInventoryId(item.id);
                  addItem(item.id);
                }}
              />
              <p {...stylex.props(objectStyles.note)}>Toque em um objeto para guardá-lo e inspecioná-lo.</p>
            </div>
          </article>

          <article {...stylex.props(labStyles.card)}>
            <div {...stylex.props(labStyles.cardHeader)}>
              <h2 {...stylex.props(labStyles.cardTitle)}>Dialogue</h2>
              <span {...stylex.props(labStyles.badge)}>{dialogueCompleted ? 'completed' : 'active'}</span>
            </div>
            <div {...stylex.props(objectStyles.body)}>
              <DialoguePanel
                key={resetVersion}
                lines={dialogueLines}
                theme={theme}
                onComplete={() => {
                  setDialogueCompleted(true);
                  setFlag('dialogueCompleted');
                }}
              />
            </div>
          </article>

          <article {...stylex.props(labStyles.card)}>
            <div {...stylex.props(labStyles.cardHeader)}>
              <h2 {...stylex.props(labStyles.cardTitle)}>Sequence input</h2>
              <span {...stylex.props(labStyles.badge)}>{sequenceSolved ? 'solved' : 'active'}</span>
            </div>
            <div {...stylex.props(objectStyles.body)}>
              <SequenceInput
                key={resetVersion}
                symbols={sequenceSymbols}
                solution={sequenceSolution}
                theme={theme}
                onSolved={() => {
                  setSequenceSolved(true);
                  setFlag('sequenceSolved');
                }}
                onError={() => setFeedbackStatus('error')}
              />
              <p {...stylex.props(objectStyles.note)}>Reproduza a ordem descoberta na planta.</p>
            </div>
          </article>

          <article {...stylex.props(labStyles.card)}>
            <div {...stylex.props(labStyles.cardHeader)}>
              <h2 {...stylex.props(labStyles.cardTitle)}>Switch group</h2>
              <span {...stylex.props(labStyles.badge)}>{switchesSolved ? 'solved' : 'active'}</span>
            </div>
            <div {...stylex.props(objectStyles.body)}>
              <SwitchGroup
                key={resetVersion}
                labels={['NORTE', 'LESTE', 'SUL', 'OESTE']}
                solution={switchSolution}
                theme={theme}
                onSolved={() => {
                  setSwitchesSolved(true);
                  setFlag('switchesSolved');
                }}
              />
              <p {...stylex.props(objectStyles.note)}>Alinhe os interruptores com a direção indicada.</p>
            </div>
          </article>

          <article {...stylex.props(labStyles.card)}>
            <div {...stylex.props(labStyles.cardHeader)}>
              <h2 {...stylex.props(labStyles.cardTitle)}>Reveal / Clue</h2>
              <span {...stylex.props(labStyles.badge)}>{clueRevealed ? 'revealed' : 'hidden'}</span>
            </div>
            <div {...stylex.props(objectStyles.body)}>
              <RevealClue
                key={resetVersion}
                title="Arquivo 07"
                teaser="O texto está coberto por uma camada de ruído."
                content="A marca luminosa deve permanecer no topo: 07."
                theme={theme}
                onReveal={() => {
                  setClueRevealed(true);
                  setFlag('clueRevealed');
                }}
              />
            </div>
          </article>

          <article {...stylex.props(labStyles.card)}>
            <div {...stylex.props(labStyles.cardHeader)}>
              <h2 {...stylex.props(labStyles.cardTitle)}>Feedback</h2>
              <span {...stylex.props(labStyles.badge)}>{feedbackStatus}</span>
            </div>
            <div {...stylex.props(objectStyles.body)}>
              <FeedbackPanel
                status={feedbackStatus}
                theme={theme}
                title={allObjectsSolved ? 'Sala preparada' : undefined}
                message={allObjectsSolved ? 'Todos os objetos confirmaram a próxima etapa.' : undefined}
                onReset={reset}
              />
            </div>
          </article>
        </section>

        <aside {...stylex.props(labStyles.statePanel)}>
          <h2 {...stylex.props(labStyles.stateTitle)}>Shared game state / Zustand</h2>
          <div {...stylex.props(labStyles.stateLine)}>
            <span>keypadSolved={String(Boolean(flags.keypadSolved))}</span>
            <span>dialSolved={String(Boolean(flags.dialSolved))}</span>
            <span>sequenceSolved={String(Boolean(flags.sequenceSolved))}</span>
            <span>switchesSolved={String(Boolean(flags.switchesSolved))}</span>
            <span>dialogueCompleted={String(Boolean(flags.dialogueCompleted))}</span>
            <span>clueRevealed={String(Boolean(flags.clueRevealed))}</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
