import * as stylex from '@stylexjs/stylex';
import { RevealClue } from '@are/engine/components/reveal/RevealClue';
import { MechanismPage } from '../harness/MechanismPage';
import type { LabRouteProps } from '../model';
import { labStyles } from '../styles';

export function RevealRoute({ entry, theme, resetVersion, session, snapshot }: LabRouteProps) {
  const status = snapshot.mechanismResults.reveal ?? 'pending';
  return (
    <MechanismPage
      entry={entry}
      status={status}
      visual={<div {...stylex.props(labStyles.domStage)}><RevealClue resetKey={resetVersion} title="Arquivo ECHO 07" teaser="A telemetria está coberta por uma camada de ruído magnético." content="FREQUÊNCIA 73 · ROTORES 731 · ENERGIA N/S" theme={theme} onReveal={() => session.send({ type: 'MECHANISM_SOLVED', mechanismId: 'reveal' })} /></div>}
      telemetry={<span>arquivo={status}</span>}
    />
  );
}
