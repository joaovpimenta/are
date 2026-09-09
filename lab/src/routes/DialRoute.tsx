import * as stylex from '@stylexjs/stylex';
import { Dial3D } from '@are/engine/components/dial/Dial3D';
import { stepDialValue } from '@are/engine/mechanisms/dial';
import { useEffect, useState } from 'react';
import { MechanismPage } from '../harness/MechanismPage';
import type { LabRouteProps } from '../model';
import { labStyles } from '../styles';
import { HardwareCanvas } from './shared';

export function DialRoute({ entry, theme, reducedMotion, resetVersion, session }: LabRouteProps) {
  const [value, setValue] = useState(2);
  const solved = value === 7;

  useEffect(() => setValue(2), [resetVersion]);
  useEffect(() => {
    session.send({ type: solved ? 'MECHANISM_SOLVED' : 'MECHANISM_ACTIVE', mechanismId: 'dial' });
  }, [session, solved]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') setValue((current) => stepDialValue(current, 1, { min: 0, max: 9 }));
      if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') setValue((current) => stepDialValue(current, -1, { min: 0, max: 9 }));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const step = (direction: number) => setValue((current) => stepDialValue(current, direction, { min: 0, max: 9 }));

  return (
    <MechanismPage
      entry={entry}
      status={solved ? 'solved' : 'active'}
      visual={<HardwareCanvas ariaLabel="Seletor de cofre 3D"><Dial3D value={value} target={7} theme={theme} reducedMotion={reducedMotion} onChange={setValue} /></HardwareCanvas>}
      controls={<><button {...stylex.props(labStyles.controlButton)} type="button" aria-label="Diminuir dial" onClick={() => step(-1)}>−</button><output {...stylex.props(labStyles.controlReadout)} aria-live="polite">{String(value).padStart(2, '0')}</output><button {...stylex.props(labStyles.controlButton)} type="button" aria-label="Aumentar dial" onClick={() => step(1)}>+</button></>}
      telemetry={<span>ângulo={Math.round(value * 36)}° · target=07</span>}
    />
  );
}
