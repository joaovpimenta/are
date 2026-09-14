import * as stylex from '@stylexjs/stylex';
import { lazy, Suspense } from 'react';
import type { ComponentType, ReactNode } from 'react';
import type { LabMechanismId, LabRouteProps } from '../model';
import { DialRoute } from './DialRoute';

const styles = stylex.create({
  loading: {
    display: 'grid',
    placeItems: 'center',
    minHeight: 360,
    color: 'var(--are-muted)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});

function routeModule<T extends Record<string, ComponentType<LabRouteProps>>>(
  load: () => Promise<T>,
  exportName: keyof T,
) {
  return lazy(async () => ({ default: (await load())[exportName] }));
}

const routes: Record<LabMechanismId, ComponentType<LabRouteProps>> = {
  keypad: routeModule(() => import('./KeypadRoute'), 'KeypadRoute'),
  // The dial is the primary touch surface and is also the return target from
  // the cipher test. Keep it in the Lab shell so a narrow WebKit viewport
  // cannot strand the user on the route loading fallback after a transition.
  dial: DialRoute,
  inventory: routeModule(() => import('./InventoryRoute'), 'InventoryRoute'),
  dialogue: routeModule(() => import('./DialogueRoute'), 'DialogueRoute'),
  sequence: routeModule(() => import('./SequenceRoute'), 'SequenceRoute'),
  switches: routeModule(() => import('./SwitchRoute'), 'SwitchRoute'),
  reveal: routeModule(() => import('./RevealRoute'), 'RevealRoute'),
  feedback: routeModule(() => import('./FeedbackRoute'), 'FeedbackRoute'),
  tuner: routeModule(() => import('./TunerRoute'), 'TunerRoute'),
  levers: routeModule(() => import('./LeversRoute'), 'LeversRoute'),
  cipher: routeModule(() => import('./CipherRoute'), 'CipherRoute'),
  locks: routeModule(() => import('./LocksRoute'), 'LocksRoute'),
};

export function renderLabRoute(id: LabMechanismId, props: LabRouteProps): ReactNode {
  const Route = routes[id];
  return (
    <Suspense fallback={<div {...stylex.props(styles.loading)} role="status">Inicializando artefato…</div>}>
      <Route {...props} />
    </Suspense>
  );
}
