import { prefersReducedMotion } from '@are/engine/core/reducedMotion';
import { createAdventureSession } from '@are/engine/session/adventureSession';
import { useModuleSnapshot } from '@are/engine/session/react';
import { amberTheme, defaultTheme, toLabThemeStyle } from '@are/engine/theme';
import { useEffect, useMemo, useState } from 'react';
import { LabHarness } from './harness/LabHarness';
import { Overview } from './harness/Overview';
import {
  LAB_ENTRIES,
  LAB_REQUIRED_MECHANISMS,
  type LabRouteId,
  parseLabRoute,
} from './model';
import { renderLabRoute } from './routes';

export function App() {
  const session = useMemo(() => createAdventureSession({
    adventureId: 'are-lab-session',
    requiredMechanisms: LAB_REQUIRED_MECHANISMS,
  }), []);
  const snapshot = useModuleSnapshot(session);
  const [route, setRoute] = useState<LabRouteId>(() => parseLabRoute(window.location.pathname));
  const [themeName, setThemeName] = useState<'cyan' | 'amber'>('cyan');
  const [reducedMotion, setReducedMotion] = useState(() => prefersReducedMotion());
  const [resetVersion, setResetVersion] = useState(0);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const theme = themeName === 'cyan' ? defaultTheme : amberTheme;

  useEffect(() => {
    const subscription = session.events.on('change', ({ event, snapshot: next }) => {
      const detail = 'mechanismId' in event
        ? event.mechanismId
        : 'artifactId' in event
          ? event.artifactId ?? 'none'
          : 'sceneId' in event
            ? event.sceneId
            : event.type.toLowerCase();
      setEventLog((events) => [
        String(next.revision).padStart(2, '0') + ' · ' + event.type.toLowerCase() + ' · ' + detail,
        ...events,
      ].slice(0, 12));
    });
    return subscription.unsubscribe;
  }, [session]);

  useEffect(() => {
    const onPopState = () => setRoute(parseLabRoute(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (nextRoute: LabRouteId, href: string) => {
    window.history.pushState({}, '', href);
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  const reset = () => {
    session.reset();
    setResetVersion((value) => value + 1);
    setEventLog([]);
  };

  const entry = LAB_ENTRIES.find((candidate) => candidate.id === route);
  const content = route === 'overview' || !entry
    ? <Overview snapshot={snapshot} onNavigate={navigate} />
    : renderLabRoute(route, {
        entry,
        theme,
        reducedMotion,
        resetVersion,
        session,
        snapshot,
      });

  return (
    <div style={toLabThemeStyle(theme)}>
      <LabHarness
        currentRoute={route}
        snapshot={snapshot}
        eventLog={eventLog}
        themeName={themeName}
        reducedMotion={reducedMotion}
        onNavigate={navigate}
        onToggleTheme={() => setThemeName((value) => value === 'cyan' ? 'amber' : 'cyan')}
        onToggleReducedMotion={() => setReducedMotion((value) => !value)}
        onReset={reset}
      >
        {content}
      </LabHarness>
    </div>
  );
}
