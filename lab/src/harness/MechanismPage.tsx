import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import type { LabEntry } from '../model';
import { labStyles } from '../styles';

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
        </div>
        <span {...stylex.props(labStyles.statusBadge)} data-status={status}>{status}</span>
      </header>

      <div {...stylex.props(labStyles.stage)}>{visual}</div>

      <section {...stylex.props(labStyles.instructionPanel)}>
        <div>
          <p {...stylex.props(labStyles.sectionLabel)}>Operação</p>
          <p {...stylex.props(labStyles.instruction)}>{entry.instruction}</p>
        </div>
        {controls ? <div {...stylex.props(labStyles.controls)}>{controls}</div> : null}
      </section>

      <div {...stylex.props(labStyles.detailGrid)}>
        <section {...stylex.props(labStyles.detailPanel)}>
          <p {...stylex.props(labStyles.sectionLabel)}>Solução de teste</p>
          <p {...stylex.props(labStyles.solution)}>{entry.solution}</p>
          {telemetry ? <div {...stylex.props(labStyles.telemetry)}>{telemetry}</div> : null}
        </section>
        <section {...stylex.props(labStyles.detailPanel)}>
          <p {...stylex.props(labStyles.sectionLabel)}>Hint ladder</p>
          <ol {...stylex.props(labStyles.hints)}>
            {entry.hints.map((hint, index) => <li key={hint}><strong>{index + 1}</strong> {hint}</li>)}
          </ol>
        </section>
      </div>
      <p {...stylex.props(labStyles.accessibility)}><strong>Acessibilidade:</strong> {entry.accessibility}</p>
    </article>
  );
}

