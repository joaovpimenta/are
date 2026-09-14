import * as stylex from '@stylexjs/stylex';
import type { AdventureSessionSnapshot } from '@are/engine/session/adventureSession';
import { LAB_ENTRIES, type LabRouteId, labRouteHref } from '../model';
import { labStyles } from '../styles';

export function Overview({
  snapshot,
  onNavigate,
}: {
  snapshot: AdventureSessionSnapshot;
  onNavigate: (route: LabRouteId, href: string) => void;
}) {
  const solvedCount = LAB_ENTRIES.filter((entry) => entry.id === 'feedback'
    ? snapshot.completed
    : snapshot.mechanismResults[entry.id] === 'solved').length;

  return (
    <section aria-labelledby="lab-overview-title">
      <header {...stylex.props(labStyles.overviewHeader)}>
        <div {...stylex.props(labStyles.overviewCopy)}>
          <p {...stylex.props(labStyles.kicker)}>Registro de hardware diegético</p>
          <h1 id="lab-overview-title" {...stylex.props(labStyles.overviewTitle)}>Escolha um mecanismo e teste a jornada completa.</h1>
          <div {...stylex.props(labStyles.overviewStats)}>
            <div {...stylex.props(labStyles.overviewStat)}>
              <strong {...stylex.props(labStyles.overviewStatValue)}>{solvedCount}/{LAB_ENTRIES.length}</strong>
              <span {...stylex.props(labStyles.overviewStatLabel)}>rotas confirmadas</span>
            </div>
            <div {...stylex.props(labStyles.overviewStat)}>
              <strong {...stylex.props(labStyles.overviewStatValue)}>{LAB_ENTRIES.length}</strong>
              <span {...stylex.props(labStyles.overviewStatLabel)}>módulos testáveis</span>
            </div>
            <div {...stylex.props(labStyles.overviewStat)}>
              <strong {...stylex.props(labStyles.overviewStatValue)}>{snapshot.inventory.length}</strong>
              <span {...stylex.props(labStyles.overviewStatLabel)}>evidências na sessão</span>
            </div>
          </div>
        </div>
        <div {...stylex.props(labStyles.overviewSummary)}>
          <p {...stylex.props(labStyles.overviewSummaryLabel)}>Protocolo de teste</p>
          <p {...stylex.props(labStyles.overviewSummaryText)}>Descoberta → interpretação → ação → confirmação. Cada cartão abre um artefato completo, com instrução, solução de teste e uma rota acessível equivalente.</p>
        </div>
      </header>
      <div {...stylex.props(labStyles.catalog)}>
        {LAB_ENTRIES.map((entry, index) => {
          const status = entry.id === 'feedback'
            ? snapshot.completed ? 'solved' : 'pending'
            : snapshot.mechanismResults[entry.id] ?? 'pending';
          return (
            <a
              key={entry.id}
              {...stylex.props(labStyles.catalogCard, status === 'solved' ? labStyles.catalogCardSolved : undefined)}
              href={labRouteHref(entry.id, window.location.pathname)}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(entry.id, event.currentTarget.href);
              }}
            >
              <span {...stylex.props(labStyles.catalogCardHeader)}>
                <span {...stylex.props(labStyles.catalogIndex)}>{String(index + 1).padStart(2, '0')}</span>
                <span {...stylex.props(labStyles.catalogStatus, status === 'solved' ? labStyles.catalogStatusSolved : undefined)} data-status={status}>{status}</span>
              </span>
              <span {...stylex.props(labStyles.catalogCopy)}>
                <strong {...stylex.props(labStyles.catalogTitle)}>{entry.title}</strong>
                <small {...stylex.props(labStyles.catalogArtifact)}>{entry.artifact}</small>
                <span {...stylex.props(labStyles.catalogDescription)}>{entry.description}</span>
              </span>
              <span {...stylex.props(labStyles.catalogFooter)}>
                <small {...stylex.props(labStyles.catalogFamily)}>{entry.family}</small>
                <span {...stylex.props(labStyles.catalogAction)}>abrir módulo ↗</span>
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
