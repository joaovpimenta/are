import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { defaultTheme } from '@are/engine/theme';
import type { AreTheme } from '@are/engine/theme';
import { LAB_STORIES } from '../narrative';
import { PuzzleBrief, PuzzleGuide } from './PuzzleStory';
import type { LabEntry } from '../model';
import { labStyles } from '../styles';

type MechanismPageProps = {
  entry: LabEntry;
  status: string;
  visual: ReactNode;
  controls?: ReactNode;
  telemetry?: ReactNode;
  theme?: AreTheme;
  resetKey?: number;
};

export function MechanismPage({ entry, status, visual, controls, telemetry, theme = defaultTheme, resetKey = 0 }: MechanismPageProps) {
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

      <PuzzleBrief story={LAB_STORIES[entry.id]} />

      <div {...stylex.props(labStyles.stage)}>
        <div {...stylex.props(labStyles.stageLead)}>
          <span {...stylex.props(labStyles.stageLeadLabel)}>Live artifact viewport</span>
          <span {...stylex.props(labStyles.stageLeadRule)} aria-hidden="true" />
        </div>
        {visual}
      </div>

      <section {...stylex.props(labStyles.instructionPanel)}>
        <div {...stylex.props(labStyles.instructionCopy)}>
          <p {...stylex.props(labStyles.sectionLabel)}>Operação</p>
          <p {...stylex.props(labStyles.instruction)}>{entry.instruction}</p>
        </div>
        {controls ? <div {...stylex.props(labStyles.controls)}>{controls}</div> : null}
      </section>

      <PuzzleGuide story={LAB_STORIES[entry.id]} theme={theme} resetKey={resetKey} />
      {telemetry ? (
        <details {...stylex.props(labStyles.detailPanel)}>
          <summary>Diagnóstico técnico (Lab)</summary>
          <div {...stylex.props(labStyles.telemetry)}>{telemetry}</div>
        </details>
      ) : null}
      <p {...stylex.props(labStyles.accessibility)}><strong>Acessibilidade:</strong> {entry.accessibility}</p>
    </article>
  );
}
