import * as stylex from '@stylexjs/stylex';
import { LeverConsole3D } from '@are/engine/components/levers/LeverConsole3D';
import { createSwitchValues, matchesSwitchSolution, toggleSwitch } from '@are/engine/mechanisms/switches';
import { useEffect, useState } from 'react';
import { MechanismPage } from '../harness/MechanismPage';
import type { LabRouteProps } from '../model';
import { labStyles } from '../styles';
import { HardwareCanvas } from './shared';

const solution = [true, false, true, false] as const;
const labels = ['N', 'E', 'S', 'W'] as const;

export function LeversRoute({ entry, theme, reducedMotion, resetVersion, session }: LabRouteProps) {
  const [values, setValues] = useState<readonly boolean[]>(() => createSwitchValues(solution));
  const solved = matchesSwitchSolution(values, solution);

  useEffect(() => setValues(createSwitchValues(solution)), [resetVersion]);

  const toggle = (index: number) => {
    const next = toggleSwitch(values, index);
    setValues(next);
    session.send({ type: matchesSwitchSolution(next, solution) ? 'MECHANISM_SOLVED' : 'MECHANISM_ACTIVE', mechanismId: 'levers' });
  };

  return (
    <MechanismPage
      entry={entry}
      status={solved ? 'solved' : 'active'}
      visual={<HardwareCanvas ariaLabel="Distribuidor de energia 3D" cameraZ={7.8}><LeverConsole3D values={values} labels={labels} solution={solution} theme={theme} reducedMotion={reducedMotion} onToggle={toggle} /></HardwareCanvas>}
      controls={<>{values.map((value, index) => <button {...stylex.props(labStyles.controlButton)} key={labels[index]} type="button" aria-pressed={value} aria-label={'Alavanca ' + labels[index] + ': ' + (value ? 'ligada' : 'desligada')} onClick={() => toggle(index)}>{labels[index]} {value ? 'ON' : 'OFF'}</button>)}</>}
      telemetry={<span>energia={values.map(Number).join(',')} · target=1,0,1,0</span>}
    />
  );
}
