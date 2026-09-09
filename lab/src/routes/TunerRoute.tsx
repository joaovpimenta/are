import * as stylex from '@stylexjs/stylex';
import { Tuner3D } from '@are/engine/components/tuner/Tuner3D';
import { stepDialValue } from '@are/engine/mechanisms/dial';
import { useEffect, useState } from 'react';
import { MechanismPage } from '../harness/MechanismPage';
import type { LabRouteProps } from '../model';
import { labStyles } from '../styles';
import { HardwareCanvas } from './shared';

export function TunerRoute({ entry, theme, reducedMotion, resetVersion, session }: LabRouteProps) {
  const [value, setValue] = useState(41);
  const solved = value === 73;
  useEffect(() => setValue(41), [resetVersion]);
  useEffect(() => { session.send({ type: solved ? 'MECHANISM_SOLVED' : 'MECHANISM_ACTIVE', mechanismId: 'tuner' }); }, [session, solved]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (solved) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') setValue((current) => stepDialValue(current, 1, { min: 0, max: 99 }));
      if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') setValue((current) => stepDialValue(current, -1, { min: 0, max: 99 }));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [solved]);
  const step = (direction: number) => { if (!solved) setValue((current) => stepDialValue(current, direction, { min: 0, max: 99 })); };
  return (
    <MechanismPage entry={entry} status={solved ? 'solved' : 'active'}
      visual={<HardwareCanvas ariaLabel="Rádio de ondas curtas 3D" cameraZ={7.8}><Tuner3D value={value} target={73} theme={theme} reducedMotion={reducedMotion} disabled={solved} onChange={setValue} /></HardwareCanvas>}
      controls={<><button {...stylex.props(labStyles.controlButton)} type="button" disabled={solved} aria-label="Diminuir frequência" onClick={() => step(-1)}>−</button><input {...stylex.props(labStyles.slider)} type="range" min="0" max="99" value={value} disabled={solved} aria-label="Frequência" onChange={(event) => setValue(Number(event.currentTarget.value))} /><output {...stylex.props(labStyles.controlReadout)}>{String(value).padStart(2, '0')}</output><button {...stylex.props(labStyles.controlButton)} type="button" disabled={solved} aria-label="Aumentar frequência" onClick={() => step(1)}>+</button></>}
      telemetry={<span>signal={String(value).padStart(2, '0')} · target=73</span>} />
  );
}
