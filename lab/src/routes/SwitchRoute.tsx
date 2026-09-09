import * as stylex from '@stylexjs/stylex';
import { SwitchGroup } from '@are/engine/components/switches/SwitchGroup';
import { MechanismPage } from '../harness/MechanismPage';
import type { LabRouteProps } from '../model';
import { labStyles } from '../styles';

const solution = [true, false, true, false] as const;

export function SwitchRoute({ entry, theme, resetVersion, session, snapshot }: LabRouteProps) {
  const status = snapshot.mechanismResults.switches ?? 'pending';
  return (
    <MechanismPage
      entry={entry}
      status={status}
      visual={<div {...stylex.props(labStyles.domStage)}><SwitchGroup resetKey={resetVersion} labels={['NORTE', 'LESTE', 'SUL', 'OESTE']} solution={solution} theme={theme} onChange={() => session.send({ type: 'MECHANISM_ACTIVE', mechanismId: 'switches' })} onSolved={() => session.send({ type: 'MECHANISM_SOLVED', mechanismId: 'switches' })} /></div>}
      telemetry={<span>target=1,0,1,0 · status={status}</span>}
    />
  );
}
