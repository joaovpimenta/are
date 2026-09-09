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
  return (
    <section aria-labelledby="lab-overview-title">
      <header {...stylex.props(labStyles.overviewHeader)}>
        <div>
          <p {...stylex.props(labStyles.kicker)}>Registro de hardware diegético</p>
          <h1 id="lab-overview-title" {...stylex.props(labStyles.overviewTitle)}>Escolha um mecanismo e teste a jornada completa.</h1>
        </div>
        <p {...stylex.props(labStyles.description)}>Cada rota expõe operação, solução, hint ladder, estado e alternativa acessível. O progresso permanece na sessão durante a navegação.</p>
      </header>
      <div {...stylex.props(labStyles.catalog)}>
        {LAB_ENTRIES.map((entry, index) => {
          const status = entry.id === 'feedback'
            ? snapshot.completed ? 'solved' : 'pending'
            : snapshot.mechanismResults[entry.id] ?? 'pending';
          return (
            <a
              key={entry.id}
              {...stylex.props(labStyles.catalogCard)}
              href={labRouteHref(entry.id, window.location.pathname)}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(entry.id, event.currentTarget.href);
              }}
            >
              <span {...stylex.props(labStyles.catalogIndex)}>{String(index + 1).padStart(2, '0')}</span>
              <span><strong>{entry.title}</strong><small>{entry.artifact}</small></span>
              <span {...stylex.props(labStyles.catalogStatus)} data-status={status}>{status}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
