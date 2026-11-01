import * as stylex from '@stylexjs/stylex';
import { DialoguePanel } from '@are/engine/components/dialogue/DialoguePanel';
import { HintLadder } from '@are/engine/components/reveal/HintLadder';
import { prefersReducedMotion } from '@are/engine/core/reducedMotion';
import { createAdventureSession } from '@are/engine/session/adventureSession';
import { useModuleSnapshot } from '@are/engine/session/react';
import type { CSSProperties } from 'react';
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { echoScenario, echoTheme, type EchoScene } from './scenario';
import { SignalArchive } from './SignalArchive';
import { echoStyles } from './styles';

const TunerScene = lazy(() => import('./TunerScene'));
const CipherScene = lazy(() => import('./CipherScene'));

const scenes = [
  { id: 'transmission', label: 'Transmissão', goal: 'Leia a mensagem da operadora. Ela contém as pistas para recuperar o arquivo.', requires: null },
  { id: 'tuner', label: 'Rádio', goal: 'Sintonize a banda indicada pela operadora para abrir o decodificador.', requires: 'dialogue' },
  { id: 'cipher', label: 'Decodificador', goal: 'Recupere o arquivo ajustando os três rotores na ordem da mensagem.', requires: 'tuner' },
  { id: 'archive', label: 'Arquivo', goal: 'Transmissão recuperada. Você concluiu a aventura.', requires: 'cipher' },
] as const;

function browserStorage() {
  try { return window.localStorage; } catch { return undefined; }
}

