import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import type { LabEntry } from '../model';
import { labStyles } from '../styles';
import { HintLadder } from '../../../engine/src/components/reveal/HintLadder';

type MechanismPageProps = {
  entry: LabEntry;
  status: string;
  visual: ReactNode;
  controls?: ReactNode;
  telemetry?: ReactNode;
};

export function MechanismPage({ entry, status, visual, controls, telemetry }: MechanismPageProps) {
  return (
    <article {...stylex.props(labStyles.workbench)} aria-labelledby={'title-' + entry.id}>
      <header {...stylex.props(labStyles.workbenchHeader)}>
        <div>
          <p {...stylex.props(labStyles.kicker)}>{entry.artifact} · {entry.family}</p>
          <h1 id={'title-' + entry.id} {...stylex.props(labStyles.workbenchTitle)}>{entry.title}</h1>
          <p {...stylex.props(labStyles.description)}>{entry.description}</p>
          <div {...stylex.props(labStyles.workbenchHeaderMeta)}>
            <span {...stylex.props(labStyles.workbenchMeta)}>interação diegética</span>
            <span {...stylex.props(labStyles.workbenchMeta)}>fallback acessível</span>
          </div>
        </div>
        <span {...stylex.props(
          labStyles.statusBadge,
          status === 'solved' ? labStyles.statusBadgeSolved : status === 'error' ? labStyles.statusBadgeError : undefined,
        )} data-status={status}>{status}</span>
      </header>

      <section {...stylex.props(labStyles.instructionPanel)}>
        <div {...stylex.props(labStyles.instructionCopy)}>
          <p {...stylex.props(labStyles.sectionLabel)}>Operação</p>
          <p {...stylex.props(labStyles.instruction)}>{entry.instruction}</p>
        </div>
        {controls ? <div {...stylex.props(labStyles.controls)}>{controls}</div> : null}
      </section>

      <div {...stylex.props(labStyles.stage)}>
        <div {...stylex.props(labStyles.stageLead)}>
          <span {...stylex.props(labStyles.stageLeadLabel)}>Objeto interativo · toque ou clique</span>
          <span {...stylex.props(labStyles.stageLeadRule)} aria-hidden="true" />
        </div>
        {visual}
      </div>
      <div {...stylex.props(labStyles.detailPanel)}><HintLadder hints={entry.hints} solution={entry.solution} resetKey={entry.id} />
        {telemetry ? <div {...stylex.props(labStyles.telemetry)}>{telemetry}</div> : null}
      </div>
      <p {...stylex.props(labStyles.accessibility)}><strong>Acessibilidade:</strong> {entry.accessibility}</p>
    </article>
  );
}
