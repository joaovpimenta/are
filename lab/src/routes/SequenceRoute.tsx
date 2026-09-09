import * as stylex from '@stylexjs/stylex';
import { SequenceInput } from '@are/engine/components/sequence/SequenceInput';
import { MechanismPage } from '../harness/MechanismPage';
import type { LabRouteProps } from '../model';
import { labStyles } from '../styles';

const symbols = ['△', '◼', '○', '✦', '◇', '⬡'] as const;
const solution = [1, 4, 0, 3] as const;

export function SequenceRoute({ entry, theme, resetVersion, session, snapshot }: LabRouteProps) {
  const status = snapshot.mechanismResults.sequence ?? 'pending';
  return (
    <MechanismPage
      entry={entry}
      status={status}
      visual={<div {...stylex.props(labStyles.domStage)}><SequenceInput resetKey={resetVersion} symbols={symbols} solution={solution} theme={theme} onChange={() => session.send({ type: 'MECHANISM_ACTIVE', mechanismId: 'sequence' })} onSolved={() => session.send({ type: 'MECHANISM_SOLVED', mechanismId: 'sequence' })} onError={() => session.send({ type: 'MECHANISM_ERROR', mechanismId: 'sequence' })} /></div>}
      telemetry={<span>ordem=1,4,0,3 · status={status}</span>}
    />
  );
}