export function App() {
  const session = useMemo(() => {
    const storage = browserStorage();
    return createAdventureSession({
      adventureId: 'echo-station',
      requiredMechanisms: ['dialogue', 'tuner', 'cipher'],
      initialSceneId: 'transmission',
      persistence: storage ? { storage } : undefined,
    });
  }, []);
  const snapshot = useModuleSnapshot(session);
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);
  const [resetKey, setResetKey] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const resetDialog = useRef<HTMLDialogElement>(null);
  const available = (step: typeof scenes[number]) => step.requires === null || snapshot.mechanismResults[step.requires] === 'solved';
  const current = scenes.find((step) => step.id === snapshot.sceneId && available(step)) ?? scenes[0];
  const scene = current.id;
  const solvedCount = Object.values(snapshot.mechanismResults).filter((result) => result === 'solved').length;
  const tunerInput = snapshot.mechanismInputs.tuner;
  const frequency = typeof tunerInput === 'number' && Number.isInteger(tunerInput) && tunerInput >= 0 && tunerInput <= 99 ? tunerInput : 41;
  const rotorInput = snapshot.mechanismInputs.cipher;
  const rotors = Array.isArray(rotorInput) && rotorInput.length === 3 && rotorInput.every((value) => typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 9) ? rotorInput as number[] : [0, 0, 0];

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ block: 'nearest', behavior: 'auto' });
  }, [scene, resetKey]);

  const go = (next: EchoScene) => session.send({ type: 'SCENE_CHANGED', sceneId: next });
  const reset = () => {
    resetDialog.current?.close();
    session.reset();
    setResetKey((value) => value + 1);
  };
  const variables = {
    '--echo-bg': echoTheme.background, '--echo-surface': echoTheme.surface, '--echo-surface-raised': echoTheme.surfaceRaised,
    '--echo-text': echoTheme.text, '--echo-muted': echoTheme.muted, '--echo-accent': echoTheme.accent, '--echo-success': echoTheme.success,
  } as CSSProperties;

  return (
    <main {...stylex.props(echoStyles.page)} style={variables}>
      <div {...stylex.props(echoStyles.shell)}>
        <header {...stylex.props(echoStyles.header)}>
          <div {...stylex.props(echoStyles.identity)}>
            <p {...stylex.props(echoStyles.eyebrow)}>{echoScenario.location}</p>
            <h1 {...stylex.props(echoStyles.title)}>{echoScenario.title}</h1>
          </div>
          <div {...stylex.props(echoStyles.actions)}>
            <a {...stylex.props(echoStyles.button)} href="../">Galeria de aventuras</a>
            <button {...stylex.props(echoStyles.button)} type="button" onClick={() => resetDialog.current?.showModal()}>Reiniciar sinal</button>
          </div>
        </header>

        <nav aria-label="Etapas da aventura">
          <ol {...stylex.props(echoStyles.steps)}>
            {scenes.map((step, index) => <li key={step.id}>
              <button {...stylex.props(echoStyles.button, echoStyles.step, scene === step.id ? echoStyles.currentStep : undefined)} type="button" disabled={!available(step)} aria-current={scene === step.id ? 'step' : undefined} onClick={() => go(step.id)}>
                <span aria-hidden="true">{index + 1}.</span>{step.label}{!available(step) && <span aria-label="bloqueado"> · —</span>}
              </button>
            </li>)}
          </ol>
        </nav>

        <section {...stylex.props(echoStyles.frame)} aria-label="Console da Echo Station">
          <header {...stylex.props(echoStyles.sceneHeader)}>
            <p {...stylex.props(echoStyles.eyebrow)}>{solvedCount} de 3 enigmas resolvidos</p>
            <progress {...stylex.props(echoStyles.progress)} aria-label="Progresso da aventura" value={solvedCount} max={3} />
            <h2 {...stylex.props(echoStyles.sceneTitle)} ref={heading} tabIndex={-1}>{current.label}</h2>
            <p {...stylex.props(echoStyles.instruction)}>{current.goal}</p>
          </header>

          {scene === 'transmission' && (
            <div {...stylex.props(echoStyles.content)}>
              <div {...stylex.props(echoStyles.stage, echoStyles.narrativeStage)}>
                <DialoguePanel lines={echoScenario.dialogue} theme={echoTheme} resetKey={resetKey} onComplete={() => {
                  session.send({ type: 'MECHANISM_SOLVED', mechanismId: 'dialogue' });
                  session.send({ type: 'ARTIFACT_COLLECTED', artifactId: 'vale-recording' });
                  go('tuner');
                }} />
              </div>
              <aside {...stylex.props(echoStyles.panel)}>
                <p {...stylex.props(echoStyles.eyebrow)}>Último contato</p>
                <p {...stylex.props(echoStyles.instruction)}>Avance no seu ritmo. Depois de ler, a mensagem ficará no registro de pistas para consulta.</p>
                <p {...stylex.props(echoStyles.status)}>Origem: Operadora Vale · 2 fragmentos</p>
              </aside>
            </div>
          )}
          {scene === 'tuner' && <Suspense fallback={<p {...stylex.props(echoStyles.narrativeStage)} role="status">Inicializando rádio…</p>}>
            <TunerScene reducedMotion={reducedMotion} frequency={frequency} solved={snapshot.mechanismResults.tuner === 'solved'} onChange={(value) => {
              session.send({ type: 'MECHANISM_INPUT_CHANGED', mechanismId: 'tuner', value });
              session.send({ type: value === echoScenario.targetBand ? 'MECHANISM_SOLVED' : 'MECHANISM_ACTIVE', mechanismId: 'tuner' });
            }} onComplete={() => go('cipher')} />
          </Suspense>}
          {scene === 'cipher' && <Suspense fallback={<p {...stylex.props(echoStyles.narrativeStage)} role="status">Inicializando decodificador…</p>}>
            <CipherScene values={rotors} solved={snapshot.mechanismResults.cipher === 'solved'} onChange={(values, solved) => {
              session.send({ type: 'MECHANISM_INPUT_CHANGED', mechanismId: 'cipher', value: values });
              session.send({ type: solved ? 'MECHANISM_SOLVED' : 'MECHANISM_ACTIVE', mechanismId: 'cipher' });
            }} onComplete={() => go('archive')} />
          </Suspense>}
          {scene === 'archive' && <div {...stylex.props(echoStyles.narrativeStage)}>
            <SignalArchive />
            <div {...stylex.props(echoStyles.actions)}>
              <a {...stylex.props(echoStyles.button)} href="../">Voltar à galeria</a>
              <button {...stylex.props(echoStyles.button)} type="button" onClick={() => resetDialog.current?.showModal()}>Jogar novamente</button>
              <a {...stylex.props(echoStyles.button)} href="../lab/">Explorar componentes</a>
            </div>
          </div>}
        </section>

        {snapshot.inventory.includes('vale-recording') && <section {...stylex.props(echoStyles.journal)} aria-label="Registro de pistas">
          <h2 {...stylex.props(echoStyles.sceneTitle)}>Registro de pistas</h2>
          <details>
            <summary {...stylex.props(echoStyles.summary)}>Consultar transmissão da Operadora Vale</summary>
            {echoScenario.dialogue.map((line) => <p {...stylex.props(echoStyles.journalText)} key={line.id}>{line.text}</p>)}
          </details>
        </section>}
        {(scene === 'tuner' || scene === 'cipher') && <div {...stylex.props(echoStyles.journal)}>
          <HintLadder theme={echoTheme} resetKey={resetKey + ':' + scene} hints={scene === 'tuner'
            ? ['A operadora informou uma banda na primeira mensagem.', 'Consulte a transmissão no registro de pistas.', 'A banda foi dita por extenso: setenta e três.']
            : ['Os três ecos estão na segunda mensagem da operadora.', 'Cada eco corresponde a um rotor, da esquerda para a direita.', 'Mantenha a ordem em que os números foram transmitidos.']}
            solution={scene === 'tuner' ? 'Ajuste a frequência para 73 e selecione Abrir decodificador.' : 'Ajuste os rotores para 7, 3 e 1, da esquerda para a direita. Depois selecione Restaurar arquivo.'} />
        </div>}
        <dialog {...stylex.props(echoStyles.dialog)} ref={resetDialog} aria-labelledby="reset-title" aria-describedby="reset-description">
          <h2 id="reset-title">Reiniciar a aventura?</h2>
          <p id="reset-description">Isso apaga o progresso e os ajustes salvos desta aventura neste navegador.</p>
          <div {...stylex.props(echoStyles.actions)}>
            <button {...stylex.props(echoStyles.button)} type="button" autoFocus onClick={() => resetDialog.current?.close()}>Continuar jogando</button>
            <button {...stylex.props(echoStyles.button)} type="button" onClick={reset}>Reiniciar aventura</button>
          </div>
        </dialog>
      </div>
    </main>
  );
}
