import * as stylex from '@stylexjs/stylex';
import { FeedbackPanel } from '@are/engine/components/feedback/FeedbackPanel';
import { MechanismPage } from '../harness/MechanismPage';
import type { LabRouteProps } from '../model';
import { labStyles } from '../styles';

export function FeedbackRoute({ entry, theme, session, snapshot }: LabRouteProps) {
  const errors = Object.values(snapshot.mechanismResults).filter((status) => status === 'error').length;
  const status = snapshot.completed ? 'success' : errors > 0 ? 'error' : 'idle';
  return (
    <MechanismPage
      entry={entry}
      status={snapshot.completed ? 'solved' : 'pending'}
      visual={<div {...stylex.props(labStyles.domStage)}><FeedbackPanel status={status} theme={theme} title={snapshot.completed ? 'Estação sincronizada' : undefined} message={snapshot.completed ? 'Todos os mecanismos obrigatórios confirmaram a abertura do arquivo central.' : undefined} onReset={() => session.reset()} /></div>}
      telemetry={<span>completed={String(snapshot.completed)} · errors={errors}</span>}
    />
  );
}
