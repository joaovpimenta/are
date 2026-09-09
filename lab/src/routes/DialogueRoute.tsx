import * as stylex from '@stylexjs/stylex';
import { DialoguePanel } from '@are/engine/components/dialogue/DialoguePanel';
import { MechanismPage } from '../harness/MechanismPage';
import type { LabRouteProps } from '../model';
import { labStyles } from '../styles';

const lines = [
  { id: 'line-1', speaker: 'Operadora', text: 'A estação responde apenas a quem observa antes de tocar.' },
  { id: 'line-2', speaker: 'Operadora', text: 'Sintonize a banda do rolo e mantenha os eixos norte e sul energizados.' },
] as const;

export function DialogueRoute({ entry, theme, resetVersion, session, snapshot }: LabRouteProps) {
  const status = snapshot.mechanismResults.dialogue ?? 'pending';
  return (
    <MechanismPage
      entry={entry}
      status={status}
      visual={<div {...stylex.props(labStyles.domStage)}><DialoguePanel key={resetVersion} lines={lines} theme={theme} onComplete={() => session.send({ type: 'MECHANISM_SOLVED', mechanismId: 'dialogue' })} /></div>}
      telemetry={<span>transmissão={status}</span>}
    />
  );
}
