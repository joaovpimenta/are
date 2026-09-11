import * as stylex from '@stylexjs/stylex';
import type { MouseEvent, ReactNode } from 'react';
import type { AdventureSessionSnapshot } from '@are/engine/session/adventureSession';
import { LAB_ENTRIES, type LabRouteId, labRouteHref } from '../model';
import { labStyles } from '../styles';

type LabHarnessProps = {
  currentRoute: LabRouteId;
  snapshot: AdventureSessionSnapshot;
  eventLog: readonly string[];
  themeName: 'cyan' | 'amber';
  reducedMotion: boolean;
  children: ReactNode;
  onNavigate: (route: LabRouteId, href: string) => void;
  onToggleTheme: () => void;
  onToggleReducedMotion: () => void;
  onReset: () => void;
};

export function LabHarness({
  currentRoute,
  snapshot,
  eventLog,
  themeName,
  reducedMotion,
  children,
  onNavigate,
  onToggleTheme,
  onToggleReducedMotion,
  onReset,
}: LabHarnessProps) {
  const solvedCount = LAB_ENTRIES.filter((entry) => entry.id === 'feedback'
    ? snapshot.completed
    : snapshot.mechanismResults[entry.id] === 'solved').length;
  const totalCount = LAB_ENTRIES.length;

  const navigate = (event: MouseEvent<HTMLAnchorElement>, route: LabRouteId) => {
    event.preventDefault();
    onNavigate(route, event.currentTarget.href);
  };

  return (
    <main {...stylex.props(labStyles.page)}>
      <header {...stylex.props(labStyles.topbar)}>
        <a
          {...stylex.props(labStyles.brand)}
          href={labRouteHref('overview', window.location.pathname)}
          onClick={(event) => navigate(event, 'overview')}
        >
          <span {...stylex.props(labStyles.brandMark)} aria-hidden="true">A</span>
          <span {...stylex.props(labStyles.brandText)}><strong>ARE LAB</strong><small {...stylex.props(labStyles.brandTextMeta)}>Field hardware registry</small></span>
        </a>
        <div {...stylex.props(labStyles.toolbar)}>
          <button {...stylex.props(labStyles.toolButton)} type="button" onClick={onToggleTheme}>
            Tema {themeName === 'cyan' ? 'Cyan' : 'Amber'}
          </button>
          <button {...stylex.props(labStyles.toolButton)} type="button" aria-pressed={reducedMotion} onClick={onToggleReducedMotion}>
            Movimento {reducedMotion ? 'reduzido' : 'normal'}
          </button>
          <button {...stylex.props(labStyles.resetButton)} type="button" onClick={onReset}>Resetar sessão</button>
        </div>
      </header>

      <div {...stylex.props(labStyles.layout)}>
        <nav {...stylex.props(labStyles.navigation)} aria-label="Mecanismos do Lab">
          <div {...stylex.props(labStyles.navigationHeader)}>
            <p {...stylex.props(labStyles.navigationTitle)}>Índice do Lab</p>
            <span {...stylex.props(labStyles.navigationCount)}>{LAB_ENTRIES.length} rotas</span>
          </div>
          <a
            {...stylex.props(labStyles.navLink, currentRoute === 'overview' ? labStyles.navLinkActive : undefined)}
            href={labRouteHref('overview', window.location.pathname)}
            onClick={(event) => navigate(event, 'overview')}
          >
            <span>Visão geral</span>
            <small {...stylex.props(labStyles.navLinkStatus, snapshot.completed ? labStyles.navLinkStatusSolved : undefined)}>{snapshot.completed ? 'complete' : 'session'}</small>
          </a>
          {LAB_ENTRIES.map((entry) => {
            const status = entry.id === 'feedback'
              ? snapshot.completed ? 'solved' : 'pending'
              : snapshot.mechanismResults[entry.id] ?? 'pending';
            return (
              <a
                key={entry.id}
                {...stylex.props(labStyles.navLink, currentRoute === entry.id ? labStyles.navLinkActive : undefined)}
                href={labRouteHref(entry.id, window.location.pathname)}
                onClick={(event) => navigate(event, entry.id)}
              >
                <span>{entry.title}</span>
                <small
                  {...stylex.props(labStyles.navLinkStatus, status === 'solved' ? labStyles.navLinkStatusSolved : undefined)}
                  data-status={status}
                >{status}</small>
              </a>
            );
          })}
        </nav>

        <div {...stylex.props(labStyles.content)}>{children}</div>

        <aside {...stylex.props(labStyles.monitor)} aria-label="Telemetria da sessão">
          <div {...stylex.props(labStyles.monitorHeader)}>
            <div {...stylex.props(labStyles.monitorIdentity)}>
              <p {...stylex.props(labStyles.sectionLabel)}>Session monitor</p>
              <strong {...stylex.props(labStyles.monitorIdentityValue)}>{snapshot.adventureId}</strong>
            </div>
            <span role="img" {...stylex.props(labStyles.monitorLight, snapshot.completed ? labStyles.monitorLightActive : undefined)} aria-label={snapshot.completed ? 'Sessão concluída' : 'Sessão em andamento'} />
          </div>
          <dl {...stylex.props(labStyles.monitorStats)}>
            <div {...stylex.props(labStyles.monitorStat)}><dt {...stylex.props(labStyles.monitorStatLabel)}>Resolvidos</dt><dd {...stylex.props(labStyles.monitorStatValue)}>{solvedCount}/{totalCount}</dd></div>
            <div {...stylex.props(labStyles.monitorStat)}><dt {...stylex.props(labStyles.monitorStatLabel)}>Artefatos</dt><dd {...stylex.props(labStyles.monitorStatValue)}>{snapshot.inventory.length}</dd></div>
            <div {...stylex.props(labStyles.monitorStat)}><dt {...stylex.props(labStyles.monitorStatLabel)}>Revisão</dt><dd {...stylex.props(labStyles.monitorStatValue)}>{snapshot.revision}</dd></div>
          </dl>
          <div {...stylex.props(labStyles.monitorProgress)}>
            <div {...stylex.props(labStyles.monitorProgressHeader)}>
              <span>Progresso operacional</span>
              <strong>{Math.round((solvedCount / Math.max(1, totalCount)) * 100)}%</strong>
            </div>
            <progress
              {...stylex.props(labStyles.monitorProgressBar)}
              value={solvedCount}
              max={Math.max(1, totalCount)}
              aria-label="Progresso da sessão"
            />
          </div>
          <div {...stylex.props(labStyles.eventLog)} aria-live="polite">
            {eventLog.length === 0 ? <span>Aguardando entrada.</span> : eventLog.map((event) => <span key={event}>{event}</span>)}
          </div>
        </aside>
      </div>
    </main>
  );
}
